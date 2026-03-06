/**
 * Reader preference persistence — M2a-11 (PRI-09, PRI-10).
 *
 * Framework-agnostic service (PRI-10: zero framework imports).
 * Manages reader preferences in a single localStorage key.
 * SSR-safe — all reads/writes check for browser environment.
 *
 * DELTA-compliant (PRI-09): preferences stay on-device in localStorage.
 * No server sync, no analytics, no behavioral profiling.
 *
 * Migrates the legacy `srf-text-only` key into the unified store
 * on first read, then removes it.
 */

// ── Types ────────────────────────────────────────────────────────

export type FontSize = "default" | "large" | "larger";
export type ColorTheme = "auto" | "light" | "sepia" | "earth" | "dark" | "meditate";
export type LineSpacing = "default" | "relaxed" | "spacious";

export interface ReaderPreferences {
  /** Text-only mode: hides images, decorative elements, web fonts. */
  "text-only-mode": boolean;
  /** Font size preference for reading content. */
  "font-size": FontSize;
  /** Preferred reading language (locale code, e.g. 'en', 'es'). */
  "reading-language": string;
  /** Immerse reading mode: hides chrome, scales text to viewport (FTR-041 §2). */
  "immerse-mode": boolean;
  /** Color theme: auto follows system prefers-color-scheme. */
  "color-theme": ColorTheme;
  /** Line spacing preference for reading content. */
  "line-spacing": LineSpacing;
}

export type PreferenceKey = keyof ReaderPreferences;

type Listener = (prefs: Readonly<ReaderPreferences>) => void;

// ── Constants ────────────────────────────────────────────────────

const STORAGE_KEY = "srf-reader-prefs";
const LEGACY_TEXT_ONLY_KEY = "srf-text-only";

const DEFAULTS: Readonly<ReaderPreferences> = {
  "text-only-mode": false,
  "font-size": "default",
  "reading-language": "en",
  "immerse-mode": false,
  "color-theme": "auto",
  "line-spacing": "default",
};

const VALID_FONT_SIZES: readonly FontSize[] = [
  "default",
  "large",
  "larger",
] as const;

const VALID_COLOR_THEMES: readonly ColorTheme[] = [
  "auto",
  "light",
  "sepia",
  "earth",
  "dark",
  "meditate",
] as const;

const VALID_LINE_SPACINGS: readonly LineSpacing[] = [
  "default",
  "relaxed",
  "spacious",
] as const;

// ── SSR guard ────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── Validation ───────────────────────────────────────────────────

function isValidFontSize(value: unknown): value is FontSize {
  return (
    typeof value === "string" &&
    VALID_FONT_SIZES.includes(value as FontSize)
  );
}

function isValidColorTheme(value: unknown): value is ColorTheme {
  return (
    typeof value === "string" &&
    VALID_COLOR_THEMES.includes(value as ColorTheme)
  );
}

function isValidLineSpacing(value: unknown): value is LineSpacing {
  return (
    typeof value === "string" &&
    VALID_LINE_SPACINGS.includes(value as LineSpacing)
  );
}

function isValidLanguage(value: unknown): value is string {
  return typeof value === "string" && value.length >= 2 && value.length <= 10;
}

/**
 * Migrates legacy preference keys to their current names.
 * Called before sanitize to ensure old keys map to new ones.
 */
function migrateKeys(raw: Record<string, unknown>): Record<string, unknown> {
  // focus-mode → immerse-mode (FTR-041)
  if ("focus-mode" in raw && !("immerse-mode" in raw)) {
    raw["immerse-mode"] = raw["focus-mode"];
    delete raw["focus-mode"];
  }
  return raw;
}

/**
 * Validates and sanitizes a raw parsed object into safe ReaderPreferences.
 * Unknown keys are dropped. Invalid values revert to defaults.
 */
function sanitize(raw: Record<string, unknown>): ReaderPreferences {
  raw = migrateKeys(raw);
  return {
    "text-only-mode":
      typeof raw["text-only-mode"] === "boolean"
        ? raw["text-only-mode"]
        : DEFAULTS["text-only-mode"],
    "font-size": isValidFontSize(raw["font-size"])
      ? raw["font-size"]
      : DEFAULTS["font-size"],
    "reading-language": isValidLanguage(raw["reading-language"])
      ? raw["reading-language"]
      : DEFAULTS["reading-language"],
    "immerse-mode":
      typeof raw["immerse-mode"] === "boolean"
        ? raw["immerse-mode"]
        : DEFAULTS["immerse-mode"],
    "color-theme": isValidColorTheme(raw["color-theme"])
      ? raw["color-theme"]
      : DEFAULTS["color-theme"],
    "line-spacing": isValidLineSpacing(raw["line-spacing"])
      ? raw["line-spacing"]
      : DEFAULTS["line-spacing"],
  };
}

// ── Legacy migration ─────────────────────────────────────────────

/**
 * Migrates the legacy `srf-text-only` localStorage key into the
 * unified preferences object. Called once during load().
 * Removes the legacy key after migration.
 */
function migrateLegacyKey(): Partial<ReaderPreferences> {
  if (!isBrowser()) return {};

  const legacy = localStorage.getItem(LEGACY_TEXT_ONLY_KEY);
  if (legacy === null) return {};

  const migrated: Partial<ReaderPreferences> = {};
  if (legacy === "true") {
    migrated["text-only-mode"] = true;
  }

  localStorage.removeItem(LEGACY_TEXT_ONLY_KEY);
  return migrated;
}

// ── Core service ─────────────────────────────────────────────────

const listeners: Set<Listener> = new Set();

/**
 * Load preferences from localStorage.
 * Returns defaults if no stored preferences exist or if running on the server.
 * Migrates legacy keys on first read.
 */
export function loadPreferences(): Readonly<ReaderPreferences> {
  if (!isBrowser()) return { ...DEFAULTS };

  // Migrate legacy key if present
  const legacy = migrateLegacyKey();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    if (Object.keys(legacy).length > 0) {
      // Legacy data existed — persist migrated values
      const migrated = sanitize({ ...DEFAULTS, ...legacy });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return { ...DEFAULTS };
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Merge legacy on top of stored — legacy takes priority during migration
    const merged = Object.keys(legacy).length > 0
      ? { ...parsed, ...legacy }
      : parsed;
    const prefs = sanitize(merged);
    // Re-persist if legacy migration modified values
    if (Object.keys(legacy).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
    return prefs;
  } catch {
    // Corrupt JSON — reset to defaults (with legacy if present)
    const fallback = sanitize({ ...DEFAULTS, ...legacy });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

/**
 * Get a single preference value.
 * Returns the default if no stored value or if running on the server.
 */
export function getPreference<K extends PreferenceKey>(
  key: K,
): ReaderPreferences[K] {
  return loadPreferences()[key];
}

/**
 * Set a single preference value.
 * No-op on the server. Notifies all subscribers after update.
 */
export function setPreference<K extends PreferenceKey>(
  key: K,
  value: ReaderPreferences[K],
): void {
  if (!isBrowser()) return;

  const current = loadPreferences();
  const updated: ReaderPreferences = { ...current, [key]: value };
  const safe = sanitize(updated as unknown as Record<string, unknown>);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  notify(safe);
}

/**
 * Subscribe to preference changes. Returns an unsubscribe function.
 * Callback receives the full preferences object on every change.
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reset all preferences to defaults.
 * No-op on the server. Notifies all subscribers.
 */
export function resetPreferences(): void {
  if (!isBrowser()) return;

  const defaults = { ...DEFAULTS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  notify(defaults);
}

/**
 * Returns a copy of the default preferences.
 * Useful for components that need to know the baseline.
 */
export function getDefaults(): Readonly<ReaderPreferences> {
  return { ...DEFAULTS };
}

// ── Internal ─────────────────────────────────────────────────────

function notify(prefs: Readonly<ReaderPreferences>): void {
  for (const listener of listeners) {
    listener(prefs);
  }
}
