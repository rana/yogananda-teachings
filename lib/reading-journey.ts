/**
 * Reading Journey — tracks where the seeker was last reading.
 *
 * A single localStorage entry with full metadata so the homepage
 * can greet returning seekers with "Continue where you left off."
 *
 * Separate from ReadingProgress (which tracks per-chapter scroll positions).
 * This tracks the *overall journey* — which chapter, which book, when.
 *
 * DELTA-compliant: all data stays on-device (PRI-09).
 * Calm technology: the portal remembers without tracking (PRI-08).
 */

const STORAGE_KEY = "srf-reading-journey";

export interface ReadingJourneyEntry {
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
  /** Timestamp in ms — when the seeker last read this chapter */
  timestamp: number;
  /** Passage UUID of the topmost visible paragraph — for scroll restoration */
  lastPassageId?: string;
}

/**
 * Record the seeker's current reading position.
 * Called when the chapter page loads.
 */
export function setLastRead(entry: Omit<ReadingJourneyEntry, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const full: ReadingJourneyEntry = {
      ...entry,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

/**
 * Update the scroll position within the current reading session.
 * Called on debounced scroll events — updates only the passage ID
 * and timestamp, preserving the rest of the entry.
 */
export function updateScrollPosition(passageId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const entry = JSON.parse(raw) as ReadingJourneyEntry;
    entry.lastPassageId = passageId;
    entry.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // silent
  }
}

/**
 * Get the seeker's last reading position.
 * Returns null if they haven't read anything yet.
 */
export function getLastRead(): ReadingJourneyEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as ReadingJourneyEntry;
    // Validate essential fields
    if (!entry.bookSlug || !entry.chapterNumber || !entry.chapterTitle) {
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

/**
 * Clear the reading journey (e.g., if the seeker wants a fresh start).
 */
export function clearLastRead(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}
