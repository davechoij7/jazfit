"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ALL_SPLITS, AFFIRMATIONS } from "@/lib/constants";
import type { WorkoutSplit } from "@/lib/types";
import type { DailyStep } from "@/actions/health";
import { StepsCard } from "@/components/workout/steps-card";
import { WorkoutHistoryRow } from "@/components/workout/workout-history-row";

interface DashboardContentProps {
  hasExercises: boolean;
  suggestedSplit: WorkoutSplit;
  weeklySteps: DailyStep[];
  recentSessions: { date: string; workout_type: string | null }[];
}

const SPLIT_ICONS: Record<WorkoutSplit, string> = {
  Upper: "🏋️‍♀️",
  Lower: "🦵",
  Yoga: "🧘‍♀️",
  Barre: "🩰",
  Walk: "🚶‍♀️",
  Run: "🏃‍♀️",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Let's go";
}

function getLastTrainedLabel(
  sessions: { date: string; workout_type: string | null }[],
  split: string
): string {
  const match = sessions.find((s) => s.workout_type === split);
  if (!match) return "First time!";
  const diffMs =
    new Date().getTime() - new Date(match.date + "T00:00:00").getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Trained today";
  if (days === 1) return "Last: yesterday";
  return `Last: ${days} days ago`;
}

export function DashboardContent({
  hasExercises,
  suggestedSplit,
  weeklySteps,
  recentSessions,
}: DashboardContentProps) {
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit>(suggestedSplit);

  const greeting = getGreeting();
  const affirmation = useMemo(
    () => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
    []
  );

  const displayName =
    selectedSplit === "Upper"
      ? "Upper Body"
      : selectedSplit === "Lower"
      ? "Lower Body"
      : selectedSplit;

  const lastTrained = getLastTrainedLabel(recentSessions, selectedSplit);

  if (!hasExercises) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-display font-normal text-text-primary mb-2">
          Welcome to JazFit
        </h1>
        <p className="text-text-muted mb-6">Let&apos;s set up your gym first.</p>
        <Link
          href="/onboarding"
          className="block w-full text-center rounded-full py-3 font-semibold text-sm bg-[#C4808E] text-white"
        >
          Set Up My Gym
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display text-text-primary">
          {greeting}, Jazmin
        </h1>
        <p className="text-sm text-text-muted italic mt-1">{affirmation}</p>
      </div>

      {/* Hero card */}
      <div
        className="rounded-[28px] px-5 pt-4 pb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #C4808E 0%, #7A3347 100%)" }}
      >
        {/* Watermark */}
        <span
          className="absolute bottom-[-10px] right-[-8px] text-[90px] leading-none select-none pointer-events-none"
          style={{ opacity: 0.07, transform: "rotate(-10deg)" }}
          aria-hidden
        >
          🌸
        </span>

        {/* Chip row */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {ALL_SPLITS.map((split) => {
            const isActive = split === selectedSplit;
            return (
              <button
                key={split}
                type="button"
                onClick={() => setSelectedSplit(split)}
                className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap min-h-[36px] shrink-0"
                style={
                  isActive
                    ? {
                        background: "rgba(255,255,255,0.28)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        color: "white",
                        fontWeight: 700,
                      }
                    : {
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.7)",
                      }
                }
              >
                {split}
              </button>
            );
          })}
        </div>

        {/* Snoopy image with bounce animation */}
        <div className="flex justify-center py-4">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <Image
                src={`/splits/${selectedSplit.toLowerCase()}.png`}
                alt={SPLIT_ICONS[selectedSplit] ?? selectedSplit}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>

        {/* Title + meta */}
        <div>
          {selectedSplit === suggestedSplit && (
            <p className="text-[10px] tracking-widest opacity-70 text-white uppercase mb-0.5">
              Suggested today
            </p>
          )}
          <p className="text-xl font-display text-white font-semibold">
            {displayName}
          </p>
          <p className="text-sm opacity-60 text-white mt-0.5">{lastTrained}</p>
        </div>

        {/* Start button */}
        <Link
          href={`/workout/active?split=${selectedSplit}`}
          className="block w-full text-center rounded-full py-3 font-semibold text-sm mt-3"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.35)",
            color: "white",
          }}
        >
          Start Workout →
        </Link>
      </div>

      {/* Steps card */}
      <StepsCard data={weeklySteps} goal={10000} />

      {/* Workout history row */}
      <WorkoutHistoryRow sessions={recentSessions} />
    </div>
  );
}
