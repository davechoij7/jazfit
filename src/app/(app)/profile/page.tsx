import { createClient } from "@/lib/supabase/server";
import { getBodyMeasurements } from "@/actions/measurements";
import { getWorkoutStats } from "@/actions/workout";
import { getStickerHistory } from "@/actions/stickers";
import { ProfileContent } from "@/components/workout/profile-content";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profileData }, measurements, stats, stickerHistory] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, created_at, name, preferences")
      .eq("id", user!.id)
      .single(),
    getBodyMeasurements(),
    getWorkoutStats(),
    getStickerHistory(90),
  ]);

  const profile = profileData as Profile | null;

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
    <ProfileContent
      profile={profile}
      measurements={measurements}
      stats={stats}
      measurementOverdue={measurementOverdue}
      memberSince={memberSince}
      stickerHistory={stickerHistory}
    />
  );
}
