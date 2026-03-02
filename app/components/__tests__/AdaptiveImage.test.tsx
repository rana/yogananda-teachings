// @vitest-environment jsdom

/**
 * AdaptiveImage component tests — M2b-16 (ADR-006, PRI-05).
 *
 * Verifies network-adaptive rendering: standard on fast connections,
 * lazy loading on moderate, halved dimensions + blur + lowResSrc on slow.
 */

import { render, act } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

// ── Import ───────────────────────────────────────────────────────

import { AdaptiveImage } from "../AdaptiveImage";

// ── Helpers ──────────────────────────────────────────────────────

function mockConnection(effectiveType: string | undefined) {
  Object.defineProperty(navigator, "connection", {
    value: effectiveType ? { effectiveType } : undefined,
    writable: true,
    configurable: true,
  });
}

function renderAndFlush(ui: React.ReactElement) {
  let result: ReturnType<typeof render>;
  act(() => {
    result = render(ui);
  });
  return result!;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("AdaptiveImage", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("renders standard img on fast connection", () => {
    mockConnection("4g");
    const { container } = renderAndFlush(
      <AdaptiveImage src="/photo.jpg" alt="Test" width={400} height={300} />,
    );
    const img = container.querySelector("img")!;

    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe("/photo.jpg");
    expect(img.getAttribute("width")).toBe("400");
    expect(img.getAttribute("height")).toBe("300");
    expect(img.getAttribute("loading")).toBeNull();
    expect(img.style.filter).toBe("");
  });

  it("renders with lazy loading on moderate (3g) connection", () => {
    mockConnection("3g");
    const { container } = renderAndFlush(
      <AdaptiveImage src="/photo.jpg" alt="Test" width={400} height={300} />,
    );
    const img = container.querySelector("img")!;

    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("width")).toBe("400");
    expect(img.getAttribute("height")).toBe("300");
    // No blur on moderate
    expect(img.style.filter).toBe("");
  });

  it("halves dimensions on slow (2g) connection", () => {
    mockConnection("2g");
    const { container } = renderAndFlush(
      <AdaptiveImage src="/photo.jpg" alt="Test" width={400} height={300} />,
    );
    const img = container.querySelector("img")!;

    expect(img.getAttribute("width")).toBe("200");
    expect(img.getAttribute("height")).toBe("150");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("uses lowResSrc on slow connection when provided", () => {
    mockConnection("2g");
    const { container } = renderAndFlush(
      <AdaptiveImage
        src="/photo-full.jpg"
        lowResSrc="/photo-thumb.jpg"
        alt="Test"
        width={400}
        height={300}
      />,
    );
    const img = container.querySelector("img")!;

    expect(img.getAttribute("src")).toBe("/photo-thumb.jpg");
  });

  it("applies blur filter on slow connection", () => {
    mockConnection("slow-2g");
    const { container } = renderAndFlush(
      <AdaptiveImage src="/photo.jpg" alt="Test" width={400} height={300} />,
    );
    const img = container.querySelector("img")!;

    expect(img.style.filter).toBe("blur(2px)");
  });

  it("defaults to fast when navigator.connection unavailable", () => {
    mockConnection(undefined);
    const { container } = renderAndFlush(
      <AdaptiveImage src="/photo.jpg" alt="Test" width={400} height={300} />,
    );
    const img = container.querySelector("img")!;

    expect(img.getAttribute("src")).toBe("/photo.jpg");
    expect(img.getAttribute("width")).toBe("400");
    expect(img.getAttribute("height")).toBe("300");
    expect(img.getAttribute("loading")).toBeNull();
    expect(img.style.filter).toBe("");
  });
});
