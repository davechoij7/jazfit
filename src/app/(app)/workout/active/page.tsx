"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWakeLock } from "@/lib/hooks/use-wake-lock";
import { useRestTimer } from "@/lib/hooks/use-rest-timer";
import { useActiveWorkout } from "@/lib/hooks/use-active-workout";
import { ActiveExercise } from "@/components/workout/active-exercise";
import { NextUpPreview } from "@/components/workout/next-up-preview";
import { RestTimerOverlay } from "@/components/workout/rest-timer-overlay";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  createWorkoutSession,
  createExerciseLog,
  logSet,
  completeWorkoutSession,
  getExerciseHistory,
} from "@/actions/workout";
import { getProgressiveOverload, summarizeExerciseHistory } from "@/lib/workout-engine";
import { DEFAULT_REST_TIMER } from "@/lib/constants";
import type { Exercise, MuscleGroup } from "@/lib/types";

export default function ActiveWorkoutPage() {
  const router = useRouter();
  useWakeLock();

  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [notes, setNotes] = useState("");
  const [elapsedDisplay, setElapsedDisplay] = useState("0:00");
  const hasInitialized = useRef(false);

  const workout = useActiveWorkout(muscleGroups);

  const restTimer = useRestTimer({
    onComplete: () => {
      // Rest done — do nothing special, overlay will close
    },
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
        setMuscleGroups(saved.muscleGroups);
        setIsInitializing(false);
        return;
      }

      // Read config from sessionStorage (set by pre-workout page)
      const configStr = sessionStorage.getItem("workout-config");
      if (!configStr) {
        router.replace("/dashboard");
        return;
      }

      const config = JSON.parse(configStr) as {
        muscleGroups: string[];
        exerciseIds: string[];
      };
      setMuscleGroups(config.muscleGroups);

      // Fetch exercise details from Supabase (client-side)
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: exerciseData } = await supabase
        .from("exercises")
        .select("*")
        .in("id", config.exerciseIds);

      if (!exerciseData || exerciseData.length === 0) {
        router.replace("/dashboard");
        return;
      }

      // Order exercises to match the config order
      const ordered = config.exerciseIds
        .map((id) => exerciseData.find((e) => e.id === id))
        .filter(Boolean) as Exercise[];

      setExercises(ordered);

      // Create session in DB
      const sessionId = await createWorkoutSession(config.muscleGroups as MuscleGroup[]);

      // Fetch progressive overload data for each exercise
      const overloadMap = new Map<string, any>();
      await Promise.all(
        ordered.map(async (exercise) => {
          try {
            const history = await getExerciseHistory(exercise.id);
            if (history.length > 0) {
              const summarized = history.map((h: any) => ({
                weight: Math.max(...h.sets.map((s: any) => s.actual_weight ?? 0)),
                reps: h.sets.map((s: any) => s.actual_reps ?? 0),
                date: h.date,
              }));
              const overload = getProgressiveOverload(summarized);
              if (overload) {
                overloadMap.set(exercise.id, overload);
              }
            }
          } catch {
            // Skip overload for this exercise
          }
        })
      );

      // Create exercise logs
      const logIds: string[] = [];
      for (let i = 0; i < ordered.length; i++) {
        const logId = await createExerciseLog(sessionId, ordered[i].id, i);
        logIds.push(logId);
      }

      // Initialize the workout state
      workout.initializeWorkout(sessionId, ordered, overloadMap);

      // Set exercise log IDs
      logIds.forEach((logId, i) => {
        workout.dispatch({ type: "SET_EXERCISE_LOG_ID", exerciseIndex: i, logId });
      });

      // Clean up config
      sessionStorage.removeItem("workout-config");
      setIsInitializing(false);
    }

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        ).catch(() => {
          // Silent fail — data is in sessionStorage
        });
      }

      // Start rest timer
      restTimer.start(DEFAULT_REST_TIMER);
    },
    [workout, restTimer]
  );

  // Handle completing workout
  const handleComplete = useCallback(async () => {
    workout.dispatch({ type: "COMPLETE_WORKOUT" });
    setShowComplete(true);

    if (workout.state.sessionId) {
      const elapsed = Math.floor((Date.now() - workout.state.startedAt) / 1000);
      await completeWorkoutSession(workout.state.sessionId, elapsed, notes || undefined);
    }
  }, [workout, notes]);

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
  const nextEx = workout.state.exercises[workout.state.currentExerciseIndex + 1] ?? null;

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          type="button"
          onClick={() => setShowEndConfirm(true)}
          className="text-sm text-text-muted active:text-text-primary select-none touch-manipulation"
        >
          End
        </button>
        <div className="text-center">
          <p className="text-xs text-text-dim">
            Exercise {workout.state.currentExerciseIndex + 1} of {workout.state.exercises.length}
          </p>
          <p className="text-sm font-medium text-text-primary tabular-nums">{elapsedDisplay}</p>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Exercise navigation dots */}
      <div className="flex justify-center gap-1.5 py-3">
        {workout.state.exercises.map((ex, i) => {
          const allComplete = ex.sets.every((s) => s.isCompleted);
          const someComplete = ex.sets.some((s) => s.isCompleted);
          return (
            <button
              key={i}
              type="button"
              onClick={() => workout.dispatch({ type: "GO_TO_EXERCISE", index: i })}
              className={`w-2.5 h-2.5 rounded-full transition-colors touch-manipulation
                ${
                  i === workout.state.currentExerciseIndex
                    ? "bg-accent scale-125"
                    : allComplete
                      ? "bg-success"
                      : someComplete
                        ? "bg-accent/40"
                        : "bg-bg-elevated"
                }`}
            />
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {currentEx && (
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
        )}

        {/* Navigation buttons */}
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
          {workout.isLastExercise ? (
            <Button className="flex-1" onClick={handleComplete}>
              Finish Workout
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => workout.dispatch({ type: "NEXT_EXERCISE" })}
            >
              Next Exercise
            </Button>
          )}
        </div>
      </div>

      {/* Next up preview */}
      {!restTimer.isRunning && nextEx && (
        <NextUpPreview
          nextExercise={nextEx}
          onSkipTo={() => workout.dispatch({ type: "NEXT_EXERCISE" })}
        />
      )}

      {/* Rest timer overlay */}
      <RestTimerOverlay
        isOpen={restTimer.isRunning}
        duration={restTimer.duration}
        remaining={restTimer.remaining}
        onChangeDuration={(s) => restTimer.start(s)}
        onSkip={restTimer.skip}
      />

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
      <Modal isOpen={showComplete} onClose={() => router.push("/dashboard")} title="Workout Complete!">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{elapsedDisplay}</p>
              <p className="text-xs text-text-dim">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{workout.totalSetsCompleted}</p>
              <p className="text-xs text-text-dim">Sets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {workout.totalVolume > 1000
                  ? `${(workout.totalVolume / 1000).toFixed(1)}k`
                  : workout.totalVolume}
              </p>
              <p className="text-xs text-text-dim">Volume (lbs)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel?"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border
                         text-text-primary placeholder:text-text-dim text-sm
                         focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <Button className="w-full" onClick={() => router.push("/history")}>
            View History
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => router.push("/dashboard")}>
            Back to Home
          </Button>
        </div>
      </Modal>
    </div>
  );
}
