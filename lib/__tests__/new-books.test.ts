/**
 * New Books detection tests — M3a-8.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock config before importing new-books
vi.mock("../config", () => ({
  BOOK_CATALOG_VERSION: 2,
}));

import {
  hasUnseenBooks,
  getNewBookIds,
  markBooksSeen,
  initBooksTracker,
} from "../new-books";

describe("new-books", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── hasUnseenBooks ──────────────────────────────────────────────

  describe("hasUnseenBooks", () => {
    it("returns false on first visit (no stored version)", () => {
      expect(hasUnseenBooks()).toBe(false);
    });

    it("returns true when stored version is lower than current", () => {
      storage["srf-books-version"] = "1"; // Config mock has version 2
      expect(hasUnseenBooks()).toBe(true);
    });

    it("returns false when stored version matches current", () => {
      storage["srf-books-version"] = "2";
      expect(hasUnseenBooks()).toBe(false);
    });

    it("returns false when stored version exceeds current", () => {
      storage["srf-books-version"] = "3";
      expect(hasUnseenBooks()).toBe(false);
    });
  });

  // ── getNewBookIds ──────────────────────────────────────────────

  describe("getNewBookIds", () => {
    it("returns empty set on first visit", () => {
      const result = getNewBookIds(["book-a", "book-b"]);
      expect(result.size).toBe(0);
    });

    it("returns new book IDs not in stored set", () => {
      storage["srf-books-seen-ids"] = JSON.stringify(["book-a"]);
      const result = getNewBookIds(["book-a", "book-b", "book-c"]);
      expect(result).toEqual(new Set(["book-b", "book-c"]));
    });

    it("returns empty set when all books are seen", () => {
      storage["srf-books-seen-ids"] = JSON.stringify(["book-a", "book-b"]);
      const result = getNewBookIds(["book-a", "book-b"]);
      expect(result.size).toBe(0);
    });

    it("handles corrupt stored JSON gracefully", () => {
      storage["srf-books-seen-ids"] = "not-json";
      const result = getNewBookIds(["book-a"]);
      expect(result.size).toBe(0);
    });
  });

  // ── markBooksSeen ─────────────────────────────────────────────

  describe("markBooksSeen", () => {
    it("stores version and book IDs", () => {
      markBooksSeen(["book-a", "book-b"]);
      expect(storage["srf-books-version"]).toBe("2");
      expect(JSON.parse(storage["srf-books-seen-ids"])).toEqual([
        "book-a",
        "book-b",
      ]);
    });

    it("after markBooksSeen, hasUnseenBooks returns false", () => {
      markBooksSeen(["book-a"]);
      expect(hasUnseenBooks()).toBe(false);
    });

    it("after markBooksSeen, getNewBookIds returns empty for same books", () => {
      markBooksSeen(["book-a", "book-b"]);
      const result = getNewBookIds(["book-a", "book-b"]);
      expect(result.size).toBe(0);
    });
  });

  // ── initBooksTracker ──────────────────────────────────────────

  describe("initBooksTracker", () => {
    it("sets version on first call", () => {
      initBooksTracker();
      expect(storage["srf-books-version"]).toBe("2");
    });

    it("does not overwrite existing version", () => {
      storage["srf-books-version"] = "1";
      initBooksTracker();
      expect(storage["srf-books-version"]).toBe("1");
    });
  });
});
