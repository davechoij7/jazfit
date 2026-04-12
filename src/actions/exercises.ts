"use server";

import { createClient } from "@/lib/supabase/server";
import type { MuscleGroup } from "@/lib/types";

export async function getUserExercisesForGroups(muscleGroups: MuscleGroup[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_exercises")
    .select("exercise_id, exercises(*)")
    .eq("user_id", user.id)
    .eq("is_available", true);

  if (!data) return [];

  // Filter to exercises matching the target muscle groups
  return data
    .filter((ue: any) =>
      ue.exercises.muscle_groups.some((mg: string) =>
        muscleGroups.includes(mg as MuscleGroup)
      )
    )
    .map((ue: any) => ({
      exercise_id: ue.exercise_id,
      exercise: ue.exercises,
    }));
}

export async function getRecentSessions(days: number = 14) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data } = await supabase
    .from("workout_sessions")
    .select("id, date, muscle_groups_focus, duration_seconds, completed_at")
    .eq("user_id", user.id)
    .gte("date", cutoffDate.toISOString().split("T")[0])
    .order("date", { ascending: false });

  return data ?? [];
}

export async function getRecentExerciseIds(days: number = 7) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data } = await supabase
    .from("workout_sessions")
    .select("id, exercise_logs(exercise_id)")
    .eq("user_id", user.id)
    .gte("date", cutoffDate.toISOString().split("T")[0]);

  if (!data) return [];

  const ids = new Set<string>();
  for (const session of data) {
    for (const log of (session as any).exercise_logs ?? []) {
      ids.add(log.exercise_id);
    }
  }
  return Array.from(ids);
}
