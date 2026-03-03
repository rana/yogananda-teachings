/**
 * Tests for visited-chapters.ts — chapter reading progress tracking.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  markChapterVisited,
  getVisitedChapters,
  getVisitedCount,
} from "../visited-chapters";

describe("visited-chapters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty set when no chapters visited", () => {
    expect(getVisitedChapters("auto")).toEqual(new Set());
    expect(getVisitedCount("auto")).toBe(0);
  });

  it("marks and retrieves a visited chapter", () => {
    markChapterVisited("auto", 14);
    const visited = getVisitedChapters("auto");
    expect(visited.has(14)).toBe(true);
    expect(visited.size).toBe(1);
  });

  it("tracks multiple chapters per book", () => {
    markChapterVisited("auto", 1);
    markChapterVisited("auto", 14);
    markChapterVisited("auto", 26);
    const visited = getVisitedChapters("auto");
    expect(visited.size).toBe(3);
    expect(visited.has(1)).toBe(true);
    expect(visited.has(14)).toBe(true);
    expect(visited.has(26)).toBe(true);
  });

  it("is idempotent — visiting same chapter twice is a no-op", () => {
    markChapterVisited("auto", 14);
    markChapterVisited("auto", 14);
    expect(getVisitedCount("auto")).toBe(1);
  });

  it("tracks chapters independently per book", () => {
    markChapterVisited("autobiography-en", 1);
    markChapterVisited("autobiography-en", 2);
    markChapterVisited("autobiografia-es", 1);

    expect(getVisitedCount("autobiography-en")).toBe(2);
    expect(getVisitedCount("autobiografia-es")).toBe(1);
  });

  it("stores chapters in sorted order", () => {
    markChapterVisited("auto", 26);
    markChapterVisited("auto", 1);
    markChapterVisited("auto", 14);

    const stored = JSON.parse(
      localStorage.getItem("srf-visited-chapters") || "{}",
    );
    expect(stored["auto"]).toEqual([1, 14, 26]);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("srf-visited-chapters", "{{invalid");
    expect(getVisitedChapters("auto")).toEqual(new Set());
  });

  it("handles non-object localStorage gracefully", () => {
    localStorage.setItem("srf-visited-chapters", '"just a string"');
    expect(getVisitedChapters("auto")).toEqual(new Set());
  });

  it("handles array localStorage gracefully", () => {
    localStorage.setItem("srf-visited-chapters", "[1,2,3]");
    expect(getVisitedChapters("auto")).toEqual(new Set());
  });

  it("getVisitedCount returns correct count", () => {
    markChapterVisited("auto", 1);
    markChapterVisited("auto", 14);
    markChapterVisited("auto", 26);
    expect(getVisitedCount("auto")).toBe(3);
  });
});
