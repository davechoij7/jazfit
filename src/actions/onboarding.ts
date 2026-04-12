"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveExerciseSelections(exerciseIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Delete existing selections and replace with new ones
  await supabase.from("user_exercises").delete().eq("user_id", user.id);

  if (exerciseIds.length > 0) {
    const rows = exerciseIds.map((exercise_id) => ({
      user_id: user.id,
      exercise_id,
      is_available: true,
    }));

    const { error } = await supabase.from("user_exercises").insert(rows);
    if (error) throw new Error(error.message);
  }

  // Mark onboarding complete in profile preferences
  await supabase
    .from("profiles")
    .update({ preferences: { onboardingComplete: true } })
    .eq("id", user.id);

  redirect("/dashboard");
}
