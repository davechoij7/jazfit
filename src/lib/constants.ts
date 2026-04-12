import type { MuscleGroup, EquipmentType } from "./types";

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

// Minimum hours before a muscle group can be trained again
export const RECOVERY_WINDOW_HOURS = 48;

// How many days to look back for workout history
export const HISTORY_LOOKBACK_DAYS = 14;

// Progressive overload: consecutive sessions at same weight before suggesting increase
export const PROGRESSION_THRESHOLD_SESSIONS = 2;

// Default weight increment when suggesting progressive overload
export const DEFAULT_WEIGHT_INCREMENT = 5; // lbs

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
