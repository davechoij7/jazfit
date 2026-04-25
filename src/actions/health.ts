"use server";

import { createClient } from "@/lib/supabase/server";
import { todayInLA, daysAgoInLA } from "@/lib/dates";

export interface DailyStep {
  date: string;       // YYYY-MM-DD
  step_count: number;
  created_at: string; // ISO timestamp of last sync for this date
}

/**
 * Returns step data for the authenticated user for the last 7 days.
 * Sparse — missing days are omitted; the caller is responsible for filling gaps.
 */
export async function getLast7DaysSteps(): Promise<DailyStep[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const endDate = todayInLA();
  const startDate = daysAgoInLA(6);

  const { data, error } = await supabase
    .from("daily_steps")
    .select("date, step_count, created_at")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("[getLast7DaysSteps] query error:", error.message);
    return [];
  }

  return (data ?? []) as DailyStep[];
}
