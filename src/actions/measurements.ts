"use server";

import { createClient } from "@/lib/supabase/server";
import type { BodyMeasurement } from "@/lib/types";

export async function getBodyMeasurements(): Promise<BodyMeasurement[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("body_measurements")
    .select(
      "id, user_id, date, weight, waist, hips, chest, arms, thighs, arms_left, arms_right, thighs_left, thighs_right, created_at"
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BodyMeasurement[];
}
