// @vitest-environment jsdom

/**
 * TextOnlyToggle component tests — M2a-21.
 *
 * Verifies button rendering, aria-pressed attribute,
 * localStorage interaction via preferences service,
 * and document.documentElement classList toggling.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockGetPreference = vi.fn(() => false);
const mockSetPreference = vi.fn();

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (key: string) => mockGetPreference(key),
  setPreference: (key: string, value: unknown) => mockSetPreference(key, value),
}));

// ── Import after mocks ───────────────────────────────────────────

import { TextOnlyToggle } from "../TextOnlyToggle";

// ── Tests ─────────────────────────────────────────────────────────

describe("TextOnlyToggle", () => {
  beforeEach(() => {
    mockGetPreference.mockReturnValue(false);
    mockSetPreference.mockClear();
    document.documentElement.classList.remove("text-only");
  });

  it("renders a button", () => {
    render(<TextOnlyToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it('has aria-pressed="false" when disabled', () => {
    render(<TextOnlyToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it('has aria-pressed="true" when enabled via stored preference', () => {
    mockGetPreference.mockReturnValue(true);
    render(<TextOnlyToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("adds text-only class to documentElement when preference is true on mount", () => {
    mockGetPreference.mockReturnValue(true);
    render(<TextOnlyToggle />);
    expect(document.documentElement.classList.contains("text-only")).toBe(true);
  });

  it("calls setPreference when toggled on", () => {
    render(<TextOnlyToggle />);
    const button = screen.getByRole("button");
    act(() => {
      fireEvent.click(button);
    });
    expect(mockSetPreference).toHaveBeenCalledWith("text-only-mode", true);
  });

  it("adds text-only class to documentElement when toggled on", () => {
    render(<TextOnlyToggle />);
    const button = screen.getByRole("button");
    act(() => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains("text-only")).toBe(true);
  });

  it("removes text-only class when toggled off", () => {
    mockGetPreference.mockReturnValue(true);
    render(<TextOnlyToggle />);
    // Now toggle off
    const button = screen.getByRole("button");
    act(() => {
      fireEvent.click(button);
    });
    expect(mockSetPreference).toHaveBeenCalledWith("text-only-mode", false);
    expect(document.documentElement.classList.contains("text-only")).toBe(false);
  });

  it("displays correct label text based on state", () => {
    render(<TextOnlyToggle />);
    expect(screen.getByText("Text-only mode")).toBeInTheDocument();
  });

  it("displays 'Text-only: on' when enabled", () => {
    mockGetPreference.mockReturnValue(true);
    render(<TextOnlyToggle />);
    expect(screen.getByText("Text-only: on")).toBeInTheDocument();
  });
});
