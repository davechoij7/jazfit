import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const USER_ID = process.env.JAZFIT_USER_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!USER_ID || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Ensure .env.local has JAZFIT_USER_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Workout data
// ---------------------------------------------------------------------------

interface WorkoutEntry {
  name: string;
  weight: number;
  note?: string;
}

interface WorkoutDay {
  date: string;
  exercises: WorkoutEntry[];
  sessionNote?: string;
}

const WORKOUTS: WorkoutDay[] = [
  {
    date: "2026-01-14",
    exercises: [
      { name: "Hip Abduction", weight: 55 },
      { name: "Leg Press", weight: 70 },
      { name: "Calf Raise", weight: 70 },
      { name: "Leg Extension", weight: 45 },
    ],
  },
  {
    date: "2026-01-16",
    exercises: [
      { name: "Arm Curl (Machine)", weight: 20 },
      { name: "Chest Press (Machine)", weight: 40 },
      { name: "Shoulder Press (Machine)", weight: 22.5 },
      { name: "Seated Dip (Machine)", weight: 45 },
      { name: "Diverging Seated Row (Machine)", weight: 40 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 50 },
    ],
  },
  {
    date: "2026-01-18",
    exercises: [
      { name: "Hip Abduction", weight: 70 },
      { name: "Hip Adduction", weight: 40 },
      { name: "Leg Extension", weight: 55 },
      { name: "Leg Press", weight: 85 },
    ],
  },
  {
    date: "2026-01-20",
    exercises: [
      { name: "Arm Curl (Machine)", weight: 20, note: "20-25 lbs range" },
      { name: "Diverging Lat Pulldown (Machine)", weight: 50 },
      { name: "Shoulder Press (Machine)", weight: 22.5 },
      { name: "Diverging Seated Row (Machine)", weight: 40 },
      { name: "Pec Fly (Machine)", weight: 55 },
    ],
  },
  {
    date: "2026-01-22",
    exercises: [
      { name: "Hip Abduction", weight: 70 },
      { name: "Hip Adduction", weight: 40 },
      { name: "Leg Press", weight: 85 },
      { name: "Seated Leg Curl", weight: 45, note: "Set chair to 2 and tip to 1" },
      { name: "Prone Leg Curl", weight: 40, note: "Adjust tip to lowest" },
    ],
  },
  {
    date: "2026-01-24",
    exercises: [
      { name: "Arm Curl (Machine)", weight: 25 },
      { name: "Shoulder Press (Machine)", weight: 30, note: "Sort of" },
      { name: "Seated Dip (Machine)", weight: 65 },
      { name: "Diverging Seated Row (Machine)", weight: 40 },
    ],
  },
  {
    date: "2026-01-26",
    exercises: [
      { name: "Leg Extension", weight: 55 },
      { name: "Hip Adduction", weight: 55, note: "Maybe 70 lbs next time" },
      { name: "Hip Abduction", weight: 60, note: "60 lbs leaning forward, 65 leaning back" },
      { name: "Leg Press", weight: 85 },
      { name: "Prone Leg Curl", weight: 40 },
    ],
  },
  {
    date: "2026-01-28",
    exercises: [
      { name: "Diverging Seated Row (Machine)", weight: 40 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 50 },
      { name: "Pec Fly (Machine)", weight: 55 },
      { name: "Arm Curl (Machine)", weight: 25 },
      { name: "Seated Dip (Machine)", weight: 65 },
    ],
  },
  {
    date: "2026-01-30",
    exercises: [
      { name: "Leg Press", weight: 100 },
      { name: "Seated Leg Curl", weight: 55 },
      { name: "Hip Adduction", weight: 55 },
      { name: "Hip Abduction", weight: 65 },
      { name: "Leg Extension", weight: 55 },
    ],
  },
  {
    date: "2026-02-02",
    exercises: [
      { name: "Chest Press (Machine)", weight: 40 },
      { name: "Arm Curl (Machine)", weight: 27 },
      { name: "Seated Dip (Machine)", weight: 70 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 55 },
      { name: "Shoulder Press (Machine)", weight: 30, note: "Or 27 lbs" },
    ],
  },
  {
    date: "2026-02-04",
    exercises: [
      { name: "Hip Abduction", weight: 67.5 },
      { name: "Leg Press", weight: 100 },
      { name: "Hip Adduction", weight: 55 },
      { name: "Seated Leg Curl", weight: 45, note: "Can't do 55 yet, set tip to 2 chair back to 2" },
      { name: "Prone Leg Curl", weight: 40 },
    ],
  },
  {
    date: "2026-02-06",
    exercises: [
      { name: "Seated Dip (Machine)", weight: 70 },
      { name: "Arm Curl (Machine)", weight: 27 },
      { name: "Pec Fly (Machine)", weight: 55 },
      { name: "Diverging Seated Row (Machine)", weight: 45 },
      { name: "Shoulder Press (Machine)", weight: 27, note: "Gonna be here for awhile teehee" },
      { name: "Chest Press (Machine)", weight: 45 },
    ],
  },
  {
    date: "2026-02-08",
    exercises: [
      { name: "Hip Adduction", weight: 60 },
      { name: "Hip Abduction", weight: 67 },
      { name: "Leg Extension", weight: 55 },
      { name: "Leg Press", weight: 100 },
      { name: "Prone Leg Curl", weight: 45 },
    ],
  },
  {
    date: "2026-02-10",
    exercises: [
      { name: "Diverging Seated Row (Machine)", weight: 45 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 55 },
      { name: "Arm Curl (Machine)", weight: 30 },
      { name: "Pec Fly (Machine)", weight: 55 },
      { name: "Hip Thrust (Machine)", weight: 50 },
    ],
  },
  {
    date: "2026-02-13",
    exercises: [
      { name: "Hip Abduction", weight: 70 },
      { name: "Hip Adduction", weight: 60 },
      { name: "Leg Press", weight: 100 },
      { name: "Leg Extension", weight: 55 },
    ],
  },
  {
    date: "2026-02-16",
    exercises: [
      { name: "Arm Curl (Machine)", weight: 30 },
      { name: "Shoulder Press (Machine)", weight: 25 },
      { name: "Seated Dip (Machine)", weight: 70 },
      { name: "Dumbbell Curl", weight: 15, note: "Dumbbells" },
      { name: "Barbell Curl", weight: 30, note: "Bar" },
      { name: "Chest Press (Machine)", weight: 45 },
      { name: "Tricep Extension (Machine)", weight: 60 },
    ],
    sessionNote: "Cable for tricep and back: 27 lbs",
  },
  {
    date: "2026-02-18",
    exercises: [
      { name: "Hip Adduction", weight: 60 },
      { name: "Leg Extension", weight: 55 },
      { name: "Hip Abduction", weight: 70 },
      { name: "Seated Leg Curl", weight: 45 },
    ],
    sessionNote: "Locker room 27 0401. Leg press: skipped, cramped.",
  },
  {
    date: "2026-02-20",
    exercises: [
      { name: "Diverging Seated Row (Machine)", weight: 50 },
      { name: "Chest Press (Machine)", weight: 50 },
      { name: "Arm Curl (Machine)", weight: 30 },
      { name: "Seated Dip (Machine)", weight: 75 },
      { name: "Shoulder Press (Machine)", weight: 27 },
      { name: "Pec Fly (Machine)", weight: 70 },
    ],
    sessionNote: "Locker 21 0401",
  },
  {
    date: "2026-02-22",
    exercises: [
      { name: "Hip Adduction", weight: 60 },
      { name: "Hip Abduction", weight: 70 },
      { name: "Leg Extension", weight: 55 },
      { name: "Prone Leg Curl", weight: 50 },
    ],
  },
  {
    date: "2026-02-24",
    exercises: [
      { name: "Chest Press (Machine)", weight: 55, note: "Barely!" },
      { name: "Shoulder Press (Machine)", weight: 27 },
      { name: "Arm Curl (Machine)", weight: 30 },
      { name: "Pec Fly (Machine)", weight: 70 },
      { name: "Rear Delt (Machine)", weight: 40 },
    ],
  },
  {
    date: "2026-02-26",
    exercises: [
      { name: "Hip Adduction", weight: 60 },
      { name: "Hip Abduction", weight: 70 },
      { name: "Seated Leg Curl", weight: 45 },
      { name: "Leg Extension", weight: 55 },
    ],
  },
  {
    date: "2026-03-01",
    exercises: [
      { name: "Chest Press (Machine)", weight: 55 },
      { name: "Seated Dip (Machine)", weight: 70 },
      { name: "Arm Curl (Machine)", weight: 30 },
      { name: "Shoulder Press (Machine)", weight: 30, note: "Barely" },
      { name: "Rear Delt (Machine)", weight: 45 },
      { name: "Pec Fly (Machine)", weight: 70 },
      { name: "Diverging Seated Row (Machine)", weight: 50 },
    ],
  },
  {
    date: "2026-03-03",
    exercises: [
      { name: "Hip Adduction", weight: 60 },
      { name: "Leg Extension", weight: 55 },
      { name: "Hip Abduction", weight: 70 },
      { name: "Leg Press", weight: 100 },
    ],
  },
  {
    date: "2026-03-05",
    exercises: [
      { name: "Shoulder Press (Machine)", weight: 30 },
      { name: "Chest Press (Machine)", weight: 55, note: "Barely" },
      { name: "Arm Curl (Machine)", weight: 30 },
      { name: "Seated Dip (Machine)", weight: 70 },
      { name: "Pec Fly (Machine)", weight: 70 },
      { name: "Rear Delt (Machine)", weight: 45 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 50 },
    ],
  },
  {
    date: "2026-03-08",
    exercises: [
      { name: "Hip Adduction", weight: 65 },
      { name: "Leg Press", weight: 100 },
      { name: "Split Leg Press", weight: 25 },
      { name: "Prone Leg Curl", weight: 45 },
    ],
  },
  {
    date: "2026-03-10",
    exercises: [
      { name: "Shoulder Press (Machine)", weight: 30 },
      { name: "Chest Press (Machine)", weight: 50, note: "Down from 55" },
      { name: "Arm Curl (Machine)", weight: 35, note: "Barely" },
      { name: "Seated Dip (Machine)", weight: 75 },
      { name: "Diverging Seated Row (Machine)", weight: 50 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 60 },
    ],
  },
  {
    date: "2026-03-12",
    exercises: [
      { name: "Split Leg Press", weight: 30 },
      { name: "Leg Press", weight: 85, note: "Sore" },
      { name: "Hip Adduction", weight: 70, note: "Barely" },
      { name: "Prone Leg Curl", weight: 45 },
      { name: "Hip Abduction", weight: 75 },
    ],
  },
  {
    date: "2026-03-15",
    exercises: [
      { name: "Chest Press (Machine)", weight: 55 },
      { name: "Rear Delt (Machine)", weight: 40 },
      { name: "Pec Fly (Machine)", weight: 75 },
      { name: "Shoulder Press (Machine)", weight: 30 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 60 },
    ],
  },
  {
    date: "2026-03-17",
    exercises: [
      { name: "Hip Adduction", weight: 70 },
      { name: "Hip Abduction", weight: 77 },
      { name: "Leg Press", weight: 100 },
      { name: "Single Leg Press", weight: 40 },
      { name: "Prone Leg Curl", weight: 50 },
    ],
  },
  {
    date: "2026-03-19",
    exercises: [
      { name: "Diverging Lat Pulldown (Machine)", weight: 60, note: "Go up next time" },
      { name: "Diverging Seated Row (Machine)", weight: 60 },
      { name: "Pec Fly (Machine)", weight: 75 },
      { name: "Rear Delt (Machine)", weight: 45 },
      { name: "Chest Press (Machine)", weight: 55 },
      { name: "Arm Curl (Machine)", weight: 35 },
      { name: "Seated Dip (Machine)", weight: 80 },
    ],
  },
  {
    date: "2026-03-21",
    exercises: [
      { name: "Hip Adduction", weight: 70 },
      { name: "Hip Abduction", weight: 80 },
      { name: "Split Leg Press", weight: 40 },
      { name: "Leg Press", weight: 100 },
      { name: "Prone Leg Curl", weight: 50 },
    ],
  },
  {
    date: "2026-03-23",
    exercises: [
      { name: "Shoulder Press (Machine)", weight: 30, note: "35 lbs last set" },
      { name: "Arm Curl (Machine)", weight: 35 },
      { name: "Seated Dip (Machine)", weight: 80, note: "Maybe go up next time" },
      { name: "Chest Press (Machine)", weight: 55 },
      { name: "Diverging Seated Row (Machine)", weight: 60 },
      { name: "Pec Fly (Machine)", weight: 75 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 65, note: "Barely" },
    ],
  },
  {
    date: "2026-03-26",
    exercises: [
      { name: "Hip Adduction", weight: 77, note: "Barely" },
      { name: "Hip Abduction", weight: 80 },
      { name: "Split Leg Press", weight: 40, note: "Stay here for now" },
      { name: "Leg Press", weight: 100, note: "Go up next time" },
    ],
  },
  {
    date: "2026-03-28",
    exercises: [
      { name: "Shoulder Press (Machine)", weight: 35 },
      { name: "Chest Press (Machine)", weight: 55 },
      { name: "Arm Curl (Machine)", weight: 35 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 65 },
      { name: "Rear Delt (Machine)", weight: 45 },
      { name: "Pec Fly (Machine)", weight: 75 },
      { name: "Seated Dip (Machine)", weight: 85 },
    ],
  },
  {
    date: "2026-03-30",
    exercises: [
      { name: "Single Leg Press", weight: 45 },
      { name: "Leg Press", weight: 115 },
      { name: "Hip Adduction", weight: 77, note: "Barely" },
      { name: "Hip Abduction", weight: 85 },
    ],
  },
  {
    date: "2026-04-07",
    exercises: [
      { name: "Pec Fly (Machine)", weight: 75 },
      { name: "Rear Delt (Machine)", weight: 45 },
      { name: "Diverging Lat Pulldown (Machine)", weight: 65 },
      { name: "Arm Curl (Machine)", weight: 35 },
      { name: "Shoulder Press (Machine)", weight: 35 },
      { name: "Chest Press (Machine)", weight: 55 },
    ],
  },
  {
    date: "2026-04-09",
    exercises: [
      { name: "Hip Adduction", weight: 85, note: "Barely" },
      { name: "Hip Abduction", weight: 85 },
      { name: "Single Leg Press", weight: 45 },
      { name: "Leg Press", weight: 110 },
    ],
    sessionNote: "Prone leg curl: no weight recorded",
  },
  {
    date: "2026-04-11",
    exercises: [
      { name: "Diverging Lat Pulldown (Machine)", weight: 65 },
      { name: "Diverging Seated Row (Machine)", weight: 60 },
      { name: "Pec Fly (Machine)", weight: 75 },
      { name: "Rear Delt (Machine)", weight: 50 },
      { name: "Chest Press (Machine)", weight: 55 },
      { name: "Seated Dip (Machine)", weight: 85 },
      { name: "Arm Curl (Machine)", weight: 35 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  // Fetch all exercises
  const { data: exercises, error: exError } = await supabase
    .from("exercises")
    .select("id, name, muscle_groups");

  if (exError || !exercises) {
    console.error("Failed to fetch exercises:", exError?.message);
    process.exit(1);
  }

  // Build normalized name → exercise map
  const exerciseMap = new Map<string, { id: string; muscle_groups: string[] }>();
  for (const ex of exercises) {
    exerciseMap.set(ex.name.toLowerCase(), { id: ex.id, muscle_groups: ex.muscle_groups });
  }

  // Validate all exercise names before inserting anything
  const unmatched = new Set<string>();
  for (const day of WORKOUTS) {
    for (const entry of day.exercises) {
      if (!exerciseMap.has(entry.name.toLowerCase())) {
        unmatched.add(entry.name);
      }
    }
  }

  if (unmatched.size > 0) {
    console.error("\n❌ Unmatched exercise names — fix before seeding:");
    for (const name of unmatched) console.error(`  - "${name}"`);
    process.exit(1);
  }

  console.log(`✓ All exercise names matched. Seeding ${WORKOUTS.length} sessions...\n`);

  let sessionCount = 0;

  for (const day of WORKOUTS) {
    // Derive muscle_groups_focus from all exercises in this session
    const muscleGroupsSet = new Set<string>();
    for (const entry of day.exercises) {
      const ex = exerciseMap.get(entry.name.toLowerCase())!;
      for (const mg of ex.muscle_groups) muscleGroupsSet.add(mg);
    }

    // Build session notes: exercise-level notes + session-level note
    const noteLines: string[] = [];
    for (const entry of day.exercises) {
      if (entry.note) noteLines.push(`${entry.name}: ${entry.note}`);
    }
    if (day.sessionNote) noteLines.push(day.sessionNote);
    const notes = noteLines.length > 0 ? noteLines.join("\n") : null;

    // Insert workout session
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: USER_ID,
        date: day.date,
        muscle_groups_focus: Array.from(muscleGroupsSet),
        notes,
        completed_at: `${day.date}T23:59:00Z`,
        duration_seconds: null,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error(`Failed to insert session ${day.date}:`, sessionError?.message);
      continue;
    }

    // Insert exercise logs + set logs
    for (let i = 0; i < day.exercises.length; i++) {
      const entry = day.exercises[i];
      const ex = exerciseMap.get(entry.name.toLowerCase())!;

      const { data: exerciseLog, error: logError } = await supabase
        .from("exercise_logs")
        .insert({
          session_id: session.id,
          exercise_id: ex.id,
          order_index: i,
        })
        .select("id")
        .single();

      if (logError || !exerciseLog) {
        console.error(`  Failed to insert exercise log for ${entry.name}:`, logError?.message);
        continue;
      }

      const { error: setError } = await supabase.from("set_logs").insert({
        exercise_log_id: exerciseLog.id,
        set_number: 1,
        actual_weight: entry.weight,
        target_weight: null,
        actual_reps: null,
        target_reps: null,
        completed_at: `${day.date}T23:59:00Z`,
      });

      if (setError) {
        console.error(`  Failed to insert set log for ${entry.name}:`, setError.message);
      }
    }

    sessionCount++;
    console.log(`  ✓ ${day.date}  (${day.exercises.length} exercises)`);
  }

  console.log(`\n✅ Done. Seeded ${sessionCount}/${WORKOUTS.length} sessions.`);
}

seed();
