import type { WorkoutStats } from "@/actions/workout";

interface ProfileStatsCardProps {
  stats: WorkoutStats;
}

function formatSplitLabel(split: string | null): string {
  if (!split) return "—";
  return split;
}

export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  const totalDisplay = stats.totalWorkouts === 0 ? "—" : stats.totalWorkouts.toString();
  const streakDisplay =
    stats.streak === 0
      ? "—"
      : `${stats.streak} day${stats.streak !== 1 ? "s" : ""}`;
  const splitDisplay = formatSplitLabel(stats.mostUsedSplit);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(240, 196, 206, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow: "0 2px 12px rgba(122, 51, 71, 0.06)",
      }}
    >
      <div className="flex items-stretch">
        {/* Total workouts */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-2xl font-bold" style={{ color: "#C4808E" }}>
            🏆 {totalDisplay}
          </p>
          <p className="text-xs" style={{ color: "#7A3347" }}>
            workouts
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-px self-stretch mx-2"
          style={{ background: "rgba(196, 128, 142, 0.25)" }}
        />

        {/* Streak */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-2xl font-bold" style={{ color: "#C4808E" }}>
            🔥 {streakDisplay}
          </p>
          <p className="text-xs" style={{ color: "#7A3347" }}>
            streak
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-px self-stretch mx-2"
          style={{ background: "rgba(196, 128, 142, 0.25)" }}
        />

        {/* Favorite split */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-2xl font-bold" style={{ color: "#C4808E" }}>
            💪 {splitDisplay}
          </p>
          <p className="text-xs" style={{ color: "#7A3347" }}>
            favorite
          </p>
        </div>
      </div>
    </div>
  );
}
