import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EQUIPMENT_LABELS } from "@/lib/constants";
import type { Exercise, ProgressiveOverloadSuggestion } from "@/lib/types";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  overload?: ProgressiveOverloadSuggestion | null;
}

export function ExerciseCard({ exercise, index, overload }: ExerciseCardProps) {
  return (
    <Card padding="sm" className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-text-dim">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">
            {exercise.name}
          </span>
          <Badge size="sm">{EQUIPMENT_LABELS[exercise.equipment_type]}</Badge>
        </div>
        {overload && (
          <p
            className={`text-sm mt-1 ${overload.shouldProgress ? "text-success" : "text-text-muted"}`}
          >
            {overload.message}
          </p>
        )}
      </div>
    </Card>
  );
}
