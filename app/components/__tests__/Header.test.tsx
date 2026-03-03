// @vitest-environment jsdom

/**
 * Header component tests — M2a-21.
 *
 * Verifies navigation structure, aria labels, active link styling,
 * touch targets, lotus home link, and ReaderSettings presence.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

let mockPathname = "/en/search";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
  useLocale: () => "en",
}));

vi.mock("@/lib/services/preferences", () => ({
  getPreference: vi.fn(() => false),
  setPreference: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, href, ...props }: Record<string, any>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => mockPathname,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/i18n/config", () => ({
  locales: ["en", "es"] as const,
  localeNames: { en: "English", es: "Español" },
}));

// ── Import after mocks ───────────────────────────────────────────

import { Header } from "../Header";

// ── Tests ─────────────────────────────────────────────────────────

describe("Header", () => {
  beforeEach(() => {
    mockPathname = "/en/search";
  });

  it("renders a <nav> element with aria-label from a11y translations", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "a11y.mainNavigation");
  });

  it("renders all four navigation items", () => {
    render(<Header />);
    expect(screen.getByText("nav.search")).toBeInTheDocument();
    expect(screen.getByText("nav.books")).toBeInTheDocument();
    expect(screen.getByText("nav.quiet")).toBeInTheDocument();
    expect(screen.getByText("nav.about")).toBeInTheDocument();
  });

  it("renders home link with lotus SVG", () => {
    render(<Header />);
    const homeLink = screen.getByRole("link", { name: "nav.home" });
    expect(homeLink).toHaveAttribute("href", "/");
    // Lotus SVG should be present inside the home link
    const svg = homeLink.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("applies active styling to the current pathname link", () => {
    mockPathname = "/en/search";
    render(<Header />);
    const searchLink = screen.getByText("nav.search").closest("a");
    expect(searchLink?.className).toContain("font-medium");
  });

  it("applies inactive styling to non-active links", () => {
    mockPathname = "/en/search";
    render(<Header />);
    const booksLink = screen.getByText("nav.books").closest("a");
    expect(booksLink?.className).toContain("text-srf-navy/60");
    expect(booksLink?.className).not.toContain("font-medium");
  });

  it("sets aria-current=page on active link and omits it on inactive links", () => {
    mockPathname = "/en/search";
    render(<Header />);
    const searchLink = screen.getByText("nav.search").closest("a");
    expect(searchLink).toHaveAttribute("aria-current", "page");
    const booksLink = screen.getByText("nav.books").closest("a");
    expect(booksLink).not.toHaveAttribute("aria-current");
  });

  it("all navigation links have min-h-11 for touch targets", () => {
    render(<Header />);
    const navLinks = ["nav.search", "nav.books", "nav.library", "nav.quiet", "nav.about"];
    for (const label of navLinks) {
      const link = screen.getByText(label).closest("a");
      expect(link?.className).toContain("min-h-11");
    }
  });

  it("renders the ReaderSettings button", () => {
    render(<Header />);
    // ReaderSettings renders a button with aria-label from settings.label
    const settingsButton = screen.getByLabelText("settings.label");
    expect(settingsButton).toBeInTheDocument();
  });
});
