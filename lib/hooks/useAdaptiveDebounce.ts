/**
 * Adaptive debounce hook — M2b-16 (FTR-006).
 *
 * Adjusts debounce delay based on network quality:
 *   - 2G/slow-2G: baseMs * 3
 *   - 3G: baseMs * 1.5
 *   - 4G/wifi: baseMs (unchanged)
 *
 * Progressive enhancement — falls back to baseMs when
 * navigator.connection is unavailable.
 *
 * Framework-agnostic hook in /lib/hooks/ (PRI-10).
 */

import { useState, useEffect, useRef } from "react";

/** Detect connection quality multiplier. */
function getDelayMultiplier(): number {
  if (typeof navigator === "undefined") return 1;

  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;

  if (!conn?.effectiveType) return 1;

  switch (conn.effectiveType) {
    case "slow-2g":
    case "2g":
      return 3;
    case "3g":
      return 1.5;
    default:
      return 1;
  }
}

/**
 * Debounce a value with network-adaptive delay.
 *
 * @param value - The value to debounce
 * @param baseMs - Base debounce delay in milliseconds
 * @returns The debounced value
 */
export function useAdaptiveDebounce<T>(value: T, baseMs: number): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delay = Math.round(baseMs * getDelayMultiplier());

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, baseMs]);

  return debounced;
}
