/**
 * Font size selector — M2b stretch.
 *
 * Three sizes: Default (16px), Large (18px), Larger (20px).
 * Compact A/A/A button group for chapter reader header.
 * Persisted via preferences service.
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
  type FontSize,
} from "@/lib/services/preferences";

// ── Font size options ───────────────────────────────────────────

const SIZES: { value: FontSize; label: string; className: string }[] = [
  { value: "default", label: "A", className: "text-xs" },
  { value: "large", label: "A", className: "text-sm" },
  { value: "larger", label: "A", className: "text-base" },
];

// ── Component ───────────────────────────────────────────────────

export function FontSizeSelector() {
  const t = useTranslations("reader");
  const [current, setCurrent] = useState<FontSize>("default");

  useEffect(() => {
    setCurrent(getPreference("font-size"));

    const unsubscribe = subscribe((prefs) => {
      setCurrent(prefs["font-size"]);
    });
    return unsubscribe;
  }, []);

  // Apply font-size class on <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("font-large", "font-larger");
    if (current === "large") html.classList.add("font-large");
    if (current === "larger") html.classList.add("font-larger");

    return () => {
      html.classList.remove("font-large", "font-larger");
    };
  }, [current]);

  const selectSize = useCallback((size: FontSize) => {
    setPreference("font-size", size);
    setCurrent(size);
  }, []);

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-(--theme-border) p-0.5"
      role="radiogroup"
      aria-label={t("fontSize")}
      data-testid="font-size-selector"
    >
      {SIZES.map(({ value, label, className }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={current === value}
          aria-label={t(`fontSize_${value}`)}
          onClick={() => selectSize(value)}
          className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded font-serif font-bold transition-colors ${className} ${
            current === value
              ? "bg-(--theme-gold) text-(--theme-bg) shadow-sm"
              : "text-(--theme-text-secondary) hover:bg-(--theme-bg-secondary)"
          } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-gold)`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
