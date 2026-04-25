"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { SaveError, SaveStatusKind } from "@/lib/hooks/use-save-status";

interface SaveIndicatorProps {
  status: SaveStatusKind;
  lastError: SaveError | null;
  onDismissError?: () => void;
}

/**
 * Compact pill shown in the active-workout header. Replaces silent failure —
 * Jaz can now see that a save is in flight, succeeded, or (critically) failed.
 * Tapping the error pill retries the last failed write.
 */
export function SaveIndicator({ status, lastError, onDismissError }: SaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <AnimatePresence mode="wait">
      {status === "saving" && (
        <motion.div
          key="saving"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-[11px] text-text-dim select-none"
        >
          <span className="w-2.5 h-2.5 border border-text-dim border-t-transparent rounded-full animate-spin" />
          Saving
        </motion.div>
      )}

      {status === "saved" && (
        <motion.div
          key="saved"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5 text-[11px] text-[#4E8F5E] select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4E8F5E]" />
          Saved
        </motion.div>
      )}

      {status === "error" && lastError && (
        <motion.button
          key="error"
          type="button"
          onClick={() => void lastError.retry()}
          onDoubleClick={onDismissError}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-[11px] text-error select-none touch-manipulation
                     px-2 py-1 rounded-full bg-error/10 active:bg-error/20"
          aria-label={`${lastError.message} — tap to retry`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-error" />
          Retry save
        </motion.button>
      )}
    </AnimatePresence>
  );
}
