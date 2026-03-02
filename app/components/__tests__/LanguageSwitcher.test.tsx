// @vitest-environment jsdom

/**
 * LanguageSwitcher component tests — M2a-21.
 *
 * Verifies select element, aria-label, locale options,
 * and router.replace on change.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────

const mockReplace = vi.fn();

vi.mock("next-intl", () => ({
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

// ── Import after mocks ───────────────────────────────────────────

import { LanguageSwitcher } from "../LanguageSwitcher";

// ── Tests ─────────────────────────────────────────────────────────

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders a <select> element", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox");
    expect(select.tagName).toBe("SELECT");
  });

  it('has aria-label="Language"', () => {
    render(<LanguageSwitcher />);
    const select = screen.getByLabelText("Language");
    expect(select).toBeInTheDocument();
  });

  it("shows locale options (English, Espanol)", () => {
    render(<LanguageSwitcher />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("English");
    expect(options[1]).toHaveTextContent("Español");
  });

  it("has the current locale selected", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByLabelText("Language") as HTMLSelectElement;
    expect(select.value).toBe("en");
  });

  it("calls router.replace when selection changes", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByLabelText("Language");
    fireEvent.change(select, { target: { value: "es" } });
    expect(mockReplace).toHaveBeenCalledWith("/search", { locale: "es" });
  });
});
