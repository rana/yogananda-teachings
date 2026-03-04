"use client";

/**
 * ReadingModes — subtle mode controls for the reading surface.
 *
 * Fixed-position pill in the bottom-right corner. Two modes:
 *   Focus (f) — hides header/footer, just the text and you.
 *   Present (p) — group reading: larger text, no chrome.
 *
 * The controls remain visible in all modes so the reader can
 * always return. Escape returns to normal mode.
 *
 * Uses DesignProvider's mode state — CSS responds to data-mode
 * on <html>. All visual treatment in reading-surface.css.
 *
 * Calm technology: functional, not decorative. Minimal chrome.
 * Touch targets: 44×44px minimum (WCAG 2.5.8).
 */

import { useCallback, useEffect } from "react";
import { useDesign } from "./DesignProvider";

export function ReadingModes() {
  const { mode, setMode } = useDesign();

  const toggleMode = useCallback(
    (target: "focus" | "present") => {
      setMode(mode === target ? "normal" : target);
    },
    [mode, setMode],
  );

  // Keyboard shortcuts: f for focus, p for present, Escape for normal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case "f":
          e.preventDefault();
          toggleMode("focus");
          break;
        case "p":
          e.preventDefault();
          toggleMode("present");
          break;
        case "Escape":
          if (mode !== "normal") {
            e.preventDefault();
            setMode("normal");
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, setMode, toggleMode]);

  return (
    <div
      className="reading-modes"
      role="toolbar"
      aria-label="Reading modes"
    >
      <button
        className="reading-mode-btn"
        aria-pressed={mode === "focus"}
        aria-label="Focus mode"
        title="Focus mode (f)"
        onClick={() => toggleMode("focus")}
      >
        {/* Eye icon — the reader's focused gaze */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        className="reading-mode-btn"
        aria-pressed={mode === "present"}
        aria-label="Presentation mode"
        title="Presentation mode (p)"
        onClick={() => toggleMode("present")}
      >
        {/* Expand icon — the text grows for group reading */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
    </div>
  );
}
