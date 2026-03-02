/**
 * Reader preference persistence tests — M2a-11.
 *
 * Tests the framework-agnostic preferences service (PRI-10).
 * Verifies localStorage interaction, legacy migration, validation,
 * subscription, and SSR safety.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadPreferences,
  getPreference,
  setPreference,
  subscribe,
  resetPreferences,
  getDefaults,
} from "@/lib/services/preferences";

// ── Setup ────────────────────────────────────────────────────────

const STORAGE_KEY = "srf-reader-prefs";
const LEGACY_KEY = "srf-text-only";

beforeEach(() => {
  localStorage.clear();
});

// ── Defaults ─────────────────────────────────────────────────────

describe("defaults", () => {
  it("returns defaults when no stored preferences exist", () => {
    const prefs = loadPreferences();
    expect(prefs).toEqual({
      "text-only-mode": false,
      "font-size": "default",
      "reading-language": "en",
      "focus-mode": false,
      "color-theme": "auto",
      "line-spacing": "default",
    });
  });

  it("getDefaults returns a copy of defaults", () => {
    const defaults = getDefaults();
    expect(defaults).toEqual({
      "text-only-mode": false,
      "font-size": "default",
      "reading-language": "en",
      "focus-mode": false,
      "color-theme": "auto",
      "line-spacing": "default",
    });
  });

  it("getPreference returns default for unset key", () => {
    expect(getPreference("text-only-mode")).toBe(false);
    expect(getPreference("font-size")).toBe("default");
    expect(getPreference("reading-language")).toBe("en");
  });
});

// ── Get / Set ────────────────────────────────────────────────────

describe("get and set", () => {
  it("persists a boolean preference", () => {
    setPreference("text-only-mode", true);
    expect(getPreference("text-only-mode")).toBe(true);

    // Verify it is actually in localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed["text-only-mode"]).toBe(true);
  });

  it("persists a font-size preference", () => {
    setPreference("font-size", "large");
    expect(getPreference("font-size")).toBe("large");

    setPreference("font-size", "larger");
    expect(getPreference("font-size")).toBe("larger");
  });

  it("persists a reading-language preference", () => {
    setPreference("reading-language", "es");
    expect(getPreference("reading-language")).toBe("es");
  });

  it("preserves other preferences when setting one", () => {
    setPreference("text-only-mode", true);
    setPreference("font-size", "large");

    expect(getPreference("text-only-mode")).toBe(true);
    expect(getPreference("font-size")).toBe("large");
  });
});

// ── Validation ───────────────────────────────────────────────────

describe("validation", () => {
  it("rejects invalid font-size and falls back to default", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "font-size": "huge" }),
    );
    expect(getPreference("font-size")).toBe("default");
  });

  it("rejects non-boolean text-only-mode and falls back to default", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "text-only-mode": "yes" }),
    );
    expect(getPreference("text-only-mode")).toBe(false);
  });

  it("rejects invalid language codes and falls back to default", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "reading-language": "x" }),
    );
    expect(getPreference("reading-language")).toBe("en");
  });

  it("rejects too-long language codes and falls back to default", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "reading-language": "a".repeat(11) }),
    );
    expect(getPreference("reading-language")).toBe("en");
  });

  it("handles corrupt JSON gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{{{");
    const prefs = loadPreferences();
    expect(prefs).toEqual(getDefaults());
    // Corrupt data should be replaced with valid JSON
    const repaired = localStorage.getItem(STORAGE_KEY);
    expect(() => JSON.parse(repaired!)).not.toThrow();
  });

  it("drops unknown keys during load", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        "text-only-mode": true,
        "font-size": "large",
        "reading-language": "es",
        "unknown-key": "unexpected",
      }),
    );
    const prefs = loadPreferences();
    expect(prefs).toEqual({
      "text-only-mode": true,
      "font-size": "large",
      "reading-language": "es",
      "focus-mode": false,
      "color-theme": "auto",
      "line-spacing": "default",
    });
    expect((prefs as Record<string, unknown>)["unknown-key"]).toBeUndefined();
  });
});

// ── Legacy migration ─────────────────────────────────────────────

describe("legacy migration", () => {
  it("migrates legacy srf-text-only=true to text-only-mode", () => {
    localStorage.setItem(LEGACY_KEY, "true");

    const prefs = loadPreferences();
    expect(prefs["text-only-mode"]).toBe(true);

    // Legacy key should be removed
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();

    // New key should exist
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("migrates legacy srf-text-only=false to defaults", () => {
    localStorage.setItem(LEGACY_KEY, "false");

    const prefs = loadPreferences();
    expect(prefs["text-only-mode"]).toBe(false);

    // Legacy key should be removed
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("merges legacy key with existing preferences", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        "text-only-mode": false,
        "font-size": "large",
        "reading-language": "es",
      }),
    );
    localStorage.setItem(LEGACY_KEY, "true");

    const prefs = loadPreferences();
    // Legacy overrides stored value
    expect(prefs["text-only-mode"]).toBe(true);
    // Other preferences preserved
    expect(prefs["font-size"]).toBe("large");
    expect(prefs["reading-language"]).toBe("es");

    // Legacy key removed
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("does nothing when no legacy key exists", () => {
    const prefs = loadPreferences();
    expect(prefs).toEqual(getDefaults());
    // No spurious writes
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

// ── Subscription ─────────────────────────────────────────────────

describe("subscribe", () => {
  it("notifies listeners on setPreference", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    setPreference("text-only-mode", true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ "text-only-mode": true }),
    );

    unsubscribe();
  });

  it("notifies listeners on resetPreferences", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    setPreference("text-only-mode", true);
    listener.mockClear();

    resetPreferences();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ "text-only-mode": false }),
    );

    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    setPreference("text-only-mode", true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    setPreference("text-only-mode", false);
    expect(listener).toHaveBeenCalledTimes(1); // No additional call
  });

  it("supports multiple concurrent subscribers", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const unsub1 = subscribe(listener1);
    const unsub2 = subscribe(listener2);

    setPreference("font-size", "large");

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });
});

// ── Reset ────────────────────────────────────────────────────────

describe("reset", () => {
  it("resets all preferences to defaults", () => {
    setPreference("text-only-mode", true);
    setPreference("font-size", "larger");
    setPreference("reading-language", "es");

    resetPreferences();

    expect(loadPreferences()).toEqual(getDefaults());
  });

  it("persists the reset to localStorage", () => {
    setPreference("text-only-mode", true);
    resetPreferences();

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed["text-only-mode"]).toBe(false);
  });
});
