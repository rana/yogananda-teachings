/**
 * Reading progress — saves and restores scroll position per chapter.
 *
 * On mount: if a saved position exists for this chapter, scrolls to it.
 * On scroll: debounced save of current paragraph index to localStorage.
 * Renders nothing visible — pure behavior component.
 *
 * DELTA-compliant: all data stays on-device (PRI-09).
 */

"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "srf-reading-progress";
const SAVE_DEBOUNCE_MS = 1000;

interface ProgressMap {
  [chapterKey: string]: number; // paragraph index
}

function getProgressMap(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(chapterKey: string, paragraphIndex: number): void {
  try {
    const map = getProgressMap();
    map[chapterKey] = paragraphIndex;
    // Keep only the 50 most recent entries to avoid unbounded growth
    const entries = Object.entries(map);
    if (entries.length > 50) {
      const trimmed = Object.fromEntries(entries.slice(-50));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {
    // Storage full or unavailable — silent fail
  }
}

function getSavedParagraph(chapterKey: string): number | null {
  const map = getProgressMap();
  return map[chapterKey] ?? null;
}

export function ReadingProgress({
  bookId,
  chapterNumber,
}: {
  bookId: string;
  chapterNumber: number;
}) {
  const chapterKey = `${bookId}:${chapterNumber}`;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  // Restore saved position on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const saved = getSavedParagraph(chapterKey);
    if (saved === null || saved === 0) return;

    // Small delay to let the page render
    requestAnimationFrame(() => {
      const el = document.getElementById(`p-${saved}`);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        // Offset for the reader header
        window.scrollBy(0, -80);
      }
    });
  }, [chapterKey]);

  // Save position on scroll (debounced)
  useEffect(() => {
    function handleScroll() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Find the paragraph closest to the top of the viewport
        const paragraphs = document.querySelectorAll("[data-paragraph]");
        let closest: Element | null = null;
        let closestDist = Infinity;
        for (const p of paragraphs) {
          const rect = p.getBoundingClientRect();
          const dist = Math.abs(rect.top - 100); // 100px from top
          if (dist < closestDist) {
            closestDist = dist;
            closest = p;
          }
        }
        if (closest) {
          const idx = parseInt(
            closest.getAttribute("data-paragraph") || "0",
            10,
          );
          saveProgress(chapterKey, idx);
        }
      }, SAVE_DEBOUNCE_MS);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [chapterKey]);

  return null;
}
