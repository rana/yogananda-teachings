// @vitest-environment jsdom

/**
 * EphemeralHighlights tests — M3c-6.
 *
 * Verifies double-click toggle, double-tap (mobile), keyboard shortcut,
 * highlight class management, and session counter display.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EphemeralHighlights } from "../EphemeralHighlights";

// ── Helpers ──────────────────────────────────────────────────────

function createParagraphs(count = 3) {
  const container = document.createElement("div");
  for (let i = 0; i < count; i++) {
    const p = document.createElement("p");
    p.setAttribute("data-paragraph", String(i));
    p.textContent = `Paragraph ${i} for testing ephemeral highlights.`;
    container.appendChild(p);
  }
  document.body.appendChild(container);
  return () => document.body.removeChild(container);
}

// ── Tests ────────────────────────────────────────────────────────

describe("EphemeralHighlights", () => {
  let cleanupParagraphs: () => void;

  beforeEach(() => {
    cleanupParagraphs = createParagraphs();
  });

  afterEach(() => {
    cleanupParagraphs();
  });

  it("renders highlight styles", () => {
    const { container } = render(<EphemeralHighlights />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("ephemeral-highlight");
    expect(style!.textContent).toContain("border-inline-start");
  });

  it("does not show highlight counter initially", () => {
    render(<EphemeralHighlights />);
    expect(screen.queryByText(/highlighted/)).toBeNull();
  });

  it("toggles highlight class on double-click", () => {
    render(<EphemeralHighlights />);
    const paragraph = document.querySelector('[data-paragraph="0"]')!;

    // Double-click to highlight
    act(() => {
      fireEvent.dblClick(paragraph);
    });
    expect(paragraph.classList.contains("ephemeral-highlight")).toBe(true);

    // Double-click again to remove
    act(() => {
      fireEvent.dblClick(paragraph);
    });
    expect(paragraph.classList.contains("ephemeral-highlight")).toBe(false);
  });

  it("shows highlight counter after a paragraph is highlighted", () => {
    render(<EphemeralHighlights />);
    const paragraph = document.querySelector('[data-paragraph="0"]')!;

    act(() => {
      fireEvent.dblClick(paragraph);
    });

    expect(screen.getByText(/1 passage/)).toBeDefined();
  });

  it("pluralizes counter for multiple highlights", () => {
    render(<EphemeralHighlights />);
    const p0 = document.querySelector('[data-paragraph="0"]')!;
    const p1 = document.querySelector('[data-paragraph="1"]')!;

    act(() => {
      fireEvent.dblClick(p0);
      fireEvent.dblClick(p1);
    });

    expect(screen.getByText(/2 passages/)).toBeDefined();
  });

  it("removes counter when all highlights are cleared", () => {
    render(<EphemeralHighlights />);
    const paragraph = document.querySelector('[data-paragraph="0"]')!;

    // Add then remove
    act(() => {
      fireEvent.dblClick(paragraph);
    });
    expect(screen.getByText(/1 passage/)).toBeDefined();

    act(() => {
      fireEvent.dblClick(paragraph);
    });
    expect(screen.queryByText(/highlighted/)).toBeNull();
  });

  it("highlights on keyboard shortcut 'h' when paragraph has kb-focus", () => {
    render(<EphemeralHighlights />);
    const paragraph = document.querySelector('[data-paragraph="1"]')!;
    paragraph.classList.add("kb-focus");

    act(() => {
      fireEvent.keyDown(document, { key: "h" });
    });

    expect(paragraph.classList.contains("ephemeral-highlight")).toBe(true);
    paragraph.classList.remove("kb-focus");
  });

  it("does not trigger 'h' shortcut in input fields", () => {
    render(<EphemeralHighlights />);
    const input = document.createElement("input");
    document.body.appendChild(input);

    const paragraph = document.querySelector('[data-paragraph="0"]')!;
    paragraph.classList.add("kb-focus");

    act(() => {
      fireEvent.keyDown(input, { key: "h" });
    });

    expect(paragraph.classList.contains("ephemeral-highlight")).toBe(false);
    paragraph.classList.remove("kb-focus");
    document.body.removeChild(input);
  });

  it("does not trigger 'h' shortcut with modifier keys", () => {
    render(<EphemeralHighlights />);
    const paragraph = document.querySelector('[data-paragraph="0"]')!;
    paragraph.classList.add("kb-focus");

    act(() => {
      fireEvent.keyDown(document, { key: "h", ctrlKey: true });
    });
    expect(paragraph.classList.contains("ephemeral-highlight")).toBe(false);

    act(() => {
      fireEvent.keyDown(document, { key: "h", metaKey: true });
    });
    expect(paragraph.classList.contains("ephemeral-highlight")).toBe(false);

    paragraph.classList.remove("kb-focus");
  });

  it("ignores double-click on non-paragraph elements", () => {
    render(<EphemeralHighlights />);

    // Double-click on body (not a paragraph)
    act(() => {
      fireEvent.dblClick(document.body);
    });

    // No counter should appear
    expect(screen.queryByText(/highlighted/)).toBeNull();
  });

  it("marks highlight counter as non-focusable and non-printable", () => {
    render(<EphemeralHighlights />);
    const paragraph = document.querySelector('[data-paragraph="0"]')!;

    act(() => {
      fireEvent.dblClick(paragraph);
    });

    const counter = screen.getByText(/1 passage/).closest("div");
    expect(counter?.hasAttribute("data-no-focus")).toBe(true);
    expect(counter?.hasAttribute("data-no-present")).toBe(true);
    expect(counter?.hasAttribute("data-no-print")).toBe(true);
  });
});
