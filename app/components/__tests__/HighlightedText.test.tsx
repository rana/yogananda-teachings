/**
 * Tests for HighlightedText — search term highlighting in passages.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighlightedText } from "../HighlightedText";

describe("HighlightedText", () => {
  it("returns plain text when query is empty", () => {
    const { container } = render(
      <HighlightedText text="The soul is eternal." query="" />,
    );
    expect(container.textContent).toBe("The soul is eternal.");
    expect(container.querySelectorAll("mark")).toHaveLength(0);
  });

  it("returns plain text when query has only single-char words", () => {
    const { container } = render(
      <HighlightedText text="The soul is eternal." query="a b c" />,
    );
    expect(container.textContent).toBe("The soul is eternal.");
    expect(container.querySelectorAll("mark")).toHaveLength(0);
  });

  it("highlights matching terms", () => {
    const { container } = render(
      <HighlightedText
        text="Finding inner peace through meditation"
        query="inner peace"
      />,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe("inner");
    expect(marks[1].textContent).toBe("peace");
  });

  it("highlights are case-insensitive", () => {
    const { container } = render(
      <HighlightedText text="The Soul transcends" query="soul" />,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe("Soul");
  });

  it("preserves full text content with highlighting", () => {
    const text = "Divine love is the highest expression of the soul.";
    const { container } = render(
      <HighlightedText text={text} query="divine soul" />,
    );
    expect(container.textContent).toBe(text);
  });

  it("handles regex special characters in query safely", () => {
    const { container } = render(
      <HighlightedText
        text="God-realization is the goal."
        query="God-realization"
      />,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe("God-realization");
  });

  it("handles multiple occurrences of the same term", () => {
    const { container } = render(
      <HighlightedText
        text="Peace within leads to peace without."
        query="peace"
      />,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe("Peace");
    expect(marks[1].textContent).toBe("peace");
  });

  it("applies gold highlight styling", () => {
    const { container } = render(
      <HighlightedText text="The soul awakens." query="soul" />,
    );
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark!.className).toContain("bg-srf-gold/15");
  });
});
