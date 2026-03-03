/**
 * Personal Library — aggregates reading journey data into a unified view.
 *
 * Combines three localStorage sources into one coherent picture:
 * - Reading journey (last-read position per book)
 * - Visited chapters (progress per book)
 * - Bookmarks (saved passages and chapters)
 *
 * The library grows silently as the seeker reads — no explicit
 * "add to library" action. Visiting a chapter is the act of adding.
 *
 * No time tracking. No streaks. No minutes spent.
 * Just a quiet map of where you've been and a door back in.
 *
 * DELTA-compliant: all data stays on-device (PRI-09).
 * Calm technology: remembers without tracking (PRI-08).
 */

import { getLastRead, type ReadingJourneyEntry } from "./reading-journey";
import { getVisitedChapters } from "./visited-chapters";
import { getBookmarks, type Bookmark } from "./services/bookmarks";

export interface LibraryBook {
  /** Book slug — used for routing */
  bookSlug: string;
  /** Human-readable title */
  bookTitle: string;
  /** Author name */
  bookAuthor: string;
  /** Chapters the seeker has visited */
  visitedChapters: Set<number>;
  /** Total bookmarks for this book */
  bookmarkCount: number;
  /** Last chapter the seeker was reading in this book */
  lastChapter: number | null;
  /** Last chapter title */
  lastChapterTitle: string | null;
  /** Timestamp of most recent reading activity */
  lastActiveAt: number;
}

/**
 * Build the seeker's personal library from localStorage data.
 *
 * Returns books the seeker has engaged with, sorted by most
 * recently active first. A book appears if the seeker has:
 * - Visited at least one chapter, OR
 * - Bookmarked a passage from it
 *
 * Each book includes progress data (visited chapters) and
 * the last-read position for a "continue" link.
 */
export function getLibrary(): LibraryBook[] {
  if (typeof window === "undefined") return [];

  try {
    const library = new Map<string, LibraryBook>();
    const lastRead = getLastRead();
    const bookmarks = getBookmarks();
    const visitedSlugs = getVisitedBookSlugs();

    // Seed from visited chapters — the primary source
    for (const slug of visitedSlugs) {
      const visited = getVisitedChapters(slug);
      if (visited.size > 0) {
        library.set(slug, {
          bookSlug: slug,
          bookTitle: "",
          bookAuthor: "",
          visitedChapters: visited,
          bookmarkCount: 0,
          lastChapter: null,
          lastChapterTitle: null,
          lastActiveAt: 0,
        });
      }
    }

    // Enrich from reading journey — provides title, author, last position
    if (lastRead) {
      const existing = library.get(lastRead.bookSlug);
      if (existing) {
        existing.bookTitle = lastRead.bookTitle;
        existing.bookAuthor = lastRead.bookAuthor;
        existing.lastChapter = lastRead.chapterNumber;
        existing.lastChapterTitle = lastRead.chapterTitle;
        existing.lastActiveAt = lastRead.timestamp || 0;
      } else {
        // Book has a reading journey entry but no visited chapters somehow
        library.set(lastRead.bookSlug, {
          bookSlug: lastRead.bookSlug,
          bookTitle: lastRead.bookTitle,
          bookAuthor: lastRead.bookAuthor,
          visitedChapters: new Set(),
          bookmarkCount: 0,
          lastChapter: lastRead.chapterNumber,
          lastChapterTitle: lastRead.chapterTitle,
          lastActiveAt: lastRead.timestamp || 0,
        });
      }
    }

    // Enrich from bookmarks — provides title for books without reading journey
    for (const bm of bookmarks) {
      const slug = bm.bookSlug ?? bm.bookId;
      const bmTimestamp = new Date(bm.createdAt).getTime() || 0;
      const existing = library.get(slug);
      if (existing) {
        existing.bookmarkCount++;
        if (!existing.bookTitle) existing.bookTitle = bm.bookTitle;
        if ("bookAuthor" in bm && bm.bookAuthor && !existing.bookAuthor) {
          existing.bookAuthor = bm.bookAuthor;
        }
        if (bmTimestamp > existing.lastActiveAt) {
          existing.lastActiveAt = bmTimestamp;
        }
      } else {
        library.set(slug, {
          bookSlug: slug,
          bookTitle: bm.bookTitle,
          bookAuthor: "bookAuthor" in bm ? (bm.bookAuthor ?? "") : "",
          visitedChapters: new Set(),
          bookmarkCount: 1,
          lastChapter: null,
          lastChapterTitle: null,
          lastActiveAt: bmTimestamp,
        });
      }
    }

    // Sort by most recently active first
    return Array.from(library.values())
      .filter((b) => b.visitedChapters.size > 0 || b.bookmarkCount > 0)
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  } catch {
    return [];
  }
}

/**
 * Get all book slugs that have visited chapters.
 * Reads the raw localStorage data to extract keys.
 */
function getVisitedBookSlugs(): string[] {
  try {
    const raw = localStorage.getItem("srf-visited-chapters");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return [];
    }
    return Object.keys(parsed);
  } catch {
    return [];
  }
}

/**
 * Check if the seeker has any library entries.
 * Lightweight check without building the full library.
 */
export function hasLibraryEntries(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Quick check: any visited chapters?
    const visited = localStorage.getItem("srf-visited-chapters");
    if (visited) {
      const parsed = JSON.parse(visited);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        if (Object.keys(parsed).length > 0) return true;
      }
    }
    // Fallback: any bookmarks?
    const bookmarks = localStorage.getItem("srf-bookmarks");
    if (bookmarks) {
      const parsed = JSON.parse(bookmarks);
      if (Array.isArray(parsed) && parsed.length > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}
