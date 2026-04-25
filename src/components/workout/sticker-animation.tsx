"use client";

/**
 * StickerAnimation — morning reward overlay.
 *
 * Plays once per day after Jaz completes a strength workout. The Snoopy that
 * appears matches the workout type (Upper or Lower).
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { markStickerSeen } from "@/actions/stickers";
import { SPLIT_IMAGES } from "@/lib/constants";
import type { StickerWorkoutType } from "@/lib/types";

const STICKER_CONFIG: Record<
  StickerWorkoutType,
  { label: string; message: string; accentColor: string; bgGradient: string }
> = {
  Upper: {
    label: "Upper Day",
    message: "Strength session done. You showed up.",
    accentColor: "#C4808E",
    bgGradient:
      "radial-gradient(circle at 50% 40%, rgba(196,128,142,0.25) 0%, rgba(240,196,206,0.15) 60%, transparent 100%)",
  },
  Lower: {
    label: "Lower Day",
    message: "Legs in the bag. Keep going.",
    accentColor: "#7A3347",
    bgGradient:
      "radial-gradient(circle at 50% 40%, rgba(122,51,71,0.25) 0%, rgba(196,128,142,0.15) 60%, transparent 100%)",
  },
};

const PARTICLE_POOL = ["✨", "🌸", "💫", "🌷", "🩷", "⭐"];
const PARTICLE_COUNT = 18;

interface Props {
  stickerId: string;
  workoutType: StickerWorkoutType;
  date: string;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function StickerAnimation({ stickerId, workoutType }: Props) {
  const [visible, setVisible] = useState(true);
  const config = STICKER_CONFIG[workoutType];
  const snoopySrc = SPLIT_IMAGES[workoutType];
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

  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
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
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: config.bgGradient }}
          />

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
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center"
              style={{
                background: `rgba(255,255,255,0.15)`,
                border: `2px solid ${config.accentColor}`,
                boxShadow: `0 0 40px ${config.accentColor}40`,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={snoopySrc}
                  alt={`${workoutType} workout sticker`}
                  width={130}
                  height={130}
                  className="object-contain select-none"
                  priority
                />
              </motion.div>
            </div>

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
