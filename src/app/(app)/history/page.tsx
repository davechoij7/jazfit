import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUP_COLORS } from "@/lib/constants";
import type { MuscleGroup } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, date, muscle_groups_focus, duration_seconds, notes, completed_at")
    .eq("user_id", user!.id)
    .not("completed_at", "is", null)
    .order("date", { ascending: false })
    .limit(30);

  // Group sessions by week
  const grouped = groupByWeek(sessions ?? []);

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-display font-normal text-text-primary mb-6">Workout History</h1>

      {grouped.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No workouts yet.</p>
          <p className="text-text-dim text-sm mt-1">Complete your first workout to see it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, sessions: weekSessions }) => (
            <div key={label}>
              <h2 className="text-xs font-medium text-text-dim tracking-wide mb-2">
                {label}
              </h2>
              <div className="space-y-2">
                {weekSessions.map((session) => (
                  <Link key={session.id} href={`/history/${session.id}`}>
                    <Card padding="sm" className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {new Date(session.date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {session.muscle_groups_focus.map((g: string) => (
                            <Badge
                              key={g}
                              colorClass={MUSCLE_GROUP_COLORS[g as MuscleGroup]}
                              size="sm"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.duration_seconds && (
                          <span className="text-sm text-text-dim">
                            {Math.round(session.duration_seconds / 60)}min
                          </span>
                        )}
                        <svg
                          className="w-4 h-4 text-text-dim"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByWeek(sessions: any[]) {
  const groups: { label: string; sessions: any[] }[] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const lastWeek = new Date(startOfWeek);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const thisWeek: any[] = [];
  const lastWeekArr: any[] = [];
  const older: any[] = [];

  for (const session of sessions) {
    const date = new Date(session.date + "T00:00:00");
    if (date >= startOfWeek) {
      thisWeek.push(session);
    } else if (date >= lastWeek) {
      lastWeekArr.push(session);
    } else {
      older.push(session);
    }
  }

  if (thisWeek.length > 0) groups.push({ label: "This Week", sessions: thisWeek });
  if (lastWeekArr.length > 0) groups.push({ label: "Last Week", sessions: lastWeekArr });
  if (older.length > 0) groups.push({ label: "Earlier", sessions: older });

  return groups;
}
