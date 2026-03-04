"use client";

/**
 * ReadingTracker — silent reading journey recorder.
 *
 * Client island that records the seeker's visit on mount:
 *   1. Updates the reading journey (last-read position)
 *   2. Marks the chapter as visited (progress tracking)
 *
 * No DOM output. Pure behavior. The portal remembers
 * without the reader having to do anything.
 *
 * DELTA-compliant: all data stays on-device (PRI-09).
 * Calm technology: remembers without tracking (PRI-08).
 */

import { useEffect } from "react";
import { setLastRead } from "@/lib/reading-journey";
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
  useEffect(() => {
    setLastRead({ bookSlug, bookTitle, bookAuthor, chapterNumber, chapterTitle });
    markChapterVisited(bookSlug, chapterNumber);
  }, [bookSlug, bookTitle, bookAuthor, chapterNumber, chapterTitle]);

  return null;
}
