"use client";

/**
 * ShowAnother — passage refresh button.
 *
 * Client island that fetches a new random passage via the API.
 * Server-renders the initial passage; this component adds the
 * "Show me another" affordance without page reload.
 *
 * Calm technology: single quiet button, no loading spinner,
 * graceful failure (keeps current passage).
 */

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { DailyPassage } from "@/lib/services/passages";

interface Props {
  initial: DailyPassage;
}

export function ShowAnother({ initial }: Props) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [passage, setPassage] = useState(initial);
  const [loading, setLoading] = useState(false);

  const fetchAnother = useCallback(async () => {
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
  }, []);

  return (
    <section className="center" style={{ maxInlineSize: "36em" }}>
      <blockquote className="reader-epigraph">
        {passage.content}
      </blockquote>
      <p className="reader-citation" style={{ textAlign: "center" }}>
        {passage.bookAuthor},{" "}
        <a href={`/${locale}/books/${passage.bookSlug}/${passage.chapterNumber}#passage-${passage.id}`}>
          <cite>{passage.bookTitle}</cite>
          {passage.chapterTitle && `, ${passage.chapterTitle}`}
        </a>
      </p>
      <div style={{ textAlign: "center", marginBlockStart: "var(--space-default)" }}>
        <button
          type="button"
          onClick={fetchAnother}
          disabled={loading}
          className="btn-ghost"
          style={{ fontSize: "0.8125rem" }}
        >
          {t("showAnother")}
        </button>
      </div>
    </section>
  );
}
