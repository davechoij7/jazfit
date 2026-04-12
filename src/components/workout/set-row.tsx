"use client";

import { motion } from "framer-motion";
import { NumberInput } from "@/components/ui/number-input";
import type { ActiveSet } from "@/lib/types";

interface SetRowProps {
  set: ActiveSet;
  weightStep?: number;
  onUpdateWeight: (value: number) => void;
  onUpdateReps: (value: number) => void;
  onComplete: () => void;
}

const rowVariants = {
  completed: { scale: [1, 1.03, 1] },
  idle: {},
};

export function SetRow({ set, weightStep = 5, onUpdateWeight, onUpdateReps, onComplete }: SetRowProps) {
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
        animate={{ opacity: set.isCompleted ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Weight input */}
        <NumberInput
          value={set.isCompleted ? set.actualWeight : (set.actualWeight ?? set.targetWeight)}
          onChange={onUpdateWeight}
          step={weightStep}
          min={0}
          max={500}
          label="lbs"
        />

        {/* Reps input */}
        <NumberInput
          value={set.isCompleted ? set.actualReps : (set.actualReps ?? set.targetReps)}
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

      {/* Done button */}
      {set.isCompleted ? (
        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      ) : (
        <motion.button
          type="button"
          onClick={onComplete}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shrink-0
                     active:bg-accent-muted select-none touch-manipulation font-bold text-sm"
        >
          Done
        </motion.button>
      )}
    </motion.div>
  );
}
