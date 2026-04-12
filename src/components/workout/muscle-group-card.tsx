"use client";

import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUP_COLORS } from "@/lib/constants";
import type { MuscleGroup, MuscleGroupStat } from "@/lib/types";

interface MuscleGroupCardProps {
  stat: MuscleGroupStat;
  isSelected: boolean;
  onSelect: (group: MuscleGroup) => void;
}

export function MuscleGroupCard({
  stat,
  isSelected,
  onSelect,
}: MuscleGroupCardProps) {
  const daysText =
    stat.daysSinceLast === Infinity
      ? "No data"
      : stat.daysSinceLast < 1
        ? "Today"
        : `${Math.floor(stat.daysSinceLast)}d ago`;

  return (
    <button
      type="button"
      onClick={() => onSelect(stat.group)}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors
                  select-none touch-manipulation min-h-12
                  ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-bg-card active:bg-bg-elevated"
                  }`}
    >
      <Badge colorClass={MUSCLE_GROUP_COLORS[stat.group]} size="sm">
        {stat.group}
      </Badge>
      <span className="text-xs text-text-dim">{daysText}</span>
    </button>
  );
}
