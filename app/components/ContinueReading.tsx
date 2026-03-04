"use client";

/**
 * ContinueReading — a warm door back in for returning seekers.
 *
 * Reads the reading journey from localStorage and shows a subtle
 * card with the last-read book, chapter, and a "Continue" link.
 * Appears only when the seeker has a reading history.
 *
 * No DOM when empty or on first load (avoids layout shift).
 * Calm technology: the portal remembers, never prods.
 */

import { useState, useEffect } from "react";
import { getLastRead, type ReadingJourneyEntry } from "@/lib/reading-journey";

interface ContinueReadingProps {
  locale: string;
}

export function ContinueReading({ locale }: ContinueReadingProps) {
  const [entry, setEntry] = useState<ReadingJourneyEntry | null>(null);

  useEffect(() => {
    setEntry(getLastRead());
  }, []);

  if (!entry) return null;

  return (
    <a
      href={`/${locale}/books/${entry.bookSlug}/${entry.chapterNumber}`}
      className="continue-reading"
    >
      <span className="continue-reading-label">Continue reading</span>
      <span className="continue-reading-chapter">
        {entry.bookTitle} &mdash; Chapter {entry.chapterNumber}: {entry.chapterTitle}
      </span>
    </a>
  );
}
