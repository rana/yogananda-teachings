"use client";

/**
 * Chapter Progress — visited chapter indicators on the book landing page.
 *
 * Shows a subtle gold checkmark next to chapters the seeker has already
 * visited, plus a gentle progress summary. Transforms the flat chapter list
 * into a living map of the seeker's journey through the book.
 *
 * Renders nothing for first-time visitors — the clean chapter list
 * appears unchanged until they start reading.
 *
 * DELTA-compliant: reads localStorage only, no tracking (PRI-08, PRI-09).
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getVisitedChapters } from "@/lib/visited-chapters";

interface ChapterProgressProps {
  bookSlug: string;
  totalChapters: number;
}

/**
 * Progress summary — shown above the chapter list when
 * the seeker has visited at least one chapter.
 */
export function ChapterProgress({
  bookSlug,
  totalChapters,
}: ChapterProgressProps) {
  const t = useTranslations("books");
  const [visitedCount, setVisitedCount] = useState(0);

  useEffect(() => {
    const visited = getVisitedChapters(bookSlug);
    setVisitedCount(visited.size);
  }, [bookSlug]);

  if (visitedCount === 0) return null;

  const percentage = Math.round((visitedCount / totalChapters) * 100);

  return (
    <div className="mb-4 flex items-center gap-3">
      {/* Progress bar — thin, gold, understated */}
      <div className="flex-1 h-1 rounded-full bg-srf-navy/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-srf-gold/40 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-srf-navy/40 tabular-nums shrink-0">
        {t("chaptersRead", { read: visitedCount, total: totalChapters })}
      </span>
    </div>
  );
}

interface ChapterVisitedDotProps {
  bookSlug: string;
  chapterNumber: number;
}

/**
 * Visited dot — subtle gold indicator next to a chapter
 * the seeker has already read.
 */
export function ChapterVisitedDot({
  bookSlug,
  chapterNumber,
}: ChapterVisitedDotProps) {
  const [visited, setVisited] = useState(false);

  useEffect(() => {
    const visitedSet = getVisitedChapters(bookSlug);
    setVisited(visitedSet.has(chapterNumber));
  }, [bookSlug, chapterNumber]);

  if (!visited) return null;

  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-srf-gold/50 shrink-0"
      aria-hidden="true"
    />
  );
}
