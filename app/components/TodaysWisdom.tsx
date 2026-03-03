"use client";

/**
 * Today's Wisdom — hero passage display with "Show me another" (M2a-1).
 *
 * Server-renders the initial passage, then client-side fetches for refreshes.
 * No page reload on "Show me another" — fetches a new random passage.
 */

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { sendResonance } from "@/lib/resonance-beacon";
import type { DailyPassage } from "@/lib/services/passages";

interface Props {
  passage: DailyPassage | null;
}

export function TodaysWisdom({ passage: initial }: Props) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [passage, setPassage] = useState(initial);
  const [loading, setLoading] = useState(false);

  const fetchAnother = useCallback(async () => {
    // M3a-7: record skip resonance for the passage being dismissed
    if (passage?.id) sendResonance(passage.id, "skip");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/passages/random");
      if (res.ok) {
        const json = await res.json();
        setPassage({
          id: json.data.id,
          slug: json.data.slug ?? json.data.id,
          content: json.data.content,
          bookId: json.data.citation.bookId,
          bookSlug: json.data.citation.bookSlug ?? json.data.citation.bookId,
          bookTitle: json.data.citation.book,
          bookAuthor: json.data.citation.author,
          chapterTitle: json.data.citation.chapter,
          chapterNumber: json.data.citation.chapterNumber,
          pageNumber: json.data.citation.page,
          language: json.data.language,
        });
      }
    } catch {
      // Silently fail — keep current passage
    } finally {
      setLoading(false);
    }
  }, [passage?.id]);

  if (!passage) {
    return (
      <div className="py-16 text-center text-srf-navy/40">
        <p className="text-lg italic">No passages available yet.</p>
      </div>
    );
  }

  return (
    <section aria-label={t("todaysWisdom")}>
      <div className="py-8 md:py-12">
        {/* Passage */}
        <blockquote className="text-lg leading-relaxed text-srf-navy md:text-xl md:leading-relaxed">
          &ldquo;{passage.content.trim()}&rdquo;
        </blockquote>

        {/* Attribution (PRI-02) */}
        <footer className="mt-4 text-sm text-srf-navy/60">
          <cite className="not-italic">
            — {passage.bookAuthor},{" "}
            <NextLink
              href={`/${locale}/books/${passage.bookSlug}`}
              className="underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-navy"
            >
              <em>{passage.bookTitle}</em>
            </NextLink>
            {passage.pageNumber && `, p. ${passage.pageNumber}`}
          </cite>
        </footer>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={fetchAnother}
            disabled={loading}
            className="min-h-11 min-w-11 rounded px-3 py-1.5 text-sm text-srf-navy/50 transition-colors hover:text-srf-navy disabled:opacity-50"
            aria-label={t("showAnother")}
          >
            {loading ? "..." : t("showAnother")}
          </button>
          <NextLink
            href={`/${locale}/books/${passage.bookSlug}/${passage.chapterNumber}#passage-${passage.id}`}
            className="min-h-11 inline-flex items-center rounded px-3 py-1.5 text-sm text-srf-gold/70 transition-colors hover:text-srf-gold"
          >
            {t("readInContext")}
          </NextLink>
        </div>
      </div>
    </section>
  );
}
