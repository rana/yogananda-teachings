/**
 * Circadian color temperature — DES-011.
 *
 * Sets data-time-band on <html> based on local time.
 * Subtly shifts background warmth: cooler cream in morning,
 * standard midday, warmer cream in evening.
 *
 * Only active in light mode contexts — dark/sepia themes
 * and OS dark preference override circadian shifts.
 *
 * Runs once on mount. No polling, no intervals.
 * DELTA-compliant: uses Date.getHours(), no data sent anywhere.
 */

"use client";

import { useEffect } from "react";
import { getPreference, subscribe } from "@/lib/services/preferences";

// ── Time bands ──────────────────────────────────────────────────

type TimeBand = "morning" | "midday" | "evening" | "night";

function getTimeBand(): TimeBand {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 16) return "midday";
  if (hour >= 16 && hour < 21) return "evening";
  return "night";
}

/** Circadian only applies when the effective theme is light. */
function shouldApplyCircadian(): boolean {
  const theme = getPreference("color-theme");
  if (theme === "dark" || theme === "sepia") return false;
  if (theme === "auto") {
    return !window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return true; // "light" or unset
}

// ── Component ───────────────────────────────────────────────────

export function CircadianProvider() {
  useEffect(() => {
    const html = document.documentElement;

    function update() {
      if (shouldApplyCircadian()) {
        html.setAttribute("data-time-band", getTimeBand());
      } else {
        html.removeAttribute("data-time-band");
      }
    }

    update();

    // Re-evaluate when user changes color theme
    const unsubscribe = subscribe(() => update());

    // Re-evaluate when OS dark mode changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);

    return () => {
      unsubscribe();
      mq.removeEventListener("change", update);
      html.removeAttribute("data-time-band");
    };
  }, []);

  return null;
}
