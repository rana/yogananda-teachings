"use client";

/**
 * Search page — hybrid search with crisis detection.
 *
 * Conditional hybrid search: FTS first (~40ms), semantic only
 * when sparse (saves Voyage API calls). Crisis interstitial
 * for distress signals. Client Component — interactive.
 *
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { locales, localeNames } from "@/i18n/config";
import type { CrisisInfo } from "@/lib/services/crisis";
import { SearchCombobox } from "@/app/components/SearchCombobox";
import { HighlightedText } from "@/app/components/HighlightedText";
import { sendResonance } from "@/lib/resonance-beacon";
import { addRecentSearch, getRecentSearches, clearRecentSearches } from "@/lib/search-history";
import { PORTAL } from "@/lib/config/srf-links";
import { SEARCH_PLACEHOLDERS } from "@/lib/config/search-prompts";

/**
 * Curated search invitations — editorially chosen doorways into the corpus.
 * Bilingual: display text matches the search language (not just UI locale)
 * so queries produce relevant results.
 */
const CURATED_SUGGESTIONS = [
  { en: "Peace of mind", es: "Paz mental" },
  { en: "Love", es: "Amor" },
  { en: "Overcoming fear", es: "Superar el miedo" },
  { en: "The miraculous", es: "Lo milagroso" },
  { en: "Life's purpose", es: "El propósito de la vida" },
  { en: "Willpower", es: "Fuerza de voluntad" },
  { en: "Where do they go?", es: "\u00bfA d\u00f3nde van?" },
  { en: "Healing", es: "Sanaci\u00f3n" },
] as const;

interface Citation {
  bookId: string;
  bookSlug: string;
  book: string;
  author: string;
  chapter: string;
  chapterNumber: number;
  page: number | null;
}

interface SearchResult {
  id: string;
  slug: string;
  content: string;
  citation: Citation;
  language: string;
  score: number;
  sources: string[];
}

interface SearchMeta {
  query: string;
  mode: string;
  language: string;
  totalResults: number;
  durationMs: number;
  fallbackLanguage?: string;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchSkeleton() {
  return (
    <div className="center" style={{ paddingBlock: "var(--space-spacious)" }}>
      <div className="pulse" style={{
        height: "2rem",
        width: "12rem",
        borderRadius: "var(--radius-gentle, 4px)",
        backgroundColor: "color-mix(in oklch, var(--color-text), transparent 90%)",
      }} />
    </div>
  );
}

/**
 * Inline crisis interstitial — compassionate response to distress signals.
 */
function CrisisBanner({ crisis }: { crisis: CrisisInfo }) {
  if (!crisis.detected || !crisis.helpline) return null;
  return (
    <div
      role="alert"
      className="crisis-banner"
    >
      <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>
        If you or someone you know is struggling, help is available.
      </p>
      <p style={{ fontSize: "0.875rem", marginBlockStart: "var(--space-compact)" }}>
        <strong>{crisis.helpline.action}</strong> — {crisis.helpline.name}
      </p>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBlockStart: "var(--space-compact)" }}>
        {crisis.helpline.available} &middot;{" "}
        <a
          href={crisis.helpline.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", textUnderlineOffset: "0.15em" }}
        >
          {crisis.helpline.url}
        </a>
      </p>
    </div>
  );
}

/**
 * Inline share button — Web Share API with clipboard fallback.
 */
function InlineShareButton({
  passage,
  citation,
  url,
  chunkId,
}: {
  passage: string;
  citation: Citation;
  url: string;
  chunkId?: string;
}) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const shareText = `"${passage}"\n\n\u2014 ${citation.author}, ${citation.book}, Ch. ${citation.chapterNumber}: ${citation.chapter}${citation.page ? `, p. ${citation.page}` : ""}`;
  const shareTitle = `${citation.book} \u2014 ${citation.chapter}`;

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        if (chunkId) sendResonance(chunkId, "share");
        return;
      } catch {
        /* User cancelled — fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (chunkId) sendResonance(chunkId, "share");
    } catch {
      /* Clipboard unavailable */
    }
  }, [shareText, shareTitle, url, chunkId]);

  return (
    <button
      type="button"
      onClick={handleShare}
      data-no-print
      style={{
        minHeight: "44px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "0.875rem",
        color: "var(--color-text-secondary)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
      aria-label={t("button")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        style={{ width: "0.875rem", height: "0.875rem" }}
        aria-hidden="true"
      >
        <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .799l6.732 3.365a2.5 2.5 0 1 1-.671 1.341l-6.732-3.365a2.5 2.5 0 1 1 0-3.482l6.732-3.365A2.52 2.52 0 0 1 13 4.5Z" />
      </svg>
      {copied ? t("copied") : t("button")}
    </button>
  );
}

function SearchPageInner() {
  const t = useTranslations("search");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [language, setLanguage] = useState(locale === "es" ? "es" : "en");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [crisis, setCrisis] = useState<CrisisInfo>({ detected: false });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const [debugMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      searchParams.has("debug") ||
      localStorage.getItem("srf-debug") === "true"
    );
  });

  const doSearch = useCallback(
    async (q: string, lang: string) => {
      if (!q.trim()) return;

      setLoading(true);
      setSearched(true);

      addRecentSearch(q.trim());
      setRecentSearches(getRecentSearches());

      const encoded = encodeURIComponent(q.trim());

      const crisisPromise = fetch(
        `/api/v1/search/crisis?q=${encoded}&language=${lang}`,
      ).then((r) => (r.ok ? r.json() : { detected: false }))
        .catch(() => ({ detected: false }));

      const ftsPromise = fetch(
        `/api/v1/search?q=${encoded}&language=${lang}&mode=fts`,
      ).then(async (r) => {
        const data = await r.json();
        return { data: data.data || [], meta: data.meta || null };
      }).catch(() => ({ data: [], meta: null }));

      const [crisisData, ftsData] = await Promise.all([
        crisisPromise,
        ftsPromise,
      ]);

      setCrisis(crisisData as CrisisInfo);
      setResults(ftsData.data);
      setMeta(ftsData.meta);
      setLoading(false);

      const HYBRID_THRESHOLD = 5;
      const HYBRID_TIMEOUT = 4000;

      if (ftsData.data.length < HYBRID_THRESHOLD) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), HYBRID_TIMEOUT);

          const hybridRes = await fetch(
            `/api/v1/search?q=${encoded}&language=${lang}`,
            { signal: controller.signal },
          );
          clearTimeout(timeout);

          const hybridJson = await hybridRes.json();
          const hybridData = hybridJson.data || [];
          if (hybridData.length > 0) {
            setResults(hybridData);
            setMeta(hybridJson.meta || null);
          }
        } catch {
          // Timeout or network error — seeker already has FTS results
        }
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      doSearch(query, language);
    },
    [query, language, doSearch],
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !searched) {
      setQuery(q);
      doSearch(q, language);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ paddingBlock: "var(--space-spacious)" }}>
      {/* Search header */}
      <div data-register="instructional" style={{
        borderBlockEnd: "1px solid var(--color-border)",
        paddingBlock: "var(--space-generous)",
      }}>
        <div className="center" style={{ maxInlineSize: "48em" }}>
          <h1 className="page-title">{t("heading")}</h1>
          <p className="page-subtitle" style={{ marginBlockEnd: "var(--space-generous)" }}>{t("subtitle")}</p>

          <form onSubmit={handleSearch} role="search">
            <div className="cluster" style={{ gap: "var(--space-compact)" }}>
              <div style={{ flex: 1 }}>
                <SearchCombobox
                  value={query}
                  onChange={setQuery}
                  onSubmit={(q) => doSearch(q, language)}
                  language={language}
                  placeholder={t("placeholder")}
                  placeholders={SEARCH_PLACEHOLDERS[language] ?? SEARCH_PLACEHOLDERS.en}
                  ariaLabel={t("heading")}
                  className="input"
                />
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input"
                style={{ minWidth: "44px" }}
                aria-label={t("language")}
              >
                {locales.map((loc) => (
                  <option key={loc} value={loc}>
                    {localeNames[loc]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-primary"
              >
                {loading ? t("loading") : t("button")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="center" style={{ paddingBlock: "var(--space-generous)" }} aria-live="polite">
        <CrisisBanner crisis={crisis} />

        {/* Empty state: recent searches + curated suggestions */}
        {!searched && !loading && (
          <div className="stack-spacious" style={{ paddingBlock: "var(--space-generous)" }}>
            {recentSearches.length > 0 && (
              <section aria-label={t("recentSearches")}>
                <div className="cluster" style={{ justifyContent: "center", marginBlockEnd: "var(--space-default)" }}>
                  <h2 className="section-label" style={{ margin: 0 }}>
                    {t("recentSearches")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentSearches();
                      setRecentSearches([]);
                    }}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      opacity: 0.6,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {t("clearRecent")}
                  </button>
                </div>
                <div className="pill-cluster">
                  {recentSearches.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      onClick={() => {
                        setQuery(recent);
                        doSearch(recent, language);
                      }}
                      className="pill"
                      style={{ cursor: "pointer", background: "none" }}
                    >
                      {recent}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section aria-label={t("suggestionsHeading")}>
              <h2 className="section-label">{t("suggestionsHeading")}</h2>
              <p className="page-subtitle" style={{ textAlign: "center", marginBlockEnd: "var(--space-generous)" }}>
                {t("suggestionsSubtitle")}
              </p>
              <div className="pill-cluster">
                {CURATED_SUGGESTIONS.map((suggestion) => {
                  const label =
                    suggestion[language as "en" | "es"] || suggestion.en;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setQuery(label);
                        doSearch(label, language);
                      }}
                      className="pill"
                      style={{ cursor: "pointer", background: "none" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {meta && (
          <div style={{ marginBlockEnd: "var(--space-default)" }}>
            <p
              style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
              title={`${meta.durationMs}ms \u00b7 ${meta.mode}`}
            >
              {meta.totalResults} result{meta.totalResults !== 1 ? "s" : ""}
            </p>
            {meta.fallbackLanguage && (
              <p style={{ fontSize: "0.875rem", color: "var(--color-gold)", marginBlockStart: "var(--space-compact)" }}>
                Showing English results.
              </p>
            )}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="empty-state" style={{ minBlockSize: "30vh" }}>
            <p style={{ color: "var(--color-text-secondary)" }}>{t("noResults")}</p>
          </div>
        )}

        <div className="stack" role="list" aria-label={t("heading")}>
          {results.map((result) => {
            const isFallback =
              meta?.fallbackLanguage && result.language !== language;
            return (
              <article
                key={result.id}
                className="search-result"
                role="listitem"
              >
                <blockquote>
                  &ldquo;
                  <HighlightedText
                    text={result.content}
                    query={meta?.query || query}
                  />
                  &rdquo;
                </blockquote>
                <footer>
                  {isFallback && (
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: "color-mix(in oklch, var(--color-text), transparent 90%)",
                      padding: "1px 6px",
                      borderRadius: "var(--radius-gentle, 4px)",
                    }}>
                      [EN]
                    </span>
                  )}
                  <span style={{ fontWeight: 500 }}>
                    {result.citation.author}
                  </span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{result.citation.book}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>
                    Ch. {result.citation.chapterNumber}:{" "}
                    {result.citation.chapter}
                  </span>
                  {result.citation.page && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>p. {result.citation.page}</span>
                    </>
                  )}
                  <NextLink
                    href={`/${locale}/books/${result.citation.bookSlug}/${result.citation.chapterNumber}#passage-${result.id}`}
                    style={{ color: "var(--color-gold)", minHeight: "44px", display: "inline-flex", alignItems: "center" }}
                  >
                    {t("readChapter")}
                  </NextLink>
                  <InlineShareButton
                    passage={result.content}
                    citation={result.citation}
                    url={`${PORTAL.canonical}/${locale}/passage/${result.slug}`}
                    chunkId={result.id}
                  />
                  {debugMode && (
                    <span style={{ marginInlineStart: "auto", fontFamily: "monospace", fontSize: "0.75rem", opacity: 0.3 }}>
                      {result.score.toFixed(3)} &middot; {result.sources.join("+")}
                    </span>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
