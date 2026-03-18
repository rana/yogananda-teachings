"use client";

/**
 * SearchCombobox — ARIA combobox with corpus-derived suggestions (FTR-029).
 *
 * Three-tier architecture:
 *   Tier A: Prefix-partitioned static JSON at CDN edge — loaded on typing (<10ms).
 *   Tier A0: Zero-state JSON (chips + questions) — loaded on focus.
 *   Tier B: pg_trgm fuzzy fallback — async API call when Tier A returns <3 results.
 *
 * Bridge matching: vocabulary_bridge entries surface Yogananda's terminology
 * when seekers type modern vocabulary (e.g., "mindfulness" → "concentration").
 *
 * Progressive enhancement: wraps a plain <input> that works without JS.
 * Keyboard: Down opens/navigates, Up navigates, Enter selects, Escape closes, Tab moves out.
 * Mobile: max 5 suggestions, 44×44px touch targets.
 * All 5 color themes via CSS custom properties.
 */

import { useState, useRef, useCallback, useEffect, useId } from "react";
import {
  SUGGEST_DEBOUNCE_MS,
  SUGGEST_DEBOUNCE_SLOW_MS,
  SUGGEST_MAX_DESKTOP,
  SUGGEST_MAX_MOBILE,
  SUGGEST_FUZZY_THRESHOLD,
  SUGGEST_FUZZY_MIN_CHARS,
} from "@/lib/config";
import { useRotatingPlaceholder } from "@/app/hooks/useRotatingPlaceholder";

interface Suggestion {
  text: string;
  display: string | null;
  type: "scoped" | "entity" | "topic" | "sanskrit" | "editorial" | "curated" | "chapter";
  weight: number;
}

interface BridgeEntry {
  stem: string;
  expression: string;
  yogananda_terms: string[];
  crisis_adjacent: boolean;
}

interface ZeroState {
  chips: string[];
  questions: string[];
}

interface SearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  language: string;
  placeholder?: string;
  placeholders?: readonly string[];
  ariaLabel?: string;
  className?: string;
  id?: string;
}

// Module-scoped caches — persist across renders, keyed by language.
const zeroStateCache = new Map<string, ZeroState>();
const prefixCache = new Map<string, Suggestion[]>();
const bridgeCache = new Map<string, BridgeEntry[]>();

function computePrefix(input: string): string {
  const clean = input.toLowerCase().normalize("NFC").trim();
  return clean.length >= 2 ? clean.slice(0, 2) : "";
}

function matchScore(suggestion: string, input: string): number {
  const lower = suggestion.toLowerCase();
  const query = input.toLowerCase();
  if (lower.startsWith(query)) return 1.0;
  // Word boundary match
  if (lower.split(/\s+/).some((w) => w.startsWith(query))) return 0.8;
  if (lower.includes(query)) return 0.5;
  return 0;
}

function findBridgeMatch(
  input: string,
  bridges: BridgeEntry[],
): BridgeEntry | null {
  const lower = input.toLowerCase().trim();
  if (lower.length < 3) return null;
  for (const b of bridges) {
    if (b.expression.startsWith(lower) || lower.startsWith(b.stem)) {
      return b;
    }
  }
  return null;
}

export function SearchCombobox({
  value,
  onChange,
  onSubmit,
  language,
  placeholder,
  placeholders,
  ariaLabel,
  className,
  id,
}: SearchComboboxProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [bridgeMatch, setBridgeMatch] = useState<BridgeEntry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const rotatingActive = !!placeholders && placeholders.length > 1 && !value && !isFocused;
  const { text: rotatingText, fading } = useRotatingPlaceholder(
    placeholders ?? [],
    rotatingActive,
  );
  const showOverlay = !!placeholders && placeholders.length > 0 && !value;

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isFirstKeystroke = useRef(true);
  const instanceId = useId();
  const listboxId = `${instanceId}-listbox`;
  const bridgeHintId = `${instanceId}-bridge-hint`;

  const maxSuggestions = isMobile ? SUGGEST_MAX_MOBILE : SUGGEST_MAX_DESKTOP;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load zero-state JSON (chips + questions)
  const loadZeroState = useCallback(
    async (lang: string): Promise<ZeroState> => {
      const cached = zeroStateCache.get(lang);
      if (cached) return cached;
      try {
        const res = await fetch(`/data/suggestions/${lang}/_zero.json`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data: ZeroState = await res.json();
        zeroStateCache.set(lang, data);
        return data;
      } catch {
        if (lang !== "en") return loadZeroState("en");
        return { chips: [], questions: [] };
      }
    },
    [],
  );

  // Load prefix-partitioned suggestions
  const loadPrefix = useCallback(
    async (lang: string, prefix: string): Promise<Suggestion[]> => {
      const key = `${lang}/${prefix}`;
      const cached = prefixCache.get(key);
      if (cached) return cached;
      try {
        const res = await fetch(`/data/suggestions/${lang}/${prefix}.json`);
        if (!res.ok) return [];
        const data: Suggestion[] = await res.json();
        prefixCache.set(key, data);
        return data;
      } catch {
        return [];
      }
    },
    [],
  );

  // Load bridge entries
  const loadBridge = useCallback(
    async (lang: string): Promise<BridgeEntry[]> => {
      const cached = bridgeCache.get(lang);
      if (cached) return cached;
      try {
        const res = await fetch(`/data/suggestions/${lang}/_bridge.json`);
        if (!res.ok) return [];
        const data: BridgeEntry[] = await res.json();
        bridgeCache.set(lang, data);
        return data;
      } catch {
        return [];
      }
    },
    [],
  );

  // Tier B: async fuzzy fallback
  const fetchFuzzy = useCallback(
    async (prefix: string, lang: string): Promise<Suggestion[]> => {
      if (prefix.length < SUGGEST_FUZZY_MIN_CHARS) return [];
      try {
        const res = await fetch(
          `/api/v1/search/suggest?q=${encodeURIComponent(prefix)}&language=${lang}`,
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map(
          (s: { text: string; display?: string | null; type: string; weight?: number }) => ({
            text: s.text,
            display: s.display || null,
            type: s.type || "topic",
            weight: s.weight || 0,
          }),
        ) as Suggestion[];
      } catch {
        return [];
      }
    },
    [],
  );

  const getDebounceMs = useCallback(() => {
    if (isFirstKeystroke.current) {
      isFirstKeystroke.current = false;
      return 0;
    }
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string };
    };
    if (nav.connection?.effectiveType === "2g") return SUGGEST_DEBOUNCE_SLOW_MS;
    return SUGGEST_DEBOUNCE_MS;
  }, []);

  // Main suggestion update logic
  const updateSuggestions = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        // Zero-state: show chips + questions
        const zero = await loadZeroState(language);
        setChips(zero.chips);
        setQuestions(zero.questions);
        setSuggestions([]);
        setBridgeMatch(null);
        setIsOpen(true);
        setActiveIndex(-1);
        return;
      }

      setChips([]);
      setQuestions([]);

      const prefix = computePrefix(input);
      if (!prefix) {
        setSuggestions([]);
        setBridgeMatch(null);
        setIsOpen(false);
        return;
      }

      // Load prefix file + bridge data in parallel
      const [prefixData, bridges] = await Promise.all([
        loadPrefix(language, prefix),
        loadBridge(language),
      ]);

      // Client-side filter + score
      const scored = prefixData
        .map((s) => {
          const ms = Math.max(matchScore(s.text, input), s.display ? matchScore(s.display, input) : 0);
          return { ...s, finalScore: s.weight * ms };
        })
        .filter((s) => s.finalScore > 0)
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, maxSuggestions);

      const local: Suggestion[] = scored.map(({ finalScore: _, ...s }) => s);

      // Bridge match
      const bridge = findBridgeMatch(input, bridges);
      setBridgeMatch(bridge);

      setSuggestions(local);
      setIsOpen(true);
      setActiveIndex(-1);

      // Tier B: fire fuzzy if local results are sparse
      if (local.length < SUGGEST_FUZZY_THRESHOLD) {
        const fuzzy = await fetchFuzzy(input, language);
        const localTexts = new Set(local.map((s) => s.text.toLowerCase()));
        const merged = [
          ...local,
          ...fuzzy.filter((f) => !localTexts.has(f.text.toLowerCase())),
        ].slice(0, maxSuggestions);
        setSuggestions(merged);
      }
    },
    [language, maxSuggestions, loadZeroState, loadPrefix, loadBridge, fetchFuzzy],
  );

  const handleInputChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const delay = getDebounceMs();
      if (delay === 0) {
        updateSuggestions(newValue);
      } else {
        debounceRef.current = setTimeout(
          () => updateSuggestions(newValue),
          delay,
        );
      }
    },
    [onChange, getDebounceMs, updateSuggestions],
  );

  const selectSuggestion = useCallback(
    (text: string) => {
      onChange(text);
      setIsOpen(false);
      setSuggestions([]);
      setChips([]);
      setQuestions([]);
      setBridgeMatch(null);
      setActiveIndex(-1);
      onSubmit(text);
    },
    [onChange, onSubmit],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Count total navigable items
      const zeroItems = chips.length + questions.length;
      const totalItems = suggestions.length > 0
        ? suggestions.length + (bridgeMatch ? 1 : 0)
        : zeroItems;

      if (!isOpen && e.key === "ArrowDown") {
        e.preventDefault();
        updateSuggestions(value);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < totalItems - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : totalItems - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0) {
            if (suggestions.length > 0) {
              // Bridge hint is not selectable as search — skip to suggestion items
              const bridgeOffset = bridgeMatch ? 1 : 0;
              if (bridgeMatch && activeIndex === 0) {
                // Selecting bridge: search the expression
                selectSuggestion(bridgeMatch.expression);
              } else if (activeIndex - bridgeOffset < suggestions.length) {
                selectSuggestion(suggestions[activeIndex - bridgeOffset].text);
              }
            } else {
              // Zero-state: chips then questions
              if (activeIndex < chips.length) {
                selectSuggestion(chips[activeIndex]);
              } else {
                const qIdx = activeIndex - chips.length;
                if (qIdx >= 0 && qIdx < questions.length) {
                  selectSuggestion(questions[qIdx]);
                }
              }
            }
          } else {
            close();
            onSubmit(value);
          }
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "Tab":
          close();
          break;
      }
    },
    [isOpen, activeIndex, suggestions, chips, questions, bridgeMatch, value, selectSuggestion, close, onSubmit, updateSuggestions],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    isFirstKeystroke.current = true;
    updateSuggestions(value);
  }, [value, updateSuggestions]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Click outside: close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  const hasZeroState = isOpen && chips.length > 0;
  const hasSuggestions = isOpen && (suggestions.length > 0 || bridgeMatch);
  const hasItems = hasZeroState || hasSuggestions;
  const activeDescendant =
    activeIndex >= 0 ? `${instanceId}-option-${activeIndex}` : undefined;

  const effectivePlaceholder = showOverlay ? "" : (placeholder || rotatingText);

  // Type labels for screen reader and visual indicator
  const typeLabel = (type: Suggestion["type"]) => {
    switch (type) {
      case "scoped": return "scoped";
      case "entity": return "teacher";
      case "topic": return "topic";
      case "sanskrit": return "Sanskrit";
      case "curated": return "topic";
      case "chapter": return "chapter";
      default: return "";
    }
  };

  return (
    <div className="combobox-wrapper">
      <input
        ref={inputRef}
        id={id}
        type="search"
        role="combobox"
        aria-expanded={!!hasItems}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-placeholder={showOverlay ? rotatingText : undefined}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={effectivePlaceholder}
        autoComplete="off"
        className={className}
      />

      {showOverlay && (
        <span
          aria-hidden="true"
          className="combobox-placeholder-overlay"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {rotatingText}
        </span>
      )}

      {hasItems && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="combobox-dropdown"
        >
          {/* Zero-state: chips */}
          {chips.length > 0 && (
            <li className="combobox-chips" role="presentation">
              {chips.map((chip, i) => (
                <button
                  key={chip}
                  id={`${instanceId}-option-${i}`}
                  role="option"
                  aria-selected={activeIndex === i}
                  type="button"
                  onClick={() => selectSuggestion(chip)}
                  className="combobox-chip"
                >
                  {chip}
                </button>
              ))}
            </li>
          )}

          {/* Zero-state: questions */}
          {questions.map((q, i) => {
            const idx = chips.length + i;
            return (
              <li
                key={q}
                id={`${instanceId}-option-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                onClick={() => selectSuggestion(q)}
                className="combobox-suggestion combobox-suggestion--question"
              >
                {q}
              </li>
            );
          })}

          {/* Bridge hint — vocabulary bridge match */}
          {bridgeMatch && (
            <li
              id={`${instanceId}-option-0`}
              role="option"
              aria-selected={activeIndex === 0}
              aria-describedby={bridgeHintId}
              onClick={() => selectSuggestion(bridgeMatch.expression)}
              className="combobox-suggestion combobox-suggestion--bridge"
            >
              <span className="combobox-suggestion-text">{bridgeMatch.expression}</span>
              <span id={bridgeHintId} className="combobox-bridge-hint">
                Yogananda&rsquo;s terms: {bridgeMatch.yogananda_terms.join(", ")}
              </span>
            </li>
          )}

          {/* Suggestion items — hide type badge when all share the same type */}
          {(() => {
            const allSameType = suggestions.length > 1 &&
              suggestions.every((s) => s.type === suggestions[0].type);
            return suggestions.map((suggestion, i) => {
              const idx = bridgeMatch ? i + 1 : i;
              const label = typeLabel(suggestion.type);
              return (
                <li
                  key={`${suggestion.type}-${suggestion.text}`}
                  id={`${instanceId}-option-${idx}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  onClick={() => selectSuggestion(suggestion.text)}
                  className={`combobox-suggestion${suggestion.type === "sanskrit" ? " combobox-suggestion--sanskrit" : ""}`}
                >
                  <span className="visually-hidden">{label}: </span>
                  <span className="combobox-suggestion-text">
                    {suggestion.display || suggestion.text}
                  </span>
                  {label && !allSameType && (
                    <span className="combobox-suggestion-type" aria-hidden="true">
                      {label}
                    </span>
                  )}
                </li>
              );
            });
          })()}
        </ul>
      )}

      {/* Live region for screen readers */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {hasItems &&
          (suggestions.length > 0
            ? `${suggestions.length} suggestion${suggestions.length !== 1 ? "s" : ""} available`
            : chips.length > 0
              ? `${chips.length} topic${chips.length !== 1 ? "s" : ""} available`
              : "")}
      </div>
    </div>
  );
}
