/**
 * Tests for LowBandwidthBanner — M2b-16.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LowBandwidthBanner } from "../LowBandwidthBanner";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const strings: Record<string, string> = {
      message: "Slow connection detected.",
      enableTextOnly: "Enable text-only mode",
      dismiss: "Dismiss",
    };
    return strings[key] || key;
  },
}));

// Mock preferences service
vi.mock("@/lib/services/preferences", () => ({
  getPreference: vi.fn(() => false),
  setPreference: vi.fn(),
}));

const DISMISSED_KEY = "srf-lowbw-dismissed";

function mockConnection(effectiveType: string | undefined) {
  Object.defineProperty(navigator, "connection", {
    value: effectiveType ? { effectiveType } : undefined,
    writable: true,
    configurable: true,
  });
}

describe("LowBandwidthBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    mockConnection(undefined);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("shows banner on 2G connection", () => {
    mockConnection("2g");
    render(<LowBandwidthBanner />);
    expect(screen.getByText("Slow connection detected.")).toBeDefined();
  });

  it("shows banner on slow-2g connection", () => {
    mockConnection("slow-2g");
    render(<LowBandwidthBanner />);
    expect(screen.getByText("Slow connection detected.")).toBeDefined();
  });

  it("does not show banner on 4G connection", () => {
    mockConnection("4g");
    render(<LowBandwidthBanner />);
    expect(screen.queryByText("Slow connection detected.")).toBeNull();
  });

  it("does not show banner on 3G connection", () => {
    mockConnection("3g");
    render(<LowBandwidthBanner />);
    expect(screen.queryByText("Slow connection detected.")).toBeNull();
  });

  it("persists dismiss to localStorage with timestamp", () => {
    mockConnection("2g");
    render(<LowBandwidthBanner />);

    const dismissBtn = screen.getByLabelText("Dismiss");
    fireEvent.click(dismissBtn);

    const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY)!);
    expect(stored.dismissed).toBe(true);
    expect(typeof stored.timestamp).toBe("number");
  });

  it("stays hidden within 30-day expiry window", () => {
    localStorage.setItem(
      DISMISSED_KEY,
      JSON.stringify({
        dismissed: true,
        timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
      }),
    );

    mockConnection("2g");
    render(<LowBandwidthBanner />);
    expect(screen.queryByText("Slow connection detected.")).toBeNull();
  });

  it("re-shows after 30-day expiry", () => {
    localStorage.setItem(
      DISMISSED_KEY,
      JSON.stringify({
        dismissed: true,
        timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000,
      }),
    );

    mockConnection("2g");
    render(<LowBandwidthBanner />);
    expect(screen.getByText("Slow connection detected.")).toBeDefined();
  });

  it("enables text-only mode on button click", async () => {
    mockConnection("2g");
    const { setPreference } = await import("@/lib/services/preferences");
    render(<LowBandwidthBanner />);

    const enableBtn = screen.getByText("Enable text-only mode");
    fireEvent.click(enableBtn);

    expect(setPreference).toHaveBeenCalledWith("text-only-mode", true);
  });

  it("hidden when text-only already active", async () => {
    const prefs = await import("@/lib/services/preferences");
    vi.mocked(prefs.getPreference).mockReturnValue(true as never);

    mockConnection("2g");
    render(<LowBandwidthBanner />);
    expect(screen.queryByText("Slow connection detected.")).toBeNull();

    vi.mocked(prefs.getPreference).mockReturnValue(false as never);
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem(DISMISSED_KEY, "not-json{{{");
    mockConnection("2g");
    render(<LowBandwidthBanner />);
    expect(screen.getByText("Slow connection detected.")).toBeDefined();
  });

  it("renders i18n-translated text", () => {
    mockConnection("2g");
    render(<LowBandwidthBanner />);
    expect(screen.getByText("Slow connection detected.")).toBeDefined();
    expect(screen.getByText("Enable text-only mode")).toBeDefined();
    expect(screen.getByLabelText("Dismiss")).toBeDefined();
  });
});
