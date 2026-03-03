/**
 * Search History — recent search queries for returning seekers.
 *
 * Stores the seeker's last few search queries in localStorage
 * for quick re-entry on return visits. DELTA-compliant: no server
 * tracking, no analytics, no behavioral profiling (PRI-09).
 *
 * Max 5 recent searches, deduplicated, most recent first.
 * Calm technology: shown as gentle chips, never pushy (PRI-08).
 */

const STORAGE_KEY = "srf-recent-searches";
const MAX_RECENT = 5;

/**
 * Add a search query to the recent history.
 * Deduplicates (case-insensitive) and keeps only the most recent MAX_RECENT.
 */
export function addRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const existing = getRecentSearches();
    // Remove duplicates (case-insensitive)
    const filtered = existing.filter(
      (q) => q.toLowerCase() !== trimmed.toLowerCase(),
    );
    // Prepend new query, cap at max
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — skip silently
  }
}

/**
 * Get the recent search queries, most recent first.
 * Returns empty array if none or on error.
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Validate: only strings, cap at max
    return parsed
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

/**
 * Clear all recent search history.
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}
