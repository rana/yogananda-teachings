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
import { SrfLotus } from "@/app/components/SrfLotus";

interface BookGroup {
  bookId: string;
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
      <div className="flex flex-col items-center py-16 text-center">
        <SrfLotus className="h-12 w-12 text-srf-gold/30" />
        <p className="mt-4 font-display text-lg text-srf-navy/60">
          {t("empty")}
        </p>
        <p className="mt-2 max-w-sm text-sm text-srf-navy/40">
          {t("emptyHint")}
        </p>
      </div>
    );
  }

  const groups = groupByBook(bookmarks);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.bookId}>
          <h2 className="mb-3 font-display text-lg text-srf-navy">
            <Link
              href={`/books/${group.bookId}`}
              className="hover:text-srf-gold transition-colors"
            >
              {group.bookTitle}
            </Link>
          </h2>

          <ul className="space-y-2">
            {group.bookmarks.map((bm) => (
              <li
                key={bm.id}
                className="group flex items-start gap-3 rounded-lg border border-srf-navy/5 bg-white px-4 py-3 transition-colors hover:border-srf-gold/20"
              >
                {/* Lotus indicator */}
                <SrfLotus className="mt-0.5 h-4 w-4 shrink-0 text-srf-gold" />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {bm.type === "chapter" ? (
                    <Link
                      href={`/books/${bm.bookId}/${bm.chapterNumber}`}
                      className="block text-sm font-medium text-srf-navy hover:text-srf-gold transition-colors"
                    >
                      {t("chapter", { number: bm.chapterNumber })}
                      {": "}
                      {bm.chapterTitle}
                    </Link>
                  ) : (
                    <div>
                      <Link
                        href={`/passage/${bm.passageId}`}
                        className="block text-sm text-srf-navy/80 leading-relaxed hover:text-srf-navy transition-colors"
                      >
                        &ldquo;{bm.content}
                        {bm.content.length >= 200 ? "..." : ""}
                        &rdquo;
                      </Link>
                      <p className="mt-1 text-xs text-srf-navy/40">
                        {t("chapter", { number: bm.chapterNumber })}
                        {": "}
                        {bm.chapterTitle}
                      </p>
                    </div>
                  )}

                  <p className="mt-1 text-xs text-srf-navy/30">
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
                  className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-srf-navy/20 transition-colors hover:bg-srf-navy/5 hover:text-srf-navy/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-srf-gold"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
