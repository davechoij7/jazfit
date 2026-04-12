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
import type { FrequencyPoint } from "@/actions/charts";

interface Props {
  frequencyData: FrequencyPoint[];
}

export function FrequencyChart({ frequencyData }: Props) {
  if (frequencyData.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        No workout history yet
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={frequencyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
          width={24}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#F3DDE0",
            border: "1px solid #E5CBCF",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [value, "Workouts"]}
          labelStyle={{ color: "#7A6068", marginBottom: 2 }}
        />
        <Bar dataKey="count" fill="#C4808E" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
