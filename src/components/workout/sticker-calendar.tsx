"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SPLIT_IMAGES } from "@/lib/constants";
import type { DailySticker, StickerWorkoutType } from "@/lib/types";

const TYPE_DISPLAY: Record<StickerWorkoutType, { label: string; ringColor: string }> = {
  Upper: { label: "Upper", ringColor: "rgba(196,128,142,0.3)" },
  Lower: { label: "Lower", ringColor: "rgba(122,51,71,0.3)" },
};

interface Props {
  stickers: DailySticker[];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
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

  const stickerMap = useMemo(() => {
    const map = new Map<string, DailySticker>();
    for (const s of stickers) map.set(s.date, s);
    return map;
  }, [stickers]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

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

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedSticker = selectedDay ? stickerMap.get(selectedDay) : null;

  // Per-type counts for this month
  const monthlyCounts = useMemo(() => {
    let upper = 0, lower = 0;
    for (const [date, s] of stickerMap) {
      const d = new Date(date + "T00:00:00");
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        if (s.workout_type === "Upper") upper++;
        else if (s.workout_type === "Lower") lower++;
      }
    }
    return { upper, lower };
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
          const display = sticker ? TYPE_DISPLAY[sticker.workout_type] : null;

          return (
            <button
              key={dateStr}
              disabled={isFuture}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all overflow-hidden"
              style={{
                opacity: isFuture ? 0.3 : 1,
                background: isSelected
                  ? "rgba(196,128,142,0.2)"
                  : sticker
                    ? display!.ringColor
                    : "transparent",
                border: isToday ? "1.5px solid #C4808E" : "1.5px solid transparent",
              }}
            >
              {sticker ? (
                <Image
                  src={SPLIT_IMAGES[sticker.workout_type]}
                  alt={display!.label}
                  width={36}
                  height={36}
                  className="object-contain select-none"
                />
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
        {selectedSticker && (
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
              <Image
                src={SPLIT_IMAGES[selectedSticker.workout_type]}
                alt={TYPE_DISPLAY[selectedSticker.workout_type].label}
                width={48}
                height={48}
                className="object-contain select-none"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {TYPE_DISPLAY[selectedSticker.workout_type].label} Day
                </p>
                <p className="text-xs" style={{ color: "#7A6068" }}>
                  {new Date(selectedSticker.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly summary */}
      <div className="mt-3 flex justify-center gap-4">
        {monthlyCounts.upper > 0 && (
          <span className="text-xs flex items-center gap-1" style={{ color: "#7A6068" }}>
            <Image src={SPLIT_IMAGES.Upper} alt="Upper" width={18} height={18} className="object-contain" />
            {monthlyCounts.upper}
          </span>
        )}
        {monthlyCounts.lower > 0 && (
          <span className="text-xs flex items-center gap-1" style={{ color: "#7A6068" }}>
            <Image src={SPLIT_IMAGES.Lower} alt="Lower" width={18} height={18} className="object-contain" />
            {monthlyCounts.lower}
          </span>
        )}
        {monthlyCounts.upper === 0 && monthlyCounts.lower === 0 && (
          <span className="text-xs" style={{ color: "#B8A0A6" }}>
            No stickers yet this month
          </span>
        )}
      </div>
    </div>
  );
}
