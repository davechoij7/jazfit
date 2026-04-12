import type { MuscleGroup, EquipmentType, StrengthSplit, NonStrengthSplit, WorkoutSplit } from "./types";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Glutes",
];

export const EQUIPMENT_TYPES: EquipmentType[] = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "band",
];

// Synergy groupings for workout routing
export const SYNERGY_GROUPS: { name: string; primary: MuscleGroup; secondary: MuscleGroup[] }[] = [
  { name: "Push", primary: "Chest", secondary: ["Shoulders", "Triceps"] },
  { name: "Pull", primary: "Back", secondary: ["Biceps"] },
  { name: "Lower", primary: "Legs", secondary: ["Glutes"] },
  { name: "Core", primary: "Core", secondary: [] },
];

// Upper/Lower split groupings
export const SPLIT_GROUPS: Record<StrengthSplit, MuscleGroup[]> = {
  Upper: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"],
  Lower: ["Legs", "Glutes", "Core"],
};

export const NON_STRENGTH_SPLITS = new Set<NonStrengthSplit>(["Yoga", "Barre", "Walk", "Run"]);

export const ALL_SPLITS: WorkoutSplit[] = ["Upper", "Lower", "Yoga", "Barre", "Walk", "Run"];

export const SPLIT_DESCRIPTIONS: Record<WorkoutSplit, string> = {
  Upper: "Chest, Back, Shoulders, Arms",
  Lower: "Legs, Glutes, Core",
  Yoga:  "Flexibility & mindfulness",
  Barre: "Low-impact full body",
  Walk:  "Outdoor or treadmill",
  Run:   "Cardio & endurance",
};

export const SPLIT_CATEGORIES: { label: string; splits: WorkoutSplit[] }[] = [
  { label: "Strength",    splits: ["Upper", "Lower"] },
  { label: "Mind & Body", splits: ["Yoga", "Barre"] },
  { label: "Cardio",      splits: ["Walk", "Run"] },
];

export const WORKOUT_TYPE_COLORS: Record<WorkoutSplit, string> = {
  Upper: "", // strength splits use per-muscle-group badges; no split-level color
  Lower: "", // strength splits use per-muscle-group badges; no split-level color
  Yoga:  "bg-[#A09878]/15 text-[#7A6858]",
  Barre: "bg-[#F0C4CE]/40 text-[#C4808E]",
  Walk:  "bg-[#7EBF8E]/20 text-[#4E8F5E]",
  Run:   "bg-[#D4A960]/20 text-[#A07830]",
};

// Minimum hours before a muscle group can be trained again
export const RECOVERY_WINDOW_HOURS = 48;

// How many days to look back for workout history
export const HISTORY_LOOKBACK_DAYS = 14;

// Progressive overload: consecutive sessions at same weight before suggesting increase
export const PROGRESSION_THRESHOLD_SESSIONS = 2;

// Default weight increment when suggesting progressive overload
export const DEFAULT_WEIGHT_INCREMENT = 5; // lbs

// Weight increment by equipment type (machine/cable plates are smaller)
export const WEIGHT_INCREMENT_BY_EQUIPMENT: Record<EquipmentType, number> = {
  barbell: 5,
  dumbbell: 5,
  cable: 2.5,
  machine: 2.5,
  bodyweight: 0,
  band: 0,
};

/** Get the weight increment step for a given equipment type */
export function getWeightIncrement(equipmentType: EquipmentType): number {
  return WEIGHT_INCREMENT_BY_EQUIPMENT[equipmentType] ?? DEFAULT_WEIGHT_INCREMENT;
}

// Rest timer presets in seconds
export const REST_TIMER_PRESETS = [60, 90, 120] as const;
export const DEFAULT_REST_TIMER = 90;

// Default sets and reps per exercise
export const DEFAULT_SETS_PER_EXERCISE = 3;
export const DEFAULT_REPS_PER_SET = 10;

// How many exercises to suggest per workout
export const EXERCISES_PER_WORKOUT = 5;

// Muscle group colors for UI badges
export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  Chest: "bg-[#C4808E]/20 text-[#9A5A68]",
  Back: "bg-[#7A3347]/15 text-[#7A3347]",
  Shoulders: "bg-[#D4A960]/20 text-[#A07830]",
  Biceps: "bg-[#A09878]/20 text-[#7A7458]",
  Triceps: "bg-[#E8A0AD]/25 text-[#B87080]",
  Legs: "bg-[#7EBF8E]/20 text-[#4E8F5E]",
  Core: "bg-[#C75B5B]/15 text-[#C75B5B]",
  Glutes: "bg-[#F0C4CE]/40 text-[#C4808E]",
};

// Equipment type labels for display
export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  bodyweight: "Bodyweight",
  band: "Band",
};

export const AFFIRMATIONS = [
  "Eres suficiente, aquí, ahora y siempre.",
  "Cada rep te acerca más a ti misma.",
  "La fuerza que buscas ya vive en ti.",
  "Hoy elegiste moverse. Eso cuenta.",
  "Tu cuerpo recuerda cada esfuerzo.",
  "Eres más fuerte de lo que crees.",
];

export const SPLIT_ICONS: Record<WorkoutSplit, string> = {
  Upper: "🏋️‍♀️",
  Lower: "🦵",
  Yoga:  "🧘‍♀️",
  Barre: "🩰",
  Walk:  "🚶‍♀️",
  Run:   "🏃‍♀️",
};

export const SPLIT_IMAGES: Record<WorkoutSplit, string> = {
  Upper: "/Upper-Snoopy.png",
  Lower: "/Lower-Snoopy.png",
  Yoga:  "/Yoga-Snoopy.png",
  Barre: "/Barre-Snoopy.png",
  Walk:  "/Walking-Snoopy.png",
  Run:   "/Running-Snoopy.png",
};
