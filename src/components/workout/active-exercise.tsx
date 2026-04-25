"use client";

import { useState } from "react";
import { SetRow } from "./set-row";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { getWeightIncrement } from "@/lib/constants";
import type { WorkoutExerciseState } from "@/lib/hooks/use-active-workout";

interface ActiveExerciseProps {
  exerciseState: WorkoutExerciseState;
  exerciseIndex: number;
  onUpdateWeight: (setIndex: number, value: number) => void;
  onUpdateReps: (setIndex: number, value: number) => void;
  onCompleteSet: (setIndex: number) => void;
  onDeleteSet: (setIndex: number) => void;
  onAddSet: () => void;
  onRemoveLastSet: () => void;
  onDeleteExercise: () => void;
}

export function ActiveExercise({
  exerciseState,
  onUpdateWeight,
  onUpdateReps,
  onCompleteSet,
  onDeleteSet,
  onAddSet,
  onRemoveLastSet,
  onDeleteExercise,
}: ActiveExerciseProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { exercise, sets, progressMessage, shouldProgress } = exerciseState;
  const weightStep = getWeightIncrement(exercise.equipment_type);

  return (
    <div className="space-y-4">
      {/* Exercise name + delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-display font-normal text-text-primary">{exercise.name}</h2>
          <p className="text-sm text-text-dim capitalize">{exercise.equipment_type}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete exercise"
          className="p-3 -mr-2 text-text-muted active:text-error transition-colors touch-manipulation select-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
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
            onDelete={() => onDeleteSet(i)}
          />
        ))}
      </div>

      {/* Add / remove set buttons. "Remove Last" handles trailing extras
          regardless of completion state — incomplete sets in the middle of a
          list can be left blank (they don't write to the DB), and completed
          sets in the middle still expose their own trash on the row. */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onAddSet} className="flex-1">
          + Add Set
        </Button>
        {sets.length > 1 && (
          <Button variant="ghost" size="sm" onClick={onRemoveLastSet} className="flex-1">
            − Remove Last
          </Button>
        )}
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete exercise?">
        <p className="text-sm text-text-muted mb-6">
          This will remove {exercise.name} and all its sets from this workout.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setConfirmOpen(false);
              onDeleteExercise();
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
