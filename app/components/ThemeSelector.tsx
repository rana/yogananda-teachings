/**
 * Theme selector — M2b stretch (DES-008).
 *
 * Five color themes: Auto (system), Light, Sepia, Dark, Meditate.
 * Compact button group for chapter reader header or settings.
 *
 * 44x44px touch targets (PRI-07).
 * DELTA-compliant: no tracking (PRI-09).
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getPreference,
  setPreference,
  subscribe,
  type ColorTheme,
} from "@/lib/services/preferences";

// ── Theme options ───────────────────────────────────────────────

const THEMES: { value: ColorTheme; icon: string }[] = [
  { value: "auto", icon: "A" },
  { value: "light", icon: "L" },
  { value: "sepia", icon: "S" },
  { value: "dark", icon: "D" },
  { value: "meditate", icon: "M" },
];

// ── Component ───────────────────────────────────────────────────

export function ThemeSelector() {
  const t = useTranslations("reader");
  const [current, setCurrent] = useState<ColorTheme>("auto");

  // Load persisted theme on mount
  useEffect(() => {
    setCurrent(getPreference("color-theme"));

    const unsubscribe = subscribe((prefs) => {
      setCurrent(prefs["color-theme"]);
    });
    return unsubscribe;
  }, []);

  const selectTheme = useCallback((theme: ColorTheme) => {
    setPreference("color-theme", theme);
    setCurrent(theme);
  }, []);

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-(--theme-border) p-0.5"
      role="radiogroup"
      aria-label={t("colorTheme")}
      data-testid="theme-selector"
    >
      {THEMES.map(({ value, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={current === value}
          aria-label={t(`theme_${value}`)}
          onClick={() => selectTheme(value)}
          className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-xs font-sans font-semibold transition-colors ${
            current === value
              ? "bg-(--theme-gold) text-(--theme-bg) shadow-sm"
              : "text-(--theme-text-secondary) hover:bg-(--theme-bg-secondary)"
          } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-gold)`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
