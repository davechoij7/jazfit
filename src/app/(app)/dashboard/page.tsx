import { createClient } from "@/lib/supabase/server";
import { suggestMuscleGroup } from "@/lib/workout-engine";
import { DashboardContent } from "@/components/workout/dashboard-content";
import { HISTORY_LOOKBACK_DAYS } from "@/lib/constants";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user has selected exercises
  const { count } = await supabase
    .from("user_exercises")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("is_available", true);

  const hasExercises = (count ?? 0) > 0;

  // Fetch recent sessions for workout routing
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_LOOKBACK_DAYS);

  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("id, date, muscle_groups_focus, duration_seconds")
    .eq("user_id", user!.id)
    .not("completed_at", "is", null)
    .gte("date", cutoffDate.toISOString().split("T")[0])
    .order("date", { ascending: false });

  const suggestion = suggestMuscleGroup(recentSessions ?? []);

  return (
    <DashboardContent
      suggestion={suggestion}
      recentSessions={recentSessions ?? []}
      hasExercises={hasExercises}
    />
  );
}
