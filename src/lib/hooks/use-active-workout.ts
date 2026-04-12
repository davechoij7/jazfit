"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { Exercise, ActiveSet } from "@/lib/types";
import { DEFAULT_SETS_PER_EXERCISE, DEFAULT_REPS_PER_SET } from "@/lib/constants";

// --- State ---

export interface WorkoutExerciseState {
  exercise: Exercise;
  exerciseLogId: string | null;
  sets: ActiveSet[];
  previousWeight: number | null;
  previousReps: number[] | null;
  suggestedWeight: number | null;
  shouldProgress: boolean;
  progressMessage: string | null;
}

export interface ActiveWorkoutState {
  sessionId: string | null;
  muscleGroups: string[];
  exercises: WorkoutExerciseState[];
  currentExerciseIndex: number;
  startedAt: number; // timestamp
  status: "ready" | "active" | "complete";
}

// --- Actions ---

type Action =
  | { type: "INIT"; sessionId: string; exercises: WorkoutExerciseState[] }
  | { type: "SET_EXERCISE_LOG_ID"; exerciseIndex: number; logId: string }
  | { type: "UPDATE_SET"; exerciseIndex: number; setIndex: number; field: "actualWeight" | "actualReps"; value: number }
  | { type: "COMPLETE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "ADD_SET"; exerciseIndex: number }
  | { type: "NEXT_EXERCISE" }
  | { type: "PREV_EXERCISE" }
  | { type: "GO_TO_EXERCISE"; index: number }
  | { type: "COMPLETE_WORKOUT" }
  | { type: "RESTORE"; state: ActiveWorkoutState };

function reducer(state: ActiveWorkoutState, action: Action): ActiveWorkoutState {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        sessionId: action.sessionId,
        exercises: action.exercises,
        status: "active",
        startedAt: Date.now(),
      };

    case "SET_EXERCISE_LOG_ID": {
      const exercises = [...state.exercises];
      exercises[action.exerciseIndex] = {
        ...exercises[action.exerciseIndex],
        exerciseLogId: action.logId,
      };
      return { ...state, exercises };
    }

    case "UPDATE_SET": {
      const exercises = [...state.exercises];
      const ex = { ...exercises[action.exerciseIndex] };
      const sets = [...ex.sets];
      sets[action.setIndex] = {
        ...sets[action.setIndex],
        [action.field]: action.value,
      };
      ex.sets = sets;
      exercises[action.exerciseIndex] = ex;
      return { ...state, exercises };
    }

    case "COMPLETE_SET": {
      const exercises = [...state.exercises];
      const ex = { ...exercises[action.exerciseIndex] };
      const sets = [...ex.sets];
      const set = { ...sets[action.setIndex] };

      // If no actual values entered, use target values
      if (set.actualWeight === null) set.actualWeight = set.targetWeight;
      if (set.actualReps === null) set.actualReps = set.targetReps;
      set.isCompleted = true;

      sets[action.setIndex] = set;
      ex.sets = sets;
      exercises[action.exerciseIndex] = ex;
      return { ...state, exercises };
    }

    case "ADD_SET": {
      const exercises = [...state.exercises];
      const ex = { ...exercises[action.exerciseIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: ActiveSet = {
        id: crypto.randomUUID(),
        setNumber: ex.sets.length + 1,
        targetWeight: lastSet?.targetWeight ?? null,
        targetReps: lastSet?.targetReps ?? DEFAULT_REPS_PER_SET,
        actualWeight: null,
        actualReps: null,
        isCompleted: false,
      };
      ex.sets = [...ex.sets, newSet];
      exercises[action.exerciseIndex] = ex;
      return { ...state, exercises };
    }

    case "NEXT_EXERCISE":
      if (state.currentExerciseIndex < state.exercises.length - 1) {
        return { ...state, currentExerciseIndex: state.currentExerciseIndex + 1 };
      }
      return state;

    case "PREV_EXERCISE":
      if (state.currentExerciseIndex > 0) {
        return { ...state, currentExerciseIndex: state.currentExerciseIndex - 1 };
      }
      return state;

    case "GO_TO_EXERCISE":
      if (action.index >= 0 && action.index < state.exercises.length) {
        return { ...state, currentExerciseIndex: action.index };
      }
      return state;

    case "COMPLETE_WORKOUT":
      return { ...state, status: "complete" };

    case "RESTORE":
      return action.state;

    default:
      return state;
  }
}

// --- Initial state ---

function createInitialState(muscleGroups: string[]): ActiveWorkoutState {
  return {
    sessionId: null,
    muscleGroups,
    exercises: [],
    currentExerciseIndex: 0,
    startedAt: Date.now(),
    status: "ready",
  };
}

// --- Hook ---

const STORAGE_KEY = "jazfit-active-workout";

export function useActiveWorkout(muscleGroups: string[]) {
  const [state, dispatch] = useReducer(reducer, muscleGroups, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist to sessionStorage on every state change
  useEffect(() => {
    if (state.status === "active") {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage full or unavailable
      }
    } else if (state.status === "complete") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  // Check for recoverable session on mount
  const getRecoverableSession = useCallback((): ActiveWorkoutState | null => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as ActiveWorkoutState;
      if (parsed.status === "active" && parsed.sessionId) {
        return parsed;
      }
    } catch {
      // Invalid data
    }
    return null;
  }, []);

  const restoreSession = useCallback((saved: ActiveWorkoutState) => {
    dispatch({ type: "RESTORE", state: saved });
  }, []);

  const clearSavedSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Build exercise states from exercise list + overload data
  const initializeWorkout = useCallback(
    (
      sessionId: string,
      exercises: Exercise[],
      overloadData: Map<string, { weight: number; reps: number[]; suggestedWeight: number; shouldProgress: boolean; message: string }>
    ) => {
      const exerciseStates: WorkoutExerciseState[] = exercises.map((exercise) => {
        const overload = overloadData.get(exercise.id);
        const targetWeight = overload?.suggestedWeight ?? overload?.weight ?? null;

        const sets: ActiveSet[] = Array.from({ length: DEFAULT_SETS_PER_EXERCISE }, (_, i) => ({
          id: crypto.randomUUID(),
          setNumber: i + 1,
          targetWeight,
          targetReps: DEFAULT_REPS_PER_SET,
          actualWeight: null,
          actualReps: null,
          isCompleted: false,
        }));

        return {
          exercise,
          exerciseLogId: null,
          sets,
          previousWeight: overload?.weight ?? null,
          previousReps: overload?.reps ?? null,
          suggestedWeight: overload?.suggestedWeight ?? null,
          shouldProgress: overload?.shouldProgress ?? false,
          progressMessage: overload?.message ?? null,
        };
      });

      dispatch({ type: "INIT", sessionId, exercises: exerciseStates });
    },
    []
  );

  return {
    state,
    dispatch,
    initializeWorkout,
    getRecoverableSession,
    restoreSession,
    clearSavedSession,
    currentExercise: state.exercises[state.currentExerciseIndex] ?? null,
    isLastExercise: state.currentExerciseIndex === state.exercises.length - 1,
    totalSetsCompleted: state.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.isCompleted).length,
      0
    ),
    totalVolume: state.exercises.reduce(
      (total, ex) =>
        total +
        ex.sets
          .filter((s) => s.isCompleted)
          .reduce((vol, s) => vol + (s.actualWeight ?? 0) * (s.actualReps ?? 0), 0),
      0
    ),
    elapsedSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
  };
}
