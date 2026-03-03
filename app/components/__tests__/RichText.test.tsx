// @vitest-environment jsdom

/**
 * RichText tests — PRI-01 verbatim fidelity.
 *
 * Verifies that formatting spans (italic, bold, small-caps, superscript)
 * render correctly and that footnote markers link to chapter notes.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RichText } from "../RichText";

describe("RichText", () => {
  it("renders plain text when no formatting spans", () => {
    const { container } = render(
      <RichText text="The guru relationship." formatting={[]} />,
    );
    expect(container.textContent).toBe("The guru relationship.");
  });

  it("renders italic spans as <em>", () => {
    const { container } = render(
      <RichText
        text="The Bhagavad Gita teaches wisdom."
        formatting={[{ start: 4, end: 17, style: "italic" }]}
      />,
    );
    const em = container.querySelector("em");
    expect(em).not.toBeNull();
    expect(em!.textContent).toBe("Bhagavad Gita");
  });

  it("renders bold spans as <strong>", () => {
    const { container } = render(
      <RichText
        text="Never give up."
        formatting={[{ start: 0, end: 5, style: "bold" }]}
      />,
    );
    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe("Never");
  });

  it("renders small-caps with correct class", () => {
    const { container } = render(
      <RichText
        text="CHAPTER 1"
        formatting={[{ start: 0, end: 9, style: "small-caps" }]}
      />,
    );
    const sc = container.querySelector(".small-caps");
    expect(sc).not.toBeNull();
    expect(sc!.textContent).toBe("CHAPTER 1");
  });

  it("renders non-footnote superscript as <sup>", () => {
    const { container } = render(
      <RichText
        text="E=mc²"
        formatting={[{ start: 4, end: 5, style: "superscript" }]}
      />,
    );
    const sup = container.querySelector("sup");
    expect(sup).not.toBeNull();
    expect(sup!.textContent).toBe("2");
  });

  it("renders footnote marker as linked superscript", () => {
    const footnotes = [
      { marker: "1", text: "1 Spiritual teacher.", pageNumber: 61 },
    ];
    const { container } = render(
      <RichText
        text="The guru¹ relationship."
        formatting={[{ start: 8, end: 9, style: "superscript" }]}
        footnotes={footnotes}
      />,
    );
    const link = container.querySelector('a[role="doc-noteref"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe("1");
    expect(link!.getAttribute("href")).toBe("#fn-1");

    const sup = container.querySelector("#fnref-1");
    expect(sup).not.toBeNull();
  });

  it("renders multiple formatting spans correctly", () => {
    const { container } = render(
      <RichText
        text="The Gita is bold truth."
        formatting={[
          { start: 4, end: 8, style: "italic" },
          { start: 12, end: 16, style: "bold" },
        ]}
      />,
    );
    expect(container.querySelector("em")!.textContent).toBe("Gita");
    expect(container.querySelector("strong")!.textContent).toBe("bold");
    expect(container.textContent).toBe("The Gita is bold truth.");
  });

  it("handles bold-italic style", () => {
    const { container } = render(
      <RichText
        text="Very important."
        formatting={[{ start: 0, end: 4, style: "bold-italic" }]}
      />,
    );
    const strong = container.querySelector("strong");
    const em = strong?.querySelector("em");
    expect(em).not.toBeNull();
    expect(em!.textContent).toBe("Very");
  });

  it("normalizes Unicode superscript digits for footnote matching", () => {
    const footnotes = [
      { marker: "2", text: "2 Practitioner of yoga.", pageNumber: 62 },
    ];
    const { container } = render(
      <RichText
        text="A yogi² meditates."
        formatting={[{ start: 6, end: 7, style: "superscript" }]}
        footnotes={footnotes}
      />,
    );
    const link = container.querySelector('a[role="doc-noteref"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe("2");
    expect(link!.getAttribute("href")).toBe("#fn-2");
  });

  it("preserves full text content across all segments", () => {
    const { container } = render(
      <RichText
        text="Before italic middle after."
        formatting={[{ start: 7, end: 20, style: "italic" }]}
      />,
    );
    expect(container.textContent).toBe("Before italic middle after.");
  });
});
