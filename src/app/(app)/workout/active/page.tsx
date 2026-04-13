"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWakeLock } from "@/lib/hooks/use-wake-lock";
import { useRestTimer } from "@/lib/hooks/use-rest-timer";
import { useActiveWorkout } from "@/lib/hooks/use-active-workout";
import { ActiveExercise } from "@/components/workout/active-exercise";
import { ExercisePickerDrawer } from "@/components/workout/exercise-picker-drawer";
import { RestTimerOverlay } from "@/components/workout/rest-timer-overlay";
import { WorkoutCompletionOverlay } from "@/components/workout/workout-completion-overlay";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  createWorkoutSession,
  createExerciseLog,
  logSet,
  completeWorkoutSession,
  getExerciseHistory,
} from "@/actions/workout";
import { getProgressiveOverload } from "@/lib/workout-engine";
import { ALL_SPLITS, NON_STRENGTH_SPLITS, SPLIT_GROUPS, DEFAULT_REST_TIMER } from "@/lib/constants";
import type { Exercise, MuscleGroup, WorkoutSplit, StrengthSplit, NonStrengthSplit } from "@/lib/types";

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
  const hasInitialized = useRef(false);
  const elapsedSecondsRef = useRef(0);

  const workout = useActiveWorkout();

  const restTimer = useRestTimer({
    onComplete: () => {},
  });

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
      // Check for recoverable session
      const saved = workout.getRecoverableSession();
      if (saved) {
        workout.restoreSession(saved);
        setIsInitializing(false);
        return;
      }

      // Read split from URL params
      const splitParam = searchParams.get("split") as WorkoutSplit | null;
      if (!splitParam || !ALL_SPLITS.includes(splitParam)) {
        router.replace("/dashboard");
        return;
      }

      const isNonStrengthInit = NON_STRENGTH_SPLITS.has(splitParam as NonStrengthSplit);
      const muscleGroups: MuscleGroup[] = isNonStrengthInit
        ? []
        : SPLIT_GROUPS[splitParam as StrengthSplit];

      // Create session in DB
      const sessionId = await createWorkoutSession(muscleGroups, splitParam);

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
      if (!workout.state.sessionId) return;

      // Create exercise log + fetch history in parallel
      const [logId, history] = await Promise.all([
        createExerciseLog(
          workout.state.sessionId,
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
    [workout]
  );

  // Handle completing a set
  const handleCompleteSet = useCallback(
    (setIndex: number) => {
      const exerciseIndex = workout.state.currentExerciseIndex;
      workout.dispatch({ type: "COMPLETE_SET", exerciseIndex, setIndex });

      // Persist to DB in background
      const exerciseState = workout.state.exercises[exerciseIndex];
      if (exerciseState?.exerciseLogId) {
        const set = exerciseState.sets[setIndex];
        logSet(
          exerciseState.exerciseLogId,
          set.setNumber,
          set.targetWeight,
          set.actualWeight ?? set.targetWeight,
          set.targetReps,
          set.actualReps ?? set.targetReps
        ).catch(() => {});
      }

      restTimer.start(DEFAULT_REST_TIMER);
    },
    [workout, restTimer]
  );

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
        </div>
        <div className="w-10" />
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
              onCompleteSet={handleCompleteSet}
              onAddSet={() =>
                workout.dispatch({
                  type: "ADD_SET",
                  exerciseIndex: workout.state.currentExerciseIndex,
                })
              }
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

      {/* Rest timer overlay */}
      {!isNonStrength && (
        <RestTimerOverlay
          isOpen={restTimer.isRunning}
          duration={restTimer.duration}
          remaining={restTimer.remaining}
          onChangeDuration={(s) => restTimer.start(s)}
          onSkip={restTimer.skip}
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
