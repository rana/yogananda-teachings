"use client";

/**
 * SearchCombobox — ARIA combobox with corpus-derived suggestions (FTR-029, FTR-029).
 *
 * Two-tier architecture:
 *   Tier A: Static JSON at CDN edge — loaded on first focus, filtered client-side (<10ms).
 *   Tier B: pg_trgm fuzzy fallback — async API call when Tier A returns <3 results.
 *
 * Progressive enhancement: wraps a plain <input> that works without JS.
 * The homepage server-rendered form still submits as a regular GET — this component
 * only activates on the client-side search page.
 *
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
  type: "chip" | "chapter" | "entity" | "topic";
}

interface SuggestionData {
  chips: string[];
  suggestions: string[];
}

interface SearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  language: string;
  placeholder?: string;
  /** Rotating placeholder texts — crossfades between items when input is empty + unfocused. */
  placeholders?: readonly string[];
  ariaLabel?: string;
  className?: string;
  id?: string;
}

// Module-scoped cache — static JSON loads once per language, persists across renders.
const suggestionDataCache = new Map<string, SuggestionData>();

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
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Rotating placeholder — active when input is empty and unfocused
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

  const maxSuggestions = isMobile ? SUGGEST_MAX_MOBILE : SUGGEST_MAX_DESKTOP;

  // Detect mobile on mount
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load static JSON on first interaction (Tier A)
  const loadSuggestionData = useCallback(
    async (lang: string): Promise<SuggestionData> => {
      const cached = suggestionDataCache.get(lang);
      if (cached) return cached;

      try {
        const res = await fetch(`/data/suggestions/${lang}.json`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data: SuggestionData = await res.json();
        suggestionDataCache.set(lang, data);
        return data;
      } catch {
        // Fallback to English if language file missing
        if (lang !== "en") return loadSuggestionData("en");
        return { chips: [], suggestions: [] };
      }
    },
    [],
  );

  // Client-side prefix filter (Tier A — <1ms)
  const filterLocal = useCallback(
    (data: SuggestionData, prefix: string): Suggestion[] => {
      const lower = prefix.toLowerCase();
      const matches: Suggestion[] = [];

      // Search suggestions (chapter titles, entities, topics)
      for (const s of data.suggestions) {
        if (s.toLowerCase().includes(lower)) {
          matches.push({ text: s, type: "chapter" });
        }
        if (matches.length >= maxSuggestions) break;
      }

      // Also check chips as suggestions when typing
      for (const c of data.chips) {
        if (
          c.toLowerCase().includes(lower) &&
          !matches.some((m) => m.text === c)
        ) {
          matches.push({ text: c, type: "topic" });
        }
        if (matches.length >= maxSuggestions) break;
      }

      return matches.slice(0, maxSuggestions);
    },
    [maxSuggestions],
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
          (s: { text: string; type: string }) =>
            ({ text: s.text, type: s.type || "topic" }) as Suggestion,
        );
      } catch {
        return [];
      }
    },
    [],
  );

  // Debounce duration — detect slow connections via Network Information API
  const getDebounceMs = useCallback(() => {
    if (isFirstKeystroke.current) {
      isFirstKeystroke.current = false;
      return 0; // First keystroke: immediate (FTR-029)
    }
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string };
    };
    if (nav.connection?.effectiveType === "2g") return SUGGEST_DEBOUNCE_SLOW_MS;
    return SUGGEST_DEBOUNCE_MS;
  }, []);

  // Main suggestion update logic
  const updateSuggestions = useCallback(
    async (prefix: string) => {
      if (!prefix.trim()) {
        // Zero-state: show chips
        const data = await loadSuggestionData(language);
        setChips(data.chips);
        setSuggestions([]);
        setIsOpen(true);
        setActiveIndex(-1);
        return;
      }

      const data = await loadSuggestionData(language);
      const local = filterLocal(data, prefix);
      setSuggestions(local);
      setChips([]);
      setIsOpen(true);
      setActiveIndex(-1);

      // Tier B: fire fuzzy if local results are sparse
      if (local.length < SUGGEST_FUZZY_THRESHOLD) {
        const fuzzy = await fetchFuzzy(prefix, language);
        // Merge: deduplicate by text, local results first
        const localTexts = new Set(local.map((s) => s.text.toLowerCase()));
        const merged = [
          ...local,
          ...fuzzy.filter((f) => !localTexts.has(f.text.toLowerCase())),
        ].slice(0, maxSuggestions);
        setSuggestions(merged);
      }
    },
    [
      language,
      maxSuggestions,
      loadSuggestionData,
      filterLocal,
      fetchFuzzy,
    ],
  );

  // Handle input changes with debounce
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
      const items = suggestions.length > 0 ? suggestions : [];
      const totalItems = items.length + chips.length;

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
            // Active item: select it
            if (suggestions.length > 0 && activeIndex < suggestions.length) {
              selectSuggestion(suggestions[activeIndex].text);
            } else {
              const chipIdx =
                suggestions.length > 0
                  ? activeIndex - suggestions.length
                  : activeIndex;
              if (chipIdx >= 0 && chipIdx < chips.length) {
                selectSuggestion(chips[chipIdx]);
              }
            }
          } else {
            // No active item: submit current value
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
    [
      isOpen,
      activeIndex,
      suggestions,
      chips,
      value,
      selectSuggestion,
      close,
      onSubmit,
      updateSuggestions,
    ],
  );

  // Focus: show zero-state chips
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

  const hasItems =
    isOpen && (suggestions.length > 0 || chips.length > 0);
  const activeDescendant =
    activeIndex >= 0 ? `${instanceId}-option-${activeIndex}` : undefined;

  // When overlay is visible, hide native placeholder visually but keep for screen readers
  const effectivePlaceholder = showOverlay ? "" : (placeholder || rotatingText);

  return (
    <div className="combobox-wrapper">
      <input
        ref={inputRef}
        id={id}
        type="search"
        role="combobox"
        aria-expanded={hasItems}
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

      {/* Rotating placeholder overlay — crossfades between human-centered prompts */}
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
          {/* Zero-state chips */}
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

          {/* Suggestion items */}
          {suggestions.map((suggestion, i) => {
            const idx = chips.length > 0 ? i + chips.length : i;
            return (
              <li
                key={suggestion.text}
                id={`${instanceId}-option-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                onClick={() => selectSuggestion(suggestion.text)}
                className="combobox-suggestion"
              >
                {suggestion.text}
              </li>
            );
          })}
        </ul>
      )}

      {/* Live region for screen readers */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {hasItems &&
          (suggestions.length > 0
            ? `${suggestions.length} suggestion${suggestions.length !== 1 ? "s" : ""} available`
            : `${chips.length} topic${chips.length !== 1 ? "s" : ""} available`)}
      </div>
    </div>
  );
}
