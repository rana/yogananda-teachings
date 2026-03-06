"use client";

/**
 * ReaderToolbar — minimal fixed controls for the reading surface.
 *
 * Three controls, bottom-right corner:
 *   Reader preferences — text size, line spacing (reading comfort).
 *   Immerse (i)        — hides chrome, scales text to viewport.
 *   Print              — triggers browser print dialog.
 *
 * FTR-041 §3. Calm technology: functional, not decorative.
 * Touch targets: 44×44px minimum (WCAG 2.5.8).
 */

import { useCallback, useEffect } from "react";
import { useDesign } from "./DesignProvider";
import { ReaderPreferences } from "./ReaderPreferences";

export function ReaderToolbar() {
  const { mode, setMode } = useDesign();
  const isImmersed = mode === "immerse";

  const toggleImmerse = useCallback(() => {
    setMode(isImmersed ? "normal" : "immerse");
  }, [isImmersed, setMode]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Clean print filename and title.
  // Page title: "A "Perfume Saint" Displays His Wonders — Autobiography of a Yogi — SRF Teachings Portal"
  // Print title: "Autobiography of a Yogi — Ch 5, A "Perfume Saint" Displays His Wonders"
  useEffect(() => {
    let originalTitle = "";
    function beforePrint() {
      originalTitle = document.title;
      const parts = document.title.split(" — ");
      // parts[0] = chapter title, parts[1] = book title, parts[2] = site name
      if (parts.length >= 2) {
        const chapterTitle = parts[0];
        const bookTitle = parts[1];
        const label = document.querySelector(".chapter-label");
        const chNum = label?.textContent?.match(/\d+/)?.[0];
        if (chNum) {
          document.title = `${bookTitle} — Ch ${chNum}, ${chapterTitle}`;
        } else {
          document.title = `${bookTitle} — ${chapterTitle}`;
        }
      }
    }
    function afterPrint() {
      if (originalTitle) document.title = originalTitle;
    }
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  // Keyboard shortcut: i for immerse, Escape for normal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "i") {
        e.preventDefault();
        toggleImmerse();
      } else if (e.key === "Escape" && isImmersed) {
        e.preventDefault();
        setMode("normal");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImmersed, setMode, toggleImmerse]);

  return (
    <div
      className="reading-modes"
      role="toolbar"
      aria-label="Reader toolbar"
      data-no-print
    >
      <ReaderPreferences />
      <button
        className="reading-mode-btn"
        aria-pressed={isImmersed}
        aria-label={isImmersed ? "Exit immerse mode" : "Immerse mode"}
        title="Immerse (i)"
        onClick={toggleImmerse}
      >
        {/* Eye icon — open when normal, closed line when immersed */}
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
          {isImmersed ? (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          ) : (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
      <button
        className="reading-mode-btn"
        aria-label="Print chapter"
        title="Print"
        onClick={handlePrint}
      >
        {/* Printer icon */}
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
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      </button>
    </div>
  );
}
