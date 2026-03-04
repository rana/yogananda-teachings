/**
 * BookmarksList — M2b-3 (ADR-066).
 *
 * Client component displaying all bookmarks grouped by book.
 * Uses the bookmarks service for localStorage read/write.
 * 44x44px touch targets (PRI-07).
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getBookmarks,
  removeBookmark,
  subscribe,
  type Bookmark,
} from "@/lib/services/bookmarks";
import { Motif } from "@/app/components/design/Motif";

interface BookGroup {
  bookId: string;
  /** Slug for human-readable URLs (falls back to bookId for legacy bookmarks) */
  bookUrlId: string;
  bookTitle: string;
  bookmarks: Bookmark[];
}

/** Group bookmarks by book, preserving newest-first order within each group. */
function groupByBook(bookmarks: readonly Bookmark[]): BookGroup[] {
  const map = new Map<string, BookGroup>();

  for (const bm of bookmarks) {
    const existing = map.get(bm.bookId);
    if (existing) {
      existing.bookmarks.push(bm);
    } else {
      map.set(bm.bookId, {
        bookId: bm.bookId,
        bookUrlId: bm.bookSlug ?? bm.bookId,
        bookTitle: bm.bookTitle,
        bookmarks: [bm],
      });
    }
  }

  return Array.from(map.values());
}

export function BookmarksList() {
  const t = useTranslations("bookmarks");
  const [bookmarks, setBookmarks] = useState<readonly Bookmark[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
    const unsubscribe = subscribe((updated) => {
      setBookmarks(updated);
    });
    return unsubscribe;
  }, []);

  if (bookmarks.length === 0) {
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
      </div>
    );
  }

  const groups = groupByBook(bookmarks);

  return (
    <div className="stack-generous">
      {groups.map((group) => (
        <section key={group.bookId}>
          <h2 className="section-heading">
            <Link href={`/books/${group.bookUrlId}`}>
              {group.bookTitle}
            </Link>
          </h2>

          <div className="stack-tight" style={{ marginBlockStart: "var(--space-compact)" }}>
            {group.bookmarks.map((bm) => (
              <div key={bm.id} className="bookmark-item">
                {/* Content */}
                <div style={{ minInlineSize: 0, flex: 1 }}>
                  {bm.type === "chapter" ? (
                    <Link
                      href={`/books/${bm.bookSlug ?? bm.bookId}/${bm.chapterNumber}`}
                      style={{ fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      {t("chapter", { number: bm.chapterNumber })}
                      {": "}
                      {bm.chapterTitle}
                    </Link>
                  ) : (
                    <div>
                      <Link
                        href={`/passage/${bm.passageSlug ?? bm.passageId}`}
                        style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
                      >
                        &ldquo;{bm.content}
                        {bm.content.length >= 200 ? "..." : ""}
                        &rdquo;
                      </Link>
                      <p style={{
                        marginBlockStart: "0.25rem",
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary)",
                        opacity: 0.4,
                      }}>
                        {t("chapter", { number: bm.chapterNumber })}
                        {": "}
                        {bm.chapterTitle}
                      </p>
                    </div>
                  )}

                  <p style={{
                    marginBlockStart: "0.25rem",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    opacity: 0.3,
                  }}>
                    {t("savedOn", {
                      date: new Date(bm.createdAt).toLocaleDateString(),
                    })}
                  </p>
                </div>

                {/* Remove button — 44x44 touch target (PRI-07) */}
                <button
                  type="button"
                  onClick={() => removeBookmark(bm.id)}
                  aria-label={t("removeBookmark")}
                  className="btn-icon"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
