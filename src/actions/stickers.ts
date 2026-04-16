"use server";

import { createClient } from "@/lib/supabase/server";
import { computeStickerSize } from "@/lib/sticker-utils";
import type { DailySticker } from "@/lib/types";

/**
 * Fetch the most recent unseen sticker for the authenticated user.
 * Called on dashboard load to decide whether to show the morning animation.
 */
export async function getUnseenSticker(): Promise<DailySticker | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());

  const { data } = await supabase
    .from("daily_stickers")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .is("seen_at", null)
    .neq("sticker_size", "none")
    .limit(1)
    .single();

  return (data as DailySticker) ?? null;
}

/**
 * Mark a sticker as seen (after the animation plays).
 */
export async function markStickerSeen(stickerId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("daily_stickers")
    .update({ seen_at: new Date().toISOString() })
    .eq("id", stickerId)
    .eq("user_id", user.id);
}

/**
 * Backfill stickers for dates that have a completed workout but no sticker row.
 * This covers days where the steps webhook never fired (phone off, shortcut skipped, etc).
 */
async function backfillWorkoutStickers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  startDate: string
) {
  // Get dates that already have sticker rows
  const { data: existing } = await supabase
    .from("daily_stickers")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate);

  const coveredDates = new Set((existing ?? []).map((s: { date: string }) => s.date));

  // Get completed strength workouts in the range
  // Use completed_at for the actual workout date (created_at may differ for bulk imports)
  // NULL workout_type = legacy strength sessions (before type was added)
  const { data: workouts } = await supabase
    .from("workout_sessions")
    .select("completed_at, workout_type")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .gte("completed_at", `${startDate}T00:00:00`)
    .or("workout_type.in.(Upper,Lower),workout_type.is.null");

  if (!workouts?.length) return;

  // Group by date, skip already-covered dates
  const workoutDates = new Set<string>();
  for (const w of workouts) {
    const d = (w.completed_at as string).split("T")[0];
    if (!coveredDates.has(d)) workoutDates.add(d);
  }

  // Also check for step data on those dates
  const { data: stepRows } = await supabase
    .from("daily_steps")
    .select("date, step_count")
    .eq("user_id", userId)
    .gte("date", startDate);

  const stepMap = new Map<string, number>();
  for (const row of stepRows ?? []) {
    stepMap.set(row.date as string, row.step_count as number);
  }

  // Insert sticker rows for uncovered workout dates
  for (const date of workoutDates) {
    const steps = stepMap.get(date) ?? 0;
    const stickerSize = computeStickerSize(true, steps);
    await supabase.from("daily_stickers").upsert(
      {
        user_id: userId,
        date,
        sticker_size: stickerSize,
        had_workout: true,
        had_10k_steps: steps >= 10_000,
        step_count: steps,
        seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
  }
}

/**
 * Fetch sticker history for the profile calendar view.
 * Backfills workout-only days first, then returns last N days of sticker data.
 */
export async function getStickerHistory(
  days: number = 30
): Promise<DailySticker[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const start = startDate.toISOString().split("T")[0];

  // Backfill any workout days that are missing sticker rows
  await backfillWorkoutStickers(supabase, user.id, start);

  const { data, error } = await supabase
    .from("daily_stickers")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", start)
    .order("date", { ascending: false });

  if (error) {
    console.error("[getStickerHistory] error:", error.message);
    return [];
  }

  return (data ?? []) as DailySticker[];
}
