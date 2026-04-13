"use client";

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
        {/* SVG Silhouette */}
        <div className="flex-shrink-0">
          <BodySilhouette />
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

function BodySilhouette() {
  // Female body silhouette — hourglass torso, separated legs, natural arms
  // viewBox: 0 0 80 200 — head at top, feet at bottom
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
      <ellipse cx="40" cy="14" rx="11" ry="13" fill="#E8A0AD" opacity="0.75" />

      {/* Neck */}
      <rect x="36" y="25" width="8" height="10" rx="3" fill="#E8A0AD" opacity="0.75" />

      {/* Torso — shoulders (56px) → waist (30px) → hips (58px) */}
      <path
        d="M12 37 Q8 58 25 80 Q14 96 11 110 L69 110 Q66 96 55 80 Q72 58 68 37 Q56 28 40 26 Q24 28 12 37Z"
        fill="#E8A0AD"
        opacity="0.75"
      />

      {/* Left arm */}
      <path
        d="M13 40 Q5 62 7 80 Q7 92 9 100 Q12 104 16 100 Q17 92 16 78 Q18 58 20 43Z"
        fill="#E8A0AD"
        opacity="0.7"
      />

      {/* Right arm */}
      <path
        d="M67 40 Q75 62 73 80 Q73 92 71 100 Q68 104 64 100 Q63 92 64 78 Q62 58 60 43Z"
        fill="#E8A0AD"
        opacity="0.7"
      />

      {/* Left leg — outer hip x=11, inner x=34, with natural taper */}
      <path
        d="M11 110 Q10 140 12 165 Q13 178 15 190 Q18 196 22 196 Q26 196 28 190 Q30 178 31 165 Q33 140 34 110Z"
        fill="#E8A0AD"
        opacity="0.75"
      />

      {/* Right leg — inner x=46, outer hip x=69 */}
      <path
        d="M69 110 Q70 140 68 165 Q67 178 65 190 Q62 196 58 196 Q54 196 52 190 Q50 178 49 165 Q47 140 46 110Z"
        fill="#E8A0AD"
        opacity="0.75"
      />

      {/* Measurement indicator dots */}
      {/* Chest */}
      <circle cx="40" cy="50" r="2.5" fill="#C4808E" />
      {/* Waist */}
      <circle cx="40" cy="80" r="2.5" fill="#C4808E" />
      {/* Hips */}
      <circle cx="40" cy="106" r="2.5" fill="#C4808E" />
      {/* Left arm */}
      <circle cx="10" cy="62" r="2" fill="#7A3347" opacity="0.8" />
      {/* Right arm */}
      <circle cx="70" cy="62" r="2" fill="#7A3347" opacity="0.8" />
      {/* Left thigh */}
      <circle cx="21" cy="132" r="2" fill="#7A3347" opacity="0.8" />
      {/* Right thigh */}
      <circle cx="59" cy="132" r="2" fill="#7A3347" opacity="0.8" />
    </svg>
  );
}
