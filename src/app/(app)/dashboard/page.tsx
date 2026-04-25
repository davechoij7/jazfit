import { createClient } from "@/lib/supabase/server";
import { suggestSplit } from "@/lib/workout-engine";
import { DashboardContent } from "@/components/workout/dashboard-content";
import { getUnseenSticker } from "@/actions/stickers";
import { getActiveWorkout } from "@/actions/workout";
import { daysAgoInLA } from "@/lib/dates";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Run independent fetches in parallel — all use the SAME supabase client
  // to avoid token refresh race conditions with separate clients
  const [{ count }, { data: recentSessions }, unseenSticker, activeWorkout] = await Promise.all([
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
    getUnseenSticker(),
    getActiveWorkout(),
  ]);

  const hasExercises = (count ?? 0) > 0;
  const suggestedSplit = suggestSplit(recentSessions ?? []);

  const activeSession = activeWorkout
    ? { sessionId: activeWorkout.sessionId, split: activeWorkout.split }
    : null;

  return (
    <DashboardContent
      hasExercises={hasExercises}
      suggestedSplit={suggestedSplit}
      recentSessions={recentSessions ?? []}
      unseenSticker={unseenSticker}
      activeSession={activeSession}
    />
  );
}
