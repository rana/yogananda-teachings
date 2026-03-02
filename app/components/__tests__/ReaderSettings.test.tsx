// @vitest-environment jsdom

/**
 * ReaderSettings component tests — M2a-21.
 *
 * Verifies popover trigger, aria attributes, text-only toggle,
 * font size selector, language selector, Escape key close,
 * click-outside close, and focus management.
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockReplace = vi.fn();
const mockGetPreference = vi.fn();
const mockSetPreference = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/search",
}));

vi.mock("@/i18n/config", () => ({
  locales: ["en", "es"] as const,
  localeNames: { en: "English", es: "Español" },
}));

vi.mock("@/lib/services/preferences", () => ({
  getPreference: (key: string) => mockGetPreference(key),
  setPreference: (key: string, value: unknown) =>
    mockSetPreference(key, value),
}));

// ── Import after mocks ───────────────────────────────────────────

import { ReaderSettings } from "../ReaderSettings";

// ── Helpers ──────────────────────────────────────────────────────

/** Click the trigger button to open the popover. */
function openPopover() {
  const trigger = screen.getByLabelText("settings.label");
  act(() => {
    fireEvent.click(trigger);
  });
  return trigger;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("ReaderSettings", () => {
  beforeEach(() => {
    mockGetPreference.mockImplementation((key: string) => {
      if (key === "text-only-mode") return false;
      if (key === "font-size") return "default";
      return undefined;
    });
    mockSetPreference.mockClear();
    mockReplace.mockClear();
    document.documentElement.classList.remove(
      "text-only",
      "font-large",
      "font-larger",
    );
  });

  // ── Trigger button ────────────────────────────────────────────

  describe("trigger button", () => {
    it("renders with aria-label from translations", () => {
      render(<ReaderSettings />);
      const trigger = screen.getByLabelText("settings.label");
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe("BUTTON");
    });

    it('has aria-haspopup="dialog"', () => {
      render(<ReaderSettings />);
      const trigger = screen.getByLabelText("settings.label");
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    });

    it('has aria-expanded="false" when popover is closed', () => {
      render(<ReaderSettings />);
      const trigger = screen.getByLabelText("settings.label");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it('has aria-expanded="true" when popover is open', () => {
      render(<ReaderSettings />);
      openPopover();
      // When open, both trigger and dialog have aria-label "settings.label",
      // so use getByRole("button") with the haspopup attribute to find trigger.
      const trigger = screen.getByRole("button", { expanded: true });
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("meets 44px minimum touch target", () => {
      render(<ReaderSettings />);
      const trigger = screen.getByLabelText("settings.label");
      expect(trigger.className).toContain("min-h-[44px]");
      expect(trigger.className).toContain("min-w-[44px]");
    });
  });

  // ── Popover panel ─────────────────────────────────────────────

  describe("popover panel", () => {
    it("is hidden by default", () => {
      render(<ReaderSettings />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("appears when trigger is clicked", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it('has role="dialog" and aria-modal="true"', () => {
      render(<ReaderSettings />);
      openPopover();
      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
    });

    it("has aria-label from translations", () => {
      render(<ReaderSettings />);
      openPopover();
      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("aria-label", "settings.label");
    });

    it("closes when trigger is clicked again", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // When open, both trigger and dialog share aria-label, so target by role+expanded
      const trigger = screen.getByRole("button", { expanded: true });
      act(() => {
        fireEvent.click(trigger);
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // ── Text-only toggle ──────────────────────────────────────────

  describe("text-only toggle", () => {
    it('renders a switch with aria-checked="false" when off', () => {
      render(<ReaderSettings />);
      openPopover();
      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });

    it('switches aria-checked to "true" on click', () => {
      render(<ReaderSettings />);
      openPopover();
      const toggle = screen.getByRole("switch");
      act(() => {
        fireEvent.click(toggle);
      });
      expect(toggle).toHaveAttribute("aria-checked", "true");
    });

    it("adds text-only class to documentElement when toggled on", () => {
      render(<ReaderSettings />);
      openPopover();
      const toggle = screen.getByRole("switch");
      act(() => {
        fireEvent.click(toggle);
      });
      expect(
        document.documentElement.classList.contains("text-only"),
      ).toBe(true);
    });

    it("calls setPreference with true when toggled on", () => {
      render(<ReaderSettings />);
      openPopover();
      const toggle = screen.getByRole("switch");
      act(() => {
        fireEvent.click(toggle);
      });
      expect(mockSetPreference).toHaveBeenCalledWith("text-only-mode", true);
    });

    it("removes text-only class when toggled off", () => {
      mockGetPreference.mockImplementation((key: string) => {
        if (key === "text-only-mode") return true;
        if (key === "font-size") return "default";
        return undefined;
      });
      render(<ReaderSettings />);
      openPopover();
      const toggle = screen.getByRole("switch");
      // Toggle is on from stored preference — click to turn off
      act(() => {
        fireEvent.click(toggle);
      });
      expect(mockSetPreference).toHaveBeenCalledWith("text-only-mode", false);
      expect(
        document.documentElement.classList.contains("text-only"),
      ).toBe(false);
    });

    it("applies text-only class on mount when stored preference is true", () => {
      mockGetPreference.mockImplementation((key: string) => {
        if (key === "text-only-mode") return true;
        if (key === "font-size") return "default";
        return undefined;
      });
      render(<ReaderSettings />);
      expect(
        document.documentElement.classList.contains("text-only"),
      ).toBe(true);
    });

    it("displays label text from translations", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByText("settings.textOnly")).toBeInTheDocument();
      expect(
        screen.getByText("settings.textOnlyDescription"),
      ).toBeInTheDocument();
    });
  });

  // ── Font size selector ────────────────────────────────────────

  describe("font size selector", () => {
    it("renders three font size buttons", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByText("settings.fontDefault")).toBeInTheDocument();
      expect(screen.getByText("settings.fontLarge")).toBeInTheDocument();
      expect(screen.getByText("settings.fontLarger")).toBeInTheDocument();
    });

    it('default button has aria-pressed="true" initially', () => {
      render(<ReaderSettings />);
      openPopover();
      const defaultBtn = screen.getByText("settings.fontDefault");
      expect(defaultBtn).toHaveAttribute("aria-pressed", "true");
    });

    it('non-active buttons have aria-pressed="false"', () => {
      render(<ReaderSettings />);
      openPopover();
      const largeBtn = screen.getByText("settings.fontLarge");
      const largerBtn = screen.getByText("settings.fontLarger");
      expect(largeBtn).toHaveAttribute("aria-pressed", "false");
      expect(largerBtn).toHaveAttribute("aria-pressed", "false");
    });

    it('clicking large sets its aria-pressed to "true"', () => {
      render(<ReaderSettings />);
      openPopover();
      const largeBtn = screen.getByText("settings.fontLarge");
      act(() => {
        fireEvent.click(largeBtn);
      });
      expect(largeBtn).toHaveAttribute("aria-pressed", "true");
      // Default should now be false
      const defaultBtn = screen.getByText("settings.fontDefault");
      expect(defaultBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("adds font-large class to documentElement when large is selected", () => {
      render(<ReaderSettings />);
      openPopover();
      const largeBtn = screen.getByText("settings.fontLarge");
      act(() => {
        fireEvent.click(largeBtn);
      });
      expect(
        document.documentElement.classList.contains("font-large"),
      ).toBe(true);
    });

    it("adds font-larger class to documentElement when larger is selected", () => {
      render(<ReaderSettings />);
      openPopover();
      const largerBtn = screen.getByText("settings.fontLarger");
      act(() => {
        fireEvent.click(largerBtn);
      });
      expect(
        document.documentElement.classList.contains("font-larger"),
      ).toBe(true);
    });

    it("removes previous font class when switching sizes", () => {
      render(<ReaderSettings />);
      openPopover();
      // Select large first
      const largeBtn = screen.getByText("settings.fontLarge");
      act(() => {
        fireEvent.click(largeBtn);
      });
      expect(
        document.documentElement.classList.contains("font-large"),
      ).toBe(true);
      // Switch to larger
      const largerBtn = screen.getByText("settings.fontLarger");
      act(() => {
        fireEvent.click(largerBtn);
      });
      expect(
        document.documentElement.classList.contains("font-large"),
      ).toBe(false);
      expect(
        document.documentElement.classList.contains("font-larger"),
      ).toBe(true);
    });

    it("removes all font classes when default is selected", () => {
      render(<ReaderSettings />);
      openPopover();
      // Select larger
      const largerBtn = screen.getByText("settings.fontLarger");
      act(() => {
        fireEvent.click(largerBtn);
      });
      // Switch back to default
      const defaultBtn = screen.getByText("settings.fontDefault");
      act(() => {
        fireEvent.click(defaultBtn);
      });
      expect(
        document.documentElement.classList.contains("font-large"),
      ).toBe(false);
      expect(
        document.documentElement.classList.contains("font-larger"),
      ).toBe(false);
    });

    it("calls setPreference with font size value", () => {
      render(<ReaderSettings />);
      openPopover();
      const largeBtn = screen.getByText("settings.fontLarge");
      act(() => {
        fireEvent.click(largeBtn);
      });
      expect(mockSetPreference).toHaveBeenCalledWith("font-size", "large");
    });

    it("applies stored font size class on mount", () => {
      mockGetPreference.mockImplementation((key: string) => {
        if (key === "text-only-mode") return false;
        if (key === "font-size") return "larger";
        return undefined;
      });
      render(<ReaderSettings />);
      expect(
        document.documentElement.classList.contains("font-larger"),
      ).toBe(true);
    });

    it("font size buttons meet 44px minimum touch target", () => {
      render(<ReaderSettings />);
      openPopover();
      const buttons = [
        screen.getByText("settings.fontDefault"),
        screen.getByText("settings.fontLarge"),
        screen.getByText("settings.fontLarger"),
      ];
      for (const btn of buttons) {
        expect(btn.className).toContain("min-h-[44px]");
      }
    });
  });

  // ── Language selector ─────────────────────────────────────────

  describe("language selector", () => {
    it("renders a select element with locale options", () => {
      render(<ReaderSettings />);
      openPopover();
      const select = screen.getByRole("combobox");
      expect(select.tagName).toBe("SELECT");
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent("English");
      expect(options[1]).toHaveTextContent("Español");
    });

    it("has the current locale selected", () => {
      render(<ReaderSettings />);
      openPopover();
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("en");
    });

    it("has a label from translations", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByText("settings.language")).toBeInTheDocument();
    });

    it("calls router.replace when selection changes", () => {
      render(<ReaderSettings />);
      openPopover();
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "es" } });
      expect(mockReplace).toHaveBeenCalledWith("/search", { locale: "es" });
    });
  });

  // ── Escape key ────────────────────────────────────────────────

  describe("Escape key", () => {
    it("closes the popover", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("returns focus to trigger button", () => {
      render(<ReaderSettings />);
      const trigger = openPopover();
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(document.activeElement).toBe(trigger);
    });

    it("sets aria-expanded back to false", () => {
      render(<ReaderSettings />);
      openPopover();
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      const trigger = screen.getByLabelText("settings.label");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ── Click outside ─────────────────────────────────────────────

  describe("click outside", () => {
    it("closes the popover when clicking outside", () => {
      render(<ReaderSettings />);
      openPopover();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      act(() => {
        fireEvent.mouseDown(document.body);
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not close when clicking inside the panel", () => {
      render(<ReaderSettings />);
      openPopover();
      const panel = screen.getByRole("dialog");
      act(() => {
        fireEvent.mouseDown(panel);
      });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  // ── Focus management ──────────────────────────────────────────

  describe("focus management", () => {
    it("re-opening after Escape allows interaction", () => {
      render(<ReaderSettings />);
      openPopover();
      // Close with Escape
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      // Re-open
      openPopover();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Verify the switch is still interactive
      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });
  });

  // ── Fieldset semantics ────────────────────────────────────────

  describe("fieldset semantics", () => {
    it("wraps font size options in a fieldset with legend", () => {
      render(<ReaderSettings />);
      openPopover();
      const panel = screen.getByRole("dialog");
      const fieldset = panel.querySelector("fieldset");
      expect(fieldset).toBeInTheDocument();
      const legend = panel.querySelector("legend");
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveTextContent("settings.fontSize");
    });
  });
});
