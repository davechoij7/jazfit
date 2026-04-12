import { createClient } from "@/lib/supabase/server";
import { getBodyMeasurements } from "@/actions/measurements";
import { BodyMeasurementsCard } from "@/components/workout/body-measurements-card";
import { MeasurementPromptBanner } from "@/components/workout/measurement-prompt-banner";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profileData }, measurements] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, created_at, name, preferences")
      .eq("id", user!.id)
      .single(),
    getBodyMeasurements(),
  ]);

  const profile = profileData as Profile | null;

  // Check if a measurement has been logged in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const mostRecentDate = measurements[0]?.date
    ? new Date(measurements[0].date + "T00:00:00")
    : null;

  const measurementOverdue =
    mostRecentDate === null || mostRecentDate < thirtyDaysAgo;

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-normal text-text-primary tracking-tight leading-tight">
          {profile?.name ?? "Jazmin"}
        </h1>
        {memberSince && (
          <p className="text-sm text-text-muted mt-1">
            Member since {memberSince}
          </p>
        )}
      </div>

      {/* Measurement overdue prompt */}
      <MeasurementPromptBanner show={measurementOverdue} />

      {/* Body measurements */}
      <section>
        <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
          Body measurements
        </h2>
        <BodyMeasurementsCard measurements={measurements} />
      </section>
    </div>
  );
}
