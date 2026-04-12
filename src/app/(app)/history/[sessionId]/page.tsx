import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkoutSummary } from "@/components/workout/workout-summary";
import { DeleteWorkoutButton } from "@/components/workout/delete-workout-button";
import { MUSCLE_GROUP_COLORS, EQUIPMENT_LABELS, WORKOUT_TYPE_COLORS } from "@/lib/constants";
import type { MuscleGroup, EquipmentType, WorkoutSplit } from "@/lib/types";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createClient();

  // Fetch session with exercise logs and set logs
  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  const { data: exerciseLogs } = await supabase
    .from("exercise_logs")
    .select(`
      id,
      order_index,
      exercise_id,
      exercises(name, muscle_groups, equipment_type),
      set_logs(id, set_number, target_weight, actual_weight, target_reps, actual_reps)
    `)
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });

  // Calculate totals
  let totalSets = 0;
  let totalVolume = 0;
  for (const log of exerciseLogs ?? []) {
    const sets = (log as any).set_logs ?? [];
    totalSets += sets.length;
    for (const set of sets) {
      totalVolume += (set.actual_weight ?? 0) * (set.actual_reps ?? 0);
    }
  }

  const dateStr = new Date(session.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{dateStr}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {session.workout_type && session.muscle_groups_focus.length === 0 ? (
              <Badge colorClass={WORKOUT_TYPE_COLORS[session.workout_type as WorkoutSplit]}>
                {session.workout_type}
              </Badge>
            ) : (
              session.muscle_groups_focus.map((g: string) => (
                <Badge key={g} colorClass={MUSCLE_GROUP_COLORS[g as MuscleGroup]}>
                  {g}
                </Badge>
              ))
            )}
          </div>
        </div>
        <DeleteWorkoutButton sessionId={sessionId} />
      </div>

      {/* Summary stats */}
      {session.workout_type && session.muscle_groups_focus.length === 0 ? (
        <Card padding="md">
          <div className="text-center">
            <p className="text-xl font-bold text-text-primary">
              {session.duration_seconds
                ? `${Math.round(session.duration_seconds / 60)} min`
                : "--"}
            </p>
            <p className="text-xs text-text-dim">Duration</p>
          </div>
        </Card>
      ) : (
        <WorkoutSummary
          duration={session.duration_seconds}
          totalSets={totalSets}
          totalVolume={totalVolume}
        />
      )}

      {/* Notes */}
      {session.notes && (
        <Card padding="sm">
          <p className="text-sm text-text-muted italic">{session.notes}</p>
        </Card>
      )}

      {/* Exercise breakdown */}
      {(exerciseLogs?.length ?? 0) > 0 && (
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-text-dim tracking-wide">
          Exercises
        </h2>

        {(exerciseLogs ?? []).map((log: any) => {
          const exercise = log.exercises;
          const sets = (log.set_logs ?? []).sort((a: any, b: any) => a.set_number - b.set_number);

          return (
            <Card key={log.id} padding="md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-text-primary">{exercise.name}</h3>
                  <span className="text-xs text-text-dim capitalize">
                    {EQUIPMENT_LABELS[exercise.equipment_type as EquipmentType]}
                  </span>
                </div>
              </div>

              {/* Sets table */}
              <div className="space-y-1">
                <div className="grid grid-cols-3 gap-2 text-xs text-text-dim tracking-wide px-1">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                </div>
                {sets.map((set: any) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-3 gap-2 px-1 py-1.5 rounded text-sm"
                  >
                    <span className="text-text-dim">{set.set_number}</span>
                    <span className="text-text-primary font-medium">
                      {set.actual_weight ?? "--"} lbs
                    </span>
                    <span className="text-text-primary font-medium">
                      {set.actual_reps ?? "--"} reps
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
