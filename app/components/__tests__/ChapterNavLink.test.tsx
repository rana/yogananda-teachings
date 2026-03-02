// @vitest-environment jsdom

/**
 * ChapterNavLink tests — DES-012.
 *
 * Verifies: link rendering, rel attribute, breath marker on click.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockMarkChapterBreath = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>
      {children as React.ReactNode}
    </a>
  ),
}));

vi.mock("../ChapterBreath", () => ({
  markChapterBreath: (...args: unknown[]) => mockMarkChapterBreath(...args),
}));

// ── Import after mocks ───────────────────────────────────────────

import { ChapterNavLink } from "../ChapterNavLink";

// ── Tests ─────────────────────────────────────────────────────────

describe("ChapterNavLink", () => {
  it("renders a link with the correct href", () => {
    render(
      <ChapterNavLink href="/books/abc/3" rel="next">
        Next Chapter
      </ChapterNavLink>,
    );
    const link = screen.getByRole("link", { name: "Next Chapter" });
    expect(link).toHaveAttribute("href", "/books/abc/3");
  });

  it("sets the rel attribute", () => {
    render(
      <ChapterNavLink href="/books/abc/1" rel="prev">
        Previous
      </ChapterNavLink>,
    );
    const link = screen.getByRole("link", { name: "Previous" });
    expect(link).toHaveAttribute("rel", "prev");
  });

  it("calls markChapterBreath on click", () => {
    render(
      <ChapterNavLink href="/books/abc/5" rel="next">
        Ch 5
      </ChapterNavLink>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Ch 5" }));
    expect(mockMarkChapterBreath).toHaveBeenCalled();
  });
});
