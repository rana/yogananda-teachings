/**
 * Resonance service unit tests — M3a-7 (FTR-031).
 *
 * Tests the in-memory rate limiter and database operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkResonanceRateLimit,
  incrementResonance,
  getResonance,
  getTopResonating,
} from "../resonance";

// ── Rate limiter tests ──────────────────────────────────────────

describe("checkResonanceRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first increment", () => {
    const allowed = checkResonanceRateLimit("10.0.0.1", "chunk-a", "share");
    expect(allowed).toBe(true);
  });

  it("blocks second increment within rate window", () => {
    checkResonanceRateLimit("10.0.0.2", "chunk-b", "dwell");
    const allowed = checkResonanceRateLimit("10.0.0.2", "chunk-b", "dwell");
    expect(allowed).toBe(false);
  });

  it("allows different types for same IP and chunk", () => {
    checkResonanceRateLimit("10.0.0.3", "chunk-c", "share");
    const allowed = checkResonanceRateLimit("10.0.0.3", "chunk-c", "dwell");
    expect(allowed).toBe(true);
  });

  it("allows different chunks for same IP and type", () => {
    checkResonanceRateLimit("10.0.0.4", "chunk-d", "share");
    const allowed = checkResonanceRateLimit("10.0.0.4", "chunk-e", "share");
    expect(allowed).toBe(true);
  });

  it("allows different IPs for same chunk and type", () => {
    checkResonanceRateLimit("10.0.0.5", "chunk-f", "share");
    const allowed = checkResonanceRateLimit("10.0.0.6", "chunk-f", "share");
    expect(allowed).toBe(true);
  });

  it("resets after the 1-hour window", () => {
    checkResonanceRateLimit("10.0.0.7", "chunk-g", "traverse");
    expect(checkResonanceRateLimit("10.0.0.7", "chunk-g", "traverse")).toBe(false);

    // Advance past 1-hour window
    vi.advanceTimersByTime(61 * 60 * 1000);

    expect(checkResonanceRateLimit("10.0.0.7", "chunk-g", "traverse")).toBe(true);
  });

  it("handles skip type", () => {
    const allowed = checkResonanceRateLimit("10.0.0.8", "chunk-h", "skip");
    expect(allowed).toBe(true);
  });
});

// ── Database operation tests ────────────────────────────────────

describe("incrementResonance", () => {
  it("executes upsert query with correct column for share", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    await incrementResonance(mockPool, "chunk-1", "share");

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("share_count"),
      ["chunk-1"],
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT"),
      expect.any(Array),
    );
  });

  it("executes upsert query with correct column for dwell", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    await incrementResonance(mockPool, "chunk-2", "dwell");

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("dwell_count"),
      ["chunk-2"],
    );
  });

  it("executes upsert query with correct column for traverse", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    await incrementResonance(mockPool, "chunk-3", "traverse");

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("traversal_count"),
      ["chunk-3"],
    );
  });

  it("executes upsert query with correct column for skip", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    await incrementResonance(mockPool, "chunk-4", "skip");

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("skip_count"),
      ["chunk-4"],
    );
  });
});

describe("getResonance", () => {
  it("returns counts for a passage", async () => {
    const mockQuery = vi.fn().mockResolvedValue({
      rows: [
        {
          chunk_id: "chunk-1",
          share_count: 5,
          dwell_count: 12,
          traversal_count: 3,
          skip_count: 1,
          total_resonance: 20,
        },
      ],
    });
    const mockPool = { query: mockQuery } as never;

    const result = await getResonance(mockPool, "chunk-1");
    expect(result).toEqual({
      chunkId: "chunk-1",
      shareCount: 5,
      dwellCount: 12,
      traversalCount: 3,
      skipCount: 1,
      totalResonance: 20,
    });
  });

  it("returns null for unknown passage", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    const result = await getResonance(mockPool, "chunk-unknown");
    expect(result).toBeNull();
  });
});

describe("getTopResonating", () => {
  it("returns top passages ordered by total resonance", async () => {
    const mockQuery = vi.fn().mockResolvedValue({
      rows: [
        {
          chunk_id: "chunk-top",
          share_count: 10,
          dwell_count: 20,
          traversal_count: 5,
          skip_count: 2,
          total_resonance: 35,
          content: "The season of failure...",
          book_title: "Autobiography of a Yogi",
          chapter_title: "Years in My Master's Hermitage",
          chapter_number: 12,
          page_number: 117,
          language: "en",
        },
      ],
    });
    const mockPool = { query: mockQuery } as never;

    const result = await getTopResonating(mockPool, 10);
    expect(result).toHaveLength(1);
    expect(result[0].chunkId).toBe("chunk-top");
    expect(result[0].totalResonance).toBe(35);
    expect(result[0].bookTitle).toBe("Autobiography of a Yogi");
  });

  it("passes limit parameter to query", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    await getTopResonating(mockPool, 25);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.any(String),
      [25],
    );
  });

  it("defaults to 20 results", async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as never;

    await getTopResonating(mockPool);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.any(String),
      [20],
    );
  });
});
