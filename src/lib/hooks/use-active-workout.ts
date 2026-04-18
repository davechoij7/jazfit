"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { Exercise, ActiveSet, WorkoutSplit } from "@/lib/types";
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
  allTimeMax: number; // highest weight ever logged for this exercise (0 if no history)
}

export interface ActiveWorkoutState {
  sessionId: string | null;
  split: WorkoutSplit | null;
  muscleGroups: string[];
  exercises: WorkoutExerciseState[];
  currentExerciseIndex: number;
  startedAt: number; // timestamp
  status: "ready" | "active" | "complete";
  lastCompletedSetKey: string | null; // "<exerciseIndex>:<setIndex>" when a set just auto-completed
}

// --- Actions ---

type Action =
  | { type: "INIT"; sessionId: string; split: WorkoutSplit; muscleGroups: string[] }
  | { type: "ADD_EXERCISE"; exercise: Exercise; exerciseLogId: string | null; previousWeight: number | null; previousReps: number[] | null; suggestedWeight: number | null; shouldProgress: boolean; progressMessage: string | null; allTimeMax: number }
  | { type: "SET_EXERCISE_LOG_ID"; exerciseIndex: number; logId: string }
  | { type: "UPDATE_SET"; exerciseIndex: number; setIndex: number; field: "actualWeight" | "actualReps"; value: number }
  | { type: "COMPLETE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "CLEAR_LAST_COMPLETED" }
  | { type: "ADD_SET"; exerciseIndex: number }
  | { type: "DELETE_SET"; exerciseIndex: number; setIndex: number }
  | { type: "DELETE_EXERCISE"; exerciseIndex: number }
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
        split: action.split,
        muscleGroups: action.muscleGroups,
        exercises: [],
        status: "active",
        startedAt: Date.now(),
        currentExerciseIndex: 0,
        lastCompletedSetKey: null,
      };

    case "ADD_EXERCISE": {
      const targetWeight = action.suggestedWeight ?? action.previousWeight;

      const sets: ActiveSet[] = Array.from({ length: DEFAULT_SETS_PER_EXERCISE }, (_, i) => ({
        id: crypto.randomUUID(),
        setNumber: i + 1,
        targetWeight,
        targetReps: DEFAULT_REPS_PER_SET,
        actualWeight: null,
        actualReps: null,
        isCompleted: false,
      }));

      const newExercise: WorkoutExerciseState = {
        exercise: action.exercise,
        exerciseLogId: action.exerciseLogId,
        sets,
        previousWeight: action.previousWeight,
        previousReps: action.previousReps,
        suggestedWeight: action.suggestedWeight,
        shouldProgress: action.shouldProgress,
        progressMessage: action.progressMessage,
        allTimeMax: action.allTimeMax,
      };

      const exercises = [...state.exercises, newExercise];
      return {
        ...state,
        exercises,
        currentExerciseIndex: exercises.length - 1,
      };
    }

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
      const prev = sets[action.setIndex];
      const next = { ...prev, [action.field]: action.value };

      // Auto-complete: first time EITHER actualWeight or actualReps transitions
      // from null → a number, mark the set done and fill the other field from target.
      const wasNull = prev[action.field] === null;
      let justCompleted = false;
      if (!prev.isCompleted && wasNull) {
        if (next.actualWeight === null) next.actualWeight = next.targetWeight;
        if (next.actualReps === null) next.actualReps = next.targetReps;
        next.isCompleted = true;
        const actualWeight = next.actualWeight ?? 0;
        next.isPR = ex.allTimeMax > 0 && actualWeight > ex.allTimeMax;
        justCompleted = true;
      }

      sets[action.setIndex] = next;
      ex.sets = sets;
      exercises[action.exerciseIndex] = ex;
      return {
        ...state,
        exercises,
        lastCompletedSetKey: justCompleted
          ? `${action.exerciseIndex}:${action.setIndex}`
          : state.lastCompletedSetKey,
      };
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

      const actualWeight = set.actualWeight ?? 0;
      set.isPR = ex.allTimeMax > 0 && actualWeight > ex.allTimeMax;

      sets[action.setIndex] = set;
      ex.sets = sets;
      exercises[action.exerciseIndex] = ex;
      return { ...state, exercises };
    }

    case "ADD_SET": {
      const exercises = [...state.exercises];
      const ex = { ...exercises[action.exerciseIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const nextNumber = ex.sets.reduce((n, s) => Math.max(n, s.setNumber), 0) + 1;
      const newSet: ActiveSet = {
        id: crypto.randomUUID(),
        setNumber: nextNumber,
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

    case "DELETE_SET": {
      const exercises = [...state.exercises];
      const ex = { ...exercises[action.exerciseIndex] };
      ex.sets = ex.sets.filter((_, i) => i !== action.setIndex);
      exercises[action.exerciseIndex] = ex;
      return { ...state, exercises };
    }

    case "DELETE_EXERCISE": {
      const exercises = state.exercises.filter((_, i) => i !== action.exerciseIndex);
      let nextIndex = state.currentExerciseIndex;
      if (action.exerciseIndex < state.currentExerciseIndex) {
        nextIndex = state.currentExerciseIndex - 1;
      }
      if (nextIndex >= exercises.length) {
        nextIndex = Math.max(0, exercises.length - 1);
      }
      return { ...state, exercises, currentExerciseIndex: nextIndex };
    }

    case "CLEAR_LAST_COMPLETED":
      return { ...state, lastCompletedSetKey: null };

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
      // Always null the pending-completion marker on restore so a refresh
      // mid-completion doesn't trigger a duplicate logSet.
      return { ...action.state, lastCompletedSetKey: null };

    default:
      return state;
  }
}

// --- Initial state ---

function createInitialState(): ActiveWorkoutState {
  return {
    sessionId: null,
    split: null,
    muscleGroups: [],
    exercises: [],
    currentExerciseIndex: 0,
    startedAt: Date.now(),
    status: "ready",
    lastCompletedSetKey: null,
  };
}

// --- Hook ---

const STORAGE_KEY = "jazfit-active-workout";

export function useActiveWorkout() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
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

  const addExercise = useCallback(
    (exercise: Exercise, exerciseLogId: string | null, overload: { lastWeight: number; lastReps: number[]; suggestedWeight: number; shouldProgress: boolean; message: string } | null, allTimeMax: number = 0) => {
      dispatch({
        type: "ADD_EXERCISE",
        exercise,
        exerciseLogId,
        previousWeight: overload?.lastWeight ?? null,
        previousReps: overload?.lastReps ?? null,
        suggestedWeight: overload?.suggestedWeight ?? null,
        shouldProgress: overload?.shouldProgress ?? false,
        progressMessage: overload?.message ?? null,
        allTimeMax,
      });
    },
    []
  );

  return {
    state,
    dispatch,
    addExercise,
    hasExercises: state.exercises.length > 0,
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
    totalPRs: state.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.isPR).length,
      0
    ),
    elapsedSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
  };
}
