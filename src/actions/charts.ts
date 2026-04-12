"use server";

import { createClient } from "@/lib/supabase/server";

export interface StrengthPoint {
  date: string;
  maxWeight: number;
}

export interface VolumePoint {
  week: string;
  volume: number;
}

export interface FrequencyPoint {
  week: string;
  count: number;
}

export interface PREntry {
  name: string;
  weight: number;
  date: string;
}

export interface ChartsData {
  strengthData: Record<string, StrengthPoint[]>;
  volumeData: VolumePoint[];
  frequencyData: FrequencyPoint[];
  prData: PREntry[];
  exerciseNames: string[]; // exercises with weight data, sorted by session count desc
}

function weekLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.toLocaleDateString("en-US", { month: "short" });
  // ISO week number within month (1-indexed)
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return `${month} W${weekOfMonth}`;
}

export async function getChartsData(): Promise<ChartsData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { strengthData: {}, volumeData: [], frequencyData: [], prData: [], exerciseNames: [] };
  }

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select(`
      id,
      date,
      exercise_logs(
        exercise_id,
        exercises(name),
        set_logs(actual_weight, actual_reps)
      )
    `)
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("date", { ascending: true });

  if (!sessions || sessions.length === 0) {
    return { strengthData: {}, volumeData: [], frequencyData: [], prData: [], exerciseNames: [] };
  }

  // --- Strength & PR data ---
  const strengthMap: Record<string, { date: string; maxWeight: number }[]> = {};
  const prMap: Record<string, { weight: number; date: string }> = {};
  const exerciseSessionCount: Record<string, number> = {};

  // --- Volume data ---
  const volumeByWeek: Record<string, number> = {};

  // --- Frequency data ---
  const frequencyByWeek: Record<string, number> = {};

  for (const session of sessions) {
    const week = weekLabel(session.date);

    // Frequency: count every session
    frequencyByWeek[week] = (frequencyByWeek[week] ?? 0) + 1;

    for (const log of (session as any).exercise_logs ?? []) {
      const exerciseName: string = log.exercises?.name;
      if (!exerciseName) continue;

      const sets: { actual_weight: number | null; actual_reps: number | null }[] =
        log.set_logs ?? [];

      // Strength: collect max weight per exercise per session
      const weights = sets
        .map((s) => s.actual_weight)
        .filter((w): w is number => w != null && w > 0);

      if (weights.length > 0) {
        const maxWeight = Math.max(...weights);

        if (!strengthMap[exerciseName]) strengthMap[exerciseName] = [];
        strengthMap[exerciseName].push({ date: session.date, maxWeight });

        // PR tracking
        if (!prMap[exerciseName] || maxWeight > prMap[exerciseName].weight) {
          prMap[exerciseName] = { weight: maxWeight, date: session.date };
        }

        exerciseSessionCount[exerciseName] = (exerciseSessionCount[exerciseName] ?? 0) + 1;
      }

      // Volume: only when both weight and reps are logged
      for (const set of sets) {
        if (set.actual_weight != null && set.actual_reps != null) {
          volumeByWeek[week] = (volumeByWeek[week] ?? 0) + set.actual_weight * set.actual_reps;
        }
      }
    }
  }

  // Sort exercises by session count desc, take top 10 for the picker
  const exerciseNames = Object.keys(exerciseSessionCount)
    .sort((a, b) => exerciseSessionCount[b] - exerciseSessionCount[a])
    .slice(0, 10);

  // Build ordered frequency data (all weeks in chronological order)
  const allWeeks = Array.from(
    new Set([...Object.keys(frequencyByWeek), ...Object.keys(volumeByWeek)])
  );

  const frequencyData: FrequencyPoint[] = allWeeks.map((week) => ({
    week,
    count: frequencyByWeek[week] ?? 0,
  }));

  const volumeData: VolumePoint[] = Object.keys(volumeByWeek).map((week) => ({
    week,
    volume: Math.round(volumeByWeek[week]),
  }));

  const prData: PREntry[] = Object.entries(prMap)
    .map(([name, { weight, date }]) => ({ name, weight, date }))
    .sort((a, b) => b.weight - a.weight);

  return {
    strengthData: strengthMap,
    volumeData,
    frequencyData,
    prData,
    exerciseNames,
  };
}
