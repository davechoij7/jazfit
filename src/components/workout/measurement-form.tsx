"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logMeasurement } from "@/actions/measurements";

interface MeasurementFormProps {
  onClose: () => void;
}

function todayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function MeasurementForm({ onClose }: MeasurementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [chest, setChest] = useState("");
  const [armsLeft, setArmsLeft] = useState("");
  const [armsRight, setArmsRight] = useState("");
  const [thighsLeft, setThighsLeft] = useState("");
  const [thighsRight, setThighsRight] = useState("");

  function parseField(val: string): number | undefined {
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: Parameters<typeof logMeasurement>[0] = {
      date: todayISO(),
    };
    const w = parseField(weight);
    if (w !== undefined) data.weight = w;
    const wa = parseField(waist);
    if (wa !== undefined) data.waist = wa;
    const h = parseField(hips);
    if (h !== undefined) data.hips = h;
    const c = parseField(chest);
    if (c !== undefined) data.chest = c;
    const al = parseField(armsLeft);
    if (al !== undefined) data.arms_left = al;
    const ar = parseField(armsRight);
    if (ar !== undefined) data.arms_right = ar;
    const tl = parseField(thighsLeft);
    if (tl !== undefined) data.thighs_left = tl;
    const tr = parseField(thighsRight);
    if (tr !== undefined) data.thighs_right = tr;

    startTransition(async () => {
      try {
        await logMeasurement(data);
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  const inputClass = "w-full rounded-xl border px-4 py-3 text-base bg-white/70 min-h-[48px]";
  const inputStyle = { borderColor: "rgba(196, 128, 142, 0.3)", outline: "none" };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50"
      style={{ background: "rgba(45, 26, 32, 0.5)" }}
      onClick={onClose}
    >
      {/* Bottom sheet — stop propagation so tapping inside doesn't close */}
      <div
        className="fixed bottom-0 left-0 right-0 rounded-t-3xl overflow-y-auto max-h-[90dvh]"
        style={{
          background: "#FBF0F0",
          paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <h2 className="font-display text-2xl font-normal text-[#2D1A20] leading-tight">
              Log Measurements
            </h2>
            <p className="text-sm mt-1" style={{ color: "#7A6068" }}>
              {todayLabel()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center text-xl text-[#7A3347] -mr-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-2">
          {/* Weight — single column */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
              Weight (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 135.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Waist — single column */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
              Waist (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 28.0"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Hips — single column */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
              Hips (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 36.0"
              value={hips}
              onChange={(e) => setHips(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Chest — single column */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
              Chest (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 34.0"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Arms — 2-column grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
                Left Arm (in)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 12.0"
                value={armsLeft}
                onChange={(e) => setArmsLeft(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
                Right Arm (in)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 12.0"
                value={armsRight}
                onChange={(e) => setArmsRight(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Thighs — 2-column grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
                Left Thigh (in)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 22.0"
                value={thighsLeft}
                onChange={(e) => setThighsLeft(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#7A3347] mb-1.5">
                Right Thigh (in)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 22.0"
                value={thighsRight}
                onChange={(e) => setThighsRight(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[52px] rounded-2xl font-semibold text-white text-base"
            style={{ background: "#C4808E", opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? "Saving…" : "Save measurements"}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
