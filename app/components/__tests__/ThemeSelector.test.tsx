// @vitest-environment jsdom

/**
 * ThemeSelector component tests — color theme picker.
 *
 * Verifies theme selection, persistence, radio group semantics,
 * subscription sync, and accessibility attributes.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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

import { ThemeSelector } from "../ThemeSelector";

// ── Tests ─────────────────────────────────────────────────────────

describe("ThemeSelector", () => {
  let unsubscribeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    unsubscribeFn = vi.fn();
    mockGetPreference.mockReset();
    mockSetPreference.mockReset();
    mockSubscribe.mockReset();
    mockGetPreference.mockReturnValue("auto");
    mockSubscribe.mockReturnValue(unsubscribeFn);
  });

  it("renders a radiogroup with five options", () => {
    render(<ThemeSelector />);
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
  });

  it("marks the current theme as checked", () => {
    mockGetPreference.mockReturnValue("sepia");
    render(<ThemeSelector />);

    const sepiaBtn = screen.getByLabelText("reader.theme_sepia");
    expect(sepiaBtn).toHaveAttribute("aria-checked", "true");

    const autoBtn = screen.getByLabelText("reader.theme_auto");
    expect(autoBtn).toHaveAttribute("aria-checked", "false");
  });

  it("selects a new theme on click and persists it", () => {
    render(<ThemeSelector />);

    const darkBtn = screen.getByLabelText("reader.theme_dark");
    act(() => {
      fireEvent.click(darkBtn);
    });

    expect(mockSetPreference).toHaveBeenCalledWith("color-theme", "dark");
    expect(darkBtn).toHaveAttribute("aria-checked", "true");
  });

  it("updates when preference changes via subscription", () => {
    render(<ThemeSelector />);

    const callback = mockSubscribe.mock.calls[0][0];
    act(() => {
      callback({ "color-theme": "sepia" });
    });

    const sepiaBtn = screen.getByLabelText("reader.theme_sepia");
    expect(sepiaBtn).toHaveAttribute("aria-checked", "true");
  });

  it("has accessible labels for all themes", () => {
    render(<ThemeSelector />);

    expect(screen.getByLabelText("reader.theme_auto")).toBeInTheDocument();
    expect(screen.getByLabelText("reader.theme_light")).toBeInTheDocument();
    expect(screen.getByLabelText("reader.theme_sepia")).toBeInTheDocument();
    expect(screen.getByLabelText("reader.theme_dark")).toBeInTheDocument();
    expect(screen.getByLabelText("reader.theme_meditate")).toBeInTheDocument();
  });

  it("has 44x44px minimum touch targets", () => {
    render(<ThemeSelector />);
    const radios = screen.getAllByRole("radio");

    radios.forEach((radio) => {
      expect(radio.className).toContain("min-h-[44px]");
      expect(radio.className).toContain("min-w-[44px]");
    });
  });

  it("has a labeled radiogroup for the theme selector", () => {
    render(<ThemeSelector />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-label", "reader.colorTheme");
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = render(<ThemeSelector />);
    unmount();
    expect(unsubscribeFn).toHaveBeenCalledTimes(1);
  });
});
