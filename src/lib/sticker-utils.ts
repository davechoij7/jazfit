import type { StickerSize } from "@/lib/types";

export const STEPS_GOAL = 10_000;
export const STRENGTH_TYPES = ["Upper", "Lower"];

/**
 * Determine sticker size from workout + steps data.
 * Pure function — no server/client boundary concerns.
 */
export function computeStickerSize(
  hadStrengthWorkout: boolean,
  stepCount: number | null
): StickerSize {
  const hit10k = (stepCount ?? 0) >= STEPS_GOAL;
  if (hadStrengthWorkout && hit10k) return "big";
  if (hadStrengthWorkout) return "medium";
  if (hit10k) return "small";
  return "none";
}
