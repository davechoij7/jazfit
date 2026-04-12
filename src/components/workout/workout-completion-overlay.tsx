"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AFFIRMATIONS } from "@/lib/constants";
import { useMemo } from "react";

// ---- Particle ----
interface ParticleProps {
  color: string;
  angle: number;
  distance: number;
}

function Particle({ color, angle, distance }: ParticleProps) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ backgroundColor: color, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0.5,
      }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    />
  );
}

const PARTICLE_COLORS = ["#C4808E", "#F0C4CE", "#E8A0AD", "#7A3347", "#F0C4CE"];

// Pre-generate 25 particles with stable values (not inside component to avoid re-render issues)
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  angle: (i / 25) * Math.PI * 2,
  distance: 80 + (i * 7.3) % 120, // deterministic, no Math.random
}));

// ---- StatCard ----
interface StatCardProps {
  value: string | number;
  label: string;
  delay: number;
}

function StatCard({ value, label, delay }: StatCardProps) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <p className="text-3xl font-display text-text-primary">{value}</p>
      <p className="text-xs text-text-dim mt-1">{label}</p>
    </motion.div>
  );
}

// ---- Main overlay ----
interface WorkoutCompletionOverlayProps {
  isOpen: boolean;
  duration: string;
  totalSets: number;
  totalVolume: number;
  totalPRs: number;
  isNonStrength?: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  onDone: () => void;
}

export function WorkoutCompletionOverlay({
  isOpen,
  duration,
  totalSets,
  totalVolume,
  totalPRs,
  isNonStrength = false,
  notes,
  onNotesChange,
  onDone,
}: WorkoutCompletionOverlayProps) {
  const affirmation = useMemo(
    () => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
    [isOpen]
  );

  const volumeDisplay =
    totalVolume > 1000
      ? `${(totalVolume / 1000).toFixed(1)}k`
      : String(totalVolume);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] bg-bg-primary flex flex-col items-center justify-center px-6"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Particle burst layer */}
          <div
            key={isOpen ? "burst" : "idle"}
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          >
            {PARTICLES.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
            {/* Headline */}
            <div className="text-center">
              <h1 className="text-3xl font-display text-text-primary">
                Nicely done, Jazmin
              </h1>
              <p className="text-sm text-text-muted italic mt-2">{affirmation}</p>
            </div>

            {/* Stats grid */}
            {isNonStrength ? (
              <div className="flex justify-center w-full">
                <StatCard value={duration} label="Duration" delay={0.2} />
              </div>
            ) : (
              <div className={`grid gap-6 w-full ${totalPRs > 0 ? "grid-cols-4" : "grid-cols-3"}`}>
                <StatCard value={duration} label="Duration" delay={0.2} />
                <StatCard value={totalSets} label="Sets" delay={0.35} />
                <StatCard value={volumeDisplay} label="Volume" delay={0.5} />
                {totalPRs > 0 && (
                  <StatCard value={totalPRs} label="PRs" delay={0.65} />
                )}
              </div>
            )}

            {/* Notes */}
            <div className="w-full">
              <label className="block text-sm text-text-muted mb-1">
                {isNonStrength ? "Notes" : "Notes (optional)"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="How did it feel?"
                rows={isNonStrength ? 4 : 2}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border
                           text-text-primary placeholder:text-text-dim text-sm
                           focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Done button */}
            <button
              type="button"
              onClick={onDone}
              className="w-full py-4 rounded-2xl bg-accent text-white font-semibold text-base
                         active:opacity-80 select-none touch-manipulation"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
