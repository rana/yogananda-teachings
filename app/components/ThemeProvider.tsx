/**
 * Theme provider — applies color theme to <html> element.
 *
 * Reads the "color-theme" preference from localStorage and sets
 * data-theme on document.documentElement. For "auto", resolves
 * via prefers-color-scheme media query.
 *
 * Mount once in the root layout. Framework-minimal — reads from
 * the preferences service (PRI-10).
 *
 * DELTA-compliant (PRI-09): no theme analytics, no server sync.
 */

"use client";

import { useEffect } from "react";
import {
  getPreference,
  subscribe,
  type ColorTheme,
} from "@/lib/services/preferences";

function applyTheme(theme: ColorTheme): void {
  document.documentElement.setAttribute("data-theme", theme === "auto" ? "auto" : theme);
}

export function ThemeProvider() {
  useEffect(() => {
    // Apply stored preference on mount
    const theme = getPreference("color-theme");
    applyTheme(theme);

    // Subscribe to preference changes from other components
    const unsubscribe = subscribe((prefs) => {
      applyTheme(prefs["color-theme"]);
    });

    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    function handleSystemChange() {
      const current = getPreference("color-theme");
      if (current === "auto") {
        // Re-apply auto to trigger CSS media query re-evaluation
        applyTheme("auto");
      }
    }
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener("change", handleSystemChange);
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  // Renders nothing — pure side effect
  return null;
}
