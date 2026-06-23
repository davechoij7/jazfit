"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import {
  SPLIT_IMAGES,
  SPLIT_ICONS,
  SPLIT_DESCRIPTIONS,
  SPLIT_CATEGORIES,
} from "@/lib/constants";
import type { WorkoutSplit } from "@/lib/types";

interface MonthCalendarProps {
  sessions: { id: string; date: string; workout_type: string | null }[];
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isWorkoutSplit(value: string | null): value is WorkoutSplit {
  return value != null && value in SPLIT_IMAGES;
}

export function MonthCalendar({ sessions }: MonthCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [addDate, setAddDate] = useState<string | null>(null);

  // date → first session that day (most recent first already from the query order)
  const sessionByDate = useMemo(() => {
    const map = new Map<string, { id: string; workout_type: string | null }>();
    for (const s of sessions) {
      if (!map.has(s.date)) map.set(s.date, { id: s.id, workout_type: s.workout_type });
    }
    return map;
  }, [sessions]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const canGoForward =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (!canGoForward) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthCount = useMemo(() => {
    let n = 0;
    for (const date of sessionByDate.keys()) {
      const d = new Date(date + "T00:00:00");
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) n++;
    }
    return n;
  }, [sessionByDate, viewMonth, viewYear]);

  function startBackdated(split: WorkoutSplit) {
    if (!addDate) return;
    router.push(`/workout/active?split=${split}&date=${addDate}`);
  }

  const addDateLabel = addDate
    ? new Date(addDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(240, 196, 206, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow: "0 2px 12px rgba(122, 51, 71, 0.06)",
      }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          style={{ background: "rgba(255,255,255,0.35)" }}
          aria-label="Previous month"
        >
          <span className="text-text-secondary text-lg">‹</span>
        </button>
        <div className="text-center">
          <h3 className="font-display text-lg text-text-primary leading-none">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <p className="text-[11px] font-medium text-[#C4808E] mt-1">
            {monthCount} {monthCount === 1 ? "workout" : "workouts"}
          </p>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          disabled={!canGoForward}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
          style={{
            background: canGoForward ? "rgba(255,255,255,0.35)" : "transparent",
            opacity: canGoForward ? 1 : 0.3,
          }}
          aria-label="Next month"
        >
          <span className="text-text-secondary text-lg">›</span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[11px] font-medium py-1" style={{ color: "#B8A0A6" }}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} className="aspect-square" />;

          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const session = sessionByDate.get(dateStr);
          const isFuture = dateStr > todayStr;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isFuture}
              onClick={() => {
                if (session) router.push(`/history/${session.id}`);
                else if (!isFuture) setAddDate(dateStr);
              }}
              className="aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all overflow-hidden touch-manipulation active:scale-95"
              style={{
                opacity: isFuture ? 0.3 : 1,
                background: session ? "rgba(196,128,142,0.18)" : "transparent",
                border: isToday ? "1.5px solid #C4808E" : "1.5px solid transparent",
              }}
            >
              {session ? (
                isWorkoutSplit(session.workout_type) ? (
                  <Image
                    src={SPLIT_IMAGES[session.workout_type]}
                    alt={session.workout_type}
                    width={34}
                    height={34}
                    className="object-contain select-none"
                  />
                ) : (
                  <span className="text-lg leading-none">💪</span>
                )
              ) : (
                <span className="text-xs" style={{ color: isFuture ? "#B8A0A6" : "#7A6068" }}>
                  {day}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add-workout split chooser */}
      <Modal
        isOpen={addDate != null}
        onClose={() => setAddDate(null)}
        title={`Add workout — ${addDateLabel}`}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5 pb-2"
          >
            {SPLIT_CATEGORIES.map((category) => (
              <div key={category.label}>
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-dim mb-2">
                  {category.label}
                </p>
                <div className="space-y-2">
                  {category.splits.map((split) => (
                    <button
                      key={split}
                      type="button"
                      onClick={() => startBackdated(split)}
                      className="w-full flex items-center gap-3 rounded-2xl p-3 bg-bg-elevated active:bg-bg-card transition-colors touch-manipulation text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(196,128,142,0.15)" }}
                      >
                        <Image
                          src={SPLIT_IMAGES[split]}
                          alt={split}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-text-primary">
                          {SPLIT_ICONS[split]} {split}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {SPLIT_DESCRIPTIONS[split]}
                        </p>
                      </div>
                      <span className="text-text-dim text-lg">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Modal>
    </div>
  );
}
