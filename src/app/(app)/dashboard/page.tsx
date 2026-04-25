import { createClient } from "@/lib/supabase/server";
import { suggestSplit } from "@/lib/workout-engine";
import { DashboardContent } from "@/components/workout/dashboard-content";
import type { DailyStep } from "@/actions/health";
import { getUnseenSticker } from "@/actions/stickers";
import { getActiveWorkout } from "@/actions/workout";
import { todayInLA, daysAgoInLA } from "@/lib/dates";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 7-day date range for steps query (LA time — matches iPhone-reported dates)
  const stepsEnd = todayInLA();
  const stepsStart = daysAgoInLA(6);

  // Run independent fetches in parallel — all use the SAME supabase client
  // to avoid token refresh race conditions with separate clients
  const [{ count }, { data: recentSessions }, { data: stepsData }, unseenSticker, activeWorkout] = await Promise.all([
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
      .gte("date", daysAgoInLA(14)),
    supabase
      .from("daily_steps")
      .select("date, step_count, created_at")
      .eq("user_id", user!.id)
      .gte("date", stepsStart)
      .lte("date", stepsEnd)
      .order("date", { ascending: true })
      ,
    getUnseenSticker(),
    getActiveWorkout(),
  ]);

  const weeklySteps: DailyStep[] = (stepsData ?? []) as DailyStep[];

  const hasExercises = (count ?? 0) > 0;
  const suggestedSplit = suggestSplit(recentSessions ?? []);

  const activeSession = activeWorkout
    ? { sessionId: activeWorkout.sessionId, split: activeWorkout.split }
    : null;

  return (
    <DashboardContent
      hasExercises={hasExercises}
      suggestedSplit={suggestedSplit}
      weeklySteps={weeklySteps}
      recentSessions={recentSessions ?? []}
      unseenSticker={unseenSticker}
      activeSession={activeSession}
    />
  );
}
