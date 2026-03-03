/**
 * Tests for HomeSearchEnhanced component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeSearchEnhanced } from "../HomeSearchEnhanced";

// Mock SearchCombobox
vi.mock("@/app/components/SearchCombobox", () => ({
  SearchCombobox: (props: Record<string, unknown>) => (
    <input
      data-testid="search-combobox"
      id={props.id as string}
      placeholder={props.placeholder as string}
      aria-label={props.ariaLabel as string}
      className={props.className as string}
    />
  ),
}));

// Mock search prompts
vi.mock("@/lib/config/search-prompts", () => ({
  SEARCH_PLACEHOLDERS: {
    en: ["peace", "joy", "love"],
    es: ["paz", "alegría", "amor"],
  },
}));

describe("HomeSearchEnhanced", () => {
  it("renders the search combobox", () => {
    render(
      <HomeSearchEnhanced
        locale="en"
        placeholder="Search teachings"
        ariaLabel="Search"
      />,
    );
    expect(screen.getByTestId("search-combobox")).toBeInTheDocument();
  });

  it("passes placeholder to search combobox", () => {
    render(
      <HomeSearchEnhanced
        locale="en"
        placeholder="Search the teachings"
        ariaLabel="Search"
      />,
    );
    expect(screen.getByTestId("search-combobox")).toHaveAttribute(
      "placeholder",
      "Search the teachings",
    );
  });

  it("passes ariaLabel to search combobox", () => {
    render(
      <HomeSearchEnhanced
        locale="en"
        placeholder="Search"
        ariaLabel="Search the teachings of Yogananda"
      />,
    );
    expect(screen.getByTestId("search-combobox")).toHaveAttribute(
      "aria-label",
      "Search the teachings of Yogananda",
    );
  });

  it("renders hidden input for form submission", () => {
    const { container } = render(
      <HomeSearchEnhanced
        locale="en"
        placeholder="Search"
        ariaLabel="Search"
      />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toBeTruthy();
    expect(hidden).toHaveAttribute("name", "q");
  });

  it("uses the correct id for label association", () => {
    render(
      <HomeSearchEnhanced
        locale="en"
        placeholder="Search"
        ariaLabel="Search"
      />,
    );
    expect(screen.getByTestId("search-combobox")).toHaveAttribute(
      "id",
      "home-search-input",
    );
  });
});
