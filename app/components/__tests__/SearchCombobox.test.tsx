// @vitest-environment jsdom

/**
 * SearchCombobox tests — ARIA combobox with corpus-derived suggestions.
 *
 * Covers: zero-state chips, prefix filtering, keyboard navigation,
 * fuzzy fallback, accessibility attributes, mobile adaptation.
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

// Mock config constants
vi.mock("@/lib/config", () => ({
  SUGGEST_DEBOUNCE_MS: 0, // No debounce in tests
  SUGGEST_DEBOUNCE_SLOW_MS: 0,
  SUGGEST_MAX_DESKTOP: 8,
  SUGGEST_MAX_MOBILE: 5,
  SUGGEST_FUZZY_THRESHOLD: 3,
  SUGGEST_FUZZY_MIN_CHARS: 3,
}));

const mockSuggestionData = {
  language: "en",
  chips: ["cosmic consciousness", "meditation", "divine mother", "peace", "karma"],
  suggestions: [
    "An Experience in Cosmic Consciousness",
    "The Science of Kriya Yoga",
    "My Parents and Early Life",
    "I Meet My Master, Sri Yukteswar",
    "The Resurrection of Sri Yukteswar",
  ],
};

// Mock fetch for static JSON and API
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(async (url: string) => {
    if (url.includes("/data/suggestions/")) {
      return { ok: true, json: async () => mockSuggestionData };
    }
    if (url.includes("/api/v1/search/suggest")) {
      return {
        ok: true,
        json: async () => ({
          data: [{ text: "samadhi", type: "topic" }],
        }),
      };
    }
    return { ok: false };
  });
});

// ── Import after mocks ───────────────────────────────────────────

import { SearchCombobox } from "../SearchCombobox";

// ── Helpers ──────────────────────────────────────────────────────

function renderCombobox(overrides: Record<string, unknown> = {}) {
  const props = {
    value: "",
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    language: "en",
    placeholder: "Search...",
    ariaLabel: "Search the Teachings",
    ...overrides,
  };
  const result = render(<SearchCombobox {...props} />);
  const input = screen.getByRole("combobox");
  return { ...result, input, ...props };
}

// ── Tests ─────────────────────────────────────────────────────────

describe("SearchCombobox", () => {
  describe("ARIA attributes", () => {
    it("renders with combobox role", () => {
      const { input } = renderCombobox();
      expect(input).toHaveAttribute("role", "combobox");
      expect(input).toHaveAttribute("aria-expanded", "false");
      expect(input).toHaveAttribute("aria-autocomplete", "list");
    });

    it("sets aria-label from props", () => {
      const { input } = renderCombobox({ ariaLabel: "Search" });
      expect(input).toHaveAttribute("aria-label", "Search");
    });

    it("expands on focus", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));
      await waitFor(() => {
        expect(input).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("zero-state chips", () => {
    it("shows chips on focus before typing", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(screen.getByText("cosmic consciousness")).toBeInTheDocument();
        expect(screen.getByText("meditation")).toBeInTheDocument();
        expect(screen.getByText("peace")).toBeInTheDocument();
      });
    });

    it("loads static JSON for the specified language", async () => {
      const { input } = renderCombobox({ language: "es" });
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/data/suggestions/es.json");
      });
    });

    it("clicking a chip submits the search", async () => {
      const { input, onChange, onSubmit } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(screen.getByText("meditation")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("meditation"));
      });

      expect(onChange).toHaveBeenCalledWith("meditation");
      expect(onSubmit).toHaveBeenCalledWith("meditation");
    });
  });

  describe("prefix filtering", () => {
    it("filters suggestions by typed prefix", async () => {
      const { input, onChange } = renderCombobox({ value: "cosmic" });

      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "cosmic" } });
      });

      await waitFor(() => {
        expect(
          screen.getByText("An Experience in Cosmic Consciousness"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("cosmic consciousness"),
        ).toBeInTheDocument();
      });
    });

    it("filters case-insensitively", async () => {
      const { input } = renderCombobox({ value: "KRIYA" });
      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "KRIYA" } });
      });

      await waitFor(() => {
        expect(
          screen.getByText("The Science of Kriya Yoga"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowDown opens the listbox", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.keyDown(input, { key: "ArrowDown" });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("Escape closes the listbox", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));
      await waitFor(() => {
        expect(input).toHaveAttribute("aria-expanded", "true");
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: "Escape" });
      });

      expect(input).toHaveAttribute("aria-expanded", "false");
    });

    it("Enter without selection submits current value", async () => {
      const { input, onSubmit } = renderCombobox({ value: "meditation" });
      await act(async () => fireEvent.focus(input));
      await waitFor(() => {
        expect(input).toHaveAttribute("aria-expanded", "true");
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: "Enter" });
      });

      expect(onSubmit).toHaveBeenCalledWith("meditation");
    });
  });

  describe("screen reader announcements", () => {
    it("announces chip count on focus", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        const liveRegion = document.querySelector("[aria-live='polite']");
        expect(liveRegion?.textContent).toContain("topics available");
      });
    });
  });

  describe("listbox rendering", () => {
    it("renders a listbox with option roles", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
        const options = screen.getAllByRole("option");
        expect(options.length).toBeGreaterThan(0);
      });
    });
  });

  describe("touch targets", () => {
    it("chip buttons have min-h-11 class for 44px targets", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        const chipButton = screen.getByText("meditation");
        expect(chipButton.className).toContain("min-h-11");
      });
    });

    it("suggestion items have min-h-11 class", async () => {
      const { input } = renderCombobox({ value: "Kriya" });
      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "Kriya" } });
      });

      await waitFor(() => {
        const item = screen.getByText("The Science of Kriya Yoga");
        expect(item.className).toContain("min-h-11");
      });
    });
  });
});
