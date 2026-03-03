/**
 * "What's New in Books" detection — M3a-8.
 *
 * Client-side utilities for tracking which books a seeker has seen.
 * Uses localStorage only — no tracking, no analytics (PRI-08, PRI-09).
 *
 * Two layers:
 * 1. Catalog version (nav dot): BOOK_CATALOG_VERSION vs stored version.
 *    Fast, no DB query — drives the gold dot in the Header.
 * 2. Book IDs (badges): stored IDs vs current IDs on the Books page.
 *    Granular — drives "New" badges per book.
 */

import { BOOK_CATALOG_VERSION } from "./config";

const VERSION_KEY = "srf-books-version";
const IDS_KEY = "srf-books-seen-ids";

// ── Catalog Version (for nav indicator) ─────────────────────────

/**
 * Returns true if the book catalog has changed since the seeker's
 * last visit to the Books page. Used by the nav indicator.
 */
export function hasUnseenBooks(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored === null) return false; // First visit — don't show dot
    return parseInt(stored, 10) < BOOK_CATALOG_VERSION;
  } catch {
    return false;
  }
}

// ── Book IDs (for per-book badges) ──────────────────────────────

/**
 * Returns the set of book IDs that the seeker hasn't seen.
 * Empty set if localStorage is unavailable or this is first visit.
 */
export function getNewBookIds(currentIds: string[]): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(IDS_KEY);
    if (stored === null) return new Set(); // First visit — nothing is "new"
    const seenIds = new Set<string>(JSON.parse(stored));
    return new Set(currentIds.filter((id) => !seenIds.has(id)));
  } catch {
    return new Set();
  }
}

/**
 * Mark the current catalog as seen. Called when the seeker visits
 * the Books page. Updates both version and IDs.
 */
export function markBooksSeen(currentIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VERSION_KEY, String(BOOK_CATALOG_VERSION));
    localStorage.setItem(IDS_KEY, JSON.stringify(currentIds));
  } catch {
    // localStorage unavailable — skip silently
  }
}

/**
 * Clear all new-books tracking data.
 * Used by the "Your Data" settings section.
 */
export function clearNewBooks(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(VERSION_KEY);
    localStorage.removeItem(IDS_KEY);
  } catch {
    // localStorage unavailable — skip silently
  }
}

/**
 * Initialize the books tracker for first-time visitors.
 * Called on first page load (any page) to set baseline.
 * Does nothing if already initialized.
 */
export function initBooksTracker(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(VERSION_KEY) === null) {
      localStorage.setItem(VERSION_KEY, String(BOOK_CATALOG_VERSION));
    }
  } catch {
    // localStorage unavailable
  }
}
