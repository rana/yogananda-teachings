// @vitest-environment jsdom

/**
 * CircadianProvider tests — DES-011 circadian color temperature.
 *
 * Verifies time band detection, data-time-band attribute,
 * theme interaction, and cleanup.
 */

import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockMediaAddListener = vi.fn();
const mockMediaRemoveListener = vi.fn();
let mockMediaMatches = false;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: mockMediaMatches,
    addEventListener: mockMediaAddListener,
    removeEventListener: mockMediaRemoveListener,
  })),
});

const mockGetPreference = vi.fn();
const mockSubscribe = vi.fn();

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (...args: unknown[]) => mockGetPreference(...args),
  subscribe: (...args: unknown[]) => mockSubscribe(...args),
}));

// ── Import after mocks ───────────────────────────────────────────

import { CircadianProvider } from "../CircadianProvider";

// ── Tests ─────────────────────────────────────────────────────────

describe("CircadianProvider", () => {
  let unsubscribeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribeFn = vi.fn();
    mockGetPreference.mockReset();
    mockSubscribe.mockReset();
    mockMediaAddListener.mockReset();
    mockMediaRemoveListener.mockReset();
    mockGetPreference.mockReturnValue("auto");
    mockSubscribe.mockReturnValue(unsubscribeFn);
    mockMediaMatches = false;
    document.documentElement.removeAttribute("data-time-band");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-time-band");
  });

  it("renders nothing visible", () => {
    const { container } = render(<CircadianProvider />);
    expect(container.innerHTML).toBe("");
  });

  it("sets data-time-band on <html> when theme is light", () => {
    mockGetPreference.mockReturnValue("light");
    render(<CircadianProvider />);
    const band = document.documentElement.getAttribute("data-time-band");
    expect(["morning", "midday", "evening", "night"]).toContain(band);
  });

  it("sets data-time-band when theme is auto and OS is light", () => {
    mockGetPreference.mockReturnValue("auto");
    mockMediaMatches = false;
    render(<CircadianProvider />);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);
  });

  it("does NOT set data-time-band when theme is dark", () => {
    mockGetPreference.mockReturnValue("dark");
    render(<CircadianProvider />);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("does NOT set data-time-band when theme is sepia", () => {
    mockGetPreference.mockReturnValue("sepia");
    render(<CircadianProvider />);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("does NOT set data-time-band when auto + OS dark mode", () => {
    mockGetPreference.mockReturnValue("auto");
    mockMediaMatches = true;
    render(<CircadianProvider />);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("subscribes to preference changes", () => {
    render(<CircadianProvider />);
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("updates when preference changes via subscription", () => {
    mockGetPreference.mockReturnValue("light");
    render(<CircadianProvider />);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);

    // Simulate switching to dark
    mockGetPreference.mockReturnValue("dark");
    const callback = mockSubscribe.mock.calls[0][0];
    act(() => {
      callback({ "color-theme": "dark" });
    });

    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("cleans up data-time-band and unsubscribes on unmount", () => {
    mockGetPreference.mockReturnValue("light");
    const { unmount } = render(<CircadianProvider />);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);

    unmount();

    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
    expect(unsubscribeFn).toHaveBeenCalledTimes(1);
  });

  it("listens for OS dark mode changes", () => {
    render(<CircadianProvider />);
    expect(mockMediaAddListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
