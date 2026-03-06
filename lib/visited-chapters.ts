/**
 * Visited Chapters — reading progress per book.
 *
 * Tracks which chapters a seeker has visited for each book.
 * Shown as subtle progress indicators on the book landing page,
 * transforming the flat chapter list into a living map of the
 * seeker's journey through the teachings.
 *
 * DELTA-compliant: localStorage only, no server tracking,
 * no behavioral profiling (PRI-08, PRI-09).
 */

const STORAGE_KEY = "srf-visited-chapters";

interface VisitedData {
  [bookSlug: string]: number[];
}

/**
 * Mark a chapter as visited for the given book.
 * Idempotent — visiting the same chapter twice is a no-op.
 */
export function markChapterVisited(
  bookSlug: string,
  chapterNumber: number,
): void {
  if (typeof window === "undefined") return;
  try {
    const data = readData();
    const chapters = data[bookSlug] || [];
    if (!chapters.includes(chapterNumber)) {
      chapters.push(chapterNumber);
      chapters.sort((a, b) => a - b);
      data[bookSlug] = chapters;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // localStorage unavailable — skip silently
  }
}

/**
 * Get the set of visited chapter numbers for a book.
 * Returns an empty set if no chapters visited or on error.
 */
export function getVisitedChapters(bookSlug: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const data = readData();
    return new Set(data[bookSlug] || []);
  } catch {
    return new Set();
  }
}

/**
 * Get the count of visited chapters for a book.
 */
export function getVisitedCount(bookSlug: string): number {
  return getVisitedChapters(bookSlug).size;
}

/**
 * Clear visited chapter data for a single book.
 */
export function clearBookVisited(bookSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    const data = readData();
    delete data[bookSlug];
    if (Object.keys(data).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // localStorage unavailable — skip silently
  }
}

/**
 * Clear all visited chapter data.
 * Used by the "Your Data" settings section.
 */
export function clearVisitedChapters(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable — skip silently
  }
}

/** Read and validate the stored data. */
function readData(): VisitedData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as VisitedData;
  } catch {
    return {};
  }
}
