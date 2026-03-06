"use client";

/**
 * HeaderSearch — compact search with autocomplete and rotating placeholder.
 *
 * Wraps SearchCombobox in a native <form> for progressive enhancement.
 * When JS is available, suggestion selection and Enter navigate programmatically.
 * Without JS, the form submits as a regular GET to /search?q=...
 */

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { SearchCombobox } from "@/app/components/SearchCombobox";

const PLACEHOLDER_KEYS = [
  "innerPeace",
  "love",
  "lastingHappiness",
  "lifePurpose",
  "healing",
  "overcomingFear",
] as const;

interface Props {
  action: string;
}

export function HeaderSearch({ action }: Props) {
  const t = useTranslations("home.thematicDoors");
  const locale = useLocale();
  const router = useRouter();
  const language = locale === "es" ? "es" : "en";

  const [query, setQuery] = useState("");

  const placeholders = PLACEHOLDER_KEYS.map((key) => t(key));

  const handleSubmit = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    },
    [router],
  );

  return (
    <form
      action={action}
      method="get"
      role="search"
      className="header-search"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(query);
      }}
    >
      <SearchCombobox
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        language={language}
        placeholders={placeholders}
        ariaLabel={t("innerPeace")}
        className="input header-search-input"
        id="header-search"
      />
      <button type="submit" className="header-search-btn" aria-label="Search">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}
