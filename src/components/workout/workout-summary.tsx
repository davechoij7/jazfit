import { Card } from "@/components/ui/card";

interface WorkoutSummaryProps {
  duration: number | null; // seconds
  totalSets: number;
  totalVolume: number; // lbs
}

export function WorkoutSummary({ duration, totalSets, totalVolume }: WorkoutSummaryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <Card padding="md">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-bold text-text-primary">
            {duration ? formatDuration(duration) : "--"}
          </p>
          <p className="text-xs text-text-dim">Duration</p>
        </div>
        <div>
          <p className="text-xl font-bold text-text-primary">{totalSets}</p>
          <p className="text-xs text-text-dim">Sets</p>
        </div>
        <div>
          <p className="text-xl font-bold text-text-primary">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
          </p>
          <p className="text-xs text-text-dim">Volume (lbs)</p>
        </div>
      </div>
    </Card>
  );
}
