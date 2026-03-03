"use client";

/**
 * Reading Journey — invisible component that records reading position.
 *
 * Placed on the chapter page. On mount, writes the current book/chapter
 * metadata to localStorage so the homepage can greet returning seekers.
 *
 * No UI — pure side effect. Separate from ReadingProgress (scroll restoration).
 */

import { useEffect } from "react";
import { setLastRead } from "@/lib/reading-journey";
import { markChapterVisited } from "@/lib/visited-chapters";

interface ReadingJourneyProps {
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
}

export function ReadingJourney({
  bookSlug,
  bookTitle,
  bookAuthor,
  chapterNumber,
  chapterTitle,
}: ReadingJourneyProps) {
  useEffect(() => {
    setLastRead({
      bookSlug,
      bookTitle,
      bookAuthor,
      chapterNumber,
      chapterTitle,
    });
    markChapterVisited(bookSlug, chapterNumber);
  }, [bookSlug, bookTitle, bookAuthor, chapterNumber, chapterTitle]);

  return null;
}
