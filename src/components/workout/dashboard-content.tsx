"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ALL_SPLITS, SPLIT_ICONS, SPLIT_IMAGES } from "@/lib/constants";
import type { WorkoutSplit } from "@/lib/types";
import { WorkoutHistoryRow } from "@/components/workout/workout-history-row";
import { StickerAnimation } from "@/components/workout/sticker-animation";
import type { DailySticker } from "@/lib/types";

interface DashboardContentProps {
  hasExercises: boolean;
  suggestedSplit: WorkoutSplit;
  recentSessions: { id: string; date: string; workout_type: string | null }[];
  unseenSticker: DailySticker | null;
  activeSession: { sessionId: string; split: WorkoutSplit | null } | null;
}


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
  recentSessions,
  unseenSticker,
  activeSession,
}: DashboardContentProps) {
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit>(suggestedSplit);

  const greeting = getGreeting();

  function splitDisplayName(split: WorkoutSplit): string {
    if (split === "Upper") return "Upper Body";
    if (split === "Lower") return "Lower Body";
    return split;
  }

  const displayName = splitDisplayName(selectedSplit);
  // If an in-progress workout exists but predates the workout_type column, fall
  // back to "Workout" so the resume card still renders.
  const resumableSplit: WorkoutSplit | null = activeSession?.split ?? null;
  const activeDisplayName = resumableSplit ? splitDisplayName(resumableSplit) : "Workout";
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
      {/* Morning sticker animation */}
      {unseenSticker && (
        <StickerAnimation
          stickerId={unseenSticker.id}
          workoutType={unseenSticker.workout_type}
          date={unseenSticker.date}
        />
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display text-text-primary">
          {greeting}, Jazmin
        </h1>
        <p className="text-sm text-text-muted italic mt-1">Dental Floss by August!</p>
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

        {activeSession ? (
          <>
            {/* Resume mode: no chips, show in-progress split */}
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
                  {resumableSplit && (
                    <Image
                      src={SPLIT_IMAGES[resumableSplit]}
                      alt={activeDisplayName}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  )}
                </div>
              </motion.div>
            </div>

            <div>
              <p className="text-[10px] tracking-widest opacity-70 text-white uppercase mb-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                In Progress
              </p>
              <p className="text-xl font-display text-white font-semibold">
                {activeDisplayName}
              </p>
            </div>

            <Link
              href="/workout/active"
              className="block w-full text-center rounded-full py-3 font-semibold text-sm mt-3"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "white",
              }}
            >
              Resume Workout →
            </Link>
          </>
        ) : (
          <>
            {/* Normal mode: chip row, suggested split, start button */}
            <div
              className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {ALL_SPLITS.map((split) => {
                const isChipActive = split === selectedSplit;
                return (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setSelectedSplit(split)}
                    className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap min-h-[48px] shrink-0"
                    style={
                      isChipActive
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
                    src={SPLIT_IMAGES[selectedSplit]}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>

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
          </>
        )}
      </div>

      {/* Workout history row */}
      <WorkoutHistoryRow sessions={recentSessions} />
    </div>
  );
}
