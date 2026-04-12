"use client";

import { SetRow } from "./set-row";
import { Button } from "@/components/ui/button";
import { getWeightIncrement } from "@/lib/constants";
import type { WorkoutExerciseState } from "@/lib/hooks/use-active-workout";

interface ActiveExerciseProps {
  exerciseState: WorkoutExerciseState;
  exerciseIndex: number;
  onUpdateWeight: (setIndex: number, value: number) => void;
  onUpdateReps: (setIndex: number, value: number) => void;
  onCompleteSet: (setIndex: number) => void;
  onAddSet: () => void;
}

export function ActiveExercise({
  exerciseState,
  exerciseIndex,
  onUpdateWeight,
  onUpdateReps,
  onCompleteSet,
  onAddSet,
}: ActiveExerciseProps) {
  const { exercise, sets, progressMessage, shouldProgress } = exerciseState;
  const weightStep = getWeightIncrement(exercise.equipment_type);

  return (
    <div className="space-y-4">
      {/* Exercise name */}
      <div>
        <h2 className="text-2xl font-display font-normal text-text-primary">{exercise.name}</h2>
        <p className="text-sm text-text-dim capitalize">{exercise.equipment_type}</p>
      </div>

      {/* Progressive overload message */}
      {progressMessage && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            shouldProgress
              ? "bg-success/10 border border-success/30 text-success"
              : "bg-bg-card border border-border text-text-muted"
          }`}
        >
          {progressMessage}
        </div>
      )}

      {/* Sets */}
      <div className="space-y-2">
        {sets.map((set, i) => (
          <SetRow
            key={set.id}
            set={set}
            weightStep={weightStep}
            onUpdateWeight={(v) => onUpdateWeight(i, v)}
            onUpdateReps={(v) => onUpdateReps(i, v)}
            onComplete={() => onCompleteSet(i)}
          />
        ))}
      </div>

      {/* Add set button */}
      <Button variant="ghost" size="sm" onClick={onAddSet} className="w-full">
        + Add Set
      </Button>
    </div>
  );
}
