// Database types matching supabase/migrations/

export type StrengthSplit = "Upper" | "Lower";
export type NonStrengthSplit = "Yoga" | "Barre" | "Walk" | "Run";
export type WorkoutSplit = StrengthSplit | NonStrengthSplit;

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Legs"
  | "Core"
  | "Glutes";

export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "band";

// --- Database row types ---

export interface Profile {
  id: string;
  created_at: string;
  name: string | null;
  preferences: ProfilePreferences;
}

export interface ProfilePreferences {
  onboardingComplete?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType;
  is_default: boolean;
}

export interface UserExercise {
  id: string;
  user_id: string;
  exercise_id: string;
  is_available: boolean;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  muscle_groups_focus: MuscleGroup[];
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  workout_type: WorkoutSplit | null; // The split selected at session start (e.g. "Upper", "Yoga")
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
}

export interface SetLog {
  id: string;
  exercise_log_id: string;
  set_number: number;
  target_weight: number | null;
  actual_weight: number | null;
  target_reps: number | null;
  actual_reps: number | null;
  completed_at: string | null;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  waist: number | null;
  hips: number | null;
  chest: number | null;
  /** @deprecated Use arms_left / arms_right instead */
  arms: number | null;
  /** @deprecated Use thighs_left / thighs_right instead */
  thighs: number | null;
  arms_left: number | null;
  arms_right: number | null;
  thighs_left: number | null;
  thighs_right: number | null;
  created_at: string;
}

// --- Composite / UI types ---

export interface ExerciseWithAvailability extends Exercise {
  is_available: boolean;
  user_exercise_id?: string;
}

export interface ExerciseLogWithDetails extends ExerciseLog {
  exercise: Exercise;
  sets: SetLog[];
}

export interface WorkoutSessionWithDetails extends WorkoutSession {
  exercise_logs: ExerciseLogWithDetails[];
}

export interface WorkoutExercise {
  exercise: Exercise;
  exerciseLogId: string;
  sets: ActiveSet[];
  previousSession: PreviousExerciseData | null;
  progressiveOverload: ProgressiveOverloadSuggestion | null;
}

export interface ActiveSet {
  id: string;
  setNumber: number;
  targetWeight: number | null;
  targetReps: number | null;
  actualWeight: number | null;
  actualReps: number | null;
  isCompleted: boolean;
  isPR?: boolean;
}

export interface PreviousExerciseData {
  weight: number;
  reps: number[];
  date: string;
}

export interface ProgressiveOverloadSuggestion {
  lastWeight: number;
  lastReps: number[];
  suggestedWeight: number;
  suggestedReps: number;
  shouldProgress: boolean;
  message: string;
}

export interface MuscleGroupSuggestion {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  daysSinceLastPrimary: number;
  reasoning: string;
  allGroupStats: MuscleGroupStat[];
}

export interface MuscleGroupStat {
  group: MuscleGroup;
  lastTrainedDate: string | null;
  daysSinceLast: number; // Infinity if never trained
}

// --- Sticker reward types ---

// One sticker per day, only awarded for completed strength workouts. The
// workout_type drives which Snoopy is rendered (Upper-Snoopy / Lower-Snoopy).
export type StickerWorkoutType = Extract<WorkoutSplit, "Upper" | "Lower">;

export interface DailySticker {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  workout_type: StickerWorkoutType;
  seen_at: string | null;
  created_at: string;
}
