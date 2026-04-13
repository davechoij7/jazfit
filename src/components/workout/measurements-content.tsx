"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { logMeasurement } from "@/actions/measurements";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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

const FORM_FIELDS = [
  { key: "waist", label: "Waist", unit: '"', step: 0.25 },
  { key: "hips", label: "Hips", unit: '"', step: 0.25 },
  { key: "arms_left", label: "L Arm", unit: '"', step: 0.25 },
  { key: "arms_right", label: "R Arm", unit: '"', step: 0.25 },
  { key: "thighs_left", label: "L Thigh", unit: '"', step: 0.25 },
  { key: "thighs_right", label: "R Thigh", unit: '"', step: 0.25 },
  { key: "weight", label: "Weight", unit: "lbs", step: 0.5 },
];

function formatDelta(delta: number): string {
  const abs = Math.abs(delta);
  return abs.toFixed(2).replace(/\.?0+$/, "") || "0";
}

function DeltaChip({ delta, label }: { delta: number; label: "prev" | "first" }) {
  if (Math.abs(delta) < 0.005) return null;
  const isNeg = delta < 0;
  return (
    <span
      className="text-[10px] font-medium whitespace-nowrap"
      style={{ color: isNeg ? "#7EBF8E" : "#C75B5B" }}
    >
      {isNeg ? "▼" : "▲"} {isNeg ? "" : "+"}{formatDelta(delta)} {label}
    </span>
  );
}

const glassStyle: React.CSSProperties = {
  background: "rgba(240,196,206,0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 2px 12px rgba(122,51,71,0.06)",
};

const inputClass =
  "w-full px-3 py-2.5 rounded-xl bg-white/60 border border-white/40 text-text-primary text-base focus:outline-none focus:border-accent placeholder:text-text-dim";

export function MeasurementsContent({ measurements }: Props) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Waist");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

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

  function openForm() {
    setFormValues({});
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const date = formValues.date || today;
      await logMeasurement({
        date,
        ...(formValues.weight ? { weight: parseFloat(formValues.weight) } : {}),
        ...(formValues.waist ? { waist: parseFloat(formValues.waist) } : {}),
        ...(formValues.hips ? { hips: parseFloat(formValues.hips) } : {}),
        ...(formValues.arms_left ? { arms_left: parseFloat(formValues.arms_left) } : {}),
        ...(formValues.arms_right ? { arms_right: parseFloat(formValues.arms_right) } : {}),
        ...(formValues.thighs_left ? { thighs_left: parseFloat(formValues.thighs_left) } : {}),
        ...(formValues.thighs_right ? { thighs_right: parseFloat(formValues.thighs_right) } : {}),
      });
      setShowForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
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
        <button
          type="button"
          onClick={openForm}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-white text-xl font-light touch-manipulation select-none"
          style={{ background: "#C4808E" }}
          aria-label="Log measurement"
        >
          +
        </button>
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
        measurements.map((m, index) => {
          const nonNullFields = DISPLAY_FIELDS.filter(
            (f) => m[f.key] != null
          );
          if (nonNullFields.length === 0) return null;

          const prevEntry = index < measurements.length - 1 ? measurements[index + 1] : null;
          const firstEntry = measurements[measurements.length - 1];
          const isOldest = index === measurements.length - 1;

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
              <div className="space-y-1.5">
                {nonNullFields.map((f) => {
                  const val = m[f.key] as number;
                  const prevVal = prevEntry?.[f.key] != null ? prevEntry[f.key] as number : null;
                  const firstVal = !isOldest && firstEntry[f.key] != null ? firstEntry[f.key] as number : null;

                  return (
                    <div key={String(f.key)} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#7A6068] shrink-0">{f.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">
                          {val}{f.unit}
                        </span>
                        {prevVal != null && (
                          <DeltaChip delta={val - prevVal} label="prev" />
                        )}
                        {firstVal != null && (
                          <DeltaChip delta={val - firstVal} label="first" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Log measurement modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Log Measurements"
        footer={
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Date</label>
            <input
              type="date"
              defaultValue={today}
              onChange={(e) => setFormValues((v) => ({ ...v, date: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Measurement fields — 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            {FORM_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  {f.label} <span className="text-text-dim font-normal">({f.unit})</span>
                </label>
                <input
                  type="number"
                  step={f.step}
                  min={0}
                  placeholder="—"
                  value={formValues[f.key] ?? ""}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
