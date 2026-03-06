/**
 * Rate limiter unit tests — M2a-21 (FTR-097).
 *
 * Tests the in-memory sliding window rate limiter.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit } from "../rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Use fake timers to control the rate window
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request", () => {
    const result = checkRateLimit("192.168.1.1", "Mozilla/5.0");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(14); // 15 - 1
    expect(result.limit).toBe(15);
  });

  it("enforces 15 req/min limit for regular users", () => {
    for (let i = 0; i < 15; i++) {
      checkRateLimit("10.0.0.1", "Mozilla/5.0");
    }
    const result = checkRateLimit("10.0.0.1", "Mozilla/5.0");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows 120 req/min for known bots", () => {
    const botUA = "Googlebot/2.1 (+http://www.google.com/bot.html)";
    for (let i = 0; i < 120; i++) {
      const result = checkRateLimit("10.0.0.2", botUA);
      expect(result.allowed).toBe(true);
    }
    const result = checkRateLimit("10.0.0.2", botUA);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(120);
  });

  it("recognizes GPTBot as a crawler", () => {
    const result = checkRateLimit("10.0.0.3", "GPTBot/1.0");
    expect(result.limit).toBe(120);
  });

  it("recognizes ClaudeBot as a crawler", () => {
    const result = checkRateLimit("10.0.0.4", "ClaudeBot/1.0");
    expect(result.limit).toBe(120);
  });

  it("separates rate limits per IP", () => {
    for (let i = 0; i < 15; i++) {
      checkRateLimit("10.0.0.5", "Mozilla/5.0");
    }
    // IP 5 is exhausted
    expect(checkRateLimit("10.0.0.5", "Mozilla/5.0").allowed).toBe(false);
    // IP 6 still has capacity
    expect(checkRateLimit("10.0.0.6", "Mozilla/5.0").allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    for (let i = 0; i < 15; i++) {
      checkRateLimit("10.0.0.7", "Mozilla/5.0");
    }
    expect(checkRateLimit("10.0.0.7", "Mozilla/5.0").allowed).toBe(false);

    // Advance time past the 60-second window
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit("10.0.0.7", "Mozilla/5.0").allowed).toBe(true);
  });

  it("defaults to user tier for empty user agent", () => {
    const result = checkRateLimit("10.0.0.8");
    expect(result.limit).toBe(15);
  });
});
