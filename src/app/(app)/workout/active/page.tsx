"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWakeLock } from "@/lib/hooks/use-wake-lock";
import { useActiveWorkout } from "@/lib/hooks/use-active-workout";
import { useSaveStatus } from "@/lib/hooks/use-save-status";
import { SaveIndicator } from "@/components/workout/save-indicator";
import { ActiveExercise } from "@/components/workout/active-exercise";
import { ExercisePickerDrawer } from "@/components/workout/exercise-picker-drawer";
import { WorkoutCompletionOverlay } from "@/components/workout/workout-completion-overlay";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  createWorkoutSession,
  createExerciseLog,
  upsertSet,
  completeWorkoutSession,
  updateWorkoutDate,
  getExerciseHistory,
  getActiveWorkout,
  deleteSetLog,
  deleteExerciseLog,
} from "@/actions/workout";
import { getProgressiveOverload } from "@/lib/workout-engine";
import { ALL_SPLITS, NON_STRENGTH_SPLITS, SPLIT_GROUPS, DEFAULT_SETS_PER_EXERCISE, DEFAULT_REPS_PER_SET } from "@/lib/constants";
import type { Exercise, MuscleGroup, WorkoutSplit, StrengthSplit, NonStrengthSplit, ActiveSet } from "@/lib/types";
import type { ActiveWorkoutState } from "@/lib/hooks/use-active-workout";
import type { ActiveWorkoutSnapshot } from "@/actions/workout";

// Map a server-side snapshot into the reducer's ActiveWorkoutState. Progressive-
// overload hints (previousWeight/suggestedWeight/allTimeMax) are nulled on
// resume — the set rows themselves carry the actual logged values.
function hydrateFromServer(snapshot: ActiveWorkoutSnapshot): ActiveWorkoutState {
  return {
    sessionId: snapshot.sessionId,
    split: snapshot.split,
    muscleGroups: snapshot.muscleGroups,
    startedAt: snapshot.startedAt,
    status: "active",
    currentExerciseIndex: Math.max(0, snapshot.exercises.length - 1),
    lastCompletedSetKey: null,
    exercises: snapshot.exercises.map((ex) => {
      const sets: ActiveSet[] =
        ex.sets.length > 0
          ? ex.sets.map((s) => ({
              id: crypto.randomUUID(),
              setNumber: s.setNumber,
              targetWeight: s.targetWeight,
              targetReps: s.targetReps,
              actualWeight: s.actualWeight,
              actualReps: s.actualReps,
              isCompleted: s.completedAt != null,
            }))
          : Array.from({ length: DEFAULT_SETS_PER_EXERCISE }, (_, i) => ({
              id: crypto.randomUUID(),
              setNumber: i + 1,
              targetWeight: null,
              targetReps: DEFAULT_REPS_PER_SET,
              actualWeight: null,
              actualReps: null,
              isCompleted: false,
            }));
      return {
        exercise: ex.exercise,
        exerciseLogId: ex.exerciseLogId,
        sets,
        previousWeight: null,
        previousReps: null,
        suggestedWeight: null,
        shouldProgress: false,
        progressMessage: null,
        allTimeMax: 0,
      };
    }),
  };
}

export default function ActiveWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-dvh">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-muted">Setting up your workout...</p>
          </div>
        </div>
      }
    >
      <ActiveWorkoutContent />
    </Suspense>
  );
}

function ActiveWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useWakeLock();

  const [isInitializing, setIsInitializing] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [elapsedDisplay, setElapsedDisplay] = useState("0:00");
  const [workoutDate, setWorkoutDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const hasInitialized = useRef(false);
  const elapsedSecondsRef = useRef(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const workout = useActiveWorkout();
  const save = useSaveStatus();

  // Elapsed time display
  useEffect(() => {
    if (workout.state.status !== "active") return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - workout.state.startedAt) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setElapsedDisplay(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [workout.state.status, workout.state.startedAt]);

  // Initialize workout on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function init() {
      // 1. Server is the source of truth — look for a dangling in-progress
      //    workout (completed_at IS NULL) on the DB before anything else.
      //    This survives iOS Safari tab eviction, device swap, cleared cache.
      const localSaved = workout.getRecoverableSession();

      let serverWorkout: ActiveWorkoutSnapshot | null = null;
      try {
        serverWorkout = await getActiveWorkout();
      } catch {
        // Network error — fall through to localStorage
      }

      if (serverWorkout) {
        const hydrated = hydrateFromServer(serverWorkout);
        // If localStorage matches this session, preserve the cursor position.
        if (
          localSaved &&
          localSaved.sessionId === serverWorkout.sessionId &&
          localSaved.currentExerciseIndex < hydrated.exercises.length
        ) {
          hydrated.currentExerciseIndex = localSaved.currentExerciseIndex;
        }
        workout.restoreSession(hydrated);
        setIsInitializing(false);
        return;
      }

      // 2. No server workout. Offline fallback to localStorage if present.
      if (localSaved) {
        workout.restoreSession(localSaved);
        setIsInitializing(false);
        return;
      }

      // 3. Fresh start — need a split from the URL.
      const splitParam = searchParams.get("split") as WorkoutSplit | null;
      if (!splitParam || !ALL_SPLITS.includes(splitParam)) {
        router.replace("/dashboard");
        return;
      }

      const isNonStrengthInit = NON_STRENGTH_SPLITS.has(splitParam as NonStrengthSplit);
      const muscleGroups: MuscleGroup[] = isNonStrengthInit
        ? []
        : SPLIT_GROUPS[splitParam as StrengthSplit];

      // Non-strength sessions never produce exercise_logs, so we create them
      // up-front. Strength sessions defer DB creation until the first exercise
      // is added — otherwise every tap of Start leaves a "phantom" in-progress
      // row that makes Resume Workout appear forever with nothing to resume.
      let sessionId: string | null = null;
      if (isNonStrengthInit) {
        const now = new Date();
        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        sessionId = await createWorkoutSession(muscleGroups, splitParam, localDate);
      }

      // Initialize empty workout
      workout.dispatch({
        type: "INIT",
        sessionId,
        split: splitParam,
        muscleGroups,
      });

      setIsInitializing(false);
    }

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle adding an exercise from the picker
  const handleAddExercise = useCallback(
    async (exercise: Exercise) => {
      if (!workout.state.split) return;

      // Lazy-create the session row on the first exercise add. See init() for
      // why strength splits defer creation — prevents phantom "resume" rows.
      let sessionId: string;
      if (workout.state.sessionId) {
        sessionId = workout.state.sessionId;
      } else {
        sessionId = await createWorkoutSession(
          workout.state.muscleGroups as MuscleGroup[],
          workout.state.split as WorkoutSplit,
          workoutDate
        );
        workout.dispatch({ type: "SET_SESSION_ID", sessionId });
      }

      // Create exercise log + fetch history in parallel
      const [logId, history] = await Promise.all([
        createExerciseLog(
          sessionId,
          exercise.id,
          workout.state.exercises.length
        ),
        getExerciseHistory(exercise.id).catch(() => []),
      ]);

      // Calculate progressive overload
      let overload = null;
      let allTimeMax = 0;
      if (history.length > 0) {
        const summarized = history
          .filter((h: any) => h.sets && h.sets.length > 0)
          .map((h: any) => ({
            weight: Math.max(...h.sets.map((s: any) => s.actual_weight ?? 0)),
            reps: h.sets.map((s: any) => s.actual_reps ?? 0),
            date: h.date,
          }));
        if (summarized.length > 0) {
          overload = getProgressiveOverload(summarized, exercise.equipment_type);
          allTimeMax = Math.max(...summarized.map((h) => h.weight));
        }
      }

      workout.addExercise(exercise, logId, overload, allTimeMax);
    },
    [workout, workoutDate]
  );

  // Auto-complete side effects: when a set transitions to completed via UPDATE_SET,
  // the reducer stamps lastCompletedSetKey. Start rest timer + persist, then clear.
  useEffect(() => {
    const key = workout.state.lastCompletedSetKey;
    if (!key) return;
    const [exStr, setStr] = key.split(":");
    const exerciseIndex = Number(exStr);
    const setIndex = Number(setStr);
    const exerciseState = workout.state.exercises[exerciseIndex];
    const set = exerciseState?.sets[setIndex];

    if (exerciseState?.exerciseLogId && set) {
      const logId = exerciseState.exerciseLogId;
      void save.track(() =>
        upsertSet(
          logId,
          set.setNumber,
          set.targetWeight,
          set.actualWeight ?? set.targetWeight,
          set.targetReps,
          set.actualReps ?? set.targetReps
        )
      );
    }

    workout.dispatch({ type: "CLEAR_LAST_COMPLETED" });
  }, [workout.state.lastCompletedSetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle deleting a set — removes from state and from DB (no-op if never persisted).
  const handleDeleteSet = useCallback(
    (setIndex: number) => {
      const exerciseIndex = workout.state.currentExerciseIndex;
      const exerciseState = workout.state.exercises[exerciseIndex];
      const set = exerciseState?.sets[setIndex];
      workout.dispatch({ type: "DELETE_SET", exerciseIndex, setIndex });
      if (exerciseState?.exerciseLogId && set) {
        const logId = exerciseState.exerciseLogId;
        void save.track(() => deleteSetLog(logId, set.setNumber));
      }
    },
    [workout, save]
  );

  // Handle deleting the current exercise — cascades set_logs in DB via FK.
  const handleDeleteExercise = useCallback(() => {
    const exerciseIndex = workout.state.currentExerciseIndex;
    const exerciseState = workout.state.exercises[exerciseIndex];
    workout.dispatch({ type: "DELETE_EXERCISE", exerciseIndex });
    if (exerciseState?.exerciseLogId) {
      const logId = exerciseState.exerciseLogId;
      void save.track(() => deleteExerciseLog(logId));
    }
  }, [workout, save]);

  // Handle completing workout
  const handleComplete = useCallback(() => {
    elapsedSecondsRef.current = Math.floor((Date.now() - workout.state.startedAt) / 1000);
    workout.dispatch({ type: "COMPLETE_WORKOUT" });
    setShowEndConfirm(false);
    setShowComplete(true);
  }, [workout]);

  // Loading state
  if (isInitializing || workout.state.status === "ready") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Setting up your workout...</p>
        </div>
      </div>
    );
  }

  const currentEx = workout.currentExercise;
  const isNonStrength = workout.state.split
    ? NON_STRENGTH_SPLITS.has(workout.state.split as NonStrengthSplit)
    : false;
  const splitMuscleGroups = isNonStrength
    ? ([] as MuscleGroup[])
    : (SPLIT_GROUPS[workout.state.split as StrengthSplit] ?? []) as MuscleGroup[];

  return (
    <div className="flex flex-col min-h-dvh pb-20">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(240, 196, 206, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.25)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (workout.hasExercises) {
              setShowEndConfirm(true);
            } else if (isNonStrength) {
              handleComplete(); // opens overlay for notes
            } else {
              workout.dispatch({ type: "COMPLETE_WORKOUT" });
              router.push("/dashboard");
            }
          }}
          className="text-sm text-text-muted active:text-text-primary select-none touch-manipulation"
        >
          End
        </button>
        <div className="text-center">
          <p className="text-xs text-text-dim">
            {isNonStrength ? workout.state.split : `${workout.state.split} Body`}
          </p>
          <p className="text-sm font-medium text-text-primary tabular-nums">{elapsedDisplay}</p>
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="text-[11px] text-accent font-medium mt-0.5 select-none touch-manipulation"
          >
            {new Date(workoutDate + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={workoutDate}
            onChange={(e) => {
              const newDate = e.target.value;
              if (!newDate) return;
              setWorkoutDate(newDate);
              if (workout.state.sessionId) {
                const sid = workout.state.sessionId;
                void save.track(() => updateWorkoutDate(sid, newDate));
              }
            }}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
        <div className="min-w-[60px] flex justify-end">
          <SaveIndicator
            status={save.status}
            lastError={save.lastError}
            onDismissError={save.dismissError}
          />
        </div>
      </header>

      {/* Exercise tabs - scrollable pills */}
      {workout.hasExercises && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none" style={{ background: "rgba(251, 240, 240, 0.6)" }}>
          {workout.state.exercises.map((ex, i) => {
            const allComplete = ex.sets.every((s) => s.isCompleted);
            const isCurrent = i === workout.state.currentExerciseIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => workout.dispatch({ type: "GO_TO_EXERCISE", index: i })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors select-none touch-manipulation
                  ${
                    isCurrent
                      ? "bg-accent text-white"
                      : allComplete
                        ? "bg-[#7EBF8E]/20 text-[#4E8F5E]"
                        : "bg-bg-elevated text-text-muted"
                  }`}
              >
                {ex.exercise.name.length > 15
                  ? ex.exercise.name.slice(0, 15) + "…"
                  : ex.exercise.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowExercisePicker(true)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium select-none touch-manipulation"
          >
            + Add
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto" style={{ background: "rgba(251, 240, 240, 0.75)" }}>
        {!workout.hasExercises && isNonStrength ? (
          /* Non-strength session: timer + notes */
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="text-center">
              <p className="text-6xl font-display text-text-primary tabular-nums">
                {elapsedDisplay}
              </p>
              <p className="text-sm text-text-muted mt-2">Keep going</p>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-text-muted mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How does it feel? Any observations..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-bg-elevated border border-border
                           text-text-primary placeholder:text-text-dim text-base
                           focus:outline-none focus:border-accent resize-none"
              />
            </div>
            <Button size="lg" className="w-full" onClick={handleComplete}>
              Finish {workout.state.split}
            </Button>
          </div>
        ) : !workout.hasExercises ? (
          /* Empty strength state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-muted mb-2">No exercises yet</p>
            <p className="text-text-dim text-sm mb-8">
              Tap below to add your first exercise
            </p>
            <Button
              size="lg"
              onClick={() => setShowExercisePicker(true)}
            >
              + Add Exercise
            </Button>
          </div>
        ) : currentEx ? (
          <>
            <ActiveExercise
              exerciseState={currentEx}
              exerciseIndex={workout.state.currentExerciseIndex}
              onUpdateWeight={(setIndex, value) =>
                workout.dispatch({
                  type: "UPDATE_SET",
                  exerciseIndex: workout.state.currentExerciseIndex,
                  setIndex,
                  field: "actualWeight",
                  value,
                })
              }
              onUpdateReps={(setIndex, value) =>
                workout.dispatch({
                  type: "UPDATE_SET",
                  exerciseIndex: workout.state.currentExerciseIndex,
                  setIndex,
                  field: "actualReps",
                  value,
                })
              }
              onCompleteSet={(setIndex) =>
                workout.dispatch({
                  type: "COMPLETE_SET",
                  exerciseIndex: workout.state.currentExerciseIndex,
                  setIndex,
                })
              }
              onDeleteSet={handleDeleteSet}
              onAddSet={() =>
                workout.dispatch({
                  type: "ADD_SET",
                  exerciseIndex: workout.state.currentExerciseIndex,
                })
              }
              onRemoveLastSet={() => {
                const lastIdx = (currentEx?.sets.length ?? 0) - 1;
                if (lastIdx >= 0) handleDeleteSet(lastIdx);
              }}
              onDeleteExercise={handleDeleteExercise}
            />

            {/* Navigation + Add buttons */}
            <div className="flex gap-3 mt-6">
              {workout.state.currentExerciseIndex > 0 && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => workout.dispatch({ type: "PREV_EXERCISE" })}
                >
                  Previous
                </Button>
              )}
              {!workout.isLastExercise && (
                <Button
                  className="flex-1"
                  onClick={() => workout.dispatch({ type: "NEXT_EXERCISE" })}
                >
                  Next
                </Button>
              )}
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowExercisePicker(true)}
              >
                + Add
              </Button>
            </div>

            {/* Finish button when on last exercise */}
            {workout.isLastExercise && (
              <Button
                className="w-full mt-3"
                onClick={handleComplete}
              >
                Finish Workout
              </Button>
            )}
          </>
        ) : null}
      </div>

      {/* Exercise Picker Drawer */}
      {!isNonStrength && (
        <ExercisePickerDrawer
          isOpen={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          onSelect={handleAddExercise}
          splitMuscleGroups={splitMuscleGroups}
          alreadyAddedIds={workout.state.exercises.map((ex) => ex.exercise.id)}
        />
      )}

      {/* End workout confirmation */}
      <Modal isOpen={showEndConfirm} onClose={() => setShowEndConfirm(false)} title="End Workout?">
        <p className="text-text-muted mb-4">
          You've completed {workout.totalSetsCompleted} sets. End this workout?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowEndConfirm(false)}>
            Keep Going
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleComplete}>
            End Workout
          </Button>
        </div>
      </Modal>

      {/* Workout complete */}
      <WorkoutCompletionOverlay
        isOpen={showComplete}
        duration={elapsedDisplay}
        totalSets={workout.totalSetsCompleted}
        totalVolume={workout.totalVolume}
        totalPRs={workout.totalPRs}
        notes={notes}
        onNotesChange={setNotes}
        onDone={async () => {
          if (workout.state.sessionId) {
            await completeWorkoutSession(
              workout.state.sessionId,
              elapsedSecondsRef.current,
              notes || undefined
            );
          }
          router.push("/dashboard");
        }}
        isNonStrength={isNonStrength}
      />
    </div>
  );
}
