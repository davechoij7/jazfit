import { createClient } from "@/lib/supabase/server";
import { suggestSplit } from "@/lib/workout-engine";
import { DashboardContent } from "@/components/workout/dashboard-content";

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

  // Fetch recent sessions for split suggestion + recent workouts list
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("id, date, muscle_groups_focus, duration_seconds")
    .eq("user_id", user!.id)
    .not("completed_at", "is", null)
    .order("date", { ascending: false })
    .limit(10);

  const suggestedSplit = suggestSplit(recentSessions ?? []);

  return (
    <DashboardContent
      recentSessions={recentSessions ?? []}
      hasExercises={hasExercises}
      suggestedSplit={suggestedSplit}
    />
  );
}
