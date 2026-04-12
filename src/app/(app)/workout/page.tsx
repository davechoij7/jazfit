import { createClient } from "@/lib/supabase/server";
import { selectExercises } from "@/lib/workout-engine";
import { EXERCISES_PER_WORKOUT } from "@/lib/constants";
import { PreWorkoutContent } from "@/components/workout/pre-workout-content";
import type { MuscleGroup } from "@/lib/types";

interface Props {
  searchParams: Promise<{ groups?: string }>;
}

export default async function WorkoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const targetGroups = (params.groups?.split(",") ?? [
    "Chest",
  ]) as MuscleGroup[];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's available exercises for target groups
  const { data: userExercises } = await supabase
    .from("user_exercises")
    .select("exercise_id, exercises(*)")
    .eq("user_id", user!.id)
    .eq("is_available", true);

  // Fetch recent exercise IDs for variety
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  const { data: recentSessionData } = await supabase
    .from("workout_sessions")
    .select("exercise_logs(exercise_id)")
    .eq("user_id", user!.id)
    .gte("date", cutoffDate.toISOString().split("T")[0]);

  const recentExerciseIds: string[] = [];
  for (const session of recentSessionData ?? []) {
    for (const log of (session as any).exercise_logs ?? []) {
      if (!recentExerciseIds.includes(log.exercise_id)) {
        recentExerciseIds.push(log.exercise_id);
      }
    }
  }

  const mapped = (userExercises ?? []).map((ue: any) => ({
    exercise_id: ue.exercise_id,
    exercise: ue.exercises,
  }));

  const selectedExercises = selectExercises(
    mapped,
    targetGroups,
    recentExerciseIds,
    EXERCISES_PER_WORKOUT
  );

  return (
    <PreWorkoutContent
      targetGroups={targetGroups}
      exercises={selectedExercises.map((se) => se.exercise)}
    />
  );
}
