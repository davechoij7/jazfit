"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExerciseCard } from "./exercise-card";
import { MUSCLE_GROUP_COLORS } from "@/lib/constants";
import type { Exercise, MuscleGroup } from "@/lib/types";

interface PreWorkoutContentProps {
  targetGroups: MuscleGroup[];
  exercises: Exercise[];
}

export function PreWorkoutContent({
  targetGroups,
  exercises,
}: PreWorkoutContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    // Store workout config in sessionStorage and navigate to active workout
    const config = {
      muscleGroups: targetGroups,
      exerciseIds: exercises.map((e) => e.id),
    };
    sessionStorage.setItem("workout-config", JSON.stringify(config));

    startTransition(() => {
      router.push("/workout/active");
    });
  };

  return (
    <div className="px-4 pt-6 space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-text-muted text-sm mb-2 flex items-center gap-1 touch-manipulation"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-display font-normal text-text-primary">Your Workout</h1>
        <div className="flex gap-2 mt-2">
          {targetGroups.map((g) => (
            <Badge key={g} colorClass={MUSCLE_GROUP_COLORS[g]}>
              {g}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
          Exercise Lineup ({exercises.length})
        </h2>
        <div className="space-y-2">
          {exercises.map((exercise, i) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={i} />
          ))}
        </div>
      </div>

      <div className="pb-6">
        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
          isLoading={isPending}
        >
          Begin Workout
        </Button>
      </div>
    </div>
  );
}
