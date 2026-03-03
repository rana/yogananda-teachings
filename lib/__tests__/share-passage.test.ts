/**
 * Tests for share-passage.ts — format and share Yogananda's words.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatShareText,
  buildShareUrl,
  sharePassage,
  type ShareablePassage,
} from "../share-passage";

const passage: ShareablePassage = {
  content: "The season of failure is the best time for sowing the seeds of success.",
  author: "Paramahansa Yogananda",
  bookTitle: "Autobiography of a Yogi",
  bookSlug: "autobiography-of-a-yogi",
  chapterNumber: 12,
  chapterTitle: "Years in My Master's Hermitage",
  chunkId: "chunk-42",
  pageNumber: 117,
};

describe("formatShareText", () => {
  it("formats passage with full attribution", () => {
    const text = formatShareText(passage);
    expect(text).toContain('"The season of failure');
    expect(text).toContain("Paramahansa Yogananda");
    expect(text).toContain("Autobiography of a Yogi");
    expect(text).toContain("Ch. 12");
    expect(text).toContain("p. 117");
  });

  it("omits page number when not provided", () => {
    const text = formatShareText({ ...passage, pageNumber: undefined });
    expect(text).not.toContain("p.");
    expect(text).toContain("Ch. 12");
  });

  it("wraps content in quotes", () => {
    const text = formatShareText(passage);
    expect(text.startsWith('"')).toBe(true);
  });
});

describe("buildShareUrl", () => {
  it("builds URL with passage hash for arrival", () => {
    const url = buildShareUrl(passage, "en");
    expect(url).toContain("/en/books/autobiography-of-a-yogi/12#passage-chunk-42");
  });

  it("respects locale", () => {
    const url = buildShareUrl(passage, "es");
    expect(url).toContain("/es/books/");
  });
});

describe("sharePassage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses Web Share API when available", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    const result = await sharePassage(passage, "en");
    expect(result.method).toBe("native");
    expect(result.success).toBe(true);
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Paramahansa Yogananda"),
        url: expect.stringContaining("#passage-chunk-42"),
      }),
    );

    // Clean up
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("falls back to clipboard when Web Share unavailable", async () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });

    const result = await sharePassage(passage, "en");
    expect(result.method).toBe("clipboard");
    expect(result.success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining("Paramahansa Yogananda"),
    );
  });

  it("handles user cancellation gracefully", async () => {
    const abortError = Object.assign(new Error("User cancelled"), {
      name: "AbortError",
    });
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockRejectedValue(abortError),
      writable: true,
      configurable: true,
    });

    const result = await sharePassage(passage, "en");
    expect(result.method).toBe("native");
    expect(result.success).toBe(false);

    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });
});
