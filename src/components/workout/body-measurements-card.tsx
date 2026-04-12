"use client";

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

  const items: MeasurementItem[] = [
    {
      key: "waist",
      label: "Waist",
      latest: latest?.waist ?? null,
      previous: previous?.waist ?? null,
    },
    {
      key: "hips",
      label: "Hips",
      latest: latest?.hips ?? null,
      previous: previous?.hips ?? null,
    },
    {
      key: "arms_left",
      label: "Left arm",
      latest: latest?.arms_left ?? null,
      previous: previous?.arms_left ?? null,
    },
    {
      key: "arms_right",
      label: "Right arm",
      latest: latest?.arms_right ?? null,
      previous: previous?.arms_right ?? null,
    },
    {
      key: "thighs_left",
      label: "Left thigh",
      latest: latest?.thighs_left ?? null,
      previous: previous?.thighs_left ?? null,
    },
    {
      key: "thighs_right",
      label: "Right thigh",
      latest: latest?.thighs_right ?? null,
      previous: previous?.thighs_right ?? null,
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
        {/* SVG Silhouette */}
        <div className="flex-shrink-0">
          <BodySilhouette />
        </div>

        {/* Delta list */}
        <div className="flex-1 space-y-2 min-w-0">
          {items.map((item) => {
            const delta = getDelta(item.latest, item.previous);
            // Smaller circumference = good (shrinking)
            const isShrinking = delta !== null && delta < 0;
            const isSame = delta !== null && delta === 0;

            return (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium truncate pr-2">
                  {item.label}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-medium text-text-primary">
                    {fmt(item.latest)}
                  </span>
                  {delta !== null && !isSame && (
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: isShrinking ? "#7EBF8E" : "#D4A960",
                      }}
                    >
                      {isShrinking ? "↓" : "↑"}
                      {Math.abs(delta)}"
                    </span>
                  )}
                  {delta !== null && isSame && (
                    <span className="text-xs text-text-dim">—</span>
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
    </div>
  );
}

function BodySilhouette() {
  // A minimal female body silhouette as inline SVG paths
  // viewBox: 0 0 80 200 — head at top, feet at bottom
  // Drawn as a single continuous fill shape with indicator dots
  return (
    <svg
      width="80"
      height="200"
      viewBox="0 0 80 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Head */}
      <ellipse cx="40" cy="16" rx="11" ry="13" fill="#E8A0AD" opacity="0.7" />

      {/* Neck */}
      <rect x="36" y="27" width="8" height="8" rx="3" fill="#E8A0AD" opacity="0.7" />

      {/* Torso — shoulders to hips */}
      <path
        d="M18 35 Q14 40 15 56 Q16 68 22 76 Q26 82 28 90 Q30 98 30 104 L50 104 Q50 98 52 90 Q54 82 58 76 Q64 68 65 56 Q66 40 62 35 Q56 32 40 31 Q24 32 18 35Z"
        fill="#E8A0AD"
        opacity="0.7"
      />

      {/* Left arm (viewer's right) */}
      <path
        d="M18 37 Q10 44 8 56 Q7 64 10 72 Q12 76 14 72 Q15 66 16 58 Q18 48 22 40Z"
        fill="#E8A0AD"
        opacity="0.65"
      />

      {/* Right arm (viewer's left) */}
      <path
        d="M62 37 Q70 44 72 56 Q73 64 70 72 Q68 76 66 72 Q65 66 64 58 Q62 48 58 40Z"
        fill="#E8A0AD"
        opacity="0.65"
      />

      {/* Left leg */}
      <path
        d="M30 104 Q28 120 27 136 Q26 152 27 168 Q28 180 32 188 Q35 194 38 188 Q40 180 40 168 L40 104Z"
        fill="#E8A0AD"
        opacity="0.7"
      />

      {/* Right leg */}
      <path
        d="M50 104 Q52 120 53 136 Q54 152 53 168 Q52 180 48 188 Q45 194 42 188 Q40 180 40 168 L40 104Z"
        fill="#E8A0AD"
        opacity="0.7"
      />

      {/* Measurement indicator dots */}
      {/* Chest */}
      <circle cx="40" cy="48" r="2.5" fill="#C4808E" />
      {/* Waist */}
      <circle cx="40" cy="78" r="2.5" fill="#C4808E" />
      {/* Hips */}
      <circle cx="40" cy="100" r="2.5" fill="#C4808E" />
      {/* Left arm */}
      <circle cx="11" cy="58" r="2" fill="#7A3347" opacity="0.8" />
      {/* Right arm */}
      <circle cx="69" cy="58" r="2" fill="#7A3347" opacity="0.8" />
      {/* Left thigh */}
      <circle cx="29" cy="130" r="2" fill="#7A3347" opacity="0.8" />
      {/* Right thigh */}
      <circle cx="51" cy="130" r="2" fill="#7A3347" opacity="0.8" />
    </svg>
  );
}
