"use client";

/**
 * LibraryView — client component rendering the seeker's personal library.
 *
 * Shows books the seeker has engaged with, each as a card with:
 * - Chapter progress (visited count)
 * - Last-read position with "continue" link
 * - Bookmark count
 *
 * Empty state for first-time visitors: warm invitation to start reading.
 *
 * Architecture note: designed as "Books" section with extension points
 * for future media types (videos, audio, etc.) — see DES-021.
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLibrary, type LibraryBook } from "@/lib/personal-library";
import { Motif } from "@/app/components/design/Motif";

interface LibraryViewProps {
  locale: string;
}

export function LibraryView({ locale }: LibraryViewProps) {
  const t = useTranslations("library");
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBooks(getLibrary());
    setLoaded(true);
  }, []);

  // Don't render until localStorage has been read (avoids SSR flash)
  if (!loaded) return null;

  if (books.length === 0) {
    return (
      <div className="empty-state">
        <Motif role="breath" voice="sacred" />
        <p className="page-subtitle" style={{ marginBlockStart: "var(--space-default)" }}>
          {t("empty")}
        </p>
        <p style={{
          maxInlineSize: "24rem",
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
          opacity: 0.4,
          marginBlockStart: "var(--space-compact)",
        }}>
          {t("emptyHint")}
        </p>
        <Link href="/books" className="btn-primary" style={{ marginBlockStart: "var(--space-generous)" }}>
          {t("browseBooks")}
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      {books.map((book) => (
        <LibraryBookCard
          key={book.bookSlug}
          book={book}
          locale={locale}
        />
      ))}
    </div>
  );
}

// ── Book Card ────────────────────────────────────────────────────

interface LibraryBookCardProps {
  book: LibraryBook;
  locale: string;
}

function LibraryBookCard({ book, locale }: LibraryBookCardProps) {
  const t = useTranslations("library");
  const chaptersRead = book.visitedChapters.size;

  // Format relative time (e.g., "2 days ago")
  const lastActive = book.lastActiveAt
    ? formatRelativeTime(book.lastActiveAt, locale)
    : null;

  return (
    <div className="library-card">
      {/* Book header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ minInlineSize: 0 }}>
          <Link
            href={`/books/${book.bookSlug}`}
            style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem" }}
          >
            {book.bookTitle || book.bookSlug}
          </Link>
          {book.bookAuthor && (
            <p style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBlockStart: "0.125rem",
            }}>
              {book.bookAuthor}
            </p>
          )}
        </div>

        {/* Bookmark count badge */}
        {book.bookmarkCount > 0 && (
          <span className="badge-gold">
            {book.bookmarkCount}
          </span>
        )}
      </div>

      {/* Chapter progress — count only (no bar; total is server-side data) */}
      {chaptersRead > 0 && (
        <p style={{
          marginBlockStart: "var(--space-compact)",
          fontSize: "0.75rem",
          color: "var(--color-text-secondary)",
          opacity: 0.4,
          fontVariantNumeric: "tabular-nums",
        }}>
          {t("chaptersVisited", { count: chaptersRead })}
        </p>
      )}

      {/* Continue reading link */}
      {book.lastChapter && book.lastChapterTitle && (
        <Link
          href={`/books/${book.bookSlug}/${book.lastChapter}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBlockStart: "var(--space-compact)",
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
          }}
        >
          <span style={{ color: "var(--color-gold)", opacity: 0.5 }} aria-hidden="true">
            &rsaquo;
          </span>
          <span>
            {t("continueChapter", {
              number: book.lastChapter,
              title: book.lastChapterTitle,
            })}
          </span>
        </Link>
      )}

      {/* Last active timestamp */}
      {lastActive && (
        <p style={{
          marginBlockStart: "0.5rem",
          fontSize: "0.75rem",
          color: "var(--color-text-secondary)",
          opacity: 0.25,
        }}>
          {lastActive}
        </p>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Format a timestamp as a calm, relative phrase.
 * "Today", "Yesterday", "3 days ago", "2 weeks ago", etc.
 * No exact times — calm technology doesn't clock-watch.
 */
function formatRelativeTime(timestamp: number, locale: string): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Use Intl.RelativeTimeFormat for localized output
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (diffDays === 0) return rtf.format(0, "day"); // "today"
    if (diffDays === 1) return rtf.format(-1, "day"); // "yesterday"
    if (diffDays < 7) return rtf.format(-diffDays, "day");
    if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
    if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), "month");
    return rtf.format(-Math.floor(diffDays / 365), "year");
  } catch {
    return "";
  }
}
