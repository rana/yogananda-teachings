"use client";

/**
 * ChapterBookmark — toggle bookmark for the current chapter.
 *
 * Fixed-position button near the reading modes pill. A single
 * tap saves; another removes. Gold fill when active.
 *
 * Touch target: 44×44px (WCAG 2.5.8).
 * Calm technology: no animation, no toast — just the fill state.
 * DELTA-compliant: localStorage via bookmarks service (PRI-09).
 */

import { useState, useEffect } from "react";
import {
  toggleChapterBookmark,
  isChapterBookmarked,
  chapterBookmarkId,
  subscribe,
} from "@/lib/services/bookmarks";

interface ChapterBookmarkProps {
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
}

export function ChapterBookmark({
  bookId,
  bookSlug,
  bookTitle,
  bookAuthor,
  chapterNumber,
  chapterTitle,
}: ChapterBookmarkProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isChapterBookmarked(bookId, chapterNumber));
    const unsubscribe = subscribe(() => {
      setSaved(isChapterBookmarked(bookId, chapterNumber));
    });
    return unsubscribe;
  }, [bookId, chapterNumber]);

  function handleToggle() {
    toggleChapterBookmark({
      bookId,
      bookSlug,
      bookTitle,
      bookAuthor,
      chapterNumber,
      chapterTitle,
    });
  }

  return (
    <button
      type="button"
      className="chapter-bookmark-btn"
      data-no-print
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark this chapter"}
      title={saved ? "Remove bookmark" : "Bookmark this chapter"}
      onClick={handleToggle}
    >
      {/* Bookmark ribbon icon — filled when saved */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
