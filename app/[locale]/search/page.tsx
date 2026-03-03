"use client";

/**
 * Search page — M2a-1 (ADR-130, ADR-122).
 *
 * Hybrid search with crisis detection, language toggle,
 * and cross-language fallback. All UI strings from next-intl.
 */

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { locales, localeNames } from "@/i18n/config";
import type { CrisisInfo } from "@/lib/services/crisis";
import { SearchCombobox } from "@/app/components/SearchCombobox";
import { PORTAL } from "@/lib/config/srf-links";

interface Citation {
  bookId: string;
  book: string;
  author: string;
  chapter: string;
  chapterNumber: number;
  page: number | null;
}

interface SearchResult {
  id: string;
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
    <main id="main-content" className="min-h-screen">
      <div className="border-b border-srf-gold/20 bg-(--theme-surface)">
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          <div className="h-8 w-48 animate-pulse rounded bg-srf-navy/10" />
        </div>
      </div>
    </main>
  );
}

/**
 * Inline crisis interstitial — M1c-9 (ADR-122).
 * Inlined to avoid separate module import overhead (PRI-07).
 */
function CrisisBanner({ crisis }: { crisis: CrisisInfo }) {
  if (!crisis.detected || !crisis.helpline) return null;
  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-srf-gold/30 bg-srf-gold/5 p-4 md:p-5"
    >
      <p className="text-sm font-medium text-srf-navy">
        If you or someone you know is struggling, help is available.
      </p>
      <p className="mt-2 text-sm text-srf-navy/80">
        <strong>{crisis.helpline.action}</strong> — {crisis.helpline.name}
      </p>
      <p className="mt-1 text-xs text-srf-navy/50">
        {crisis.helpline.available} &middot;{" "}
        <a
          href={crisis.helpline.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-navy"
        >
          {crisis.helpline.url}
        </a>
      </p>
    </div>
  );
}

/**
 * Inline share button — M2a-6 (DES-006, PRI-02).
 * Web Share API with clipboard fallback. Inlined to avoid
 * next/dynamic overhead (PRI-07).
 */
function InlineShareButton({
  passage,
  citation,
  url,
}: {
  passage: string;
  citation: Citation;
  url: string;
}) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const shareText = `"${passage}"\n\n— ${citation.author}, ${citation.book}, Ch. ${citation.chapterNumber}: ${citation.chapter}${citation.page ? `, p. ${citation.page}` : ""}`;
  const shareTitle = `${citation.book} — ${citation.chapter}`;

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch {
        /* User cancelled — fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard unavailable */
    }
  }, [shareText, shareTitle, url]);

  return (
    <button
      type="button"
      onClick={handleShare}
      data-no-print
      className="min-h-11 inline-flex items-center gap-1.5 rounded-lg border border-srf-navy/10 px-3 py-1.5 text-xs text-srf-navy/60 transition-colors hover:border-srf-gold/40 hover:text-srf-navy"
      aria-label={t("button")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
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
  const [language, setLanguage] = useState("en");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [crisis, setCrisis] = useState<CrisisInfo>({ detected: false });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Engineering debug mode — ?debug query param or localStorage flag.
  // Readers see clean result counts; engineers see timing, mode, scores.
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

      const encoded = encodeURIComponent(q.trim());

      // Conditional hybrid search:
      //
      // 1. Fire FTS-only + crisis detection in parallel (~40ms warm).
      //    Renders results immediately — seeker sees content fast.
      // 2. If FTS returned sparse results (< threshold), fire hybrid
      //    for semantic recall via Voyage embeddings (~350ms).
      //    Otherwise skip — FTS was sufficient, no Voyage cost.
      //
      // This eliminates Voyage API calls on common keyword queries entirely.

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

      // Phase 1: render FTS results + crisis
      const [crisisData, ftsData] = await Promise.all([
        crisisPromise,
        ftsPromise,
      ]);

      setCrisis(crisisData as CrisisInfo);
      setResults(ftsData.data);
      setMeta(ftsData.meta);
      setLoading(false);

      // Phase 2: only fire hybrid if FTS results are sparse
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

  // Auto-search from URL params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !searched) {
      setQuery(q);
      doSearch(q, language);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main id="main-content" className="min-h-screen">
      {/* Search header */}
      <div className="border-b border-srf-gold/20 bg-(--theme-surface)">
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          <h1 className="mb-2 font-display text-2xl text-srf-navy md:text-3xl">
            {t("heading")}
          </h1>
          <p className="mb-6 text-sm text-srf-navy/60">{t("subtitle")}</p>

          <form onSubmit={handleSearch} role="search">
            <div className="flex gap-2">
              <SearchCombobox
                value={query}
                onChange={setQuery}
                onSubmit={(q) => doSearch(q, language)}
                language={language}
                placeholder={t("placeholder")}
                ariaLabel={t("heading")}
                className="min-h-11 flex-1 rounded-lg border border-srf-navy/15 bg-(--theme-surface) px-4 py-2.5 text-srf-navy placeholder:text-srf-navy/35 focus:border-srf-gold/60 focus:outline-none focus:ring-1 focus:ring-srf-gold/30"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="min-h-11 min-w-11 rounded-lg border border-srf-navy/15 bg-(--theme-surface) px-2 py-2.5 text-sm text-srf-navy focus:border-srf-gold/60 focus:outline-none focus:ring-1 focus:ring-srf-gold/30"
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
                className="min-h-11 min-w-11 rounded-lg bg-srf-navy px-5 py-2.5 text-sm font-sans font-semibold text-warm-cream transition-colors hover:bg-srf-navy/90 disabled:opacity-50"
              >
                {loading ? t("loading") : t("button")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-3xl px-4 py-6" aria-live="polite">
        <CrisisBanner crisis={crisis} />

        {meta && (
          <div className="mb-4">
            <p className="text-sm text-srf-navy/50">
              {meta.totalResults} result{meta.totalResults !== 1 ? "s" : ""}
              {debugMode && (
                <span className="ml-1 font-mono text-xs text-srf-navy/30">
                  {meta.durationMs}ms · {meta.mode}
                </span>
              )}
            </p>
            {meta.fallbackLanguage && (
              <p className="mt-1 text-sm text-srf-gold">
                Showing English results.
              </p>
            )}
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <p className="py-12 text-center text-srf-navy/50">
            {t("noResults")}
          </p>
        )}

        <div className="space-y-4" role="list" aria-label={t("heading")}>
          {results.map((result) => {
            const isFallback =
              meta?.fallbackLanguage && result.language !== language;
            return (
              <article
                key={result.id}
                className="rounded-lg border border-srf-navy/10 bg-(--theme-surface) p-4 md:p-6"
                role="listitem"
              >
                <blockquote className="mb-3 text-base leading-relaxed text-srf-navy md:text-lg md:leading-relaxed">
                  &ldquo;{result.content}&rdquo;
                </blockquote>
                <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-srf-navy/60">
                  {isFallback && (
                    <span className="rounded bg-srf-navy/10 px-1.5 py-0.5 text-xs font-medium text-srf-navy/70">
                      [EN]
                    </span>
                  )}
                  <span className="font-medium text-srf-navy/80">
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
                  <span aria-hidden="true">&middot;</span>
                  <NextLink
                    href={`/${locale}/books/${result.citation.bookId}/${result.citation.chapterNumber}`}
                    className="text-srf-gold hover:text-srf-navy transition-colors min-h-11 inline-flex items-center"
                  >
                    {t("readInContext")}
                  </NextLink>
                  <InlineShareButton
                    passage={result.content}
                    citation={result.citation}
                    url={`${PORTAL.canonical}/${locale}/passage/${result.id}`}
                  />
                  {debugMode && (
                    <span className="ml-auto font-mono text-xs text-srf-navy/25">
                      {result.score.toFixed(3)} · {result.sources.join("+")}
                    </span>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
