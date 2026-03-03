/**
 * Passage Arrival tests.
 *
 * Tests the search-to-reading scroll + highlight behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PassageArrival } from "../PassageArrival";

// ── Helpers ──────────────────────────────────────────────────────

const CHUNK_IDS = ["chunk-aaa", "chunk-bbb", "chunk-ccc"];

function createParagraphs() {
  const container = document.createElement("div");
  CHUNK_IDS.forEach((_, i) => {
    const p = document.createElement("p");
    p.setAttribute("data-paragraph", String(i));
    p.textContent = `Paragraph ${i}`;
    container.appendChild(p);
  });
  document.body.appendChild(container);
  return container;
}

// ── Tests ────────────────────────────────────────────────────────

describe("PassageArrival", () => {
  let paragraphContainer: HTMLDivElement;

  beforeEach(() => {
    paragraphContainer = createParagraphs() as HTMLDivElement;
    // Default: no reduced motion
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    cleanup();
    paragraphContainer?.remove();
    // Reset hash
    window.history.replaceState(null, "", window.location.pathname);
    vi.restoreAllMocks();
  });

  it("scrolls to and highlights the passage when hash matches a chunk ID", () => {
    window.location.hash = "#passage-chunk-bbb";

    const scrollMock = vi.fn();
    const targetPara = document.querySelector('[data-paragraph="1"]') as HTMLElement;
    targetPara.scrollIntoView = scrollMock;

    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    // Should scroll to paragraph index 1
    expect(scrollMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });

    // Should apply arrival attribute
    expect(targetPara.hasAttribute("data-arrival")).toBe(true);

    // Should clean the hash from URL
    expect(window.location.hash).toBe("");
  });

  it("does nothing when no hash is present", () => {
    window.location.hash = "";

    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    // No paragraph should have arrival attribute
    const arrived = document.querySelector("[data-arrival]");
    expect(arrived).toBeNull();
  });

  it("does nothing when hash does not match any chunk ID", () => {
    window.location.hash = "#passage-unknown-id";

    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    const arrived = document.querySelector("[data-arrival]");
    expect(arrived).toBeNull();
  });

  it("does nothing for non-passage hash fragments", () => {
    window.location.hash = "#some-other-fragment";

    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    const arrived = document.querySelector("[data-arrival]");
    expect(arrived).toBeNull();
  });

  it("uses instant scroll when prefers-reduced-motion is set", () => {
    window.location.hash = "#passage-chunk-aaa";
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true }),
    );

    const scrollMock = vi.fn();
    const targetPara = document.querySelector('[data-paragraph="0"]') as HTMLElement;
    targetPara.scrollIntoView = scrollMock;

    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    expect(scrollMock).toHaveBeenCalledWith({
      behavior: "instant",
      block: "center",
    });
  });

  it("removes the arrival attribute after the glow duration", () => {
    vi.useFakeTimers();
    window.location.hash = "#passage-chunk-ccc";

    const scrollMock = vi.fn();
    const targetPara = document.querySelector('[data-paragraph="2"]') as HTMLElement;
    targetPara.scrollIntoView = scrollMock;

    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    expect(targetPara.hasAttribute("data-arrival")).toBe(true);

    // Fast-forward past the glow duration (3000ms)
    vi.advanceTimersByTime(3000);

    expect(targetPara.hasAttribute("data-arrival")).toBe(false);

    vi.useRealTimers();
  });

  it("handles URL-encoded chunk IDs", () => {
    window.location.hash = "#passage-chunk%2Fwith%20spaces";

    const chunkIds = ["chunk/with spaces", "chunk-other"];

    // Add paragraphs for this test's chunk IDs
    const extraContainer = document.createElement("div");
    chunkIds.forEach((_, i) => {
      const p = document.createElement("p");
      p.setAttribute("data-paragraph", String(i));
      p.scrollIntoView = vi.fn();
      extraContainer.appendChild(p);
    });
    document.body.appendChild(extraContainer);

    // Remove the default test paragraphs so indexOf matches correctly
    paragraphContainer.remove();

    const scrollMock = vi.fn();
    const targetPara = extraContainer.querySelector('[data-paragraph="0"]') as HTMLElement;
    targetPara.scrollIntoView = scrollMock;

    render(<PassageArrival paragraphChunkIds={chunkIds} />);

    expect(scrollMock).toHaveBeenCalled();
    expect(targetPara.hasAttribute("data-arrival")).toBe(true);

    extraContainer.remove();
  });

  it("injects arrival glow CSS styles", () => {
    render(<PassageArrival paragraphChunkIds={CHUNK_IDS} />);

    const styleTag = document.querySelector("style");
    expect(styleTag).not.toBeNull();
    expect(styleTag?.textContent).toContain("passage-arrival-glow");
  });
});
