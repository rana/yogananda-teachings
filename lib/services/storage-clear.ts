/**
 * Storage clearing — tiered data removal for the "Your Data" settings.
 *
 * Coordinates clearing across individual service modules.
 * Framework-agnostic (PRI-10), DELTA-compliant (PRI-09).
 * Each tier groups data by seeker mental model, not by storage key.
 */

import { clearRecentSearches } from "@/lib/search-history";
import { clearLastRead } from "@/lib/reading-journey";
import { clearVisitedChapters } from "@/lib/visited-chapters";
import { clearReadingProgress } from "@/app/components/ReadingProgress";
import { clearBookmarks } from "@/lib/services/bookmarks";
import { resetPreferences } from "@/lib/services/preferences";
import { clearNewBooks } from "@/lib/new-books";

/** Clear recent search queries. */
export function clearSearchData(): void {
  clearRecentSearches();
}

/** Clear reading journey, visited chapters, and scroll positions. */
export function clearReadingData(): void {
  clearLastRead();
  clearVisitedChapters();
  clearReadingProgress();
}

/** Clear saved bookmarks. */
export function clearBookmarkData(): void {
  clearBookmarks();
}

/** Reset preferences to defaults. */
export function clearPreferenceData(): void {
  resetPreferences();
}

/** Clear everything — all tiers plus UI state keys. */
export function clearAllData(): void {
  clearSearchData();
  clearReadingData();
  clearBookmarkData();
  clearPreferenceData();
  clearNewBooks();
  // Clear UI state keys that don't have dedicated modules
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("srf-lowbw-dismissed");
  } catch {
    // silent
  }
}
