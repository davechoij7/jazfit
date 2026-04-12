"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseRestTimerOptions {
  onComplete?: () => void;
}

export function useRestTimer({ onComplete }: UseRestTimerOptions = {}) {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    cleanup();
    setDuration(seconds);
    setRemaining(seconds);
    setIsRunning(true);

    const startTime = Date.now();
    const endTime = startTime + seconds * 1000;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, (endTime - now) / 1000);

      if (left <= 0) {
        cleanup();
        setRemaining(0);
        setIsRunning(false);

        // Vibrate on completion if available
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }

        onCompleteRef.current?.();
      } else {
        setRemaining(left);
      }
    }, 100); // 100ms for smooth animation
  }, [cleanup]);

  const skip = useCallback(() => {
    cleanup();
    setRemaining(0);
    setIsRunning(false);
    onCompleteRef.current?.();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  return {
    isRunning,
    duration,
    remaining,
    start,
    skip,
    setDuration,
  };
}
