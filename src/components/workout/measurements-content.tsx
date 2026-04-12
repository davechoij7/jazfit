"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { BodyMeasurement } from "@/lib/types";

interface Props {
  measurements: BodyMeasurement[];
}

const METRIC_FIELDS: Record<string, keyof BodyMeasurement> = {
  Waist: "waist",
  Hips: "hips",
  "L Arm": "arms_left",
  "R Arm": "arms_right",
  "L Thigh": "thighs_left",
  "R Thigh": "thighs_right",
};

const TABS = Object.keys(METRIC_FIELDS);

const DISPLAY_FIELDS: Array<{
  key: keyof BodyMeasurement;
  label: string;
  unit: string;
}> = [
  { key: "waist", label: "Waist", unit: '"' },
  { key: "hips", label: "Hips", unit: '"' },
  { key: "arms_left", label: "L Arm", unit: '"' },
  { key: "arms_right", label: "R Arm", unit: '"' },
  { key: "thighs_left", label: "L Thigh", unit: '"' },
  { key: "thighs_right", label: "R Thigh", unit: '"' },
  { key: "weight", label: "Weight", unit: " lbs" },
];

const glassStyle: React.CSSProperties = {
  background: "rgba(240,196,206,0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 2px 12px rgba(122,51,71,0.06)",
};

export function MeasurementsContent({ measurements }: Props) {
  const [selectedTab, setSelectedTab] = useState("Waist");

  const selectedField = METRIC_FIELDS[selectedTab];

  const chartData = [...measurements]
    .filter((m) => m[selectedField] != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: new Date(m.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: m[selectedField] as number,
    }));

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profile"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7A3347]"
        >
          ←
        </Link>
        <h1 className="font-display text-2xl font-normal text-text-primary">
          Measurements
        </h1>
      </div>

      {/* Metric tab selector */}
      <div className="flex overflow-x-auto scrollbar-none gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className="shrink-0 min-h-[48px] px-4 rounded-full text-sm font-medium transition-colors touch-manipulation"
            style={
              selectedTab === tab
                ? { background: "#C4808E", color: "white" }
                : { background: "rgba(240,196,206,0.4)", color: "#7A3347" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Line chart */}
      <div className="rounded-2xl p-4 mb-6" style={glassStyle}>
        {chartData.length < 2 ? (
          <p className="text-sm text-text-muted text-center py-8">
            Log more measurements to see your trend
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5CBCF"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
              />
              <Tooltip
                contentStyle={{
                  background: "#F3DDE0",
                  border: "1px solid #E5CBCF",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}"`, selectedTab]}
                labelStyle={{ color: "#7A6068", marginBottom: 2 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#C4808E"
                strokeWidth={2}
                dot={{ fill: "#C4808E", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Measurement log */}
      <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
        All entries
      </h2>

      {measurements.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">
          No measurements logged yet
        </p>
      ) : (
        measurements.map((m) => {
          const nonNullFields = DISPLAY_FIELDS.filter(
            (f) => m[f.key] != null
          );
          if (nonNullFields.length === 0) return null;

          return (
            <div
              key={m.id}
              className="rounded-2xl p-4 mb-3"
              style={glassStyle}
            >
              <p className="text-sm font-semibold text-[#7A3347] mb-2">
                {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {nonNullFields.map((f) => (
                  <div key={String(f.key)} className="flex justify-between">
                    <span className="text-xs text-[#7A6068]">{f.label}</span>
                    <span className="text-xs font-medium text-text-primary">
                      {m[f.key]}
                      {f.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
