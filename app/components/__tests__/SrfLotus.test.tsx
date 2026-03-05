// @vitest-environment jsdom

/**
 * SrfLotus component tests — M2a-21.
 *
 * Verifies SVG rendering, aria-hidden attribute,
 * size prop behavior, and className override.
 */

import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { SrfLotus } from "../SrfLotus";

// ── Tests ─────────────────────────────────────────────────────────

describe("SrfLotus", () => {
  it("renders an SVG element", () => {
    const { container } = render(<SrfLotus />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it('has aria-hidden="true"', () => {
    const { container } = render(<SrfLotus />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("uses default size (md) when no size prop is given", () => {
    const { container } = render(<SrfLotus />);
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.style.inlineSize).toBe("1.25rem");
    expect(svg.style.blockSize).toBe("1.25rem");
  });

  it("applies sm size via inline style", () => {
    const { container } = render(<SrfLotus size="sm" />);
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.style.inlineSize).toBe("1rem");
    expect(svg.style.blockSize).toBe("1rem");
  });

  it("applies md size via inline style", () => {
    const { container } = render(<SrfLotus size="md" />);
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.style.inlineSize).toBe("1.25rem");
    expect(svg.style.blockSize).toBe("1.25rem");
  });

  it("applies lg size via inline style", () => {
    const { container } = render(<SrfLotus size="lg" />);
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.style.inlineSize).toBe("2rem");
    expect(svg.style.blockSize).toBe("2rem");
  });

  it("applies xl size via inline style", () => {
    const { container } = render(<SrfLotus size="xl" />);
    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.style.inlineSize).toBe("3rem");
    expect(svg.style.blockSize).toBe("3rem");
  });

  it("uses className override instead of inline style when className is provided", () => {
    const { container } = render(
      <SrfLotus className="custom-class text-red-500" />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const cls = svg.className.baseVal || svg.getAttribute("class") || "";
    expect(cls).toContain("custom-class");
    expect(cls).toContain("text-red-500");
    // When className is provided, inline style should NOT be applied
    expect(svg.style.inlineSize).toBe("");
  });

  it("has correct viewBox", () => {
    const { container } = render(<SrfLotus />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 33 23");
  });

  it("has fill set to currentColor for CSS theming", () => {
    const { container } = render(<SrfLotus />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });
});
