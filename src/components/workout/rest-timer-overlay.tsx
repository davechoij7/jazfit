"use client";

import { CircularTimer } from "@/components/ui/circular-timer";
import { Button } from "@/components/ui/button";
import { REST_TIMER_PRESETS } from "@/lib/constants";

interface RestTimerOverlayProps {
  isOpen: boolean;
  duration: number;
  remaining: number;
  onChangeDuration: (seconds: number) => void;
  onSkip: () => void;
}

export function RestTimerOverlay({
  isOpen,
  duration,
  remaining,
  onChangeDuration,
  onSkip,
}: RestTimerOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(240,196,206,0.55)] backdrop-blur-[20px]">
      <div className="flex flex-col items-center gap-8">
        <h3 className="text-lg font-medium text-text-muted tracking-wide">Rest</h3>

        <CircularTimer duration={duration} remaining={remaining} size={220} strokeWidth={10} />

        {/* Duration presets */}
        <div className="flex gap-3">
          {REST_TIMER_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChangeDuration(preset)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                         select-none touch-manipulation min-h-10
                         ${
                           preset === duration
                             ? "bg-accent text-white"
                             : "bg-bg-elevated text-text-muted active:bg-bg-card"
                         }`}
            >
              {preset}s
            </button>
          ))}
        </div>

        <Button variant="ghost" size="lg" onClick={onSkip}>
          Skip Rest
        </Button>
      </div>
    </div>
  );
}
