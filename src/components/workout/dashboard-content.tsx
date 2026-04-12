"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPLIT_GROUPS, SPLIT_CATEGORIES, SPLIT_DESCRIPTIONS, MUSCLE_GROUP_COLORS, AFFIRMATIONS } from "@/lib/constants";
import type { MuscleGroup, WorkoutSplit, StrengthSplit } from "@/lib/types";

interface DashboardContentProps {
  hasExercises: boolean;
  suggestedSplit: WorkoutSplit;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Let's go";
}


function isStrengthSplit(s: WorkoutSplit): s is StrengthSplit {
  return s === "Upper" || s === "Lower";
}

export function DashboardContent({
  hasExercises,
  suggestedSplit,
}: DashboardContentProps) {
  const [selectedSplit, setSelectedSplit] =
    useState<WorkoutSplit>(suggestedSplit);
  const greeting = getGreeting();
  const affirmation = useMemo(
    () => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
    []
  );

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
    <div className="px-4 pt-6 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display text-text-primary">
          {greeting}, Jazmin
        </h1>
        <p className="text-sm text-text-muted italic mt-1">{affirmation}</p>
      </div>

      {/* Hero split card — selected/suggested */}
      <Link href={`/workout/active?split=${selectedSplit}`} className="block">
        <div className="rounded-2xl bg-accent/10 border-2 border-accent p-6 min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-display text-text-primary">
              {!isStrengthSplit(selectedSplit) ? selectedSplit : `${selectedSplit} Body`}
            </span>
            {selectedSplit === suggestedSplit && (
              <Badge size="sm" colorClass="bg-accent/20 text-accent">
                Suggested
              </Badge>
            )}
          </div>
          {isStrengthSplit(selectedSplit) ? (
            <div className="flex flex-wrap gap-1.5">
              {SPLIT_GROUPS[selectedSplit].map((g) => (
                <Badge key={g} size="sm" colorClass={MUSCLE_GROUP_COLORS[g]}>
                  {g}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">{SPLIT_DESCRIPTIONS[selectedSplit]}</p>
          )}
        </div>
      </Link>

      {/* Category-grouped shelf — other options */}
      <div className="space-y-4">
        {SPLIT_CATEGORIES.map(({ label, splits }) => {
          const others = splits.filter((s) => s !== selectedSplit);
          if (!others.length) return null;
          return (
            <div key={label}>
              <p className="text-xs text-text-dim tracking-wide mb-2 uppercase">{label}</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4">
                {others.map((split) => (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setSelectedSplit(split)}
                    className="shrink-0 w-40 min-h-12 rounded-2xl bg-bg-card border border-border p-4 text-left touch-manipulation select-none"
                  >
                    <p className="text-sm font-display text-text-primary mb-1">{split}</p>
                    <p className="text-xs text-text-muted">{SPLIT_DESCRIPTIONS[split]}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start CTA */}
      <Link href={`/workout/active?split=${selectedSplit}`}>
        <Button size="lg" className="w-full">
          Start Workout
        </Button>
      </Link>
    </div>
  );
}
