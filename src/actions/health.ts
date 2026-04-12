"use server";

import { createClient } from "@/lib/supabase/server";

export interface DailyStep {
  date: string;       // YYYY-MM-DD
  step_count: number;
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

  // Calculate date range (today and the 6 days before)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const startDate = sevenDaysAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_steps")
    .select("date, step_count")
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
