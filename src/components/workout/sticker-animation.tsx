"use client";

/**
 * StickerAnimation — morning reward overlay.
 *
 * EASILY EDITABLE: To change the animation visuals, edit the STICKER_CONFIG
 * object below and/or swap out the motion variants. The component shell
 * (overlay, dismiss logic, mark-as-seen) stays the same.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markStickerSeen } from "@/actions/stickers";
import type { StickerSize } from "@/lib/types";

// ─── EDIT THIS SECTION TO CHANGE STICKER VISUALS ───────────────────────
// Each tier gets: emoji, label, message, particle count, color accent
const STICKER_CONFIG: Record<
  Exclude<StickerSize, "none">,
  {
    emoji: string;
    label: string;
    message: string;
    particles: number;
    accentColor: string;
    bgGradient: string;
  }
> = {
  big: {
    emoji: "🌟",
    label: "Gold Star",
    message: "Strength + 10K steps. Unstoppable.",
    particles: 24,
    accentColor: "#D4A960",
    bgGradient: "radial-gradient(circle at 50% 40%, rgba(212,169,96,0.3) 0%, rgba(196,128,142,0.15) 60%, transparent 100%)",
  },
  medium: {
    emoji: "🌸",
    label: "Bloom",
    message: "Strength session done. You showed up.",
    particles: 14,
    accentColor: "#C4808E",
    bgGradient: "radial-gradient(circle at 50% 40%, rgba(196,128,142,0.25) 0%, rgba(240,196,206,0.15) 60%, transparent 100%)",
  },
  small: {
    emoji: "🌿",
    label: "Sprout",
    message: "10K steps yesterday. Keep moving.",
    particles: 8,
    accentColor: "#7EBF8E",
    bgGradient: "radial-gradient(circle at 50% 40%, rgba(126,191,142,0.2) 0%, rgba(196,128,142,0.1) 60%, transparent 100%)",
  },
};

// Particle emojis that float up during the animation
const PARTICLE_POOL = ["✨", "🌸", "💫", "🌷", "🩷", "⭐"];
// ─── END EDITABLE SECTION ──────────────────────────────────────────────

interface Props {
  stickerId: string;
  stickerSize: Exclude<StickerSize, "none">;
  date: string;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function StickerAnimation({ stickerId, stickerSize, date }: Props) {
  const [visible, setVisible] = useState(true);
  const config = STICKER_CONFIG[stickerSize];
  const markedRef = useRef(false);

  // Mark as seen immediately on mount so refreshes don't re-trigger
  useEffect(() => {
    if (!markedRef.current) {
      markedRef.current = true;
      markStickerSeen(stickerId);
    }
  }, [stickerId]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  // Generate stable particles on first render
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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(45, 26, 32, 0.6)" }}
          onClick={handleDismiss}
        >
          {/* Glow background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: config.bgGradient }}
          />

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${p.x}%`,
                bottom: "20%",
                fontSize: `${p.size}px`,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -200, -350, -450],
              }}
              transition={{
                duration: p.duration,
                delay: 0.3 + p.delay,
                ease: "easeOut",
              }}
            >
              {p.emoji}
            </motion.span>
          ))}

          {/* Main sticker */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
            {/* Emoji ring */}
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: `rgba(255,255,255,0.15)`,
                border: `2px solid ${config.accentColor}`,
                boxShadow: `0 0 40px ${config.accentColor}40`,
              }}
            >
              <motion.span
                className="text-6xl select-none"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                {config.emoji}
              </motion.span>
            </div>

            {/* Label */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p
                className="font-display text-2xl tracking-tight"
                style={{ color: config.accentColor }}
              >
                {config.label}
              </p>
              <p className="text-sm text-white/70 mt-1 max-w-[260px]">
                {config.message}
              </p>
            </motion.div>

            {/* Tap to dismiss hint */}
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
      )}
    </AnimatePresence>
  );
}
