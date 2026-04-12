import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SeedExercise {
  name: string;
  muscle_groups: string[];
  equipment_type: string;
  is_default: boolean;
}

const exercises: SeedExercise[] = [
  // Chest (8)
  { name: "Barbell Bench Press", muscle_groups: ["Chest", "Triceps"], equipment_type: "barbell", is_default: true },
  { name: "Incline Barbell Bench Press", muscle_groups: ["Chest", "Shoulders"], equipment_type: "barbell", is_default: true },
  { name: "Dumbbell Bench Press", muscle_groups: ["Chest", "Triceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Incline Dumbbell Press", muscle_groups: ["Chest", "Shoulders"], equipment_type: "dumbbell", is_default: true },
  { name: "Dumbbell Fly", muscle_groups: ["Chest"], equipment_type: "dumbbell", is_default: true },
  { name: "Cable Fly", muscle_groups: ["Chest"], equipment_type: "cable", is_default: true },
  { name: "Push-Up", muscle_groups: ["Chest", "Triceps", "Core"], equipment_type: "bodyweight", is_default: true },
  { name: "Chest Press (Machine)", muscle_groups: ["Chest", "Triceps"], equipment_type: "machine", is_default: true },
  { name: "Pec Fly (Machine)", muscle_groups: ["Chest"], equipment_type: "machine", is_default: true },

  // Back (9)
  { name: "Barbell Row", muscle_groups: ["Back", "Biceps"], equipment_type: "barbell", is_default: true },
  { name: "Deadlift", muscle_groups: ["Back", "Legs", "Glutes"], equipment_type: "barbell", is_default: true },
  { name: "Pull-Up", muscle_groups: ["Back", "Biceps"], equipment_type: "bodyweight", is_default: true },
  { name: "Lat Pulldown", muscle_groups: ["Back", "Biceps"], equipment_type: "cable", is_default: true },
  { name: "Seated Cable Row", muscle_groups: ["Back", "Biceps"], equipment_type: "cable", is_default: true },
  { name: "Dumbbell Row", muscle_groups: ["Back", "Biceps"], equipment_type: "dumbbell", is_default: true },
  { name: "T-Bar Row", muscle_groups: ["Back", "Biceps"], equipment_type: "barbell", is_default: true },
  { name: "Face Pull", muscle_groups: ["Back", "Shoulders"], equipment_type: "cable", is_default: true },
  { name: "Machine Row", muscle_groups: ["Back", "Biceps"], equipment_type: "machine", is_default: true },
  { name: "Diverging Seated Row (Machine)", muscle_groups: ["Back", "Biceps"], equipment_type: "machine", is_default: true },
  { name: "Diverging Lat Pulldown (Machine)", muscle_groups: ["Back", "Biceps"], equipment_type: "machine", is_default: true },

  // Shoulders (9)
  { name: "Overhead Press", muscle_groups: ["Shoulders", "Triceps"], equipment_type: "barbell", is_default: true },
  { name: "Dumbbell Shoulder Press", muscle_groups: ["Shoulders", "Triceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Lateral Raise", muscle_groups: ["Shoulders"], equipment_type: "dumbbell", is_default: true },
  { name: "Cable Lateral Raise", muscle_groups: ["Shoulders"], equipment_type: "cable", is_default: true },
  { name: "Front Raise", muscle_groups: ["Shoulders"], equipment_type: "dumbbell", is_default: true },
  { name: "Reverse Fly", muscle_groups: ["Shoulders", "Back"], equipment_type: "dumbbell", is_default: true },
  { name: "Arnold Press", muscle_groups: ["Shoulders", "Triceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Upright Row", muscle_groups: ["Shoulders", "Biceps"], equipment_type: "barbell", is_default: true },
  { name: "Shoulder Press (Machine)", muscle_groups: ["Shoulders", "Triceps"], equipment_type: "machine", is_default: true },
  { name: "Rear Delt (Machine)", muscle_groups: ["Shoulders", "Back"], equipment_type: "machine", is_default: true },

  // Biceps (8)
  { name: "Barbell Curl", muscle_groups: ["Biceps"], equipment_type: "barbell", is_default: true },
  { name: "Dumbbell Curl", muscle_groups: ["Biceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Hammer Curl", muscle_groups: ["Biceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Preacher Curl", muscle_groups: ["Biceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Cable Curl", muscle_groups: ["Biceps"], equipment_type: "cable", is_default: true },
  { name: "Incline Dumbbell Curl", muscle_groups: ["Biceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Concentration Curl", muscle_groups: ["Biceps"], equipment_type: "dumbbell", is_default: true },
  { name: "EZ Bar Curl", muscle_groups: ["Biceps"], equipment_type: "barbell", is_default: true },

  // Biceps — Machine
  { name: "Arm Curl (Machine)", muscle_groups: ["Biceps"], equipment_type: "machine", is_default: true },

  // Triceps (8+)
  { name: "Tricep Pushdown", muscle_groups: ["Triceps"], equipment_type: "cable", is_default: true },
  { name: "Overhead Tricep Extension", muscle_groups: ["Triceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Close-Grip Bench Press", muscle_groups: ["Triceps", "Chest"], equipment_type: "barbell", is_default: true },
  { name: "Skull Crusher", muscle_groups: ["Triceps"], equipment_type: "barbell", is_default: true },
  { name: "Dip", muscle_groups: ["Triceps", "Chest"], equipment_type: "bodyweight", is_default: true },
  { name: "Cable Overhead Extension", muscle_groups: ["Triceps"], equipment_type: "cable", is_default: true },
  { name: "Diamond Push-Up", muscle_groups: ["Triceps", "Chest"], equipment_type: "bodyweight", is_default: true },
  { name: "Tricep Kickback", muscle_groups: ["Triceps"], equipment_type: "dumbbell", is_default: true },
  { name: "Tricep Extension (Machine)", muscle_groups: ["Triceps"], equipment_type: "machine", is_default: true },
  { name: "Seated Dip (Machine)", muscle_groups: ["Triceps", "Chest"], equipment_type: "machine", is_default: true },

  // Legs (10)
  { name: "Barbell Squat", muscle_groups: ["Legs", "Glutes", "Core"], equipment_type: "barbell", is_default: true },
  { name: "Leg Press", muscle_groups: ["Legs", "Glutes"], equipment_type: "machine", is_default: true },
  { name: "Romanian Deadlift", muscle_groups: ["Legs", "Glutes", "Back"], equipment_type: "barbell", is_default: true },
  { name: "Leg Extension", muscle_groups: ["Legs"], equipment_type: "machine", is_default: true },
  { name: "Seated Leg Curl (Machine)", muscle_groups: ["Legs"], equipment_type: "machine", is_default: true },
  { name: "Prone Leg Curl (Machine)", muscle_groups: ["Legs"], equipment_type: "machine", is_default: true },
  { name: "Single Leg Press (Machine)", muscle_groups: ["Legs", "Glutes"], equipment_type: "machine", is_default: true },
  { name: "Split Leg Press (Machine)", muscle_groups: ["Legs", "Glutes"], equipment_type: "machine", is_default: true },
  { name: "Hip Abduction (Machine)", muscle_groups: ["Glutes"], equipment_type: "machine", is_default: true },
  { name: "Hip Adduction (Machine)", muscle_groups: ["Legs"], equipment_type: "machine", is_default: true },
  { name: "Bulgarian Split Squat", muscle_groups: ["Legs", "Glutes"], equipment_type: "dumbbell", is_default: true },
  { name: "Walking Lunge", muscle_groups: ["Legs", "Glutes"], equipment_type: "dumbbell", is_default: true },
  { name: "Calf Raise", muscle_groups: ["Legs"], equipment_type: "machine", is_default: true },
  { name: "Goblet Squat", muscle_groups: ["Legs", "Glutes"], equipment_type: "dumbbell", is_default: true },
  { name: "Front Squat", muscle_groups: ["Legs", "Core"], equipment_type: "barbell", is_default: true },

  // Glutes (7)
  { name: "Hip Thrust", muscle_groups: ["Glutes", "Legs"], equipment_type: "barbell", is_default: true },
  { name: "Hip Thrust (Machine)", muscle_groups: ["Glutes", "Legs"], equipment_type: "machine", is_default: true },
  { name: "Cable Kickback", muscle_groups: ["Glutes"], equipment_type: "cable", is_default: true },
  { name: "Glute Bridge", muscle_groups: ["Glutes"], equipment_type: "bodyweight", is_default: true },
  { name: "Sumo Deadlift", muscle_groups: ["Glutes", "Legs", "Back"], equipment_type: "barbell", is_default: true },
  { name: "Step-Up", muscle_groups: ["Glutes", "Legs"], equipment_type: "dumbbell", is_default: true },
  { name: "Cable Pull-Through", muscle_groups: ["Glutes", "Back"], equipment_type: "cable", is_default: true },
  { name: "Single-Leg Hip Thrust", muscle_groups: ["Glutes"], equipment_type: "bodyweight", is_default: true },

  // Core (8)
  { name: "Plank", muscle_groups: ["Core"], equipment_type: "bodyweight", is_default: true },
  { name: "Hanging Leg Raise", muscle_groups: ["Core"], equipment_type: "bodyweight", is_default: true },
  { name: "Cable Crunch", muscle_groups: ["Core"], equipment_type: "cable", is_default: true },
  { name: "Russian Twist", muscle_groups: ["Core"], equipment_type: "bodyweight", is_default: true },
  { name: "Ab Wheel Rollout", muscle_groups: ["Core"], equipment_type: "bodyweight", is_default: true },
  { name: "Dead Bug", muscle_groups: ["Core"], equipment_type: "bodyweight", is_default: true },
  { name: "Pallof Press", muscle_groups: ["Core"], equipment_type: "cable", is_default: true },
  { name: "Bicycle Crunch", muscle_groups: ["Core"], equipment_type: "bodyweight", is_default: true },
];

async function seed() {
  console.log(`Seeding ${exercises.length} exercises...`);

  const { data, error } = await supabase
    .from("exercises")
    .upsert(exercises, { onConflict: "name" })
    .select();

  if (error) {
    console.error("Error seeding exercises:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} exercises`);

  // Log count by muscle group
  const byGroup: Record<string, number> = {};
  for (const ex of exercises) {
    const primary = ex.muscle_groups[0];
    byGroup[primary] = (byGroup[primary] || 0) + 1;
  }
  console.log("\nExercises by primary muscle group:");
  for (const [group, count] of Object.entries(byGroup).sort()) {
    console.log(`  ${group}: ${count}`);
  }
}

seed();
