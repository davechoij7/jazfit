"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { StrengthPoint } from "@/actions/charts";

interface Props {
  strengthData: Record<string, StrengthPoint[]>;
  exerciseNames: string[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ProgressChart({ strengthData, exerciseNames }: Props) {
  const [selected, setSelected] = useState(exerciseNames[0] ?? "");

  if (exerciseNames.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        Log weights to see progress
      </p>
    );
  }

  const points = (strengthData[selected] ?? []).map((p) => ({
    ...p,
    label: formatDate(p.date),
  }));

  return (
    <div className="space-y-3">
      {/* Exercise picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exerciseNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors touch-manipulation ${
              selected === name
                ? "bg-accent text-white"
                : "bg-bg-card text-text-muted"
            }`}
          >
            {name.replace(/\s*\(Machine\)\s*$/i, "")}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5CBCF" vertical={false} />
          <XAxis
            dataKey="label"
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
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#F3DDE0",
              border: "1px solid #E5CBCF",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value} lbs`, "Weight"]}
            labelStyle={{ color: "#7A6068", marginBottom: 2 }}
          />
          <Line
            type="monotone"
            dataKey="maxWeight"
            stroke="#C4808E"
            strokeWidth={2}
            dot={{ fill: "#C4808E", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
