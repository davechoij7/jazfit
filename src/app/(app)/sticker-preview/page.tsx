"use client";

/**
 * DEV-ONLY: Preview the sticker animation for each strength workout type.
 * Delete this page before shipping to prod, or gate behind a flag.
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { StickerAnimation } from "@/components/workout/sticker-animation";
import { StickerCalendar } from "@/components/workout/sticker-calendar";
import { SPLIT_IMAGES } from "@/lib/constants";
import type { DailySticker, StickerWorkoutType } from "@/lib/types";

const TYPES: StickerWorkoutType[] = ["Upper", "Lower"];

// Generate mock sticker data for the current month
function generateMockStickers(): DailySticker[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayNum = today.getDate();

  const pattern: (StickerWorkoutType | null)[] = [
    "Upper", "Lower", null, "Upper", "Lower", null, null,
    "Upper", "Lower", null, null, "Upper", "Lower", null,
    "Upper", null, null, "Lower", "Upper", null,
    "Lower", "Upper", null, null, "Upper", "Lower", null,
    null, "Upper", null, "Lower",
  ];

  const stickers: DailySticker[] = [];
  for (let d = 1; d < todayNum; d++) {
    const type = pattern[(d - 1) % pattern.length];
    if (!type) continue;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    stickers.push({
      id: `mock-${d}`,
      user_id: "preview",
      date: dateStr,
      workout_type: type,
      seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
  }
  return stickers;
}

const MOCK_STICKERS = generateMockStickers();

export default function StickerPreviewPage() {
  const [activeType, setActiveType] = useState<StickerWorkoutType | null>(null);

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-display text-2xl text-text-primary mb-2">Sticker Preview</h1>
      <p className="text-sm text-text-muted mb-6">Tap a workout type to see the morning animation.</p>

      <div className="space-y-3">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className="w-full rounded-2xl border p-4 flex items-center gap-4 text-left"
            style={{ borderColor: "#E5CBCF", background: "#F3DDE0" }}
          >
            <Image
              src={SPLIT_IMAGES[type]}
              alt={type}
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              <p className="font-medium text-text-primary">{type} Day</p>
              <p className="text-sm text-text-muted">
                {type === "Upper"
                  ? "Strength session done. You showed up."
                  : "Legs in the bag. Keep going."}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl text-text-primary mb-1">Calendar preview</h2>
        <p className="text-sm text-text-muted mb-3">Mock data — shows what this month looks like populated.</p>
        <StickerCalendar stickers={MOCK_STICKERS} />
      </div>

      <AnimatePresence>
        {activeType && (
          <StickerAnimation
            stickerId={`preview-${activeType}`}
            workoutType={activeType}
            date={new Date().toISOString().slice(0, 10)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
