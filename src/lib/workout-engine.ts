import type {
  MuscleGroup,
  MuscleGroupSuggestion,
  MuscleGroupStat,
  ProgressiveOverloadSuggestion,
  WorkoutSession,
  WorkoutSplit,
  SetLog,
  EquipmentType,
} from "./types";
import {
  MUSCLE_GROUPS,
  SYNERGY_GROUPS,
  RECOVERY_WINDOW_HOURS,
  HISTORY_LOOKBACK_DAYS,
  PROGRESSION_THRESHOLD_SESSIONS,
  DEFAULT_WEIGHT_INCREMENT,
  EXERCISES_PER_WORKOUT,
  getWeightIncrement,
} from "./constants";
import { todayInLA, daysAgoInLA } from "./dates";

/**
 * Suggest today's muscle group based on workout history.
 *
 * Algorithm:
 * 1. Build a "last trained" map for each muscle group from recent sessions
 * 2. Filter out groups still within recovery window (< 48h)
 * 3. Apply synergy grouping (Push/Pull/Lower/Core)
 * 4. Pick the synergy group whose primary muscle has the longest rest
 */
export function suggestMuscleGroup(
  recentSessions: Pick<WorkoutSession, "date" | "muscle_groups_focus">[]
): MuscleGroupSuggestion {
  const now = new Date();
  const cutoff = new Date(now.getTime() - HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  // Build last-trained map
  const allGroupStats: MuscleGroupStat[] = MUSCLE_GROUPS.map((group) => {
    let lastTrainedDate: string | null = null;
    let daysSinceLast = Infinity;

    for (const session of recentSessions) {
      const sessionDate = new Date(session.date);
      if (sessionDate < cutoff) continue;

      if (session.muscle_groups_focus.includes(group)) {
        if (!lastTrainedDate || session.date > lastTrainedDate) {
          lastTrainedDate = session.date;
          const diffMs = now.getTime() - sessionDate.getTime();
          daysSinceLast = diffMs / (1000 * 60 * 60 * 24);
        }
      }
    }

    return { group, lastTrainedDate, daysSinceLast };
  });

  // Filter out groups still recovering (< 48 hours)
  const recoveryDays = RECOVERY_WINDOW_HOURS / 24;
  const availableGroups = allGroupStats.filter(
    (stat) => stat.daysSinceLast >= recoveryDays
  );

  // Score each synergy group by the primary muscle's rest time
  let bestSynergy = SYNERGY_GROUPS[0];
  let bestPrimaryRest = -1;

  for (const synergy of SYNERGY_GROUPS) {
    const primaryStat = availableGroups.find((s) => s.group === synergy.primary);
    if (!primaryStat) continue;

    // Also check that at least the primary is available
    if (primaryStat.daysSinceLast > bestPrimaryRest) {
      bestPrimaryRest = primaryStat.daysSinceLast;
      bestSynergy = synergy;
    }
  }

  // Build reasoning message
  const primaryStat = allGroupStats.find((s) => s.group === bestSynergy.primary)!;
  const daysRounded = Math.floor(primaryStat.daysSinceLast);
  const reasoning =
    primaryStat.daysSinceLast === Infinity
      ? `${bestSynergy.primary} hasn't been trained recently`
      : `${bestSynergy.primary} hasn't been trained in ${daysRounded} day${daysRounded !== 1 ? "s" : ""}`;

  return {
    primary: bestSynergy.primary,
    secondary: bestSynergy.secondary as MuscleGroup[],
    daysSinceLastPrimary: primaryStat.daysSinceLast,
    reasoning,
    allGroupStats,
  };
}

/**
 * Select exercises for a workout from the user's available pool.
 * Prioritizes exercises not done recently for variety.
 */
export function selectExercises<
  T extends { exercise_id: string; exercise: { muscle_groups: string[] } }
>(
  availableExercises: T[],
  targetGroups: MuscleGroup[],
  recentExerciseIds: string[],
  count: number = EXERCISES_PER_WORKOUT
): T[] {
  // Filter to exercises that hit at least one target group
  const matching = availableExercises.filter((ue) =>
    ue.exercise.muscle_groups.some((mg) => targetGroups.includes(mg as MuscleGroup))
  );

  // Sort: exercises not done recently first, then shuffle within tiers
  const notRecent = matching.filter((e) => !recentExerciseIds.includes(e.exercise_id));
  const recent = matching.filter((e) => recentExerciseIds.includes(e.exercise_id));

  // Shuffle each tier for variety
  shuffle(notRecent);
  shuffle(recent);

  return [...notRecent, ...recent].slice(0, count);
}

/**
 * Calculate progressive overload suggestion for an exercise.
 *
 * If the user hit target reps for all working sets in the last N consecutive
 * sessions at the same weight, suggest increasing by the default increment.
 */
export function getProgressiveOverload(
  sessionHistory: { weight: number; reps: number[]; date: string }[],
  equipmentType?: EquipmentType
): ProgressiveOverloadSuggestion | null {
  if (sessionHistory.length === 0) {
    return null;
  }

  const lastSession = sessionHistory[0];
  const lastWeight = !isFinite(lastSession.weight) || lastSession.weight <= 0
    ? 0
    : lastSession.weight;
  const lastReps = lastSession.reps;

  // Find consecutive sessions at the same weight
  let consecutiveAtWeight = 0;
  let allHitTarget = true;

  for (const session of sessionHistory) {
    if (session.weight !== lastWeight) break;

    consecutiveAtWeight++;

    // Check if all sets hit target (we consider >=10 reps as hitting target for now)
    // In practice, target reps come from the set_logs.target_reps field
    const avgReps = session.reps.reduce((a, b) => a + b, 0) / session.reps.length;
    if (avgReps < 10) {
      allHitTarget = false;
    }
  }

  const shouldProgress =
    consecutiveAtWeight >= PROGRESSION_THRESHOLD_SESSIONS && allHitTarget;

  const increment = equipmentType
    ? getWeightIncrement(equipmentType)
    : DEFAULT_WEIGHT_INCREMENT;

  const suggestedWeight = shouldProgress
    ? lastWeight + increment
    : lastWeight;

  const message = shouldProgress
    ? `You did ${lastWeight} lbs last time. Ready for ${suggestedWeight}?`
    : `Last time: ${lastWeight} lbs x ${lastReps.join(", ")} reps`;

  return {
    lastWeight,
    lastReps,
    suggestedWeight,
    suggestedReps: 10,
    shouldProgress,
    message,
  };
}

/**
 * Summarize exercise history from set_logs into per-session data
 * for the progressive overload calculator.
 */
export function summarizeExerciseHistory(
  setLogs: (SetLog & { session_date: string })[]
): { weight: number; reps: number[]; date: string }[] {
  // Group by session date
  const byDate = new Map<string, SetLog[]>();
  for (const log of setLogs) {
    const date = log.session_date;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(log);
  }

  // Convert to summary format, sorted by date descending
  const summaries = Array.from(byDate.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, sets]) => {
      const workingSets = filterWorkingSets(sets);
      const weight = workingSets.length > 0
        ? Math.max(...workingSets.map((s) => s.actual_weight ?? 0))
        : 0;
      const reps = workingSets.map((s) => s.actual_reps ?? 0);
      return { weight, reps, date };
    });

  return summaries;
}

/**
 * Filter out warm-up sets (< 70% of max weight in the session)
 */
function filterWorkingSets(sets: SetLog[]): SetLog[] {
  if (sets.length === 0) return sets;
  const maxWeight = Math.max(...sets.map((s) => s.actual_weight ?? 0));
  if (maxWeight <= 0) return sets;

  const threshold = maxWeight * 0.7;
  return sets.filter((s) => (s.actual_weight ?? 0) >= threshold);
}

/**
 * Suggest Upper or Lower split based on the most recent workout.
 * If last session was Upper → suggest Lower, and vice versa.
 * Defaults to Upper if no history.
 */
export function suggestSplit(
  recentSessions: Pick<WorkoutSession, "date" | "muscle_groups_focus">[]
): WorkoutSplit {
  if (recentSessions.length === 0) return "Upper";

  const last = recentSessions[0]; // sorted descending by date
  const upperGroups: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Biceps", "Triceps"];
  const wasUpper = last.muscle_groups_focus.some((g) =>
    upperGroups.includes(g as MuscleGroup)
  );
  return wasUpper ? "Lower" : "Upper";
}

/** Fisher-Yates shuffle (mutates array) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Compute current workout streak in calendar days.
 * Streak = consecutive calendar days ending today or yesterday with at least one completed session.
 */
export function computeStreak(sessions: { date: string }[]): number {
  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  if (dates.length === 0) return 0;

  const today = todayInLA();
  const yesterday = daysAgoInLA(1);

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diffMs = new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}
