"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPLIT_GROUPS, MUSCLE_GROUP_COLORS } from "@/lib/constants";
import type { MuscleGroup, WorkoutSession, WorkoutSplit } from "@/lib/types";
import { ChartsPanel } from "@/components/workout/charts/charts-panel";
import type { ChartsData } from "@/actions/charts";

interface DashboardContentProps {
  recentSessions: Pick<
    WorkoutSession,
    "id" | "date" | "muscle_groups_focus" | "duration_seconds"
  >[];
  hasExercises: boolean;
  suggestedSplit: WorkoutSplit;
  chartsData: ChartsData;
}

const SPLIT_OPTIONS: WorkoutSplit[] = ["Upper", "Lower"];

export function DashboardContent({
  recentSessions,
  hasExercises,
  suggestedSplit,
  chartsData,
}: DashboardContentProps) {
  const [selectedSplit, setSelectedSplit] =
    useState<WorkoutSplit>(suggestedSplit);

  if (!hasExercises) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-display font-normal text-text-primary mb-2">
          Welcome to JazFit
        </h1>
        <p className="text-text-muted mb-6">Let&apos;s set up your gym first.</p>
        <Link href="/onboarding">
          <Button size="lg" className="w-full">
            Set Up My Gym
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-text-muted text-sm">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-display font-normal text-text-primary">
          Today&apos;s Workout
        </h1>
      </div>

      {/* Split Picker */}
      <div className="space-y-3">
        {SPLIT_OPTIONS.map((split) => {
          const isSelected = split === selectedSplit;
          const isSuggested = split === suggestedSplit;
          const muscles = SPLIT_GROUPS[split];

          return (
            <button
              key={split}
              type="button"
              className="w-full text-left"
              onClick={() => setSelectedSplit(split)}
            >
              <Card
                padding="lg"
                className={`min-h-[80px] transition-all ${
                  isSelected
                    ? "ring-2 ring-accent border-accent"
                    : "opacity-60"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display font-normal text-text-primary">
                      {split} Body
                    </span>
                    {isSuggested && (
                      <Badge size="sm" colorClass="bg-accent/20 text-accent">
                        Suggested
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {muscles.map((g) => (
                      <Badge
                        key={g}
                        size="sm"
                        colorClass={MUSCLE_GROUP_COLORS[g as MuscleGroup]}
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Start Workout */}
      <Link href={`/workout/active?split=${selectedSplit}`}>
        <Button size="lg" className="w-full">
          Start Workout
        </Button>
      </Link>

      {/* Progress Charts */}
      <div>
        <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
          Your Progress
        </h2>
        <ChartsPanel chartsData={chartsData} />
      </div>

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
            Recent Workouts
          </h2>
          <div className="space-y-2">
            {recentSessions.slice(0, 3).map((session) => (
              <Link key={session.id} href={`/history/${session.id}`}>
                <Card
                  padding="sm"
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-text-primary font-medium">
                      {new Date(
                        session.date + "T00:00:00"
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {session.muscle_groups_focus.map((g) => (
                        <Badge
                          key={g}
                          colorClass={MUSCLE_GROUP_COLORS[g as MuscleGroup]}
                          size="sm"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {session.duration_seconds && (
                    <span className="text-sm text-text-dim">
                      {Math.round(session.duration_seconds / 60)}min
                    </span>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
