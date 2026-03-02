/**
 * Tests for useAdaptiveDebounce hook — M2b-16.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdaptiveDebounce } from "../useAdaptiveDebounce";

// Mock navigator.connection
function mockConnection(effectiveType: string | undefined) {
  Object.defineProperty(navigator, "connection", {
    value: effectiveType ? { effectiveType } : undefined,
    writable: true,
    configurable: true,
  });
}

describe("useAdaptiveDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Reset navigator.connection
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("returns base delay on 4G/wifi", () => {
    mockConnection("4g");
    const { result } = renderHook(() => useAdaptiveDebounce("test", 300));

    // Initial value
    expect(result.current).toBe("test");
  });

  it("debounces with 3x delay on 2G", () => {
    mockConnection("2g");
    const { result, rerender } = renderHook(
      ({ value }) => useAdaptiveDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    // At 300ms (base), should NOT have updated yet (needs 900ms on 2G)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("a");

    // At 900ms, should update
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe("b");
  });

  it("debounces with 3x delay on slow-2g", () => {
    mockConnection("slow-2g");
    const { result, rerender } = renderHook(
      ({ value }) => useAdaptiveDebounce(value, 200),
      { initialProps: { value: "x" } },
    );

    rerender({ value: "y" });
    // Needs 600ms on slow-2g
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("x");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("y");
  });

  it("debounces with 1.5x delay on 3G", () => {
    mockConnection("3g");
    const { result, rerender } = renderHook(
      ({ value }) => useAdaptiveDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    // At 300ms, should NOT have updated yet (needs 450ms on 3G)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("a");

    // At 450ms, should update
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("b");
  });

  it("falls back to base delay when API unavailable", () => {
    mockConnection(undefined);
    const { result, rerender } = renderHook(
      ({ value }) => useAdaptiveDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("b");
  });

  it("cancels timer on rapid value changes", () => {
    mockConnection("4g");
    const { result, rerender } = renderHook(
      ({ value }) => useAdaptiveDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    // Rapid changes
    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "d" });

    // Only the last value should be set after full delay
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("d");
  });
});
