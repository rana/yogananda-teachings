"use client";

/**
 * Continue Reading — quiet homepage invitation for returning seekers.
 *
 * When a seeker has previously read a chapter, this component appears
 * above Today's Wisdom with a warm, understated link to continue
 * where they left off.
 *
 * Design principles:
 * - Warm recognition, not a demand ("Welcome back" is implied, not stated)
 * - Disappears naturally for first-time visitors (they see nothing)
 * - The gold thread accent connects to the portal's golden thread motif
 * - Calm: no animation, no urgency (PRI-08)
 * - DELTA-compliant: reads only from localStorage (PRI-09)
 */

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { getLastRead, type ReadingJourneyEntry } from "@/lib/reading-journey";

interface ContinueReadingProps {
  locale: string;
}

export function ContinueReading({ locale }: ContinueReadingProps) {
  const t = useTranslations("home");
  const [entry, setEntry] = useState<ReadingJourneyEntry | null>(null);

  useEffect(() => {
    setEntry(getLastRead());
  }, []);

  if (!entry) return null;

  return (
    <div className="mb-8">
      <NextLink
        href={`/${locale}/books/${entry.bookSlug}/${entry.chapterNumber}`}
        className="group block rounded-lg border border-srf-gold/15 bg-srf-gold/[0.03] px-4 py-3 transition-colors hover:border-srf-gold/30 hover:bg-srf-gold/[0.06]"
      >
        <p className="text-xs font-medium text-srf-gold/60 mb-1">
          {t("continueReading")}
        </p>
        <p className="text-sm text-srf-navy/70 group-hover:text-srf-navy transition-colors">
          <span className="text-srf-navy/40 me-1.5">
            Ch. {entry.chapterNumber}:
          </span>
          {entry.chapterTitle}
        </p>
        <p className="text-xs text-srf-navy/35 mt-0.5">
          {entry.bookTitle}
        </p>
      </NextLink>
    </div>
  );
}
