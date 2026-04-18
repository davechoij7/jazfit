"use client";

import { motion } from "framer-motion";
import { NumberInput } from "@/components/ui/number-input";
import type { ActiveSet } from "@/lib/types";

interface SetRowProps {
  set: ActiveSet;
  weightStep?: number;
  onUpdateWeight: (value: number) => void;
  onUpdateReps: (value: number) => void;
  onDelete: () => void;
}

const rowVariants = {
  completed: { scale: [1, 1.03, 1] },
  idle: {},
};

export function SetRow({ set, weightStep = 5, onUpdateWeight, onUpdateReps, onDelete }: SetRowProps) {
  return (
    <motion.div
      variants={rowVariants}
      animate={set.isCompleted ? "completed" : "idle"}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors
        ${set.isCompleted ? "bg-success/10 border border-success/30" : "bg-bg-card border border-border"}`}
    >
      {/* Set number */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold
          ${set.isCompleted ? "bg-success/20 text-success" : "bg-bg-elevated text-text-dim"}`}
      >
        {set.setNumber}
      </div>

      {/* Weight + reps inputs */}
      <motion.div
        className="flex gap-3 flex-1"
        animate={{ opacity: set.isCompleted ? 0.85 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Weight input */}
        <NumberInput
          value={set.actualWeight ?? set.targetWeight}
          onChange={onUpdateWeight}
          step={weightStep}
          min={0}
          max={500}
          label="lbs"
        />

        {/* Reps input */}
        <NumberInput
          value={set.actualReps ?? set.targetReps}
          onChange={onUpdateReps}
          step={1}
          min={0}
          max={100}
          label="reps"
        />
      </motion.div>

      {/* PR badge */}
      {set.isPR && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10px] font-semibold text-white bg-accent px-1.5 py-0.5 rounded-full shrink-0"
        >
          PR
        </motion.span>
      )}

      {/* Delete set */}
      <motion.button
        type="button"
        onClick={onDelete}
        whileTap={{ scale: 0.92 }}
        aria-label="Delete set"
        className="w-12 h-12 rounded-xl bg-bg-elevated text-text-dim flex items-center justify-center shrink-0
                   active:bg-error/10 active:text-error select-none touch-manipulation"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </motion.button>
    </motion.div>
  );
}
