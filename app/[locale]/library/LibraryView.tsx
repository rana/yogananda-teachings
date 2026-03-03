"use client";

/**
 * LibraryView — client component rendering the seeker's personal library.
 *
 * Shows books the seeker has engaged with, each as a card with:
 * - Chapter progress (visited / total shown as a gold bar)
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
import { SrfLotus } from "@/app/components/SrfLotus";

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
      <div className="flex flex-col items-center py-16 text-center">
        <SrfLotus className="h-12 w-12 text-srf-gold/30" />
        <p className="mt-4 font-display text-lg text-srf-navy/60">
          {t("empty")}
        </p>
        <p className="mt-2 max-w-sm text-sm text-srf-navy/40">
          {t("emptyHint")}
        </p>
        <Link
          href="/books"
          className="mt-6 rounded-lg bg-srf-navy px-5 py-2.5 text-sm font-sans font-semibold text-warm-cream transition-colors hover:bg-srf-navy/90 min-h-11 inline-flex items-center"
        >
          {t("browseBooks")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <LibraryBookCard
          key={book.bookSlug}
          book={book}
          locale={locale}
        />
      ))}

      {/* Future: Videos section, Audio section, etc. */}
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
    <div className="rounded-lg border border-srf-navy/10 bg-(--theme-surface) p-5 transition-colors hover:border-srf-gold/20">
      {/* Book header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/books/${book.bookSlug}`}
            className="font-display text-lg text-srf-navy hover:text-srf-gold transition-colors"
          >
            {book.bookTitle || book.bookSlug}
          </Link>
          {book.bookAuthor && (
            <p className="text-sm text-srf-navy/50 mt-0.5">{book.bookAuthor}</p>
          )}
        </div>

        {/* Bookmark count badge */}
        {book.bookmarkCount > 0 && (
          <span className="shrink-0 flex items-center gap-1 rounded-full bg-srf-gold/10 px-2 py-0.5 text-xs text-srf-gold/80">
            <SrfLotus className="h-3 w-3" />
            {book.bookmarkCount}
          </span>
        )}
      </div>

      {/* Chapter progress — count only (no bar; total is server-side data) */}
      {chaptersRead > 0 && (
        <p className="mt-3 text-xs text-srf-navy/40 tabular-nums">
          {t("chaptersVisited", { count: chaptersRead })}
        </p>
      )}

      {/* Continue reading link */}
      {book.lastChapter && book.lastChapterTitle && (
        <Link
          href={`/books/${book.bookSlug}/${book.lastChapter}`}
          className="mt-3 flex items-center gap-2 text-sm text-srf-navy/60 hover:text-srf-navy transition-colors group"
        >
          <span className="text-srf-gold/50 group-hover:text-srf-gold transition-colors" aria-hidden="true">
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
        <p className="mt-2 text-xs text-srf-navy/25">{lastActive}</p>
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
