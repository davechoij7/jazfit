"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MuscleGroupCard } from "./muscle-group-card";
import { MUSCLE_GROUP_COLORS, SYNERGY_GROUPS } from "@/lib/constants";
import type {
  MuscleGroup,
  MuscleGroupSuggestion,
  WorkoutSession,
} from "@/lib/types";

interface DashboardContentProps {
  suggestion: MuscleGroupSuggestion;
  recentSessions: Pick<
    WorkoutSession,
    "id" | "date" | "muscle_groups_focus" | "duration_seconds"
  >[];
  hasExercises: boolean;
}

export function DashboardContent({
  suggestion,
  recentSessions,
  hasExercises,
}: DashboardContentProps) {
  const [selectedPrimary, setSelectedPrimary] = useState<MuscleGroup>(
    suggestion.primary
  );

  // Find the synergy group for the selected primary
  const synergy = SYNERGY_GROUPS.find((sg) => sg.primary === selectedPrimary);
  const targetGroups = synergy
    ? [synergy.primary, ...synergy.secondary]
    : [selectedPrimary];

  const handleGroupSelect = (group: MuscleGroup) => {
    setSelectedPrimary(group);
  };

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

      {/* Suggestion Card */}
      <Card padding="lg">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {targetGroups.map((g) => (
              <Badge
                key={g}
                colorClass={MUSCLE_GROUP_COLORS[g as MuscleGroup]}
              >
                {g}
              </Badge>
            ))}
          </div>
          <p className="text-text-muted text-sm">{suggestion.reasoning}</p>
          <Link href={`/workout?groups=${targetGroups.join(",")}`}>
            <Button size="lg" className="w-full mt-2">
              Start Workout
            </Button>
          </Link>
        </div>
      </Card>

      {/* Muscle Group Grid (override) */}
      <div>
        <h2 className="text-sm font-medium text-text-muted mb-3 tracking-wide">
          Or choose a different focus
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {suggestion.allGroupStats.map((stat) => (
            <MuscleGroupCard
              key={stat.group}
              stat={stat}
              isSelected={stat.group === selectedPrimary}
              onSelect={handleGroupSelect}
            />
          ))}
        </div>
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
