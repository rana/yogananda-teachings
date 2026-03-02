/**
 * Bookmark service tests — M2b-3 (ADR-066).
 *
 * Tests the framework-agnostic bookmarks service (PRI-10).
 * Verifies localStorage interaction, add/remove/toggle,
 * passage bookmarks, subscription, and SSR safety.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBookmarks,
  addChapterBookmark,
  addPassageBookmark,
  removeBookmark,
  toggleChapterBookmark,
  isChapterBookmarked,
  isPassageBookmarked,
  clearBookmarks,
  subscribe,
  chapterBookmarkId,
  passageBookmarkId,
} from "@/lib/services/bookmarks";

// ── Setup ────────────────────────────────────────────────────────

const STORAGE_KEY = "srf-bookmarks";

const sampleChapter = {
  bookId: "book-001",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterNumber: 12,
  chapterTitle: "Years in My Master's Hermitage",
};

const sampleChapter2 = {
  bookId: "book-001",
  bookTitle: "Autobiography of a Yogi",
  bookAuthor: "Paramahansa Yogananda",
  chapterNumber: 14,
  chapterTitle: "An Experience in Cosmic Consciousness",
};

const samplePassage = {
  passageId: "passage-abc-123",
  content: "The season of failure is the best time for sowing the seeds of success.",
  bookId: "book-001",
  bookTitle: "Autobiography of a Yogi",
  chapterNumber: 12,
  chapterTitle: "Years in My Master's Hermitage",
  pageNumber: 143,
};

beforeEach(() => {
  localStorage.clear();
});

// ── ID helpers ───────────────────────────────────────────────────

describe("ID helpers", () => {
  it("generates chapter bookmark IDs", () => {
    expect(chapterBookmarkId("book-001", 12)).toBe("chapter:book-001:12");
  });

  it("generates passage bookmark IDs", () => {
    expect(passageBookmarkId("passage-abc")).toBe("passage:passage-abc");
  });
});

// ── Empty state ──────────────────────────────────────────────────

describe("empty state", () => {
  it("returns empty array when no bookmarks exist", () => {
    expect(getBookmarks()).toEqual([]);
  });

  it("isChapterBookmarked returns false for unbookmarked chapter", () => {
    expect(isChapterBookmarked("book-001", 12)).toBe(false);
  });

  it("isPassageBookmarked returns false for unbookmarked passage", () => {
    expect(isPassageBookmarked("passage-abc")).toBe(false);
  });
});

// ── Chapter bookmarks ────────────────────────────────────────────

describe("chapter bookmarks", () => {
  it("adds a chapter bookmark", () => {
    addChapterBookmark(sampleChapter);

    const bookmarks = getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0]).toMatchObject({
      type: "chapter",
      id: "chapter:book-001:12",
      bookId: "book-001",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 12,
      chapterTitle: "Years in My Master's Hermitage",
    });
    expect(bookmarks[0].createdAt).toBeDefined();
  });

  it("does not add duplicate chapter bookmarks", () => {
    addChapterBookmark(sampleChapter);
    addChapterBookmark(sampleChapter);

    expect(getBookmarks()).toHaveLength(1);
  });

  it("adds multiple different chapter bookmarks", () => {
    addChapterBookmark(sampleChapter);
    addChapterBookmark(sampleChapter2);

    expect(getBookmarks()).toHaveLength(2);
  });

  it("newest bookmark is first", () => {
    addChapterBookmark(sampleChapter);
    addChapterBookmark(sampleChapter2);

    const bookmarks = getBookmarks();
    expect(bookmarks[0].id).toBe("chapter:book-001:14");
    expect(bookmarks[1].id).toBe("chapter:book-001:12");
  });

  it("isChapterBookmarked returns true after adding", () => {
    addChapterBookmark(sampleChapter);
    expect(isChapterBookmarked("book-001", 12)).toBe(true);
  });

  it("isChapterBookmarked returns false for different chapter", () => {
    addChapterBookmark(sampleChapter);
    expect(isChapterBookmarked("book-001", 99)).toBe(false);
  });
});

// ── Passage bookmarks ────────────────────────────────────────────

describe("passage bookmarks", () => {
  it("adds a passage bookmark", () => {
    addPassageBookmark(samplePassage);

    const bookmarks = getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0]).toMatchObject({
      type: "passage",
      id: "passage:passage-abc-123",
      passageId: "passage-abc-123",
      content: samplePassage.content,
      bookId: "book-001",
      pageNumber: 143,
    });
  });

  it("does not add duplicate passage bookmarks", () => {
    addPassageBookmark(samplePassage);
    addPassageBookmark(samplePassage);

    expect(getBookmarks()).toHaveLength(1);
  });

  it("truncates content to 200 characters", () => {
    const longContent = "a".repeat(300);
    addPassageBookmark({ ...samplePassage, content: longContent });

    const bookmarks = getBookmarks();
    expect(bookmarks[0].type === "passage" && bookmarks[0].content.length).toBe(200);
  });

  it("handles null page number", () => {
    addPassageBookmark({ ...samplePassage, pageNumber: null });

    const bookmarks = getBookmarks();
    expect(bookmarks[0].type === "passage" && bookmarks[0].pageNumber).toBeNull();
  });

  it("isPassageBookmarked returns true after adding", () => {
    addPassageBookmark(samplePassage);
    expect(isPassageBookmarked("passage-abc-123")).toBe(true);
  });
});

// ── Remove bookmarks ─────────────────────────────────────────────

describe("removeBookmark", () => {
  it("removes a chapter bookmark by ID", () => {
    addChapterBookmark(sampleChapter);
    expect(getBookmarks()).toHaveLength(1);

    removeBookmark("chapter:book-001:12");
    expect(getBookmarks()).toHaveLength(0);
    expect(isChapterBookmarked("book-001", 12)).toBe(false);
  });

  it("removes a passage bookmark by ID", () => {
    addPassageBookmark(samplePassage);
    expect(getBookmarks()).toHaveLength(1);

    removeBookmark("passage:passage-abc-123");
    expect(getBookmarks()).toHaveLength(0);
  });

  it("is a no-op when bookmark does not exist", () => {
    addChapterBookmark(sampleChapter);
    removeBookmark("chapter:nonexistent:99");
    expect(getBookmarks()).toHaveLength(1);
  });

  it("only removes the targeted bookmark", () => {
    addChapterBookmark(sampleChapter);
    addChapterBookmark(sampleChapter2);
    addPassageBookmark(samplePassage);

    removeBookmark("chapter:book-001:12");
    expect(getBookmarks()).toHaveLength(2);
    expect(isChapterBookmarked("book-001", 14)).toBe(true);
    expect(isPassageBookmarked("passage-abc-123")).toBe(true);
  });
});

// ── Toggle ───────────────────────────────────────────────────────

describe("toggleChapterBookmark", () => {
  it("adds bookmark when not present, returns true", () => {
    const result = toggleChapterBookmark(sampleChapter);
    expect(result).toBe(true);
    expect(isChapterBookmarked("book-001", 12)).toBe(true);
  });

  it("removes bookmark when present, returns false", () => {
    addChapterBookmark(sampleChapter);
    const result = toggleChapterBookmark(sampleChapter);
    expect(result).toBe(false);
    expect(isChapterBookmarked("book-001", 12)).toBe(false);
  });

  it("toggles back and forth", () => {
    toggleChapterBookmark(sampleChapter);
    expect(isChapterBookmarked("book-001", 12)).toBe(true);

    toggleChapterBookmark(sampleChapter);
    expect(isChapterBookmarked("book-001", 12)).toBe(false);

    toggleChapterBookmark(sampleChapter);
    expect(isChapterBookmarked("book-001", 12)).toBe(true);
  });
});

// ── Clear ────────────────────────────────────────────────────────

describe("clearBookmarks", () => {
  it("removes all bookmarks", () => {
    addChapterBookmark(sampleChapter);
    addChapterBookmark(sampleChapter2);
    addPassageBookmark(samplePassage);

    clearBookmarks();
    expect(getBookmarks()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

// ── Subscription ─────────────────────────────────────────────────

describe("subscribe", () => {
  it("notifies listeners on addChapterBookmark", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    addChapterBookmark(sampleChapter);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "chapter:book-001:12" }),
      ]),
    );

    unsubscribe();
  });

  it("notifies listeners on addPassageBookmark", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    addPassageBookmark(samplePassage);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("notifies listeners on removeBookmark", () => {
    addChapterBookmark(sampleChapter);

    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    removeBookmark("chapter:book-001:12");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);

    unsubscribe();
  });

  it("notifies listeners on toggleChapterBookmark", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    toggleChapterBookmark(sampleChapter);
    expect(listener).toHaveBeenCalledTimes(1);

    toggleChapterBookmark(sampleChapter);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it("notifies listeners on clearBookmarks", () => {
    addChapterBookmark(sampleChapter);

    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    clearBookmarks();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);

    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    addChapterBookmark(sampleChapter);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    addChapterBookmark(sampleChapter2);
    expect(listener).toHaveBeenCalledTimes(1); // no additional call
  });

  it("does not notify on no-op remove", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    removeBookmark("chapter:nonexistent:1");
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });

  it("does not notify on duplicate add", () => {
    addChapterBookmark(sampleChapter);

    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    addChapterBookmark(sampleChapter); // duplicate — no-op
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });

  it("supports multiple concurrent subscribers", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const unsub1 = subscribe(listener1);
    const unsub2 = subscribe(listener2);

    addChapterBookmark(sampleChapter);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });
});

// ── localStorage corruption recovery ─────────────────────────────

describe("corruption recovery", () => {
  it("handles corrupt JSON gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
    const bookmarks = getBookmarks();
    expect(bookmarks).toEqual([]);
    // Corrupt data should be cleared
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("handles non-array JSON gracefully", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "an array" }));
    const bookmarks = getBookmarks();
    expect(bookmarks).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("drops invalid bookmark entries silently", () => {
    const data = [
      { type: "chapter", id: "chapter:book-001:1", bookId: "book-001", bookTitle: "Title", bookAuthor: "Author", chapterNumber: 1, chapterTitle: "Ch1", createdAt: "2026-01-01T00:00:00Z" },
      { type: "invalid" }, // invalid entry
      { type: "chapter" }, // missing fields
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const bookmarks = getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].id).toBe("chapter:book-001:1");
  });

  it("recovers and allows adding after corruption", () => {
    localStorage.setItem(STORAGE_KEY, "garbage");
    addChapterBookmark(sampleChapter);
    expect(getBookmarks()).toHaveLength(1);
  });
});

// ── Persistence ──────────────────────────────────────────────────

describe("persistence", () => {
  it("persists bookmarks to localStorage", () => {
    addChapterBookmark(sampleChapter);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe("chapter:book-001:12");
  });

  it("persists removal to localStorage", () => {
    addChapterBookmark(sampleChapter);
    removeBookmark("chapter:book-001:12");

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(0);
  });
});
