"use client";

/**
 * DesignProvider — manages design system state on <html>.
 *
 * Sets data-org, data-theme, and data-voice on the document element.
 * Persists theme to localStorage. Reads theme from URL params.
 * Provides useDesign() hook for client components that need state.
 *
 * This is the only client component that touches the document element.
 * All other design-system-aware components are server components that
 * set data attributes on their own containers.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ── Types ──────────────────────────────────────────────────────── */

type Org = "srf" | "yss";

type SRFTheme = "light" | "sepia" | "earth" | "dark" | "meditate" | "gathering";
type YSSTheme = "ashram" | "sandstone" | "earth" | "night" | "devotion";
type ThemeName = SRFTheme | YSSTheme;

type ReaderMode = "normal" | "focus" | "present" | "quiet" | "dwell";

interface DesignState {
  org: Org;
  theme: ThemeName;
  mode: ReaderMode;
  setOrg: (org: Org) => void;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ReaderMode) => void;
}

/* ── Theme mappings ─────────────────────────────────────────────── */

const orgThemes: Record<Org, ThemeName[]> = {
  srf: ["light", "sepia", "earth", "dark", "meditate", "gathering"],
  yss: ["ashram", "sandstone", "earth", "night", "devotion"],
};

/** When switching orgs, find the equivalent theme. */
const themeEquivalents: Partial<Record<ThemeName, ThemeName>> = {
  light: "ashram",
  ashram: "light",
  sepia: "sandstone",
  sandstone: "sepia",
  dark: "night",
  night: "dark",
  meditate: "devotion",
  devotion: "meditate",
  // earth is shared — no mapping needed
  // gathering has no YSS equivalent
};

/* ── Context ────────────────────────────────────────────────────── */

const DesignContext = createContext<DesignState | null>(null);

export function useDesign(): DesignState {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
}

/* ── Storage ────────────────────────────────────────────────────── */

const STORAGE_KEY = "yogananda-design";

function loadFromStorage(): { org?: Org; theme?: ThemeName } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(org: Org, theme: ThemeName) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ org, theme }));
  } catch {
    /* Storage full or unavailable — graceful degradation */
  }
}

/* ── Provider ───────────────────────────────────────────────────── */

interface DesignProviderProps {
  children: ReactNode;
  defaultOrg?: Org;
  defaultTheme?: ThemeName;
}

export function DesignProvider({
  children,
  defaultOrg = "srf",
  defaultTheme = "light",
}: DesignProviderProps) {
  const [org, setOrgState] = useState<Org>(defaultOrg);
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [mode, setMode] = useState<ReaderMode>("normal");

  /* Initialize from storage/URL on mount */
  useEffect(() => {
    const stored = loadFromStorage();
    const params = new URLSearchParams(window.location.search);

    const urlOrg = params.get("org") as Org | null;
    const urlTheme = params.get("theme") as ThemeName | null;

    const finalOrg = urlOrg || stored.org || defaultOrg;
    const finalTheme = urlTheme || stored.theme || defaultTheme;

    setOrgState(finalOrg);
    setThemeState(finalTheme);
  }, [defaultOrg, defaultTheme]);

  /* Sync to DOM and storage */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-org", org);
    html.setAttribute("data-theme", theme);
    saveToStorage(org, theme);
  }, [org, theme]);

  useEffect(() => {
    const html = document.documentElement;
    if (mode === "normal") {
      html.removeAttribute("data-mode");
    } else {
      html.setAttribute("data-mode", mode);
    }
  }, [mode]);

  /* Handle system dark mode preference */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange(e: MediaQueryListEvent) {
      if (theme === "light" && e.matches) {
        setThemeState("dark");
      } else if (theme === "dark" && !e.matches) {
        setThemeState("light");
      }
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [theme]);

  const setOrg = useCallback(
    (newOrg: Org) => {
      setOrgState(newOrg);
      // Switch to equivalent theme if current theme doesn't belong to new org
      if (!orgThemes[newOrg].includes(theme)) {
        const equivalent = themeEquivalents[theme];
        setThemeState(equivalent || orgThemes[newOrg][0]);
      }
    },
    [theme]
  );

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
  }, []);

  return (
    <DesignContext.Provider
      value={{ org, theme, mode, setOrg, setTheme, setMode }}
    >
      {children}
    </DesignContext.Provider>
  );
}
