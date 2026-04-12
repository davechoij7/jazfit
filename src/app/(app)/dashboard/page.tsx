import { createClient } from "@/lib/supabase/server";
import { suggestSplit } from "@/lib/workout-engine";
import { DashboardContent } from "@/components/workout/dashboard-content";
import { getLast7DaysSteps } from "@/actions/health";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Run independent fetches in parallel
  const [{ count }, { data: recentSessions }, weeklySteps] = await Promise.all([
    supabase
      .from("user_exercises")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("is_available", true),
    supabase
      .from("workout_sessions")
      .select("id, date, muscle_groups_focus, duration_seconds")
      .eq("user_id", user!.id)
      .not("completed_at", "is", null)
      .order("date", { ascending: false })
      .limit(10),
    getLast7DaysSteps(),
  ]);

  const hasExercises = (count ?? 0) > 0;
  const suggestedSplit = suggestSplit(recentSessions ?? []);

  return (
    <DashboardContent
      hasExercises={hasExercises}
      suggestedSplit={suggestedSplit}
      weeklySteps={weeklySteps}
    />
  );
}
