"use client";

/**
 * Progressive enhancement for the homepage search input.
 *
 * Server-rendered: a plain <form action="/search"> works without JS (PRI-05).
 * Client-enhanced: hydrates to SearchCombobox with chips, prefix filtering,
 * and rotating human-centered placeholder prompts.
 *
 * This component replaces the static <input> while keeping the same
 * form submission behavior. The <form> wrapper stays in the server component.
 */

import { useState } from "react";
import { SearchCombobox } from "@/app/components/SearchCombobox";
import { SEARCH_PLACEHOLDERS } from "@/lib/config/search-prompts";

interface HomeSearchEnhancedProps {
  locale: string;
  placeholder: string;
  ariaLabel: string;
}

export function HomeSearchEnhanced({
  locale,
  placeholder,
  ariaLabel,
}: HomeSearchEnhancedProps) {
  const [query, setQuery] = useState("");
  const lang = locale === "es" ? "es" : "en";

  const handleSubmit = (q: string) => {
    // Navigate to search page with query — same as the form action
    window.location.href = `/${locale}/search?q=${encodeURIComponent(q)}`;
  };

  return (
    <>
      <SearchCombobox
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        language={lang}
        placeholder={placeholder}
        placeholders={SEARCH_PLACEHOLDERS[lang]}
        ariaLabel={ariaLabel}
        id="home-search-input"
        className="min-h-11 flex-1 rounded-lg border border-srf-navy/15 bg-(--theme-surface) px-4 py-2.5 text-srf-navy placeholder:text-srf-navy/35 focus:border-srf-gold/60 focus:outline-none focus:ring-1 focus:ring-srf-gold/30"
      />
      {/* Hidden input mirrors value for form submission without JS enhancement */}
      <input type="hidden" name="q" value={query} />
    </>
  );
}
