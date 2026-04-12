"use client";

import { useEffect, useRef, useCallback } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // Wake Lock request failed (e.g., low battery)
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Already released
      }
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    acquire();

    // Re-acquire on visibility change (when user switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      release();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [acquire, release]);
}
