"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Cycles through placeholder texts with a contemplative rhythm:
 * show text → fade out → empty breath → fade in next text.
 *
 * Returns the current text and a `fading` flag for CSS transitions.
 * Pauses when `active` is false (e.g. input is focused or has a value).
 * Respects prefers-reduced-motion — shows first item only (PRI-07).
 */
export function useRotatingPlaceholder(
  items: readonly string[],
  active: boolean,
  intervalMs = 20000,
  breathMs = 20000,
  fadeMs = 500,
): { text: string; fading: boolean } {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cleanup = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    cleanup();

    if (!active || items.length <= 1) {
      setFading(false);
      setEmpty(false);
      return;
    }

    // Respect prefers-reduced-motion (PRI-07)
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mql.matches) return;
    }

    const fullCycle = intervalMs + fadeMs + breathMs + fadeMs;

    function schedule() {
      // Phase 1: After showing text, fade out
      const t1 = setTimeout(() => {
        setFading(true);
      }, intervalMs);

      // Phase 2: Text gone → enter empty breath
      const t2 = setTimeout(() => {
        setEmpty(true);
        setFading(false);
      }, intervalMs + fadeMs);

      // Phase 3: Breath done → fade in next text
      const t3 = setTimeout(() => {
        setFading(true);
      }, intervalMs + fadeMs + breathMs);

      // Phase 4: Advance index, show next text
      const t4 = setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setEmpty(false);
        setFading(false);
        timersRef.current = [];
        schedule();
      }, fullCycle);

      timersRef.current = [t1, t2, t3, t4];
    }

    schedule();
    return cleanup;
  }, [active, items, intervalMs, breathMs, fadeMs, cleanup]);

  const text = empty ? "" : (items[index] ?? items[0] ?? "");
  return { text, fading };
}
