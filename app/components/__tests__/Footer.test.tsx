// @vitest-environment jsdom

/**
 * Footer component tests — M2a-21.
 *
 * Verifies internal links, external SRF links, accessibility attributes,
 * and copyright text.
 */

import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

vi.mock("@/i18n/navigation", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, href, ...props }: Record<string, any>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/en",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/services/preferences", () => ({
  getPreference: vi.fn(() => false),
  setPreference: vi.fn(),
}));

// ── Import after mocks ───────────────────────────────────────────

import { Footer } from "../Footer";

// ── Tests ─────────────────────────────────────────────────────────

describe("Footer", () => {
  it("renders two <nav> elements with distinct aria-labels", () => {
    render(<Footer />);
    const navs = screen.getAllByRole("navigation");
    expect(navs).toHaveLength(2);
    const labels = navs.map((n) => n.getAttribute("aria-label"));
    expect(labels).toContain("a11y.footerNavigation");
    expect(labels).toContain("a11y.srfEcosystem");
  });

  it("renders internal navigation links", () => {
    render(<Footer />);
    const footerNav = screen.getByRole("navigation", {
      name: "a11y.footerNavigation",
    });

    expect(within(footerNav).getByText("nav.home")).toBeInTheDocument();
    expect(within(footerNav).getByText("nav.books")).toBeInTheDocument();
    expect(within(footerNav).getByText("nav.search")).toBeInTheDocument();
    expect(within(footerNav).getByText("nav.quiet")).toBeInTheDocument();
    expect(within(footerNav).getByText("footer.browseAll")).toBeInTheDocument();
    expect(within(footerNav).getByText("nav.privacy")).toBeInTheDocument();
    expect(within(footerNav).getByText("nav.legal")).toBeInTheDocument();
  });

  it("renders external SRF links", () => {
    render(<Footer />);
    const srfNav = screen.getByRole("navigation", {
      name: "a11y.srfEcosystem",
    });

    expect(
      within(srfNav).getByText("footer.yoganandaOrg"),
    ).toBeInTheDocument();
    expect(within(srfNav).getByText("footer.lessons")).toBeInTheDocument();
    expect(within(srfNav).getByText("footer.bookstore")).toBeInTheDocument();
    expect(within(srfNav).getByText("YouTube")).toBeInTheDocument();
  });

  it("external links have target='_blank' and rel='noopener noreferrer'", () => {
    render(<Footer />);
    const srfNav = screen.getByRole("navigation", {
      name: "a11y.srfEcosystem",
    });
    const externalLinks = within(srfNav).getAllByRole("link");

    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("external links point to correct URLs", () => {
    render(<Footer />);
    const srfNav = screen.getByRole("navigation", {
      name: "a11y.srfEcosystem",
    });

    const yoganandaLink = within(srfNav).getByText("footer.yoganandaOrg");
    expect(yoganandaLink).toHaveAttribute("href", "https://yogananda.org");

    const lessonsLink = within(srfNav).getByText("footer.lessons");
    expect(lessonsLink).toHaveAttribute(
      "href",
      "https://yogananda.org/lessons",
    );

    const bookstoreLink = within(srfNav).getByText("footer.bookstore");
    expect(bookstoreLink).toHaveAttribute(
      "href",
      "https://bookstore.yogananda-srf.org",
    );

    const youtubeLink = within(srfNav).getByText("YouTube");
    expect(youtubeLink).toHaveAttribute(
      "href",
      "https://www.youtube.com/@YoganandaSRF",
    );
  });

  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText("footer.copyright")).toBeInTheDocument();
  });

  // TextOnlyToggle moved to ReaderSettings popover in Header (M2a-11)
});
