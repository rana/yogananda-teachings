/**
 * Reader mode toggles — M2b-8 (Focus), M2b-15 (Presentation).
 *
 * Two CSS-only reading modes for the chapter reader:
 *   Focus: suppresses all chrome except reading column + Next Chapter.
 *   Present: enlarges text, hides all chrome, warm cream fills viewport.
 *
 * Both modes set data-mode on <main>. Mutually exclusive.
 * Focus mode persists via preferences service. Presentation mode is session-only.
 * Escape exits presentation mode.
 *
 * 44x44px minimum touch targets (PRI-07).
 * DELTA-compliant: no tracking (PRI-09).
 * prefers-reduced-motion respected via CSS (globals.css).
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getPreference,
  setPreference,
} from "@/lib/services/preferences";

// ── Types ──────────────────────────────────────────────────────────

type ReaderMode = "none" | "focus" | "present";

// ── Component ─────────────────────────────────────────────────────

export function ReaderModes() {
  const t = useTranslations("reader");

  const [mode, setMode] = useState<ReaderMode>("none");

  // ── Load persisted focus mode on mount ───────────────────────────

  useEffect(() => {
    const storedFocus = getPreference("focus-mode");
    if (storedFocus) {
      setMode("focus");
    }
  }, []);

  // ── Apply data-mode attribute on <main> ──────────────────────────

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    if (mode === "none") {
      main.removeAttribute("data-mode");
    } else {
      main.setAttribute("data-mode", mode);
    }

    return () => {
      main.removeAttribute("data-mode");
    };
  }, [mode]);

  // ── Escape exits presentation mode ───────────────────────────────

  useEffect(() => {
    if (mode !== "present") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMode("none");
        setPreference("focus-mode", false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode]);

  // ── Toggle handlers ──────────────────────────────────────────────

  const toggleFocus = useCallback(() => {
    setMode((prev) => {
      const next = prev === "focus" ? "none" : "focus";
      setPreference("focus-mode", next === "focus");
      return next;
    });
  }, []);

  const togglePresent = useCallback(() => {
    setMode((prev) => {
      const next = prev === "present" ? "none" : "present";
      // Presentation mode is session-only — but clear focus persistence
      if (next === "present") {
        setPreference("focus-mode", false);
      }
      return next;
    });
  }, []);

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="flex items-center gap-1" data-testid="reader-modes">
      {/* Focus mode toggle */}
      <button
        type="button"
        onClick={toggleFocus}
        aria-pressed={mode === "focus"}
        aria-label={mode === "focus" ? t("focusModeOff") : t("focusMode")}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors ${
          mode === "focus"
            ? "bg-srf-navy/10 text-srf-navy"
            : "text-srf-navy/60 hover:text-srf-navy hover:bg-srf-navy/5"
        } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-srf-gold`}
      >
        {/* Focus icon: crosshair / target */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="5" />
          <circle cx="8" cy="8" r="1.5" />
          <line x1="8" y1="1" x2="8" y2="3" />
          <line x1="8" y1="13" x2="8" y2="15" />
          <line x1="1" y1="8" x2="3" y2="8" />
          <line x1="13" y1="8" x2="15" y2="8" />
        </svg>
      </button>

      {/* Presentation mode toggle */}
      <button
        type="button"
        onClick={togglePresent}
        aria-pressed={mode === "present"}
        aria-label={
          mode === "present" ? t("presentModeOff") : t("presentMode")
        }
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors ${
          mode === "present"
            ? "bg-srf-navy/10 text-srf-navy"
            : "text-srf-navy/60 hover:text-srf-navy hover:bg-srf-navy/5"
        } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-srf-gold`}
      >
        {/* Present icon: expand/maximize */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="1,5 1,1 5,1" />
          <polyline points="11,1 15,1 15,5" />
          <polyline points="15,11 15,15 11,15" />
          <polyline points="5,15 1,15 1,11" />
        </svg>
      </button>

      {/* Screen reader announcement */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="mode-announcer"
      >
        {mode === "focus" ? t("focusModeOn") : ""}
        {mode === "present" ? t("presentModeOn") : ""}
      </div>
    </div>
  );
}
