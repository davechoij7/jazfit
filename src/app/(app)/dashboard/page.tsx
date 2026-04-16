import { createClient } from "@/lib/supabase/server";
import { suggestSplit } from "@/lib/workout-engine";
import { DashboardContent } from "@/components/workout/dashboard-content";
import type { DailyStep } from "@/actions/health";
import { getUnseenSticker } from "@/actions/stickers";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 7-day date range for steps query (use US Eastern so dates match the iPhone)
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }); // en-CA gives YYYY-MM-DD
  const stepsEnd = fmt.format(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const stepsStart = fmt.format(sevenDaysAgo);

  // Run independent fetches in parallel — all use the SAME supabase client
  // to avoid token refresh race conditions with separate clients
  const [{ count }, { data: recentSessions }, { data: stepsData }, unseenSticker] = await Promise.all([
    supabase
      .from("user_exercises")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("is_available", true),
    supabase
      .from("workout_sessions")
      .select("id, date, muscle_groups_focus, workout_type")
      .eq("user_id", user!.id)
      .not("completed_at", "is", null)
      .order("date", { ascending: false })
      .gte("date", new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0]),
    supabase
      .from("daily_steps")
      .select("date, step_count")
      .eq("user_id", user!.id)
      .gte("date", stepsStart)
      .lte("date", stepsEnd)
      .order("date", { ascending: true })
      ,
    getUnseenSticker(),
  ]);

  const weeklySteps: DailyStep[] = (stepsData ?? []) as DailyStep[];

  const hasExercises = (count ?? 0) > 0;
  const suggestedSplit = suggestSplit(recentSessions ?? []);

  return (
    <DashboardContent
      hasExercises={hasExercises}
      suggestedSplit={suggestedSplit}
      weeklySteps={weeklySteps}
      recentSessions={recentSessions ?? []}
      unseenSticker={unseenSticker}
    />
  );
}
