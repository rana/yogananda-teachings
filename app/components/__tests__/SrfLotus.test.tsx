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
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal || svg?.getAttribute("class")).toContain(
      "w-5",
    );
    expect(svg?.className.baseVal || svg?.getAttribute("class")).toContain(
      "h-5",
    );
  });

  it("applies sm size classes", () => {
    const { container } = render(<SrfLotus size="sm" />);
    const svg = container.querySelector("svg");
    const cls = svg?.className.baseVal || svg?.getAttribute("class") || "";
    expect(cls).toContain("w-4");
    expect(cls).toContain("h-4");
  });

  it("applies md size classes", () => {
    const { container } = render(<SrfLotus size="md" />);
    const svg = container.querySelector("svg");
    const cls = svg?.className.baseVal || svg?.getAttribute("class") || "";
    expect(cls).toContain("w-5");
    expect(cls).toContain("h-5");
  });

  it("applies lg size classes", () => {
    const { container } = render(<SrfLotus size="lg" />);
    const svg = container.querySelector("svg");
    const cls = svg?.className.baseVal || svg?.getAttribute("class") || "";
    expect(cls).toContain("w-8");
    expect(cls).toContain("h-8");
  });

  it("applies xl size classes", () => {
    const { container } = render(<SrfLotus size="xl" />);
    const svg = container.querySelector("svg");
    const cls = svg?.className.baseVal || svg?.getAttribute("class") || "";
    expect(cls).toContain("w-12");
    expect(cls).toContain("h-12");
  });

  it("uses className override instead of size classes when className is provided", () => {
    const { container } = render(
      <SrfLotus className="custom-class text-red-500" />,
    );
    const svg = container.querySelector("svg");
    const cls = svg?.className.baseVal || svg?.getAttribute("class") || "";
    expect(cls).toContain("custom-class");
    expect(cls).toContain("text-red-500");
    // When className is provided, size classes should NOT be applied
    expect(cls).not.toContain("w-5");
    expect(cls).not.toContain("h-5");
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
