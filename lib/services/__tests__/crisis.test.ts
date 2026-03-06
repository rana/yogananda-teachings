/**
 * Crisis detection unit tests — M2a-21 (FTR-051).
 *
 * Tests keyword-based crisis detection. Intentionally sensitive —
 * false positives acceptable, false negatives are not.
 */

import { describe, it, expect } from "vitest";
import { detectCrisis } from "../crisis";

describe("detectCrisis", () => {
  it("detects suicide-related queries", () => {
    const result = detectCrisis("I want to end my life", "en");
    expect(result.detected).toBe(true);
    expect(result.helpline).toBeDefined();
    expect(result.helpline?.name).toContain("988");
  });

  it("detects despair queries", () => {
    const result = detectCrisis("I want to kill myself", "en");
    expect(result.detected).toBe(true);
  });

  it("does not flag normal spiritual queries", () => {
    const result = detectCrisis("How do I find inner peace?", "en");
    expect(result.detected).toBe(false);
    expect(result.helpline).toBeUndefined();
  });

  it("does not flag meditation queries", () => {
    const result = detectCrisis("What is the best way to meditate?", "en");
    expect(result.detected).toBe(false);
  });

  it("is case-insensitive", () => {
    const result = detectCrisis("I WANT TO END MY LIFE", "en");
    expect(result.detected).toBe(true);
  });

  it("works for Spanish queries", () => {
    const result = detectCrisis("quiero suicidarme", "es");
    expect(result.detected).toBe(true);
    expect(result.helpline).toBeDefined();
  });

  it("falls back to English helpline for unknown languages", () => {
    const result = detectCrisis("I want to end my life", "de");
    expect(result.detected).toBe(true);
    expect(result.helpline?.name).toContain("988");
  });

  it("returns detected: false for empty query", () => {
    const result = detectCrisis("", "en");
    expect(result.detected).toBe(false);
  });

  it("returns detected: false for whitespace-only query", () => {
    const result = detectCrisis("   ", "en");
    expect(result.detected).toBe(false);
  });
});
