"use server";

import { createClient } from "@/lib/supabase/server";
import type { BodyMeasurement } from "@/lib/types";

export async function logMeasurement(data: {
  date: string;
  weight?: number | null;
  waist?: number | null;
  hips?: number | null;
  chest?: number | null;
  arms_left?: number | null;
  arms_right?: number | null;
  thighs_left?: number | null;
  thighs_right?: number | null;
}): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("body_measurements").insert({
    user_id: user.id,
    ...data,
  });
  if (error) throw error;
}

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
