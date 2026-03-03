/**
 * Tests for search page — curated suggestions and empty state.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      heading: "Search the Teachings",
      subtitle: "Verbatim passages from Paramahansa Yogananda's published works",
      placeholder: "What did Yogananda say about...",
      button: "Search",
      loading: "...",
      noResults: "No passages found.",
      language: "Language",
      suggestionsHeading: "Explore the teachings",
      suggestionsSubtitle: "Not sure where to begin? Try one of these doorways:",
      readInContext: "Read in context",
      recentSearches: "Your recent searches",
      clearRecent: "Clear",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock SearchCombobox (heavy component with its own tests)
vi.mock("@/app/components/SearchCombobox", () => ({
  SearchCombobox: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="search-input"
    />
  ),
}));

// Mock HighlightedText
vi.mock("@/app/components/HighlightedText", () => ({
  HighlightedText: ({ text }: { text: string }) => <span>{text}</span>,
}));

// Mock resonance-beacon
vi.mock("@/lib/resonance-beacon", () => ({
  sendResonance: vi.fn(),
}));

// Mock srf-links
vi.mock("@/lib/config/srf-links", () => ({
  PORTAL: { canonical: "https://teachings.yogananda.org" },
}));

// Mock i18n config
vi.mock("@/i18n/config", () => ({
  locales: ["en", "es"],
  localeNames: { en: "English", es: "Español" } as Record<string, string>,
}));

// Mock search-history
const mockGetRecentSearches = vi.fn().mockReturnValue([]);
const mockAddRecentSearch = vi.fn();
const mockClearRecentSearches = vi.fn();
vi.mock("@/lib/search-history", () => ({
  getRecentSearches: () => mockGetRecentSearches(),
  addRecentSearch: (...args: unknown[]) => mockAddRecentSearch(...args),
  clearRecentSearches: () => mockClearRecentSearches(),
}));

import SearchPage from "../page";

describe("SearchPage curated suggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRecentSearches.mockReturnValue([]);
  });

  it("renders curated suggestions in the empty state", () => {
    render(<SearchPage />);

    expect(screen.getByText("Explore the teachings")).toBeInTheDocument();
    expect(
      screen.getByText("Not sure where to begin? Try one of these doorways:"),
    ).toBeInTheDocument();
  });

  it("shows all 8 curated suggestion buttons", () => {
    render(<SearchPage />);

    // English suggestions (default language is "en")
    expect(screen.getByRole("button", { name: "Inner peace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Divine love" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Overcoming fear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cosmic consciousness" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "The soul" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Willpower" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "God-realization" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meditation" })).toBeInTheDocument();
  });

  it("clicking a suggestion triggers a search", async () => {
    // Mock fetch to track calls
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], meta: null, detected: false }),
    });
    global.fetch = fetchMock;

    render(<SearchPage />);

    const innerPeaceBtn = screen.getByRole("button", { name: "Inner peace" });
    fireEvent.click(innerPeaceBtn);

    // After clicking, fetch should have been called (crisis + FTS)
    // Wait a tick for the async doSearch to fire
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Verify the search was triggered with the suggestion text
    const calls = fetchMock.mock.calls.map((c) => c[0] as string);
    const searchCall = calls.find(
      (url) =>
        url.includes("/api/v1/search?") && url.includes("Inner%20peace"),
    );
    expect(searchCall).toBeDefined();
  });

  it("hides suggestions after a search is performed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          meta: { query: "test", mode: "hybrid", language: "en", totalResults: 0, durationMs: 50 },
          detected: false,
        }),
    });
    global.fetch = fetchMock;

    render(<SearchPage />);

    // Suggestions visible initially
    expect(screen.getByText("Explore the teachings")).toBeInTheDocument();

    // Click a suggestion to trigger search
    fireEvent.click(screen.getByRole("button", { name: "Meditation" }));

    // Wait for search to complete — suggestions should disappear
    await vi.waitFor(() => {
      expect(screen.queryByText("Explore the teachings")).not.toBeInTheDocument();
    });
  });
});

describe("SearchPage recent searches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRecentSearches.mockReturnValue([]);
  });

  it("does not show recent searches section when history is empty", () => {
    mockGetRecentSearches.mockReturnValue([]);
    render(<SearchPage />);
    expect(screen.queryByText("Your recent searches")).not.toBeInTheDocument();
  });

  it("shows recent searches when history exists", () => {
    mockGetRecentSearches.mockReturnValue(["inner peace", "meditation"]);
    render(<SearchPage />);
    expect(screen.getByText("Your recent searches")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "inner peace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "meditation" })).toBeInTheDocument();
  });

  it("shows clear button for recent searches", () => {
    mockGetRecentSearches.mockReturnValue(["test query"]);
    render(<SearchPage />);
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("clicking clear removes recent searches", () => {
    mockGetRecentSearches.mockReturnValue(["test query"]);
    render(<SearchPage />);

    fireEvent.click(screen.getByText("Clear"));
    expect(mockClearRecentSearches).toHaveBeenCalled();
  });
});
