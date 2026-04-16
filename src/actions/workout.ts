"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/workout-engine";
import type { MuscleGroup, WorkoutSplit } from "@/lib/types";

export async function createWorkoutSession(
  muscleGroups: MuscleGroup[],
  workoutType: WorkoutSplit,
  date?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      date: date ?? new Date().toISOString().split("T")[0],
      muscle_groups_focus: muscleGroups,
      workout_type: workoutType,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateWorkoutDate(sessionId: string, date: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_sessions")
    .update({ date })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/history/${sessionId}`);
  revalidatePath("/history");
  revalidatePath("/dashboard");
}

export async function updateWorkoutDuration(sessionId: string, durationSeconds: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_sessions")
    .update({ duration_seconds: durationSeconds })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/history/${sessionId}`);
  revalidatePath("/history");
}

export async function createExerciseLog(
  sessionId: string,
  exerciseId: string,
  orderIndex: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercise_logs")
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      order_index: orderIndex,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function logSet(
  exerciseLogId: string,
  setNumber: number,
  targetWeight: number | null,
  actualWeight: number | null,
  targetReps: number | null,
  actualReps: number | null
) {
  const supabase = await createClient();

  const { error } = await supabase.from("set_logs").insert({
    exercise_log_id: exerciseLogId,
    set_number: setNumber,
    target_weight: targetWeight,
    actual_weight: actualWeight,
    target_reps: targetReps,
    actual_reps: actualReps,
    completed_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function completeWorkoutSession(
  sessionId: string,
  durationSeconds: number,
  notes?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sessions")
    .update({
      duration_seconds: durationSeconds,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
}

export async function deleteWorkoutSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export interface WorkoutStats {
  totalWorkouts: number;
  streak: number;
  mostUsedSplit: WorkoutSplit | null;
}

export async function getWorkoutStats(): Promise<WorkoutStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { totalWorkouts: 0, streak: 0, mostUsedSplit: null };

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("date, workout_type")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("date", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return { totalWorkouts: 0, streak: 0, mostUsedSplit: null };
  }

  const totalWorkouts = sessions.length;
  const streak = computeStreak(sessions);

  // Mode of workout_type
  const counts: Partial<Record<string, number>> = {};
  for (const s of sessions) {
    if (s.workout_type) counts[s.workout_type] = (counts[s.workout_type] ?? 0) + 1;
  }
  const sortedEntries = Object.entries(counts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const mostUsedSplit = (sortedEntries[0]?.[0] ?? null) as WorkoutSplit | null;

  return { totalWorkouts, streak, mostUsedSplit };
}

export async function getExerciseHistory(exerciseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get the last 5 sessions for this exercise
  const { data } = await supabase
    .from("exercise_logs")
    .select(`
      id,
      workout_sessions!inner(date, user_id),
      set_logs(set_number, actual_weight, actual_reps)
    `)
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", user.id)
    .order("workout_sessions(date)", { ascending: false })
    .limit(5);

  if (!data) return [];

  return data.map((log: any) => ({
    date: log.workout_sessions.date,
    sets: (log.set_logs ?? []).sort((a: any, b: any) => a.set_number - b.set_number),
  }));
}
