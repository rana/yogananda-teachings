/**
 * Bookmark service — M2b-3 (ADR-066).
 *
 * localStorage-based bookmarks. Framework-agnostic (PRI-10).
 * DELTA-compliant: no server sync, no tracking (PRI-09).
 * SSR-safe — all reads/writes check for browser environment.
 *
 * Bookmark IDs:
 *   chapter:{bookId}:{chapterNumber}
 *   passage:{passageId}
 *
 * Storage: single JSON array under `srf-bookmarks` key.
 * Milestone 7a migration to server sync when accounts arrive.
 */

// ── Types ────────────────────────────────────────────────────────

export interface ChapterBookmark {
  type: "chapter";
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
  createdAt: string; // ISO date
}

export interface PassageBookmark {
  type: "passage";
  id: string;
  passageId: string;
  content: string; // first 200 chars for display
  bookId: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  pageNumber: number | null;
  createdAt: string; // ISO date
}

export type Bookmark = ChapterBookmark | PassageBookmark;

type Listener = (bookmarks: readonly Bookmark[]) => void;

// ── Constants ────────────────────────────────────────────────────

const STORAGE_KEY = "srf-bookmarks";

/** Maximum content length stored for passage bookmark display. */
const MAX_CONTENT_LENGTH = 200;

// ── SSR guard ────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── ID helpers ───────────────────────────────────────────────────

export function chapterBookmarkId(
  bookId: string,
  chapterNumber: number,
): string {
  return `chapter:${bookId}:${chapterNumber}`;
}

export function passageBookmarkId(passageId: string): string {
  return `passage:${passageId}`;
}

// ── Validation ───────────────────────────────────────────────────

function isValidBookmark(raw: unknown): raw is Bookmark {
  if (typeof raw !== "object" || raw === null) return false;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.id !== "string" || obj.id.length === 0) return false;
  if (typeof obj.createdAt !== "string") return false;

  if (obj.type === "chapter") {
    return (
      typeof obj.bookId === "string" &&
      typeof obj.bookTitle === "string" &&
      typeof obj.bookAuthor === "string" &&
      typeof obj.chapterNumber === "number" &&
      typeof obj.chapterTitle === "string"
    );
  }

  if (obj.type === "passage") {
    return (
      typeof obj.passageId === "string" &&
      typeof obj.content === "string" &&
      typeof obj.bookId === "string" &&
      typeof obj.bookTitle === "string" &&
      typeof obj.chapterNumber === "number" &&
      typeof obj.chapterTitle === "string" &&
      (obj.pageNumber === null || typeof obj.pageNumber === "number")
    );
  }

  return false;
}

/**
 * Parse and validate stored bookmarks.
 * Invalid entries are silently dropped — corruption recovery.
 */
function parseStored(): Bookmark[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      // Corrupt — clear and return empty
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.filter(isValidBookmark);
  } catch {
    // Corrupt JSON — clear and return empty
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function persist(bookmarks: Bookmark[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

// ── Subscription ─────────────────────────────────────────────────

const listeners: Set<Listener> = new Set();

function notify(bookmarks: readonly Bookmark[]): void {
  for (const listener of listeners) {
    listener(bookmarks);
  }
}

/**
 * Subscribe to bookmark changes. Returns an unsubscribe function.
 * Callback receives the full bookmark array on every change.
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ── Core service ─────────────────────────────────────────────────

/**
 * Get all bookmarks, newest first.
 * Returns empty array on the server or when no bookmarks exist.
 */
export function getBookmarks(): readonly Bookmark[] {
  return parseStored();
}

/**
 * Add a chapter bookmark.
 * No-op if already bookmarked. No-op on the server.
 */
export function addChapterBookmark(data: {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
}): void {
  if (!isBrowser()) return;

  const bookmarks = parseStored();
  const id = chapterBookmarkId(data.bookId, data.chapterNumber);

  // Already exists — no-op
  if (bookmarks.some((b) => b.id === id)) return;

  const bookmark: ChapterBookmark = {
    type: "chapter",
    id,
    bookId: data.bookId,
    bookTitle: data.bookTitle,
    bookAuthor: data.bookAuthor,
    chapterNumber: data.chapterNumber,
    chapterTitle: data.chapterTitle,
    createdAt: new Date().toISOString(),
  };

  const updated = [bookmark, ...bookmarks];
  persist(updated);
  notify(updated);
}

/**
 * Add a passage bookmark.
 * No-op if already bookmarked. No-op on the server.
 * Content is truncated to MAX_CONTENT_LENGTH characters.
 */
export function addPassageBookmark(data: {
  passageId: string;
  content: string;
  bookId: string;
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  pageNumber: number | null;
}): void {
  if (!isBrowser()) return;

  const bookmarks = parseStored();
  const id = passageBookmarkId(data.passageId);

  // Already exists — no-op
  if (bookmarks.some((b) => b.id === id)) return;

  const bookmark: PassageBookmark = {
    type: "passage",
    id,
    passageId: data.passageId,
    content: data.content.slice(0, MAX_CONTENT_LENGTH),
    bookId: data.bookId,
    bookTitle: data.bookTitle,
    chapterNumber: data.chapterNumber,
    chapterTitle: data.chapterTitle,
    pageNumber: data.pageNumber,
    createdAt: new Date().toISOString(),
  };

  const updated = [bookmark, ...bookmarks];
  persist(updated);
  notify(updated);
}

/**
 * Remove a bookmark by ID.
 * No-op if not found. No-op on the server.
 */
export function removeBookmark(id: string): void {
  if (!isBrowser()) return;

  const bookmarks = parseStored();
  const updated = bookmarks.filter((b) => b.id !== id);

  if (updated.length === bookmarks.length) return; // not found

  persist(updated);
  notify(updated);
}

/**
 * Toggle a chapter bookmark: add if missing, remove if present.
 * Returns `true` if the chapter is now bookmarked.
 */
export function toggleChapterBookmark(data: {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
}): boolean {
  const id = chapterBookmarkId(data.bookId, data.chapterNumber);
  if (isChapterBookmarked(data.bookId, data.chapterNumber)) {
    removeBookmark(id);
    return false;
  }
  addChapterBookmark(data);
  return true;
}

/**
 * Check if a chapter is bookmarked.
 * Returns false on the server.
 */
export function isChapterBookmarked(
  bookId: string,
  chapterNumber: number,
): boolean {
  const id = chapterBookmarkId(bookId, chapterNumber);
  return parseStored().some((b) => b.id === id);
}

/**
 * Check if a passage is bookmarked.
 * Returns false on the server.
 */
export function isPassageBookmarked(passageId: string): boolean {
  const id = passageBookmarkId(passageId);
  return parseStored().some((b) => b.id === id);
}

/**
 * Clear all bookmarks.
 * No-op on the server. Notifies all subscribers.
 */
export function clearBookmarks(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(STORAGE_KEY);
  notify([]);
}
