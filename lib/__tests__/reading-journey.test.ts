/**
 * Tests for reading-journey.ts — last-read position tracking.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setLastRead,
  getLastRead,
  clearLastRead,
} from "../reading-journey";

describe("reading-journey", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const entry = {
    bookSlug: "autobiography-of-a-yogi",
    bookTitle: "Autobiography of a Yogi",
    bookAuthor: "Paramahansa Yogananda",
    chapterNumber: 14,
    chapterTitle: "An Experience in Cosmic Consciousness",
  };

  it("returns null when nothing has been read", () => {
    expect(getLastRead()).toBeNull();
  });

  it("stores and retrieves a reading position", () => {
    setLastRead(entry);
    const result = getLastRead();
    expect(result).not.toBeNull();
    expect(result!.bookSlug).toBe("autobiography-of-a-yogi");
    expect(result!.chapterNumber).toBe(14);
    expect(result!.chapterTitle).toBe("An Experience in Cosmic Consciousness");
    expect(result!.timestamp).toBeGreaterThan(0);
  });

  it("overwrites previous entry", () => {
    setLastRead(entry);
    setLastRead({
      ...entry,
      chapterNumber: 26,
      chapterTitle: "The Science of Kriya Yoga",
    });
    const result = getLastRead();
    expect(result!.chapterNumber).toBe(26);
    expect(result!.chapterTitle).toBe("The Science of Kriya Yoga");
  });

  it("clearLastRead removes the entry", () => {
    setLastRead(entry);
    expect(getLastRead()).not.toBeNull();
    clearLastRead();
    expect(getLastRead()).toBeNull();
  });

  it("returns null for corrupted data", () => {
    localStorage.setItem("srf-reading-journey", "{{invalid");
    expect(getLastRead()).toBeNull();
  });

  it("returns null for incomplete data", () => {
    localStorage.setItem(
      "srf-reading-journey",
      JSON.stringify({ bookSlug: "test" }),
    );
    expect(getLastRead()).toBeNull();
  });

  it("handles localStorage errors gracefully", () => {
    const original = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error("quota");
    };
    expect(getLastRead()).toBeNull();
    localStorage.getItem = original;
  });
});
