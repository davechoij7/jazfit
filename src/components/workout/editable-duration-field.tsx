"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkoutDuration } from "@/actions/workout";

interface EditableDurationFieldProps {
  sessionId: string;
  durationSeconds: number | null;
}

export function EditableDurationField({ sessionId, durationSeconds }: EditableDurationFieldProps) {
  const [editing, setEditing] = useState(false);
  const [minutes, setMinutes] = useState(
    durationSeconds ? Math.round(durationSeconds / 60).toString() : ""
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const displayValue = durationSeconds
    ? `${Math.round(durationSeconds / 60)} min`
    : "--";

  function handleSave() {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins < 0) {
      setEditing(false);
      return;
    }

    const newSeconds = mins * 60;
    if (newSeconds === durationSeconds) {
      setEditing(false);
      return;
    }

    startTransition(async () => {
      await updateWorkoutDuration(sessionId, newSeconds);
      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          autoFocus
          className="w-16 text-xl font-bold text-text-primary text-center bg-bg-page border border-border rounded-xl px-2 py-1 focus:border-accent focus:outline-none"
          min={0}
          aria-label="Duration in minutes"
        />
        <span className="text-xs text-text-dim">min</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      disabled={isPending}
      className="group touch-manipulation"
    >
      <p className={`text-xl font-bold text-text-primary group-active:text-accent transition-colors ${isPending ? "opacity-50" : ""}`}>
        {displayValue}
      </p>
    </button>
  );
}
