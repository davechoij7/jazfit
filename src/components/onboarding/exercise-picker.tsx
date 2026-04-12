"use client";

import { useState, useTransition } from "react";
import { MuscleGroupSection } from "./muscle-group-section";
import { Button } from "@/components/ui/button";
import { saveExerciseSelections } from "@/actions/onboarding";
import { MUSCLE_GROUPS } from "@/lib/constants";
import type { Exercise, MuscleGroup } from "@/lib/types";

interface ExercisePickerProps {
  exercises: Exercise[];
  initialSelectedIds?: string[];
}

export function ExercisePicker({ exercises, initialSelectedIds = [] }: ExercisePickerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [isPending, startTransition] = useTransition();

  const exercisesByGroup = MUSCLE_GROUPS.reduce(
    (acc, group) => {
      acc[group] = exercises.filter((e) => e.muscle_groups[0] === group);
      return acc;
    },
    {} as Record<MuscleGroup, Exercise[]>
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (selected ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await saveExerciseSelections(Array.from(selectedIds));
    });
  };

  return (
    <div className="pb-24">
      <div className="space-y-3">
        {MUSCLE_GROUPS.map((group) => (
          <MuscleGroupSection
            key={group}
            group={group}
            exercises={exercisesByGroup[group]}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
          />
        ))}
      </div>

      {/* Sticky bottom save bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-bg-primary/95 backdrop-blur-sm border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-sm text-text-muted">
            {selectedIds.size} exercise{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <Button
            onClick={handleSave}
            isLoading={isPending}
            disabled={selectedIds.size === 0}
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
