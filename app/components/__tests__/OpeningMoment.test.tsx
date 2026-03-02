// @vitest-environment jsdom

/**
 * OpeningMoment tests — DES-007 portal threshold.
 *
 * Verifies: first visit shows threshold, repeat visits skip,
 * reduced motion skips, children rendered after fade.
 */

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

let mockReducedMotion = false;

beforeEach(() => {
  sessionStorage.clear();
  mockReducedMotion = false;
  vi.useFakeTimers({ shouldAdvanceTime: true });

  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduced-motion") ? mockReducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Import after mocks ───────────────────────────────────────────

import { OpeningMoment } from "../OpeningMoment";

// ── Tests ─────────────────────────────────────────────────────────

describe("OpeningMoment", () => {
  it("renders children", () => {
    render(
      <OpeningMoment>
        <div data-testid="content">Hello</div>
      </OpeningMoment>,
    );

    // After effect runs, content should be visible
    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("sets sessionStorage flag on first visit", () => {
    render(
      <OpeningMoment>
        <div>Content</div>
      </OpeningMoment>,
    );

    expect(sessionStorage.getItem("srf-threshold-shown")).toBe("1");
  });

  it("skips threshold on repeat visit (sessionStorage set)", () => {
    sessionStorage.setItem("srf-threshold-shown", "1");

    const { container } = render(
      <OpeningMoment>
        <div data-testid="content">Content</div>
      </OpeningMoment>,
    );

    // Should render children immediately without overlay
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByTestId("content")).toBeInTheDocument();
    // No fixed overlay should be present
    const overlay = container.querySelector("[aria-hidden='true']");
    expect(overlay).toBeNull();
  });

  it("skips threshold when prefers-reduced-motion is set", () => {
    mockReducedMotion = true;

    render(
      <OpeningMoment>
        <div data-testid="content">Content</div>
      </OpeningMoment>,
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Content should be immediately visible
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("shows lotus overlay on first visit", () => {
    const { container } = render(
      <OpeningMoment>
        <div data-testid="content">Content</div>
      </OpeningMoment>,
    );

    // After initial render but before timeout
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Overlay with lotus should be present
    const overlay = container.querySelector("[aria-hidden='true']");
    expect(overlay).toBeInTheDocument();
    // Lotus SVG should be inside
    const svg = overlay?.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("completes full fade cycle in ~1.2 seconds", () => {
    render(
      <OpeningMoment>
        <div data-testid="content">Content</div>
      </OpeningMoment>,
    );

    // At 800ms: should start fading
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // At 1200ms: should be done
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Content should be rendered without wrapper
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
