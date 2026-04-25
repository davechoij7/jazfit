"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/workout-engine";
import { NON_STRENGTH_SPLITS } from "@/lib/constants";
import { todayInLA } from "@/lib/dates";
import type { Exercise, MuscleGroup, NonStrengthSplit, WorkoutSplit } from "@/lib/types";

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
      date: date ?? todayInLA(),
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date format");

  const { error } = await supabase
    .from("workout_sessions")
    .update({ date })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/history", "layout");
  revalidatePath("/dashboard");
}

export async function updateWorkoutDuration(sessionId: string, durationSeconds: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    throw new Error("Invalid duration");
  }

  const { error } = await supabase
    .from("workout_sessions")
    .update({ duration_seconds: durationSeconds })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/history", "layout");
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

export async function upsertSet(
  exerciseLogId: string,
  setNumber: number,
  targetWeight: number | null,
  actualWeight: number | null,
  targetReps: number | null,
  actualReps: number | null
) {
  const supabase = await createClient();

  // Upsert on the (exercise_log_id, set_number) unique key so edits to an
  // already-persisted set write through instead of creating duplicates.
  const { error } = await supabase
    .from("set_logs")
    .upsert(
      {
        exercise_log_id: exerciseLogId,
        set_number: setNumber,
        target_weight: targetWeight,
        actual_weight: actualWeight,
        target_reps: targetReps,
        actual_reps: actualReps,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "exercise_log_id,set_number" }
    );

  if (error) throw new Error(error.message);
}

export async function deleteSetLog(exerciseLogId: string, setNumber: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("set_logs")
    .delete()
    .eq("exercise_log_id", exerciseLogId)
    .eq("set_number", setNumber);

  if (error) throw new Error(error.message);
}

export async function deleteExerciseLog(exerciseLogId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("exercise_logs")
    .delete()
    .eq("id", exerciseLogId);

  if (error) throw new Error(error.message);
}

export async function completeWorkoutSession(
  sessionId: string,
  durationSeconds: number,
  notes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const completedAt = new Date().toISOString();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .update({
      duration_seconds: durationSeconds,
      notes: notes || null,
      completed_at: completedAt,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select("date, workout_type")
    .single();

  if (error) throw new Error(error.message);

  // Strength workouts (Upper / Lower) earn a daily sticker. Yoga / Walk / Run
  // / Barre still log normally but don't surface a sticker reward.
  if (session?.workout_type === "Upper" || session?.workout_type === "Lower") {
    await supabase.from("daily_stickers").upsert(
      {
        user_id: user.id,
        date: session.date,
        workout_type: session.workout_type,
      },
      { onConflict: "user_id,date" }
    );
  }
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

export interface ActiveWorkoutSnapshot {
  sessionId: string;
  split: WorkoutSplit | null;
  muscleGroups: MuscleGroup[];
  startedAt: number;
  exercises: {
    exerciseLogId: string;
    exercise: Exercise;
    sets: {
      setNumber: number;
      targetWeight: number | null;
      actualWeight: number | null;
      targetReps: number | null;
      actualReps: number | null;
      completedAt: string | null;
    }[];
  }[];
}

/**
 * Returns the user's most recent in-progress workout (completed_at IS NULL) if
 * any, hydrated with its exercise_logs and set_logs. This is the server-side
 * source of truth for resume — localStorage is only a cache.
 */
export async function getActiveWorkout(): Promise<ActiveWorkoutSnapshot | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Pull all in-progress sessions so we can skip phantom strength sessions
  // (started-but-never-logged rows left behind when the user taps Start and
  // navigates away). Non-strength workouts have no exercise_logs by design, so
  // they're always considered resumable.
  const { data: candidates } = await supabase
    .from("workout_sessions")
    .select("id, workout_type, muscle_groups_focus, created_at, exercise_logs(id)")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("created_at", { ascending: false });

  const session = (candidates ?? []).find((s: any) => {
    const isNonStrength = NON_STRENGTH_SPLITS.has(s.workout_type as NonStrengthSplit);
    const hasLogs = Array.isArray(s.exercise_logs) && s.exercise_logs.length > 0;
    return isNonStrength || hasLogs;
  });

  if (!session) return null;

  const { data: logs } = await supabase
    .from("exercise_logs")
    .select(`
      id,
      order_index,
      exercises:exercise_id (id, name, muscle_groups, equipment_type, is_default),
      set_logs (set_number, target_weight, actual_weight, target_reps, actual_reps, completed_at)
    `)
    .eq("session_id", session.id)
    .order("order_index", { ascending: true });

  return {
    sessionId: session.id as string,
    split: (session.workout_type ?? null) as WorkoutSplit | null,
    muscleGroups: (session.muscle_groups_focus ?? []) as MuscleGroup[],
    startedAt: new Date(session.created_at).getTime(),
    exercises: (logs ?? []).map((log: any) => ({
      exerciseLogId: log.id as string,
      exercise: log.exercises as Exercise,
      sets: (log.set_logs ?? [])
        .slice()
        .sort((a: any, b: any) => a.set_number - b.set_number)
        .map((s: any) => ({
          setNumber: s.set_number as number,
          targetWeight: s.target_weight as number | null,
          actualWeight: s.actual_weight as number | null,
          targetReps: s.target_reps as number | null,
          actualReps: s.actual_reps as number | null,
          completedAt: s.completed_at as string | null,
        })),
    })),
  };
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
