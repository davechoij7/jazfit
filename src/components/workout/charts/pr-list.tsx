"use client";

import type { PREntry } from "@/actions/charts";

interface Props {
  prData: PREntry[];
  lastSessionDate: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PRList({ prData, lastSessionDate }: Props) {
  if (prData.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        Log weights to see your PRs
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {prData.map((entry) => {
        const isNew = lastSessionDate != null && entry.date === lastSessionDate;
        return (
          <div
            key={entry.name}
            className="flex items-center justify-between py-2.5 px-3 bg-bg-card rounded-xl"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {entry.name.replace(/\s*\(Machine\)\s*$/i, "")}
              </p>
              <p className="text-xs text-text-dim">{formatDate(entry.date)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {isNew && (
                <span className="text-xs font-medium text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                  New PR
                </span>
              )}
              <span className="text-sm font-semibold text-text-primary">
                {entry.weight} lbs
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
