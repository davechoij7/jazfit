"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { VolumePoint } from "@/actions/charts";

interface Props {
  volumeData: VolumePoint[];
}

function formatVolume(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;
}

export function VolumeChart({ volumeData }: Props) {
  if (volumeData.length === 0) {
    return (
      <div className="text-center py-10 space-y-1">
        <p className="text-sm text-text-muted">Volume tracks once you log reps</p>
        <p className="text-xs text-text-dim">Start a workout and log your reps to see weekly volume here</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={volumeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5CBCF" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "#B8A0A6" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#B8A0A6" }}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={formatVolume}
        />
        <Tooltip
          contentStyle={{
            background: "#F3DDE0",
            border: "1px solid #E5CBCF",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`${typeof value === "number" ? formatVolume(value) : value} lbs`, "Volume"]}
          labelStyle={{ color: "#7A6068", marginBottom: 2 }}
        />
        <Bar dataKey="volume" fill="#C4808E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
