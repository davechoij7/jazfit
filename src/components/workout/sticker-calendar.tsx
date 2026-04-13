"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailySticker, StickerSize } from "@/lib/types";

// ─── EDIT THIS SECTION TO CHANGE STICKER VISUALS ───────────────────────
const STICKER_DISPLAY: Record<
  StickerSize,
  { emoji: string; color: string; label: string; ringColor: string }
> = {
  big: {
    emoji: "🌟",
    color: "#D4A960",
    label: "Gold Star",
    ringColor: "rgba(212,169,96,0.35)",
  },
  medium: {
    emoji: "🌸",
    color: "#C4808E",
    label: "Bloom",
    ringColor: "rgba(196,128,142,0.3)",
  },
  small: {
    emoji: "🌿",
    color: "#7EBF8E",
    label: "Sprout",
    ringColor: "rgba(126,191,142,0.3)",
  },
  none: {
    emoji: "",
    color: "transparent",
    label: "No sticker",
    ringColor: "transparent",
  },
};
// ─── END EDITABLE SECTION ──────────────────────────────────────────────

interface Props {
  stickers: DailySticker[];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0 = Sunday
  return new Date(year, month, 1).getDay();
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function StickerCalendar({ stickers }: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build a map of date -> sticker for quick lookup
  const stickerMap = useMemo(() => {
    const map = new Map<string, DailySticker>();
    for (const s of stickers) {
      map.set(s.date, s);
    }
    return map;
  }, [stickers]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  // Don't let them navigate into the future
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
    setSelectedDay(null);
  }

  function nextMonth() {
    if (!canGoForward) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDay(null);
  }

  // Build grid cells: leading blanks + day cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedSticker = selectedDay ? stickerMap.get(selectedDay) : null;

  // Summary counts for this month
  const monthlyCounts = useMemo(() => {
    let big = 0, medium = 0, small = 0;
    for (const [date, s] of stickerMap) {
      const d = new Date(date + "T00:00:00");
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        if (s.sticker_size === "big") big++;
        else if (s.sticker_size === "medium") medium++;
        else if (s.sticker_size === "small") small++;
      }
    }
    return { big, medium, small };
  }, [stickerMap, viewMonth, viewYear]);

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: "#E5CBCF", background: "#F3DDE0" }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(196,128,142,0.15)" }}
        >
          <span className="text-text-secondary text-lg">‹</span>
        </button>
        <h3 className="font-display text-lg text-text-primary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          disabled={!canGoForward}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: canGoForward ? "rgba(196,128,142,0.15)" : "transparent",
            opacity: canGoForward ? 1 : 0.3,
          }}
        >
          <span className="text-text-secondary text-lg">›</span>
        </button>
      </div>

      {/* Legend */}
      <div
        className="mb-3 rounded-xl p-3 grid grid-cols-3 gap-2"
        style={{ background: "rgba(255,255,255,0.4)" }}
      >
        {(["big", "medium", "small"] as const).map((size) => (
          <div key={size} className="flex items-center gap-1.5">
            <span className="text-sm leading-none">{STICKER_DISPLAY[size].emoji}</span>
            <div>
              <p className="text-[10px] font-medium leading-tight" style={{ color: "#2D1A20" }}>
                {STICKER_DISPLAY[size].label}
              </p>
              <p className="text-[9px] leading-tight" style={{ color: "#B8A0A6" }}>
                {size === "big" ? "Strength + 10K" : size === "medium" ? "Strength only" : "10K only"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium py-1"
            style={{ color: "#B8A0A6" }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} className="aspect-square" />;
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const sticker = stickerMap.get(dateStr);
          const isFuture = new Date(dateStr + "T00:00:00") > today;
          const isToday = dateStr === today.toISOString().split("T")[0];
          const isSelected = selectedDay === dateStr;
          const display = sticker ? STICKER_DISPLAY[sticker.sticker_size] : null;
          const hasSticker = display && sticker?.sticker_size !== "none";

          return (
            <button
              key={dateStr}
              disabled={isFuture}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all"
              style={{
                opacity: isFuture ? 0.3 : 1,
                background: isSelected
                  ? "rgba(196,128,142,0.2)"
                  : hasSticker
                    ? display.ringColor
                    : "transparent",
                border: isToday ? "1.5px solid #C4808E" : "1.5px solid transparent",
              }}
            >
              {hasSticker ? (
                <span className="text-base leading-none select-none">
                  {display.emoji}
                </span>
              ) : (
                <span
                  className="text-xs"
                  style={{ color: isFuture ? "#B8A0A6" : "#7A6068" }}
                >
                  {day}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selectedSticker && selectedSticker.sticker_size !== "none" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl p-3 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.5)" }}
            >
              <span className="text-2xl">
                {STICKER_DISPLAY[selectedSticker.sticker_size].emoji}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {STICKER_DISPLAY[selectedSticker.sticker_size].label}
                </p>
                <p className="text-xs" style={{ color: "#7A6068" }}>
                  {selectedSticker.had_workout ? "Strength" : "No workout"}
                  {" · "}
                  {selectedSticker.step_count?.toLocaleString() ?? "—"} steps
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly summary */}
      <div className="mt-3 flex justify-center gap-4">
        {monthlyCounts.big > 0 && (
          <span className="text-xs" style={{ color: "#7A6068" }}>
            🌟 {monthlyCounts.big}
          </span>
        )}
        {monthlyCounts.medium > 0 && (
          <span className="text-xs" style={{ color: "#7A6068" }}>
            🌸 {monthlyCounts.medium}
          </span>
        )}
        {monthlyCounts.small > 0 && (
          <span className="text-xs" style={{ color: "#7A6068" }}>
            🌿 {monthlyCounts.small}
          </span>
        )}
        {monthlyCounts.big === 0 && monthlyCounts.medium === 0 && monthlyCounts.small === 0 && (
          <span className="text-xs" style={{ color: "#B8A0A6" }}>
            No stickers yet this month
          </span>
        )}
      </div>

    </div>
  );
}
