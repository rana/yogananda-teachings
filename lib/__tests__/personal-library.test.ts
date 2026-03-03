/**
 * Tests for personal-library.ts — aggregated reading journey view.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getLibrary, hasLibraryEntries } from "../personal-library";

// Mock reading-journey
const mockGetLastRead = vi.fn();
vi.mock("../reading-journey", () => ({
  getLastRead: () => mockGetLastRead(),
}));

// Mock visited-chapters
const mockGetVisitedChapters = vi.fn();
vi.mock("../visited-chapters", () => ({
  getVisitedChapters: (slug: string) => mockGetVisitedChapters(slug),
}));

// Mock bookmarks
const mockGetBookmarks = vi.fn();
vi.mock("../services/bookmarks", () => ({
  getBookmarks: () => mockGetBookmarks(),
}));

describe("getLibrary", () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetLastRead.mockReset();
    mockGetVisitedChapters.mockReset();
    mockGetBookmarks.mockReset();
    mockGetBookmarks.mockReturnValue([]);
    mockGetLastRead.mockReturnValue(null);
    mockGetVisitedChapters.mockReturnValue(new Set());
  });

  it("returns empty array when no data exists", () => {
    expect(getLibrary()).toEqual([]);
  });

  it("returns books from visited chapters", () => {
    localStorage.setItem(
      "srf-visited-chapters",
      JSON.stringify({ "autobiography-en": [1, 14, 26] }),
    );
    mockGetVisitedChapters.mockImplementation((slug: string) => {
      if (slug === "autobiography-en") return new Set([1, 14, 26]);
      return new Set();
    });

    const library = getLibrary();
    expect(library).toHaveLength(1);
    expect(library[0].bookSlug).toBe("autobiography-en");
    expect(library[0].visitedChapters.size).toBe(3);
  });

  it("enriches book from reading journey", () => {
    localStorage.setItem(
      "srf-visited-chapters",
      JSON.stringify({ "autobiography-en": [1, 14] }),
    );
    mockGetVisitedChapters.mockImplementation((slug: string) => {
      if (slug === "autobiography-en") return new Set([1, 14]);
      return new Set();
    });
    mockGetLastRead.mockReturnValue({
      bookSlug: "autobiography-en",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 14,
      chapterTitle: "An Experience in Cosmic Consciousness",
      timestamp: 1709500000000,
    });

    const library = getLibrary();
    expect(library[0].bookTitle).toBe("Autobiography of a Yogi");
    expect(library[0].bookAuthor).toBe("Paramahansa Yogananda");
    expect(library[0].lastChapter).toBe(14);
    expect(library[0].lastChapterTitle).toBe(
      "An Experience in Cosmic Consciousness",
    );
    expect(library[0].lastActiveAt).toBe(1709500000000);
  });

  it("includes books from bookmarks even without visited chapters", () => {
    mockGetBookmarks.mockReturnValue([
      {
        type: "passage" as const,
        id: "p1",
        passageId: "abc",
        content: "test",
        bookId: "book-123",
        bookSlug: "autobiografia-es",
        bookTitle: "Autobiografía de un yogui",
        chapterNumber: 1,
        chapterTitle: "My Parents",
        pageNumber: null,
        createdAt: "2026-03-01T00:00:00Z",
      },
    ]);

    const library = getLibrary();
    expect(library).toHaveLength(1);
    expect(library[0].bookSlug).toBe("autobiografia-es");
    expect(library[0].bookmarkCount).toBe(1);
  });

  it("merges data from all three sources", () => {
    localStorage.setItem(
      "srf-visited-chapters",
      JSON.stringify({ "autobiography-en": [1, 14] }),
    );
    mockGetVisitedChapters.mockImplementation((slug: string) => {
      if (slug === "autobiography-en") return new Set([1, 14]);
      return new Set();
    });
    mockGetLastRead.mockReturnValue({
      bookSlug: "autobiography-en",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 14,
      chapterTitle: "Cosmic Consciousness",
      timestamp: 1709500000000,
    });
    mockGetBookmarks.mockReturnValue([
      {
        type: "chapter" as const,
        id: "c1",
        bookId: "book-1",
        bookSlug: "autobiography-en",
        bookTitle: "Autobiography of a Yogi",
        bookAuthor: "Paramahansa Yogananda",
        chapterNumber: 14,
        chapterTitle: "Cosmic Consciousness",
        createdAt: "2026-03-02T00:00:00Z",
      },
    ]);

    const library = getLibrary();
    expect(library).toHaveLength(1);
    expect(library[0].visitedChapters.size).toBe(2);
    expect(library[0].bookmarkCount).toBe(1);
    expect(library[0].lastChapter).toBe(14);
  });

  it("sorts by most recently active first", () => {
    localStorage.setItem(
      "srf-visited-chapters",
      JSON.stringify({
        "autobiography-en": [1],
        "autobiografia-es": [1, 2, 3],
      }),
    );
    mockGetVisitedChapters.mockImplementation((slug: string) => {
      if (slug === "autobiography-en") return new Set([1]);
      if (slug === "autobiografia-es") return new Set([1, 2, 3]);
      return new Set();
    });
    // English book was read more recently (March 2, 2026)
    mockGetLastRead.mockReturnValue({
      bookSlug: "autobiography-en",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 1,
      chapterTitle: "My Parents",
      timestamp: new Date("2026-03-02T12:00:00Z").getTime(),
    });
    // Spanish book has a bookmark from earlier (March 1, 2026)
    mockGetBookmarks.mockReturnValue([
      {
        type: "passage" as const,
        id: "p1",
        passageId: "xyz",
        content: "test",
        bookId: "book-2",
        bookSlug: "autobiografia-es",
        bookTitle: "Autobiografía de un yogui",
        chapterNumber: 1,
        chapterTitle: "Mis padres",
        pageNumber: null,
        createdAt: "2026-03-01T00:00:00Z",
      },
    ]);

    const library = getLibrary();
    expect(library).toHaveLength(2);
    expect(library[0].bookSlug).toBe("autobiography-en"); // more recent
    expect(library[1].bookSlug).toBe("autobiografia-es");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("srf-visited-chapters", "{{invalid");
    expect(getLibrary()).toEqual([]);
  });

  it("tracks multiple books independently", () => {
    localStorage.setItem(
      "srf-visited-chapters",
      JSON.stringify({
        "autobiography-en": [1, 14, 26],
        "autobiografia-es": [1],
      }),
    );
    mockGetVisitedChapters.mockImplementation((slug: string) => {
      if (slug === "autobiography-en") return new Set([1, 14, 26]);
      if (slug === "autobiografia-es") return new Set([1]);
      return new Set();
    });

    const library = getLibrary();
    expect(library).toHaveLength(2);
  });
});

describe("hasLibraryEntries", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false when no data exists", () => {
    expect(hasLibraryEntries()).toBe(false);
  });

  it("returns true when visited chapters exist", () => {
    localStorage.setItem(
      "srf-visited-chapters",
      JSON.stringify({ "auto": [1] }),
    );
    expect(hasLibraryEntries()).toBe(true);
  });

  it("returns true when bookmarks exist", () => {
    localStorage.setItem(
      "srf-bookmarks",
      JSON.stringify([{ id: "test" }]),
    );
    expect(hasLibraryEntries()).toBe(true);
  });

  it("returns false for empty visited chapters", () => {
    localStorage.setItem("srf-visited-chapters", "{}");
    expect(hasLibraryEntries()).toBe(false);
  });

  it("handles corrupted data gracefully", () => {
    localStorage.setItem("srf-visited-chapters", "not json");
    expect(hasLibraryEntries()).toBe(false);
  });
});
