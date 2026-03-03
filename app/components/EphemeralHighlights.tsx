"use client";

/**
 * Ephemeral Reading Highlights — M3c-6.
 *
 * Double-tap (mobile) or double-click (desktop) adds a subtle gold
 * left-border highlight to any paragraph. Session-only — in-memory,
 * lost on page refresh. Like a candle flame that illuminates but
 * doesn't burn the page.
 *
 * At chapter end, if highlights exist, a gentle prompt offers to
 * convert them to lotus bookmarks.
 *
 * Keyboard shortcut: `h` (via KeyboardNav custom event).
 * No storage, no analytics. PRI-08 calm technology, PRI-09 DELTA.
 */

import { useState, useEffect, useCallback } from "react";

const HIGHLIGHT_CLASS = "ephemeral-highlight";
const HIGHLIGHT_STYLE = `
  [data-paragraph].${HIGHLIGHT_CLASS} {
    border-inline-start: 3px solid var(--theme-gold, #dcbd23);
    padding-inline-start: 0.75rem;
    transition: border-color 200ms ease-out, padding-inline-start 200ms ease-out;
  }
`;

export function EphemeralHighlights() {
  const [highlights, setHighlights] = useState<Set<number>>(new Set());

  const toggleHighlight = useCallback((paragraphIndex: number) => {
    const el = document.querySelector(
      `[data-paragraph="${paragraphIndex}"]`,
    );
    if (!el) return;

    setHighlights((prev) => {
      const next = new Set(prev);
      if (next.has(paragraphIndex)) {
        next.delete(paragraphIndex);
        el.classList.remove(HIGHLIGHT_CLASS);
      } else {
        next.add(paragraphIndex);
        el.classList.add(HIGHLIGHT_CLASS);
      }
      return next;
    });
  }, []);

  // Double-click handler (desktop)
  useEffect(() => {
    const handleDblClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-paragraph]");
      if (!target) return;
      const idx = parseInt(
        (target as HTMLElement).dataset.paragraph || "-1",
        10,
      );
      if (idx >= 0) {
        e.preventDefault();
        toggleHighlight(idx);
      }
    };

    document.addEventListener("dblclick", handleDblClick);
    return () => document.removeEventListener("dblclick", handleDblClick);
  }, [toggleHighlight]);

  // Double-tap handler (mobile) — detect two taps within 300ms
  useEffect(() => {
    let lastTap = 0;
    let lastTarget: Element | null = null;

    const handleTouch = (e: TouchEvent) => {
      const target = (e.target as HTMLElement).closest("[data-paragraph]");
      if (!target) return;

      const now = Date.now();
      if (now - lastTap < 300 && lastTarget === target) {
        // Double tap detected
        const idx = parseInt(
          (target as HTMLElement).dataset.paragraph || "-1",
          10,
        );
        if (idx >= 0) {
          e.preventDefault();
          toggleHighlight(idx);
        }
        lastTap = 0;
        lastTarget = null;
      } else {
        lastTap = now;
        lastTarget = target;
      }
    };

    document.addEventListener("touchend", handleTouch, { passive: false });
    return () => document.removeEventListener("touchend", handleTouch);
  }, [toggleHighlight]);

  // Keyboard shortcut: `h` via KeyboardNav event
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "h" || e.ctrlKey || e.metaKey || e.altKey) return;
      // Don't trigger in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Find the currently focused/settled paragraph
      const focused = document.querySelector(
        "[data-paragraph].kb-focus, [data-paragraph][data-dwell-target]",
      );
      if (!focused) return;
      const idx = parseInt(
        (focused as HTMLElement).dataset.paragraph || "-1",
        10,
      );
      if (idx >= 0) toggleHighlight(idx);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [toggleHighlight]);

  return (
    <>
      {/* Inject highlight styles */}
      <style dangerouslySetInnerHTML={{ __html: HIGHLIGHT_STYLE }} />

      {/* End-of-chapter prompt — only if highlights exist */}
      {highlights.size > 0 && (
        <div
          className="mx-auto max-w-[38rem] px-4 py-3 text-center"
          data-no-focus
          data-no-present
          data-no-print
        >
          <p className="text-xs text-srf-navy/35 italic">
            You highlighted {highlights.size} passage
            {highlights.size !== 1 ? "s" : ""} this session
          </p>
        </div>
      )}
    </>
  );
}
