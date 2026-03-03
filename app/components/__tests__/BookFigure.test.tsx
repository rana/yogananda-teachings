/**
 * Tests for BookFigure component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookFigure } from "../BookFigure";

// Mock AdaptiveImage
vi.mock("@/app/components/AdaptiveImage", () => ({
  AdaptiveImage: (props: Record<string, unknown>) => (
    <img
      src={props.src as string}
      alt={props.alt as string}
      width={props.width as number}
      height={props.height as number}
      loading={props.loading as "eager" | "lazy" | undefined}
      className={props.className as string}
    />
  ),
}));

const baseImage = {
  imagePath: "/images/chapter-1.jpg",
  alt: "Yogananda meditating",
  width: 600,
  height: 400,
  pageNumber: 42,
  caption: "Paramahansa Yogananda in meditation",
};

describe("BookFigure", () => {
  it("renders a figure element", () => {
    const { container } = render(<BookFigure image={baseImage} />);
    expect(container.querySelector("figure")).toBeTruthy();
  });

  it("renders the image with correct attributes", () => {
    render(<BookFigure image={baseImage} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/chapter-1.jpg");
    expect(img).toHaveAttribute("alt", "Yogananda meditating");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders figcaption when caption exists", () => {
    render(<BookFigure image={baseImage} />);
    expect(
      screen.getByText("Paramahansa Yogananda in meditation"),
    ).toBeInTheDocument();
  });

  it("omits figcaption when caption is empty", () => {
    const imageNoCaption = { ...baseImage, caption: "" };
    const { container } = render(<BookFigure image={imageNoCaption} />);
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("omits figcaption when caption is null", () => {
    const imageNullCaption = { ...baseImage, caption: null };
    const { container } = render(<BookFigure image={imageNullCaption} />);
    expect(container.querySelector("figcaption")).toBeNull();
  });
});
