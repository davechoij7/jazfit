"use client";

import Link from "next/link";
import { SPLIT_ICONS } from "@/lib/constants";
import type { WorkoutSplit } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WorkoutHistoryRowProps {
  sessions: { id: string; date: string; workout_type: string | null }[];
}

function buildWeekDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

export function WorkoutHistoryRow({ sessions }: WorkoutHistoryRowProps) {
  const weekDays = buildWeekDays();
  const todayDate = weekDays[weekDays.length - 1];

  // Build a map: date → first session's id + workout_type
  const sessionByDate = new Map<string, { id: string; workout_type: string | null }>();
  for (const s of sessions) {
    if (!sessionByDate.has(s.date)) {
      sessionByDate.set(s.date, { id: s.id, workout_type: s.workout_type });
    }
  }

  const sessionCount = weekDays.filter((d) => sessionByDate.has(d)).length;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(240, 196, 206, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow: "0 2px 12px rgba(122, 51, 71, 0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium tracking-wide uppercase text-[#7A6068]">
          🏅 Workouts — 7 days
        </p>
        <p className="text-xs font-medium text-[#C4808E]">
          {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
        </p>
      </div>

      {/* Tile row */}
      <div className="flex gap-1.5">
        {weekDays.map((date) => {
          const session = sessionByDate.get(date);
          const hasSession = !!session;
          const isToday = date === todayDate;
          const emoji = hasSession
            ? (session!.workout_type ? (SPLIT_ICONS[session!.workout_type as WorkoutSplit] ?? "💪") : "💪")
            : null;

          const tileStyle = {
            height: "36px",
            background: hasSession ? "#C4808E" : "rgba(229, 203, 207, 0.3)",
            outline: isToday ? "2px solid rgba(122, 51, 71, 0.3)" : "none",
            outlineOffset: "1px",
          };

          const tileContent = emoji ? (
            <span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>
          ) : null;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              {hasSession ? (
                <Link
                  href={`/history/${session!.id}`}
                  className="w-full rounded-lg flex items-center justify-center"
                  style={tileStyle}
                >
                  {tileContent}
                </Link>
              ) : (
                <div
                  className="w-full rounded-lg flex items-center justify-center"
                  style={tileStyle}
                />
              )}
              <span
                className="text-[10px] font-medium"
                style={{ color: isToday ? "#C4808E" : "#B8A0A6" }}
              >
                {DAY_LABELS[new Date(date + "T00:00:00").getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
