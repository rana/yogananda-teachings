// @vitest-environment jsdom

/**
 * Theme integration tests — verifies the full theme chain.
 *
 * Tests the cascade: @theme tokens → CSS variables → Tailwind classes.
 * Ensures data-theme attribute, circadian bands, and high-contrast
 * work together without breaking each other.
 */

import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

let mockMediaMatches = false;
const mockMediaAddListener = vi.fn();
const mockMediaRemoveListener = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: mockMediaMatches,
    addEventListener: mockMediaAddListener,
    removeEventListener: mockMediaRemoveListener,
  })),
});

const mockGetPreference = vi.fn();
const mockSetPreference = vi.fn();
const mockSubscribe = vi.fn();

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (...args: unknown[]) => mockGetPreference(...args),
  setPreference: (...args: unknown[]) => mockSetPreference(...args),
  subscribe: (...args: unknown[]) => mockSubscribe(...args),
}));

// ── Import after mocks ───────────────────────────────────────────

import { ThemeProvider } from "../ThemeProvider";
import { CircadianProvider } from "../CircadianProvider";

// ── Tests ─────────────────────────────────────────────────────────

describe("Theme Integration", () => {
  let unsubFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubFn = vi.fn();
    mockGetPreference.mockReset();
    mockSetPreference.mockReset();
    mockSubscribe.mockReset();
    mockSubscribe.mockReturnValue(unsubFn);
    mockMediaMatches = false;
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-time-band");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-time-band");
  });

  it("ThemeProvider and CircadianProvider coexist without conflict", () => {
    mockGetPreference.mockReturnValue("light");

    render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);
  });

  it("circadian is suppressed when dark theme is active", () => {
    mockGetPreference.mockReturnValue("dark");

    render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("circadian is suppressed when sepia theme is active", () => {
    mockGetPreference.mockReturnValue("sepia");

    render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("sepia");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("circadian is suppressed in auto mode when OS prefers dark", () => {
    mockGetPreference.mockReturnValue("auto");
    mockMediaMatches = true;

    render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("auto");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("circadian is active in auto mode when OS prefers light", () => {
    mockGetPreference.mockReturnValue("auto");
    mockMediaMatches = false;

    render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("auto");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);
  });

  it("switching from light to dark removes circadian band", () => {
    // Start with light
    mockGetPreference.mockReturnValue("light");

    render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);

    // Simulate theme change to dark
    mockGetPreference.mockReturnValue("dark");
    const themeCallback = mockSubscribe.mock.calls[0][0];
    const circadianCallback = mockSubscribe.mock.calls[1][0];

    act(() => {
      themeCallback({ "color-theme": "dark" });
      circadianCallback({ "color-theme": "dark" });
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });

  it("cleans up both attributes on unmount", () => {
    mockGetPreference.mockReturnValue("light");

    const { unmount } = render(
      <>
        <ThemeProvider />
        <CircadianProvider />
      </>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(true);

    unmount();

    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(document.documentElement.hasAttribute("data-time-band")).toBe(false);
  });
});
