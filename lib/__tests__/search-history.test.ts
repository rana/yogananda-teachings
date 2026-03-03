/**
 * Tests for search-history.ts — recent search tracking.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
} from "../search-history";

describe("search-history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when nothing has been searched", () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it("stores and retrieves a search query", () => {
    addRecentSearch("inner peace");
    expect(getRecentSearches()).toEqual(["inner peace"]);
  });

  it("stores multiple queries, most recent first", () => {
    addRecentSearch("meditation");
    addRecentSearch("divine love");
    addRecentSearch("the soul");
    expect(getRecentSearches()).toEqual([
      "the soul",
      "divine love",
      "meditation",
    ]);
  });

  it("deduplicates case-insensitively, keeping the latest", () => {
    addRecentSearch("meditation");
    addRecentSearch("divine love");
    addRecentSearch("Meditation");
    expect(getRecentSearches()).toEqual(["Meditation", "divine love"]);
  });

  it("caps at 5 recent searches", () => {
    addRecentSearch("a");
    addRecentSearch("bb");
    addRecentSearch("cc");
    addRecentSearch("dd");
    addRecentSearch("ee");
    addRecentSearch("ff");
    const recent = getRecentSearches();
    expect(recent).toHaveLength(5);
    expect(recent[0]).toBe("ff");
    // "a" was dropped (oldest, single-char won't be stored if trimmed is empty)
    // Actually "a" is valid, it just gets pushed out
    expect(recent).not.toContain("a");
  });

  it("ignores empty and whitespace-only queries", () => {
    addRecentSearch("");
    addRecentSearch("   ");
    expect(getRecentSearches()).toEqual([]);
  });

  it("trims whitespace from queries", () => {
    addRecentSearch("  inner peace  ");
    expect(getRecentSearches()).toEqual(["inner peace"]);
  });

  it("clearRecentSearches removes all history", () => {
    addRecentSearch("meditation");
    addRecentSearch("the soul");
    expect(getRecentSearches()).toHaveLength(2);
    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("srf-recent-searches", "{{invalid");
    expect(getRecentSearches()).toEqual([]);
  });

  it("handles non-array localStorage gracefully", () => {
    localStorage.setItem("srf-recent-searches", '"just a string"');
    expect(getRecentSearches()).toEqual([]);
  });

  it("filters out non-string entries", () => {
    localStorage.setItem(
      "srf-recent-searches",
      JSON.stringify(["valid", 42, null, "also valid"]),
    );
    expect(getRecentSearches()).toEqual(["valid", "also valid"]);
  });
});
