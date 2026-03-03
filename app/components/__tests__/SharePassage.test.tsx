/**
 * Tests for SharePassage component — paragraph-level sharing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      sharePassage: "Share this passage",
      shared: "Shared",
      copiedToClipboard: "Copied",
    };
    return translations[key] || key;
  },
}));

// Mock share-passage
vi.mock("@/lib/share-passage", () => ({
  sharePassage: vi.fn().mockResolvedValue({ method: "clipboard", success: true }),
}));

// Mock resonance-beacon
vi.mock("@/lib/resonance-beacon", () => ({
  sendResonance: vi.fn(),
}));

import { SharePassage } from "../SharePassage";

const paragraphs = [
  { id: "chunk-1", content: "The first paragraph of wisdom.", pageNumber: 42 },
  { id: "chunk-2", content: "The second paragraph of wisdom." },
];

function setupParagraphDom() {
  const container = document.createElement("div");
  paragraphs.forEach((p, i) => {
    const el = document.createElement("p");
    el.setAttribute("data-paragraph", String(i));
    el.textContent = p.content;
    container.appendChild(el);
  });
  document.body.appendChild(container);
  return () => document.body.removeChild(container);
}

describe("SharePassage", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupParagraphDom();
  });

  afterEach(() => {
    cleanup();
  });

  it("injects share buttons into paragraph elements", () => {
    render(
      <SharePassage
        paragraphs={paragraphs}
        bookTitle="Autobiography of a Yogi"
        bookAuthor="Paramahansa Yogananda"
        bookSlug="autobiography-of-a-yogi"
        chapterNumber={1}
        chapterTitle="My Parents and Early Life"
        locale="en"
      />,
    );

    const buttons = document.querySelectorAll(".share-passage-btn");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].getAttribute("aria-label")).toBe("Share this passage");
  });

  it("injects styles for hover and toast animations", () => {
    const { container } = render(
      <SharePassage
        paragraphs={paragraphs}
        bookTitle="Test"
        bookAuthor="Author"
        bookSlug="test"
        chapterNumber={1}
        chapterTitle="Ch"
        locale="en"
      />,
    );

    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("share-passage-btn");
    expect(style!.textContent).toContain("share-toast");
  });

  it("cleans up buttons on unmount", () => {
    const { unmount } = render(
      <SharePassage
        paragraphs={paragraphs}
        bookTitle="Test"
        bookAuthor="Author"
        bookSlug="test"
        chapterNumber={1}
        chapterTitle="Ch"
        locale="en"
      />,
    );

    expect(document.querySelectorAll(".share-passage-btn")).toHaveLength(2);
    unmount();
    expect(document.querySelectorAll(".share-passage-btn")).toHaveLength(0);
  });
});
