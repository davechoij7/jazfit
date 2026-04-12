"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EQUIPMENT_LABELS, MUSCLE_GROUP_COLORS } from "@/lib/constants";
import type { Exercise, MuscleGroup } from "@/lib/types";

interface MuscleGroupSectionProps {
  group: MuscleGroup;
  exercises: Exercise[];
  selectedIds: Set<string>;
  onToggle: (exerciseId: string) => void;
  onToggleAll: (exerciseIds: string[], selected: boolean) => void;
}

export function MuscleGroupSection({
  group,
  exercises,
  selectedIds,
  onToggle,
  onToggleAll,
}: MuscleGroupSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const selectedCount = exercises.filter((e) => selectedIds.has(e.id)).length;
  const allSelected = selectedCount === exercises.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-card
                   select-none touch-manipulation min-h-12"
      >
        <div className="flex items-center gap-3">
          <Badge colorClass={MUSCLE_GROUP_COLORS[group]}>{group}</Badge>
          <span className="text-sm text-text-muted">
            {selectedCount}/{exercises.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-text-dim transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          <button
            type="button"
            onClick={() =>
              onToggleAll(
                exercises.map((e) => e.id),
                !allSelected
              )
            }
            className="w-full px-4 py-2 text-left text-sm text-accent font-medium
                       active:bg-bg-elevated select-none touch-manipulation"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>

          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onToggle(exercise.id)}
              className="w-full flex items-center justify-between px-4 py-3
                         border-t border-border/50 active:bg-bg-elevated
                         select-none touch-manipulation min-h-12"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${
                      selectedIds.has(exercise.id)
                        ? "bg-accent border-accent"
                        : "border-text-dim"
                    }`}
                >
                  {selectedIds.has(exercise.id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-text-primary">{exercise.name}</span>
              </div>
              <span className="text-xs text-text-dim capitalize">
                {EQUIPMENT_LABELS[exercise.equipment_type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
