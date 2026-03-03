/**
 * Tests for SrfLotusDetailed component.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SrfLotusDetailed } from "../SrfLotusDetailed";

describe("SrfLotusDetailed", () => {
  it("renders a decorative div", () => {
    const { container } = render(<SrfLotusDetailed />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("applies mask-image style for the lotus SVG", () => {
    const { container } = render(<SrfLotusDetailed />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.maskImage).toContain("srf-lotus-detailed.svg");
  });

  it("uses currentColor for theme awareness", () => {
    const { container } = render(<SrfLotusDetailed />);
    const el = container.firstChild as HTMLElement;
    // jsdom normalizes CSS values to lowercase
    expect(el.style.backgroundColor).toBe("currentcolor");
  });

  it("preserves aspect ratio", () => {
    const { container } = render(<SrfLotusDetailed />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.aspectRatio).toBe("181 / 150");
  });

  it("passes className prop", () => {
    const { container } = render(<SrfLotusDetailed className="w-24 text-srf-gold" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("w-24");
    expect(el.className).toContain("text-srf-gold");
  });
});
