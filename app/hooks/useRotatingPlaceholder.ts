"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Cycles through placeholder texts with a gentle crossfade.
 *
 * Returns the current text and a `fading` flag for CSS transitions.
 * Pauses when `active` is false (e.g. input is focused or has a value).
 * Respects prefers-reduced-motion — shows first item only (PRI-07).
 */
export function useRotatingPlaceholder(
  items: readonly string[],
  active: boolean,
  intervalMs = 5000,
  fadeMs = 500,
): { text: string; fading: boolean } {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    cleanup();

    if (!active || items.length <= 1) {
      setFading(false);
      return;
    }

    // Respect prefers-reduced-motion (PRI-07)
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mql.matches) return;
    }

    timerRef.current = setInterval(() => {
      setFading(true);
      fadeTimerRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setFading(false);
      }, fadeMs);
    }, intervalMs);

    return cleanup;
  }, [active, items, intervalMs, fadeMs, cleanup]);

  return { text: items[index] ?? items[0] ?? "", fading };
}
