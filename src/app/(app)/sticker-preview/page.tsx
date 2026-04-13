"use client";

/**
 * DEV-ONLY: Preview all sticker animation tiers.
 * Delete this page before shipping to prod, or gate behind a flag.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickerCalendar } from "@/components/workout/sticker-calendar";
import type { DailySticker } from "@/lib/types";

const PARTICLE_POOL = ["✨", "🌸", "💫", "🌷", "🩷", "⭐"];

const STICKER_CONFIG = {
  big: {
    emoji: "🌟",
    label: "Gold Star",
    message: "Strength + 10K steps. Unstoppable.",
    particles: 24,
    accentColor: "#D4A960",
    bgGradient:
      "radial-gradient(circle at 50% 40%, rgba(212,169,96,0.3) 0%, rgba(196,128,142,0.15) 60%, transparent 100%)",
  },
  medium: {
    emoji: "🌸",
    label: "Bloom",
    message: "Strength session done. You showed up.",
    particles: 14,
    accentColor: "#C4808E",
    bgGradient:
      "radial-gradient(circle at 50% 40%, rgba(196,128,142,0.25) 0%, rgba(240,196,206,0.15) 60%, transparent 100%)",
  },
  small: {
    emoji: "🌿",
    label: "Sprout",
    message: "10K steps yesterday. Keep moving.",
    particles: 8,
    accentColor: "#7EBF8E",
    bgGradient:
      "radial-gradient(circle at 50% 40%, rgba(126,191,142,0.2) 0%, rgba(196,128,142,0.1) 60%, transparent 100%)",
  },
} as const;

type Tier = keyof typeof STICKER_CONFIG;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function StickerPreview({ tier, onDismiss }: { tier: Tier; onDismiss: () => void }) {
  const config = STICKER_CONFIG[tier];
  const [particles] = useState(() =>
    Array.from({ length: config.particles }, (_, i) => ({
      id: i,
      emoji: PARTICLE_POOL[Math.floor(Math.random() * PARTICLE_POOL.length)],
      x: randomBetween(10, 90),
      delay: randomBetween(0, 0.6),
      duration: randomBetween(1.5, 2.5),
      size: randomBetween(14, 24),
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(45, 26, 32, 0.6)" }}
      onClick={onDismiss}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: config.bgGradient }}
      />

      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute pointer-events-none select-none"
          style={{ left: `${p.x}%`, bottom: "20%", fontSize: `${p.size}px` }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, -200, -350, -450] }}
          transition={{ duration: p.duration, delay: 0.3 + p.delay, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}

      <motion.div
        className="relative flex flex-col items-center gap-4"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: `2px solid ${config.accentColor}`,
            boxShadow: `0 0 40px ${config.accentColor}40`,
          }}
        >
          <motion.span
            className="text-6xl select-none"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            {config.emoji}
          </motion.span>
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-display text-2xl tracking-tight" style={{ color: config.accentColor }}>
            {config.label}
          </p>
          <p className="text-sm text-white/70 mt-1 max-w-[260px]">{config.message}</p>
        </motion.div>

        <motion.p
          className="text-xs text-white/40 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          tap anywhere to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// Generate mock sticker data for the current month
function generateMockStickers(): DailySticker[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayNum = today.getDate();

  const pattern: Array<"big" | "medium" | "small" | "none"> = [
    "big", "medium", "none", "small", "big", "none", "none",
    "medium", "big", "small", "none", "big", "medium", "none",
    "small", "big", "none", "medium", "big", "small",
    "none", "big", "medium", "none", "big", "small", "medium",
    "none", "big", "none", "small",
  ];

  const stickers: DailySticker[] = [];
  for (let d = 1; d < todayNum; d++) {
    const size = pattern[(d - 1) % pattern.length];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    stickers.push({
      id: `mock-${d}`,
      user_id: "preview",
      date: dateStr,
      sticker_size: size,
      had_workout: size === "big" || size === "medium",
      had_10k_steps: size === "big" || size === "small",
      step_count: size === "big" ? 12400 : size === "small" ? 10800 : size === "medium" ? 7200 : 3100,
      seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
  }
  return stickers;
}

const MOCK_STICKERS = generateMockStickers();

export default function StickerPreviewPage() {
  const [activeTier, setActiveTier] = useState<Tier | null>(null);

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="font-display text-2xl text-text-primary mb-2">Sticker Preview</h1>
      <p className="text-sm text-text-muted mb-6">Tap a tier to see the morning animation.</p>

      <div className="space-y-3">
        {(["big", "medium", "small"] as Tier[]).map((tier) => {
          const config = STICKER_CONFIG[tier];
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className="w-full rounded-2xl border p-4 flex items-center gap-4 text-left"
              style={{ borderColor: "#E5CBCF", background: "#F3DDE0" }}
            >
              <span className="text-3xl">{config.emoji}</span>
              <div>
                <p className="font-medium text-text-primary">
                  {config.label}{" "}
                  <span className="text-xs font-normal" style={{ color: config.accentColor }}>
                    ({tier})
                  </span>
                </p>
                <p className="text-sm text-text-muted">{config.message}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Calendar preview */}
      <div className="mt-8">
        <h2 className="font-display text-xl text-text-primary mb-1">Calendar preview</h2>
        <p className="text-sm text-text-muted mb-3">Mock data — shows what this month looks like populated.</p>
        <StickerCalendar stickers={MOCK_STICKERS} />
      </div>

      <AnimatePresence>
        {activeTier && (
          <StickerPreview tier={activeTier} onDismiss={() => setActiveTier(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
