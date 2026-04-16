"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkoutDate } from "@/actions/workout";

interface EditableDateFieldProps {
  sessionId: string;
  date: string; // YYYY-MM-DD
}

export function EditableDateField({ sessionId, date }: EditableDateFieldProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value;
    if (!newDate || newDate === date) return;

    startTransition(async () => {
      await updateWorkoutDate(sessionId, newDate);
      router.refresh();
    });
  }

  return (
    <div
      className="group relative flex items-center gap-1.5 text-sm text-text-muted active:text-accent transition-colors touch-manipulation text-left"
    >
      <span className={isPending ? "opacity-50" : ""}>
        {displayDate}
      </span>
      <svg
        className="w-3.5 h-3.5 text-text-dim group-active:text-accent transition-colors shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
        />
      </svg>
      <input
        type="date"
        value={date}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        aria-label="Change workout date"
      />
    </div>
  );
}
