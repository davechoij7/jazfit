"use client";

import { useState } from "react";
import type { BodyMeasurement } from "@/lib/types";
import type { WorkoutStats } from "@/actions/workout";
import { ProfileStatsCard } from "@/components/workout/profile-stats-card";
import { MeasurementPromptBanner } from "@/components/workout/measurement-prompt-banner";
import { BodyMeasurementsCard } from "@/components/workout/body-measurements-card";
import { MeasurementForm } from "@/components/workout/measurement-form";

interface Props {
  profile: { name: string | null; created_at: string } | null;
  measurements: BodyMeasurement[];
  stats: WorkoutStats;
  measurementOverdue: boolean;
  memberSince: string | null;
}

export function ProfileContent({
  profile,
  measurements,
  stats,
  measurementOverdue,
  memberSince,
}: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header card */}
      <div
        className="rounded-2xl border p-5 mb-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(196,128,142,0.2), rgba(122,51,71,0.1))",
          borderColor: "#E8A0AD",
        }}
      >
        <span
          className="absolute top-3 right-4 text-2xl select-none"
          aria-hidden="true"
        >
          🌸
        </span>
        <h1 className="font-display text-3xl font-normal text-text-primary tracking-tight leading-tight">
          {profile?.name ?? "Jazmin"}
        </h1>
        {memberSince && (
          <p className="text-sm text-text-muted mt-1">Member since {memberSince}</p>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5">
        <ProfileStatsCard stats={stats} />
      </div>

      {/* Measurement overdue banner */}
      <MeasurementPromptBanner
        show={measurementOverdue}
        onLogClick={() => setShowForm(true)}
      />

      {/* Body measurements section */}
      <section>
        <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
          Body measurements
        </h2>
        <BodyMeasurementsCard measurements={measurements} />
      </section>

      {/* Measurement form modal */}
      {showForm && <MeasurementForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
