"use client";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SPLIT_ICONS: Record<string, string> = {
  Upper: "🏋️‍♀️",
  Lower: "🦵",
  Yoga: "🧘‍♀️",
  Barre: "🩰",
  Walk: "🚶‍♀️",
  Run: "🏃‍♀️",
};

interface WorkoutHistoryRowProps {
  sessions: { date: string; workout_type: string | null }[];
}

function buildWeekDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export function WorkoutHistoryRow({ sessions }: WorkoutHistoryRowProps) {
  const weekDays = buildWeekDays();
  const todayDate = weekDays[weekDays.length - 1];

  // Build a map: date → first session's workout_type
  const sessionByDate = new Map<string, string>();
  for (const s of sessions) {
    if (s.workout_type && !sessionByDate.has(s.date)) {
      sessionByDate.set(s.date, s.workout_type);
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
          const workoutType = sessionByDate.get(date) ?? null;
          const isToday = date === todayDate;
          const emoji = workoutType ? (SPLIT_ICONS[workoutType] ?? "💪") : null;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-lg flex items-center justify-center"
                style={{
                  height: "36px",
                  background: workoutType
                    ? "#C4808E"
                    : "rgba(229, 203, 207, 0.3)",
                  outline: isToday
                    ? "2px solid rgba(122, 51, 71, 0.3)"
                    : "none",
                  outlineOffset: "1px",
                }}
              >
                {emoji && (
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>
                    {emoji}
                  </span>
                )}
              </div>
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
