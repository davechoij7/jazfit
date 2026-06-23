"use client";

import { useEffect, useState } from "react";

/**
 * Pure geometry: how many CSS pixels of the layout viewport are covered by the
 * on-screen keyboard. iOS Safari shrinks only the *visual* viewport when the
 * keyboard opens, leaving `window.innerHeight` (the layout viewport, which
 * `position: fixed` anchors to) unchanged. So the keyboard height is simply the
 * difference between the two.
 *
 * Crucially this does NOT subtract `visualViewport.offsetTop`: when iOS pans to
 * reveal a focused field, offsetTop goes positive, but the keyboard's position
 * relative to the layout viewport hasn't changed. Subtracting it collapses the
 * inset to ~0 on lower fields and drops a fixed sheet back behind the keyboard.
 */
export function keyboardInsetFrom(
  layoutHeight: number,
  visualViewportHeight: number
): number {
  return Math.max(0, Math.round(layoutHeight - visualViewportHeight));
}

export interface KeyboardInset {
  /** Pixels covered by the keyboard — 0 when closed. Use as `bottom` for fixed sheets. */
  keyboardInset: number;
  /** Visible viewport height while the keyboard is open, else null. Clamp sheet max-height to this. */
  visibleHeight: number | null;
}

/**
 * Tracks the on-screen keyboard so a bottom-anchored `position: fixed` sheet can
 * be lifted above it and clamped to the visible area (keeping action buttons
 * reachable). Returns zeroed values where `visualViewport` is unavailable (SSR,
 * older browsers) so callers fall back to their default layout.
 */
export function useKeyboardInset(): KeyboardInset {
  const [state, setState] = useState<KeyboardInset>({
    keyboardInset: 0,
    visibleHeight: null,
  });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const keyboardInset = keyboardInsetFrom(window.innerHeight, vv.height);
      setState({
        keyboardInset,
        visibleHeight: keyboardInset > 0 ? Math.round(vv.height) : null,
      });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}
