"use client";

import type { DailyStep } from "@/actions/health";

interface StepsCardProps {
  data: DailyStep[];
  goal?: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Format a Date as YYYY-MM-DD in local timezone (not UTC). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns an array of the 7 days in the current week ending today (Sun→Sat order). */
function buildWeekDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(localDateStr(d));
  }
  return days;
}

export function StepsCard({ data, goal = 10_000 }: StepsCardProps) {
  const weekDays = buildWeekDays();
  const stepsByDate = new Map(data.map((d) => [d.date, d.step_count]));

  const hasAnyData = data.length > 0;

  // Today is the last entry in weekDays
  const todayDate = weekDays[weekDays.length - 1];
  const todaySteps = stepsByDate.get(todayDate) ?? 0;

  // Max value for bar scaling — at least the goal so bars never overflow
  const maxSteps = Math.max(goal, ...Array.from(stepsByDate.values()));

  // Formatted today display
  const todayFormatted =
    todaySteps >= 1000
      ? `${(todaySteps / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : todaySteps.toString();

  const goalMet = todaySteps >= goal;

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
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium tracking-wide uppercase text-[#7A6068]">
            Steps today
          </p>
          {hasAnyData ? (
            <p
              className="text-3xl font-display leading-none mt-1"
              style={{
                color: goalMet ? "#7EBF8E" : "#2D1A20",
                letterSpacing: "-0.02em",
              }}
            >
              {todayFormatted}
            </p>
          ) : (
            <p className="text-xl font-display leading-none mt-1 text-[#B8A0A6]">
              —
            </p>
          )}
        </div>

        {/* Open Health app link */}
        <a
          href="x-apple-health://"
          className="min-h-[48px] min-w-[48px] flex items-center justify-end"
          aria-label="View in Health app"
        >
          <span className="text-sm font-medium text-[#C4808E]">
            Health →
          </span>
        </a>
      </div>

      {/* Empty state */}
      {!hasAnyData ? (
        <div className="py-6 text-center">
          <p className="text-sm text-[#7A6068] leading-relaxed">
            Sync pending — run your Shortcut to get started
          </p>
        </div>
      ) : (
        /* Bar chart */
        <div className="relative">
          {/* Dotted goal line — sits at the 100% height of the chart area */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Goal line at goal/maxSteps from the top */}
            <line
              x1="0"
              y1={`${((1 - goal / maxSteps) * 100).toFixed(1)}%`}
              x2="100%"
              y2={`${((1 - goal / maxSteps) * 100).toFixed(1)}%`}
              stroke="#C4808E"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          </svg>

          {/* Bars */}
          <div className="flex items-end gap-1.5 h-20">
            {weekDays.map((date) => {
              const steps = stepsByDate.get(date) ?? 0;
              const heightPct = steps > 0 ? Math.max(4, (steps / maxSteps) * 100) : 4;
              const isToday = date === todayDate;
              const met = steps >= goal;

              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${heightPct}%`,
                      // Rose/dusty when goal met, muted blush when not, very faint if zero
                      background:
                        steps === 0
                          ? "rgba(229, 203, 207, 0.3)"
                          : met
                          ? "#C4808E"
                          : "#E8A0AD",
                      // Outline today's bar
                      outline: isToday
                        ? "2px solid rgba(122, 51, 71, 0.3)"
                        : "none",
                      outlineOffset: "1px",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Day labels */}
          <div className="flex gap-1.5 mt-1.5">
            {weekDays.map((date) => {
              const dow = new Date(date + "T00:00:00").getDay();
              const isToday = date === todayDate;
              return (
                <div key={date} className="flex-1 text-center">
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: isToday ? "#C4808E" : "#B8A0A6",
                    }}
                  >
                    {DAY_LABELS[dow]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goal label */}
      {hasAnyData && (
        <p className="text-[10px] text-[#B8A0A6] mt-3 text-right">
          Goal: {goal.toLocaleString()} steps
        </p>
      )}
    </div>
  );
}
