"use server";

import { createClient } from "@/lib/supabase/server";
import { todayInLA, daysAgoInLA } from "@/lib/dates";
import type { DailySticker } from "@/lib/types";

/**
 * Fetch the most recent unseen sticker for the authenticated user. Used by
 * the dashboard to decide whether to play the morning Snoopy animation.
 */
export async function getUnseenSticker(): Promise<DailySticker | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayInLA();

  const { data } = await supabase
    .from("daily_stickers")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .is("seen_at", null)
    .limit(1)
    .maybeSingle();

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
 * Fetch the last `days` of stickers for the calendar view. Stickers are now
 * created at workout-completion time (see completeWorkoutSession), so no
 * read-side backfill is needed.
 */
export async function getStickerHistory(
  days: number = 30
): Promise<DailySticker[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const start = daysAgoInLA(days);

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
