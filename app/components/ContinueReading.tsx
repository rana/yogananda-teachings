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
import { Link } from "@/i18n/navigation";
import { getLastRead, type ReadingJourneyEntry } from "@/lib/reading-journey";

export function ContinueReading() {
  const [entry, setEntry] = useState<ReadingJourneyEntry | null>(null);

  useEffect(() => {
    setEntry(getLastRead());
  }, []);

  if (!entry) return null;

  // Link to exact scroll position if available, otherwise chapter start
  const fragment = entry.lastPassageId ? `#passage-${entry.lastPassageId}` : "";

  return (
    <Link
      href={`/books/${entry.bookSlug}/${entry.chapterNumber}${fragment}`}
      className="continue-reading"
    >
      <span className="continue-reading-label">Continue reading</span>
      <span className="continue-reading-chapter">
        {entry.bookTitle} &mdash; Chapter {entry.chapterNumber}: {entry.chapterTitle}
      </span>
    </Link>
  );
}
