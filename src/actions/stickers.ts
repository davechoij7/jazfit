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

  const { data } = await supabase
    .from("daily_stickers")
    .select("*")
    .eq("user_id", user.id)
    .is("seen_at", null)
    .neq("sticker_size", "none")
    .order("date", { ascending: false })
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
 * Fetch sticker history for the profile calendar view.
 * Returns last N days of sticker data (including 'none' days).
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
