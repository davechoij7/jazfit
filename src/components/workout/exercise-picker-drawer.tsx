"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { getUserExercisesForGroups } from "@/actions/exercises";
import {
  MUSCLE_GROUP_COLORS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUPS,
} from "@/lib/constants";
import type { Exercise, MuscleGroup } from "@/lib/types";

interface ExercisePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  splitMuscleGroups: MuscleGroup[];
  alreadyAddedIds: string[];
}

export function ExercisePickerDrawer({
  isOpen,
  onClose,
  onSelect,
  splitMuscleGroups,
  alreadyAddedIds,
}: ExercisePickerDrawerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<MuscleGroup>>(
    new Set()
  );

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);

    getUserExercisesForGroups(splitMuscleGroups).then((data) => {
      if (cancelled) return;
      setExercises(data.map((d: { exercise: Exercise }) => d.exercise));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, splitMuscleGroups]);

  // Group exercises by primary muscle group (first element of muscle_groups)
  const grouped = exercises.reduce<Record<MuscleGroup, Exercise[]>>(
    (acc, exercise) => {
      const primary = exercise.muscle_groups[0];
      if (!acc[primary]) acc[primary] = [];
      acc[primary].push(exercise);
      return acc;
    },
    {} as Record<MuscleGroup, Exercise[]>
  );

  // Sort groups in canonical MUSCLE_GROUPS order
  const orderedGroups = MUSCLE_GROUPS.filter((mg) => grouped[mg]?.length > 0);

  function toggleGroup(group: MuscleGroup) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise">
      <div className="overflow-y-auto max-h-[60vh] -mx-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : orderedGroups.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">
            No exercises available for this split.
          </p>
        ) : (
          <div className="space-y-2">
            {orderedGroups.map((group) => {
              const isCollapsed = collapsedGroups.has(group);
              const colorClasses = MUSCLE_GROUP_COLORS[group];

              return (
                <div key={group}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="flex w-full items-center gap-2 min-h-12 px-1 select-none touch-manipulation"
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses}`}
                    >
                      {group}
                    </span>
                    <span className="text-xs text-text-dim">
                      {grouped[group].length}
                    </span>
                    <svg
                      className={`ml-auto h-4 w-4 text-text-dim transition-transform ${
                        isCollapsed ? "" : "rotate-180"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {!isCollapsed && (
                    <div className="ml-1">
                      {grouped[group].map((exercise) => {
                        const isAdded = alreadyAddedIds.includes(exercise.id);

                        return (
                          <button
                            key={exercise.id}
                            type="button"
                            onClick={() => handleSelect(exercise)}
                            className={`flex w-full items-center justify-between min-h-12 px-3 rounded-lg select-none touch-manipulation active:bg-bg-elevated transition-colors ${
                              isAdded ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium text-text-primary">
                                {exercise.name}
                              </span>
                              <span className="text-xs text-text-dim">
                                {EQUIPMENT_LABELS[exercise.equipment_type]}
                              </span>
                            </div>
                            {isAdded && (
                              <svg
                                className="h-4 w-4 text-accent flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
