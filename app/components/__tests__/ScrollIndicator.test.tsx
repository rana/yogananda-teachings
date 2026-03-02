// @vitest-environment jsdom

/**
 * ScrollIndicator component tests — M2b-5.
 *
 * Verifies rendering attributes, initial width,
 * scroll-based width updates, and CSS class.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

// ── Import ───────────────────────────────────────────────────────

import { ScrollIndicator } from "../ScrollIndicator";

// ── Helpers ──────────────────────────────────────────────────────

function mockScrollEnvironment(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
) {
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: innerHeight,
    writable: true,
    configurable: true,
  });
}

// ── Tests ─────────────────────────────────────────────────────────

describe("ScrollIndicator", () => {
  beforeEach(() => {
    // Default: page taller than viewport, at top
    mockScrollEnvironment(0, 2000, 800);
  });

  afterEach(() => {
    // Reset scroll properties
    mockScrollEnvironment(0, 0, 0);
  });

  it("renders with correct role and aria attributes", () => {
    render(<ScrollIndicator />);
    const indicator = screen.getByRole("presentation", { hidden: true });
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });

  it("sets initial width to 0% on mount", () => {
    mockScrollEnvironment(0, 2000, 800);
    render(<ScrollIndicator />);
    const indicator = screen.getByRole("presentation", { hidden: true });
    expect(indicator.style.inlineSize).toBe("0%");
  });

  it("updates width on scroll event", () => {
    mockScrollEnvironment(0, 2000, 800);
    render(<ScrollIndicator />);
    const indicator = screen.getByRole("presentation", { hidden: true });

    // Scroll to 50%: scrollY = 600, docHeight = 2000 - 800 = 1200
    // pct = (600 / 1200) * 100 = 50
    Object.defineProperty(window, "scrollY", {
      value: 600,
      writable: true,
      configurable: true,
    });

    act(() => {
      fireEvent.scroll(window);
    });

    expect(indicator.style.inlineSize).toBe("50%");
  });

  it("has scroll-indicator class", () => {
    render(<ScrollIndicator />);
    const indicator = screen.getByRole("presentation", { hidden: true });
    expect(indicator.className).toContain("scroll-indicator");
  });
});
