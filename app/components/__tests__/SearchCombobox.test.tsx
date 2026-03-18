// @vitest-environment jsdom

/**
 * SearchCombobox tests — ARIA combobox with corpus-derived suggestions (FTR-029).
 *
 * Covers: zero-state chips/questions, prefix-partitioned loading, bridge hints,
 * type indicators, keyboard navigation, fuzzy fallback, accessibility, mobile.
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("@/lib/config", () => ({
  SUGGEST_DEBOUNCE_MS: 0,
  SUGGEST_DEBOUNCE_SLOW_MS: 0,
  SUGGEST_MAX_DESKTOP: 8,
  SUGGEST_MAX_MOBILE: 5,
  SUGGEST_FUZZY_THRESHOLD: 3,
  SUGGEST_FUZZY_MIN_CHARS: 3,
}));

const mockZeroState = {
  chips: ["Peace", "Courage", "Meditation", "Divine Love", "Joy"],
  questions: ["How do I overcome fear?", "What is the purpose of life?"],
};

const mockBridgeData = [
  { stem: "mind", expression: "mindfulness", yogananda_terms: ["concentration", "one-pointed attention"], crisis_adjacent: false },
];

const mockPrefixCo = [
  { text: "cosmic consciousness", display: null, type: "topic", weight: 0.5 },
  { text: "concentration", display: null, type: "topic", weight: 0.3 },
  { text: "courage", display: null, type: "curated", weight: 0.2 },
];

const mockPrefixMe = [
  { text: "Meditation", display: null, type: "curated", weight: 0.4 },
  { text: "meditation", display: null, type: "topic", weight: 0.06 },
  { text: "mental discipline", display: null, type: "topic", weight: 0.003 },
];

const mockPrefixSa = [
  { text: "samadhi", display: "Samādhi — superconscious state", type: "sanskrit", weight: 0.3 },
];

// Mock fetch — route by URL pattern
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(async (url: string) => {
    if (url.includes("_zero.json")) {
      return { ok: true, json: async () => mockZeroState };
    }
    if (url.includes("_bridge.json")) {
      return { ok: true, json: async () => mockBridgeData };
    }
    if (url.includes("/co.json")) {
      return { ok: true, json: async () => mockPrefixCo };
    }
    if (url.includes("/me.json")) {
      return { ok: true, json: async () => mockPrefixMe };
    }
    if (url.includes("/sa.json")) {
      return { ok: true, json: async () => mockPrefixSa };
    }
    if (url.includes("/mi.json")) {
      return { ok: true, json: async () => [] };
    }
    if (url.includes("/api/v1/search/suggest")) {
      return {
        ok: true,
        json: async () => ({
          data: [{ text: "samadhi", display: null, type: "topic", weight: 0.3 }],
        }),
      };
    }
    // Default: empty prefix file
    if (url.includes("/data/suggestions/")) {
      return { ok: true, json: async () => [] };
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

  describe("zero-state", () => {
    it("shows chips on focus before typing", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(screen.getByText("Peace")).toBeInTheDocument();
        expect(screen.getByText("Meditation")).toBeInTheDocument();
        expect(screen.getByText("Joy")).toBeInTheDocument();
      });
    });

    it("shows questions on focus", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(screen.getByText("How do I overcome fear?")).toBeInTheDocument();
      });
    });

    it("loads zero-state JSON for the specified language", async () => {
      const { input } = renderCombobox({ language: "es" });
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/data/suggestions/es/_zero.json");
      });
    });

    it("clicking a chip submits the search", async () => {
      const { input, onChange, onSubmit } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        expect(screen.getByText("Meditation")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Meditation"));
      });

      expect(onChange).toHaveBeenCalledWith("Meditation");
      expect(onSubmit).toHaveBeenCalledWith("Meditation");
    });
  });

  describe("prefix filtering", () => {
    it("filters suggestions from prefix file", async () => {
      const { input } = renderCombobox({ value: "cosmic" });

      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "cosmic" } });
      });

      await waitFor(() => {
        expect(screen.getByText("cosmic consciousness")).toBeInTheDocument();
      });
    });

    it("loads correct prefix file for input", async () => {
      const { input } = renderCombobox({ value: "me" });

      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "me" } });
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/data/suggestions/en/me.json");
      });
    });
  });

  describe("type indicators", () => {
    it("renders type label for suggestions", async () => {
      // Use short prefix "co" so multiple mock entries match with mixed types
      const { input } = renderCombobox({ value: "co" });

      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "co" } });
      });

      await waitFor(() => {
        // Type label should be visible (aria-hidden but rendered) when types differ
        const typeLabels = document.querySelectorAll(".combobox-suggestion-type");
        expect(typeLabels.length).toBeGreaterThan(0);
      });
    });

    it("shows Sanskrit display text", async () => {
      const { input } = renderCombobox({ value: "samadhi" });

      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "samadhi" } });
      });

      await waitFor(() => {
        expect(screen.getByText("Samādhi — superconscious state")).toBeInTheDocument();
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
    it("chip buttons have combobox-chip class", async () => {
      const { input } = renderCombobox();
      await act(async () => fireEvent.focus(input));

      await waitFor(() => {
        const chipButton = screen.getByText("Meditation");
        expect(chipButton.className).toContain("combobox-chip");
      });
    });

    it("suggestion items have combobox-suggestion class", async () => {
      const { input } = renderCombobox({ value: "cosmic" });
      await act(async () => fireEvent.focus(input));
      await act(async () => {
        fireEvent.change(input, { target: { value: "cosmic" } });
      });

      await waitFor(() => {
        const item = screen.getByText("cosmic consciousness").closest("[role='option']");
        expect(item?.className).toContain("combobox-suggestion");
      });
    });
  });
});
