// @vitest-environment jsdom

/**
 * ThemeProvider tests — color theme system.
 *
 * Verifies data-theme attribute application on <html>,
 * preference loading, subscription, and cleanup.
 */

import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

// jsdom doesn't implement matchMedia — stub it
const mockMediaAddListener = vi.fn();
const mockMediaRemoveListener = vi.fn();
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: mockMediaAddListener,
    removeEventListener: mockMediaRemoveListener,
  }),
});

const mockGetPreference = vi.fn();
const mockSubscribe = vi.fn();

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (...args: unknown[]) => mockGetPreference(...args),
  subscribe: (...args: unknown[]) => mockSubscribe(...args),
}));

// ── Import after mocks ───────────────────────────────────────────

import { ThemeProvider } from "../ThemeProvider";

// ── Tests ─────────────────────────────────────────────────────────

describe("ThemeProvider", () => {
  let unsubscribeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribeFn = vi.fn();
    mockGetPreference.mockReset();
    mockSubscribe.mockReset();
    mockGetPreference.mockReturnValue("auto");
    mockSubscribe.mockReturnValue(unsubscribeFn);
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders nothing visible", () => {
    const { container } = render(<ThemeProvider />);
    expect(container.innerHTML).toBe("");
  });

  it("applies data-theme='auto' on mount when preference is auto", () => {
    mockGetPreference.mockReturnValue("auto");
    render(<ThemeProvider />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("auto");
  });

  it("applies data-theme='dark' when preference is dark", () => {
    mockGetPreference.mockReturnValue("dark");
    render(<ThemeProvider />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("applies data-theme='sepia' when preference is sepia", () => {
    mockGetPreference.mockReturnValue("sepia");
    render(<ThemeProvider />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("sepia");
  });

  it("applies data-theme='light' when preference is light", () => {
    mockGetPreference.mockReturnValue("light");
    render(<ThemeProvider />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("subscribes to preference changes", () => {
    render(<ThemeProvider />);
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(typeof mockSubscribe.mock.calls[0][0]).toBe("function");
  });

  it("updates data-theme when preference changes via subscription", () => {
    mockGetPreference.mockReturnValue("light");
    render(<ThemeProvider />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // Simulate preference change
    const callback = mockSubscribe.mock.calls[0][0];
    act(() => {
      callback({ "color-theme": "dark" });
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("cleans up data-theme and unsubscribes on unmount", () => {
    mockGetPreference.mockReturnValue("dark");
    const { unmount } = render(<ThemeProvider />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    unmount();

    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(unsubscribeFn).toHaveBeenCalledTimes(1);
  });
});
