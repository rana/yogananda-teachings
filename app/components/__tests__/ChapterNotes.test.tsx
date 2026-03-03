// @vitest-environment jsdom

/**
 * ChapterNotes tests — PRI-01 verbatim fidelity.
 *
 * Verifies DPUB-ARIA roles, bidirectional links, marker stripping,
 * and empty-state behavior.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChapterNotes } from "../ChapterNotes";

describe("ChapterNotes", () => {
  const sampleFootnotes = [
    { marker: "1", text: "1 Spiritual teacher. The Guru Gita describes the guru.", pageNumber: 61 },
    { marker: "2", text: "2 Practitioner of yoga.", pageNumber: 62 },
  ];

  it("renders nothing when footnotes array is empty", () => {
    const { container } = render(<ChapterNotes footnotes={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when footnotes is undefined", () => {
    const { container } = render(<ChapterNotes footnotes={undefined as never} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders endnotes section with DPUB-ARIA role", () => {
    render(<ChapterNotes footnotes={sampleFootnotes} />);
    const aside = screen.getByRole("doc-endnotes");
    expect(aside).toBeDefined();
  });

  it("renders Notes heading", () => {
    render(<ChapterNotes footnotes={sampleFootnotes} />);
    expect(screen.getByText("Notes")).toBeDefined();
  });

  it("strips leading marker number from footnote text", () => {
    render(<ChapterNotes footnotes={sampleFootnotes} />);
    // Should show "Spiritual teacher..." not "1 Spiritual teacher..."
    const fn1 = document.getElementById("fn-1");
    expect(fn1).not.toBeNull();
    expect(fn1!.textContent).toContain("Spiritual teacher");
    expect(fn1!.textContent).not.toMatch(/^1\s/);
  });

  it("renders anchor IDs for each footnote", () => {
    render(<ChapterNotes footnotes={sampleFootnotes} />);
    expect(document.getElementById("fn-1")).not.toBeNull();
    expect(document.getElementById("fn-2")).not.toBeNull();
  });

  it("renders back-links with doc-backlink role", () => {
    const { container } = render(<ChapterNotes footnotes={sampleFootnotes} />);
    const backlinks = container.querySelectorAll('a[role="doc-backlink"]');
    expect(backlinks.length).toBe(2);
    expect(backlinks[0].getAttribute("href")).toBe("#fnref-1");
    expect(backlinks[1].getAttribute("href")).toBe("#fnref-2");
  });

  it("renders back-link arrow character", () => {
    const { container } = render(<ChapterNotes footnotes={sampleFootnotes} />);
    const backlinks = container.querySelectorAll('a[role="doc-backlink"]');
    expect(backlinks[0].textContent).toBe("↩");
  });

  it("renders ordered list with correct values", () => {
    const { container } = render(<ChapterNotes footnotes={sampleFootnotes} />);
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
    expect(items[0].getAttribute("value")).toBe("1");
    expect(items[1].getAttribute("value")).toBe("2");
  });

  it("handles footnotes with empty markers by using index", () => {
    const footnotes = [
      { marker: "", text: "¹ El significado de la raíz sánscrita.", pageNumber: 100 },
    ];
    const { container } = render(<ChapterNotes footnotes={footnotes} />);
    // Should fall back to index-based ID
    expect(document.getElementById("fn-1")).not.toBeNull();
  });
});
