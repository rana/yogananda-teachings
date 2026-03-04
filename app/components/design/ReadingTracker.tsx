"use client";

/**
 * ReadingTracker — silent reading journey recorder.
 *
 * Client island that records the seeker's visit and scroll position:
 *   1. On mount: updates reading journey + marks chapter visited
 *   2. On scroll (debounced 2s): records the topmost visible paragraph
 *      so ContinueReading can link back to the exact position
 *
 * No DOM output. Pure behavior. The portal remembers
 * without the reader having to do anything.
 *
 * DELTA-compliant: all data stays on-device (PRI-09).
 * Calm technology: remembers without tracking (PRI-08).
 */

import { useEffect } from "react";
import { setLastRead, updateScrollPosition } from "@/lib/reading-journey";
import { markChapterVisited } from "@/lib/visited-chapters";

interface ReadingTrackerProps {
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
}

export function ReadingTracker({
  bookSlug,
  bookTitle,
  bookAuthor,
  chapterNumber,
  chapterTitle,
}: ReadingTrackerProps) {
  // Record visit on mount
  useEffect(() => {
    setLastRead({ bookSlug, bookTitle, bookAuthor, chapterNumber, chapterTitle });
    markChapterVisited(bookSlug, chapterNumber);
  }, [bookSlug, bookTitle, bookAuthor, chapterNumber, chapterTitle]);

  // Track scroll position — debounced to avoid localStorage thrashing
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function handleScroll() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const paragraphs = document.querySelectorAll<HTMLElement>("[data-paragraph]");
        if (paragraphs.length === 0) return;

        // Find the topmost paragraph whose top edge is above the viewport center
        const viewportMid = window.innerHeight * 0.35;
        let topmost: HTMLElement | null = null;

        for (const p of paragraphs) {
          const rect = p.getBoundingClientRect();
          if (rect.top <= viewportMid && rect.bottom > 0) {
            topmost = p;
          }
        }

        if (topmost?.id?.startsWith("passage-")) {
          const passageId = topmost.id.replace("passage-", "");
          updateScrollPosition(passageId);
        }
      }, 2000);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
