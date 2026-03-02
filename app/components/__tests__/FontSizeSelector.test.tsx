// @vitest-environment jsdom

/**
 * FontSizeSelector component tests — font size picker.
 *
 * Verifies size selection, CSS class application on <html>,
 * persistence, subscription sync, and accessibility.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `reader.${key}`,
}));

const mockGetPreference = vi.fn();
const mockSetPreference = vi.fn();
const mockSubscribe = vi.fn();

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (...args: unknown[]) => mockGetPreference(...args),
  setPreference: (...args: unknown[]) => mockSetPreference(...args),
  subscribe: (...args: unknown[]) => mockSubscribe(...args),
}));

// ── Import after mocks ───────────────────────────────────────────

import { FontSizeSelector } from "../FontSizeSelector";

// ── Tests ─────────────────────────────────────────────────────────

describe("FontSizeSelector", () => {
  let unsubscribeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribeFn = vi.fn();
    mockGetPreference.mockReset();
    mockSetPreference.mockReset();
    mockSubscribe.mockReset();
    mockGetPreference.mockReturnValue("default");
    mockSubscribe.mockReturnValue(unsubscribeFn);
    document.documentElement.classList.remove("font-large", "font-larger");
  });

  afterEach(() => {
    document.documentElement.classList.remove("font-large", "font-larger");
  });

  it("renders a radiogroup with three options", () => {
    render(<FontSizeSelector />);
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("marks the current size as checked", () => {
    mockGetPreference.mockReturnValue("large");
    render(<FontSizeSelector />);

    const largeBtn = screen.getByLabelText("reader.fontSize_large");
    expect(largeBtn).toHaveAttribute("aria-checked", "true");

    const defaultBtn = screen.getByLabelText("reader.fontSize_default");
    expect(defaultBtn).toHaveAttribute("aria-checked", "false");
  });

  it("selects a new size on click and persists it", () => {
    render(<FontSizeSelector />);

    const largerBtn = screen.getByLabelText("reader.fontSize_larger");
    act(() => {
      fireEvent.click(largerBtn);
    });

    expect(mockSetPreference).toHaveBeenCalledWith("font-size", "larger");
    expect(largerBtn).toHaveAttribute("aria-checked", "true");
  });

  it("applies font-large class on <html> when large is selected", () => {
    mockGetPreference.mockReturnValue("large");
    render(<FontSizeSelector />);

    expect(document.documentElement.classList.contains("font-large")).toBe(true);
    expect(document.documentElement.classList.contains("font-larger")).toBe(false);
  });

  it("applies font-larger class on <html> when larger is selected", () => {
    mockGetPreference.mockReturnValue("larger");
    render(<FontSizeSelector />);

    expect(document.documentElement.classList.contains("font-larger")).toBe(true);
    expect(document.documentElement.classList.contains("font-large")).toBe(false);
  });

  it("removes font classes when default is selected", () => {
    mockGetPreference.mockReturnValue("default");
    render(<FontSizeSelector />);

    expect(document.documentElement.classList.contains("font-large")).toBe(false);
    expect(document.documentElement.classList.contains("font-larger")).toBe(false);
  });

  it("has 44x44px minimum touch targets", () => {
    render(<FontSizeSelector />);
    const radios = screen.getAllByRole("radio");

    radios.forEach((radio) => {
      expect(radio.className).toContain("min-h-[44px]");
      expect(radio.className).toContain("min-w-[44px]");
    });
  });

  it("cleans up font classes on unmount", () => {
    mockGetPreference.mockReturnValue("large");
    const { unmount } = render(<FontSizeSelector />);

    expect(document.documentElement.classList.contains("font-large")).toBe(true);

    unmount();

    expect(document.documentElement.classList.contains("font-large")).toBe(false);
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = render(<FontSizeSelector />);
    unmount();
    expect(unsubscribeFn).toHaveBeenCalledTimes(1);
  });
});
