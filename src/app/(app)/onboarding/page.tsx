import { createClient } from "@/lib/supabase/server";
import { ExercisePicker } from "@/components/onboarding/exercise-picker";
import type { Exercise } from "@/lib/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all default exercises
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("is_default", true)
    .order("name");

  // Fetch any existing selections
  const { data: userExercises } = await supabase
    .from("user_exercises")
    .select("exercise_id")
    .eq("user_id", user!.id)
    .eq("is_available", true);

  const selectedIds = (userExercises ?? []).map((ue) => ue.exercise_id);

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-normal text-text-primary">Set Up Your Gym</h1>
        <p className="text-text-muted mt-1">
          Select the exercises and machines available at your gym. You can change these anytime.
        </p>
      </div>

      <ExercisePicker
        exercises={(exercises as Exercise[]) ?? []}
        initialSelectedIds={selectedIds}
      />
    </div>
  );
}
