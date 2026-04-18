"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getAllUserExercises, createCustomExercise } from "@/actions/exercises";
import {
  MUSCLE_GROUP_COLORS,
  EQUIPMENT_LABELS,
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
} from "@/lib/constants";
import type { Exercise, MuscleGroup, EquipmentType } from "@/lib/types";

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
    () => new Set(MUSCLE_GROUPS.filter((g) => !splitMuscleGroups.includes(g)))
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setShowCreateForm(false);
    // Re-sync default collapsed set each time the drawer opens
    setCollapsedGroups(new Set(MUSCLE_GROUPS.filter((g) => !splitMuscleGroups.includes(g))));

    getAllUserExercises().then((data) => {
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

  // Split groups first (in canonical order), then the rest — so today's split
  // appears at the top of the picker regardless of MUSCLE_GROUPS ordering.
  const splitOrdered = MUSCLE_GROUPS.filter(
    (mg) => grouped[mg]?.length > 0 && splitMuscleGroups.includes(mg)
  );
  const otherOrdered = MUSCLE_GROUPS.filter(
    (mg) => grouped[mg]?.length > 0 && !splitMuscleGroups.includes(mg)
  );
  const orderedGroups = [...splitOrdered, ...otherOrdered];

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

  async function handleCreate(name: string, muscleGroup: MuscleGroup, equipmentType: EquipmentType) {
    const exercise = await createCustomExercise(name, [muscleGroup], equipmentType);
    onSelect(exercise);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise">
      {/* Create New toggle */}
      {!showCreateForm && !loading && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="w-full text-left px-3 py-3 mb-2 rounded-xl bg-accent/10 text-accent text-sm font-medium select-none touch-manipulation active:bg-accent/20 transition-colors"
        >
          + Create New Exercise
        </button>
      )}

      {/* Inline creation form */}
      {showCreateForm && (
        <CreateExerciseForm
          defaultMuscleGroup={splitMuscleGroups[0]}
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Exercise list */}
      <div className="overflow-y-auto max-h-[60vh] -mx-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : orderedGroups.length === 0 && !showCreateForm ? (
          <p className="text-center text-text-muted py-8 text-sm">
            No exercises available for this split.
          </p>
        ) : (
          <div className="space-y-2">
            {orderedGroups.map((group, idx) => {
              const isCollapsed = collapsedGroups.has(group);
              const colorClasses = MUSCLE_GROUP_COLORS[group];
              const isInSplit = splitMuscleGroups.includes(group);
              const prevGroup = idx > 0 ? orderedGroups[idx - 1] : null;
              const prevInSplit = prevGroup ? splitMuscleGroups.includes(prevGroup) : false;
              const showDivider = !isInSplit && (idx === 0 || prevInSplit);

              return (
                <div key={group}>
                  {showDivider && (
                    <p className="pt-3 pb-1 text-[11px] uppercase tracking-wide text-text-dim font-medium">
                      Other muscle groups
                    </p>
                  )}
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

// --- Inline creation form ---

function CreateExerciseForm({
  defaultMuscleGroup,
  onSave,
  onCancel,
}: {
  defaultMuscleGroup: MuscleGroup;
  onSave: (name: string, muscleGroup: MuscleGroup, equipmentType: EquipmentType) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(defaultMuscleGroup);
  const [equipmentType, setEquipmentType] = useState<EquipmentType>("machine");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await onSave(name, muscleGroup, equipmentType);
    } catch (err: any) {
      setError(err.message?.includes("unique") ? "Exercise name already exists" : "Failed to create exercise");
      setSaving(false);
    }
  }

  const selectClasses =
    "w-full rounded-lg bg-bg-elevated border border-border px-3 py-2.5 text-sm text-text-primary min-h-12 appearance-none";

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-xl bg-bg-elevated/50 border border-border space-y-3">
      <input
        type="text"
        placeholder="Exercise name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full rounded-lg bg-bg-elevated border border-border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-dim min-h-12"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
          className={selectClasses}
        >
          {MUSCLE_GROUPS.map((mg) => (
            <option key={mg} value={mg}>{mg}</option>
          ))}
        </select>

        <select
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value as EquipmentType)}
          className={selectClasses}
        >
          {EQUIPMENT_TYPES.map((et) => (
            <option key={et} value={et}>{EQUIPMENT_LABELS[et]}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-12 rounded-lg text-sm text-text-muted active:bg-bg-elevated select-none touch-manipulation"
        >
          Cancel
        </button>
        <Button type="submit" className="flex-1" disabled={!name.trim() || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
