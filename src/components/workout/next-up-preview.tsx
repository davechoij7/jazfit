"use client";

import type { WorkoutExerciseState } from "@/lib/hooks/use-active-workout";

interface NextUpPreviewProps {
  nextExercise: WorkoutExerciseState | null;
  onSkipTo: () => void;
}

export function NextUpPreview({ nextExercise, onSkipTo }: NextUpPreviewProps) {
  if (!nextExercise) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-bg-card border-t border-border">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-dim tracking-wide">Next up</span>
        <span className="text-sm font-medium text-text-primary">{nextExercise.exercise.name}</span>
        {nextExercise.suggestedWeight && (
          <span className="text-xs text-text-muted">{nextExercise.suggestedWeight} lbs</span>
        )}
      </div>
      <button
        type="button"
        onClick={onSkipTo}
        className="text-xs text-accent font-medium px-2 py-1 rounded-lg
                   active:bg-accent/10 select-none touch-manipulation"
      >
        Skip to
      </button>
    </div>
  );
}
