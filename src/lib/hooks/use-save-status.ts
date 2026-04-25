"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatusKind = "idle" | "saving" | "saved" | "error";

export interface SaveError {
  message: string;
  retry: () => Promise<void>;
}

export interface UseSaveStatus {
  status: SaveStatusKind;
  lastError: SaveError | null;
  track: (task: () => Promise<unknown>) => Promise<void>;
  dismissError: () => void;
}

/**
 * Tracks in-flight and failed writes for the active workout. Call `track(fn)`
 * wherever you'd fire-and-forget a server action; the hook surfaces pending /
 * saved / error state so the UI can show a status pill instead of silently
 * dropping failures. On `online`, the most recent failed task is retried.
 */
export function useSaveStatus(): UseSaveStatus {
  const [pending, setPending] = useState(0);
  const [lastError, setLastError] = useState<SaveError | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const lastErrorRef = useRef<SaveError | null>(null);
  lastErrorRef.current = lastError;

  const track = useCallback(
    async (task: () => Promise<unknown>) => {
      setPending((n) => n + 1);
      try {
        await task();
        setLastError(null);
        setLastSavedAt(Date.now());
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Couldn't save. Tap to retry.";
        setLastError({ message, retry: () => track(task) });
      } finally {
        setPending((n) => Math.max(0, n - 1));
      }
    },
    []
  );

  const dismissError = useCallback(() => setLastError(null), []);

  // Retry the most recent failed task when the browser comes back online.
  useEffect(() => {
    const onOnline = () => {
      const err = lastErrorRef.current;
      if (err) void err.retry();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const status: SaveStatusKind = lastError
    ? "error"
    : pending > 0
      ? "saving"
      : lastSavedAt
        ? "saved"
        : "idle";

  return { status, lastError, track, dismissError };
}
