// @vitest-environment jsdom

/**
 * ReaderModes component tests — M2b-8 (Focus), M2b-15 (Presentation).
 *
 * Verifies focus/presentation mode toggles, mutual exclusivity,
 * Escape exit, persistence, and accessibility attributes.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `reader.${key}`,
}));

const mockGetPreference = vi.fn();
const mockSetPreference = vi.fn();

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (...args: unknown[]) => mockGetPreference(...args),
  setPreference: (...args: unknown[]) => mockSetPreference(...args),
}));

// ── Import after mocks ───────────────────────────────────────────

import { ReaderModes } from "../ReaderModes";

// ── Helpers ──────────────────────────────────────────────────────

function setupMain() {
  const main = document.createElement("main");
  document.body.appendChild(main);
  return main;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("ReaderModes", () => {
  let main: HTMLElement;

  beforeEach(() => {
    mockGetPreference.mockReset();
    mockSetPreference.mockReset();
    mockGetPreference.mockReturnValue(false);
    main = setupMain();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders two toggle buttons", () => {
    render(<ReaderModes />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("renders focus button with correct label", () => {
    render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");
    expect(focusBtn).toBeInTheDocument();
    expect(focusBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders present button with correct label", () => {
    render(<ReaderModes />);
    const presentBtn = screen.getByLabelText("reader.presentMode");
    expect(presentBtn).toBeInTheDocument();
    expect(presentBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("activates focus mode on click", () => {
    render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");

    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("focus");
    expect(mockSetPreference).toHaveBeenCalledWith("focus-mode", true);
  });

  it("deactivates focus mode on second click", () => {
    render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");

    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("focus");

    // After activating focus, label changes to "Exit focus mode"
    const exitFocusBtn = screen.getByLabelText("reader.focusModeOff");
    act(() => {
      fireEvent.click(exitFocusBtn);
    });

    expect(main.hasAttribute("data-mode")).toBe(false);
    expect(mockSetPreference).toHaveBeenLastCalledWith("focus-mode", false);
  });

  it("activates presentation mode on click", () => {
    render(<ReaderModes />);
    const presentBtn = screen.getByLabelText("reader.presentMode");

    act(() => {
      fireEvent.click(presentBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("present");
  });

  it("modes are mutually exclusive — focus then present", () => {
    render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");

    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("focus");

    const presentBtn = screen.getByLabelText("reader.presentMode");
    act(() => {
      fireEvent.click(presentBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("present");
  });

  it("modes are mutually exclusive — present then focus", () => {
    render(<ReaderModes />);
    const presentBtn = screen.getByLabelText("reader.presentMode");

    act(() => {
      fireEvent.click(presentBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("present");

    const focusBtn = screen.getByLabelText("reader.focusMode");
    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("focus");
  });

  it("Escape exits presentation mode", () => {
    render(<ReaderModes />);
    const presentBtn = screen.getByLabelText("reader.presentMode");

    act(() => {
      fireEvent.click(presentBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("present");

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(main.hasAttribute("data-mode")).toBe(false);
  });

  it("Escape does not affect focus mode (focus is persistent)", () => {
    render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");

    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("focus");

    // Escape should NOT exit focus mode (only presentation mode)
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    // Focus mode should still be active
    expect(main.getAttribute("data-mode")).toBe("focus");
  });

  it("loads persisted focus mode on mount", () => {
    mockGetPreference.mockReturnValue(true);
    render(<ReaderModes />);

    expect(main.getAttribute("data-mode")).toBe("focus");
  });

  it("persists focus mode to preferences service", () => {
    render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");

    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(mockSetPreference).toHaveBeenCalledWith("focus-mode", true);
  });

  it("clears focus-mode preference when entering presentation mode", () => {
    render(<ReaderModes />);
    const presentBtn = screen.getByLabelText("reader.presentMode");

    act(() => {
      fireEvent.click(presentBtn);
    });

    expect(mockSetPreference).toHaveBeenCalledWith("focus-mode", false);
  });

  it("has 44x44px minimum touch targets", () => {
    render(<ReaderModes />);
    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      expect(button.className).toContain("min-h-[44px]");
      expect(button.className).toContain("min-w-[44px]");
    });
  });

  it("contains SVG icons that are hidden from screen readers", () => {
    render(<ReaderModes />);
    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      const svg = button.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("announces mode changes to screen readers", () => {
    render(<ReaderModes />);
    const announcer = screen.getByTestId("mode-announcer");

    expect(announcer).toHaveAttribute("aria-live", "polite");

    const focusBtn = screen.getByLabelText("reader.focusMode");
    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(announcer.textContent).toBe("reader.focusModeOn");
  });

  it("cleans up data-mode attribute on unmount", () => {
    const { unmount } = render(<ReaderModes />);
    const focusBtn = screen.getByLabelText("reader.focusMode");

    act(() => {
      fireEvent.click(focusBtn);
    });

    expect(main.getAttribute("data-mode")).toBe("focus");

    unmount();

    expect(main.hasAttribute("data-mode")).toBe(false);
  });
});
