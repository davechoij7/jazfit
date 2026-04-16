import { Card } from "@/components/ui/card";
import { EditableDurationField } from "@/components/workout/editable-duration-field";

interface WorkoutSummaryProps {
  sessionId?: string;
  duration: number | null; // seconds
  totalSets: number;
  totalVolume: number; // lbs
}

export function WorkoutSummary({ sessionId, duration, totalSets, totalVolume }: WorkoutSummaryProps) {
  return (
    <Card padding="md" glass>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          {sessionId ? (
            <EditableDurationField sessionId={sessionId} durationSeconds={duration} />
          ) : (
            <p className="text-xl font-bold text-text-primary">
              {duration ? `${Math.floor(duration / 60)} min` : "--"}
            </p>
          )}
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
