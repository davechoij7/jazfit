"use client";

import Image from "next/image";
import Link from "next/link";
import type { BodyMeasurement } from "@/lib/types";

interface Props {
  measurements: BodyMeasurement[];
}

type MeasurementKey =
  | "waist"
  | "hips"
  | "arms_left"
  | "arms_right"
  | "thighs_left"
  | "thighs_right";

interface MeasurementItem {
  key: MeasurementKey;
  label: string;
  latest: number | null;
  previous: number | null;
  first: number | null;
}

function getDelta(latest: number | null, previous: number | null) {
  if (latest === null || previous === null) return null;
  return +(latest - previous).toFixed(1);
}

/** Format: "30.8"" or "--" */
function fmt(v: number | null) {
  if (v === null) return "--";
  return `${v}"`;
}

export function BodyMeasurementsCard({ measurements }: Props) {
  const latest = measurements[0] ?? null;
  const previous = measurements[1] ?? null;
  // Only show "from first" delta when there are 3+ entries (otherwise prev === first)
  const first = measurements.length > 2 ? measurements[measurements.length - 1] : null;

  const items: MeasurementItem[] = [
    {
      key: "waist",
      label: "Waist",
      latest: latest?.waist ?? null,
      previous: previous?.waist ?? null,
      first: first?.waist ?? null,
    },
    {
      key: "hips",
      label: "Hips",
      latest: latest?.hips ?? null,
      previous: previous?.hips ?? null,
      first: first?.hips ?? null,
    },
    {
      key: "arms_left",
      label: "Left arm",
      latest: latest?.arms_left ?? null,
      previous: previous?.arms_left ?? null,
      first: first?.arms_left ?? null,
    },
    {
      key: "arms_right",
      label: "Right arm",
      latest: latest?.arms_right ?? null,
      previous: previous?.arms_right ?? null,
      first: first?.arms_right ?? null,
    },
    {
      key: "thighs_left",
      label: "Left thigh",
      latest: latest?.thighs_left ?? null,
      previous: previous?.thighs_left ?? null,
      first: first?.thighs_left ?? null,
    },
    {
      key: "thighs_right",
      label: "Right thigh",
      latest: latest?.thighs_right ?? null,
      previous: previous?.thighs_right ?? null,
      first: first?.thighs_right ?? null,
    },
  ];

  return (
    <div
      className="rounded-2xl border border-border p-4"
      style={{
        background: "rgba(240, 196, 206, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255, 255, 255, 0.25)",
        boxShadow: "0 2px 12px rgba(122, 51, 71, 0.06)",
      }}
    >
      <h2 className="font-display text-lg font-normal text-text-primary mb-4 tracking-tight">
        Body measurements
      </h2>

      <div className="flex gap-4 items-start">
        {/* Body image */}
        <div className="flex-shrink-0">
          <Image
            src="/betty-boop.png"
            alt="Body silhouette"
            width={160}
            height={240}
            className="opacity-75 pointer-events-none"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Delta list */}
        <div className="flex-1 space-y-2 min-w-0">
          {items.map((item) => {
            const delta = getDelta(item.latest, item.previous);
            const deltaFirst = getDelta(item.latest, item.first);
            // Smaller circumference = good (shrinking)
            const isShrinking = delta !== null && delta < 0;
            const isSame = delta !== null && delta === 0;
            const firstIsShrinking = deltaFirst !== null && deltaFirst < 0;

            return (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium truncate pr-2">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  <span className="text-sm font-medium text-text-primary">
                    {fmt(item.latest)}
                  </span>
                  {delta !== null && !isSame && (
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: isShrinking ? "#7EBF8E" : "#D4A960",
                      }}
                    >
                      {isShrinking ? "↓" : "↑"}
                      {Math.abs(delta)}" prev
                    </span>
                  )}
                  {delta !== null && isSame && (
                    <span className="text-xs text-text-dim">—</span>
                  )}
                  {deltaFirst !== null && deltaFirst !== 0 && (
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: firstIsShrinking ? "#7EBF8E" : "#D4A960",
                      }}
                    >
                      {firstIsShrinking ? "↓" : "↑"}
                      {Math.abs(deltaFirst)}" start
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {latest?.date && (
            <p className="text-xs text-text-dim pt-1 border-t border-border mt-2">
              Last logged{" "}
              {new Date(latest.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <Link
          href="/profile/measurements"
          className="min-h-[48px] flex items-center px-1 text-xs font-medium"
          style={{ color: "#C4808E" }}
        >
          View all →
        </Link>
      </div>
    </div>
  );
}

