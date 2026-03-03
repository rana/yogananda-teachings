/**
 * Chapter reader — M2a-2, M2b-4, M2b-5 (ADR-006, DES-006, DES-008).
 *
 * Reading column at 38rem max-width for 65-75 char line length.
 * Typography: drop caps, paper texture, optical margin alignment.
 * Print citation for @media print.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getEquivalentBook, resolveChapterContent } from "@/lib/services/books";
import { getChapterRelations } from "@/lib/services/relations";
import { BookmarkButton } from "@/app/components/BookmarkButton";
import { RelatedTeachings } from "@/app/components/RelatedTeachings";
import { ScrollIndicator } from "@/app/components/ScrollIndicator";
import { KeyboardNav } from "@/app/components/KeyboardNav";
import { DwellMode } from "@/app/components/DwellMode";
import { ContextualQuiet } from "@/app/components/ContextualQuiet";
import { ReaderModes } from "@/app/components/ReaderModes";
import { ThemeSelector } from "@/app/components/ThemeSelector";
import { FontSizeSelector } from "@/app/components/FontSizeSelector";
import { PartingWord } from "@/app/components/PartingWord";
import { ChapterBreath } from "@/app/components/ChapterBreath";
import { ChapterNavLink } from "@/app/components/ChapterNavLink";
import { ReadingProgress } from "@/app/components/ReadingProgress";
import { RichText } from "@/app/components/RichText";
import { ChapterNotes } from "@/app/components/ChapterNotes";
import { EphemeralHighlights } from "@/app/components/EphemeralHighlights";
import { ResonanceWatcher } from "@/app/components/ResonanceWatcher";
import { PassageArrival } from "@/app/components/PassageArrival";
import { ThreadReturnBar } from "@/app/components/ThreadReturnBar";
import { ReadingJourney } from "@/app/components/ReadingJourney";
import type { Metadata } from "next";
import { PORTAL } from "@/lib/config/srf-links";

/** Estimate reading time in minutes (~230 WPM average). */
function estimateReadingTime(paragraphs: { content: string }[]): number {
  const words = paragraphs.reduce(
    (sum, p) => sum + p.content.split(/\s+/).length,
    0,
  );
  return Math.max(1, Math.round(words / 230));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; bookId: string; chapter: string }>;
}): Promise<Metadata> {
  const { locale, bookId, chapter } = await params;
  const chapterNumber = parseInt(chapter, 10);
  if (isNaN(chapterNumber) || chapterNumber < 1) return {};
  const content = await resolveChapterContent(pool, bookId, chapterNumber);
  if (!content) return {};
  const prefix = locale === "en" ? "" : `/${locale}`;
  const base = `${PORTAL.canonical}${prefix}/books/${content.book.slug}`;

  // rel="prev"/"next" for sequential chapter navigation (M2a-7)
  const other: Record<string, string> = {};
  if (content.prevChapter) {
    other["prev"] = `${base}/${content.prevChapter.chapterNumber}`;
  }
  if (content.nextChapter) {
    other["next"] = `${base}/${content.nextChapter.chapterNumber}`;
  }

  return {
    title: `${content.chapter.title} — ${content.book.title}`,
    description: `Chapter ${content.chapter.chapterNumber} of ${content.book.title} by ${content.book.author}`,
    alternates: {
      canonical: `${prefix}/books/${content.book.slug}/${chapter}`,
    },
    other,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ locale: string; bookId: string; chapter: string }>;
}) {
  const { locale, bookId, chapter } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reader");

  const chapterNumber = parseInt(chapter, 10);
  if (isNaN(chapterNumber) || chapterNumber < 1) notFound();

  const content = await resolveChapterContent(pool, bookId, chapterNumber);
  if (!content) notFound();

  const bookSlug = content.book.slug;

  // Cross-language redirect: if book language doesn't match locale,
  // redirect to the equivalent book's same chapter (PRI-06)
  if (content.book.language !== locale) {
    const equivalent = await getEquivalentBook(pool, content.book.id, locale);
    if (equivalent) {
      redirect(`/${locale}/books/${equivalent.slug}/${chapterNumber}`);
    }
    // No equivalent — show this content (ADR-077 cross-language fallback)
  }

  const readingTime = estimateReadingTime(content.paragraphs);

  // Batch prefetch: all paragraph relations for the entire chapter (M3c-2).
  // Single DB round-trip, included in SSR — zero client-side fetching.
  const chapterRelations = await getChapterRelations(
    pool,
    content.book.id,
    chapterNumber,
  );

  const bookUrl = `${PORTAL.canonical}/${locale}/books/${bookSlug}`;
  const chapterUrl = `${bookUrl}/${chapterNumber}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Chapter",
      name: content.chapter.title,
      position: content.chapter.chapterNumber,
      url: chapterUrl,
      isPartOf: {
        "@type": "Book",
        name: content.book.title,
        author: { "@type": "Person", name: content.book.author },
        url: bookUrl,
      },
      copyrightHolder: {
        "@type": "Organization",
        name: "Self-Realization Fellowship",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Books",
          item: `${PORTAL.canonical}/${locale}/books`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: content.book.title,
          item: bookUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: content.chapter.title,
          item: chapterUrl,
        },
      ],
    },
  ];

  // Speculation Rules: prerender next chapter, prefetch previous (M2b-11)
  const speculationRules = {
    prerender: content.nextChapter
      ? [
          {
            urls: [
              `/${locale}/books/${bookSlug}/${content.nextChapter.chapterNumber}`,
            ],
          },
        ]
      : [],
    prefetch: content.prevChapter
      ? [
          {
            urls: [
              `/${locale}/books/${bookSlug}/${content.prevChapter.chapterNumber}`,
            ],
          },
        ]
      : [],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Speculation Rules — M2b-11 (ADR-081 §13) */}
      {(speculationRules.prerender.length > 0 ||
        speculationRules.prefetch.length > 0) && (
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(speculationRules),
          }}
        />
      )}

      {/* Scroll position indicator — M2b-5 */}
      <ScrollIndicator />

      {/* Reading progress — saves/restores scroll position per chapter */}
      <ReadingProgress bookId={bookSlug} chapterNumber={chapterNumber} />

      {/* Reading journey — records this chapter visit for homepage "Continue Reading" */}
      <ReadingJourney
        bookSlug={bookSlug}
        bookTitle={content.book.title}
        bookAuthor={content.book.author}
        chapterNumber={chapterNumber}
        chapterTitle={content.chapter.title}
      />

      {/* Keyboard navigation — M2b-2 */}
      <KeyboardNav
        bookId={bookSlug}
        prevChapter={content.prevChapter?.chapterNumber ?? null}
        nextChapter={content.nextChapter?.chapterNumber ?? null}
        locale={locale}
      />

      {/* Reader header */}
      <header className="border-b border-(--theme-border) bg-(--theme-surface)">
        <div className="mx-auto max-w-[38rem] px-4 py-4">
          <nav
            className="mb-2 text-sm text-srf-navy/50"
            aria-label="Breadcrumb"
          >
            <Link href="/books" className="hover:text-srf-navy/80">
              {t("breadcrumbBooks")}
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href={`/books/${bookSlug}`} className="hover:text-srf-navy/80">
              {content.book.title}
            </Link>
          </nav>
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-xl text-srf-navy md:text-2xl">
                <span className="me-2 text-srf-navy/40">
                  {content.chapter.chapterNumber}.
                </span>
                {content.chapter.title}
              </h1>
              {/* Lotus bookmark — always visible */}
              <BookmarkButton
                bookId={content.book.id}
                bookSlug={bookSlug}
                bookTitle={content.book.title}
                bookAuthor={content.book.author}
                chapterNumber={content.chapter.chapterNumber}
                chapterTitle={content.chapter.title}
              />
            </div>
            <p className="mt-1 text-sm text-srf-navy/50">
              {content.book.author}
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span aria-label={t("readingTime", { minutes: readingTime })}>
                ~{readingTime} {t("minuteAbbrev")}
              </span>
            </p>
            {/* Reader controls — second row, hidden in focus/present mode */}
            <div className="mt-3 flex flex-wrap items-center gap-2" data-no-focus data-no-present>
              <FontSizeSelector />
              <ThemeSelector />
              <ReaderModes />
            </div>
          </div>
        </div>
      </header>

      {/* Dwell contemplation — M2b-1 */}
      <DwellMode />

      {/* Resonance watcher — M3a-7 (ADR-052): maps dwell events to chunk IDs */}
      <ResonanceWatcher paragraphChunkIds={content.paragraphs.map((p) => p.id)} />

      {/* Passage Arrival — scroll + highlight when arriving from search or golden thread */}
      <PassageArrival paragraphChunkIds={content.paragraphs.map((p) => p.id)} />

      {/* Contextual Quiet Corner — M2b-7 */}
      <ContextualQuiet
        bookId={content.book.id}
        bookSlug={bookSlug}
        bookTitle={content.book.title}
        chapterNumber={content.chapter.chapterNumber}
        chapterTitle={content.chapter.title}
      />

      {/* "Breath Between Chapters" — DES-012 */}
      {/* Thread Return Bar — golden thread breadcrumb (ADR-050) */}
      <ThreadReturnBar locale={locale} />

      <ChapterBreath
        chapterNumber={content.chapter.chapterNumber}
        chapterTitle={content.chapter.title}
      >
        {/* Reading layout: article + Related Teachings side panel (M3c-3).
            Mobile: single column (side panel hidden, bottom sheet instead).
            Desktop (lg:): flex layout with sticky side panel in the right margin.
            The reading column stays at 38rem — the side panel uses whitespace. */}
        <div className="mx-auto max-w-[38rem] lg:flex lg:max-w-[58rem] lg:gap-8">
          {/* Reading content — M2b-4 typography: drop caps, paper texture */}
          <article className="reader-texture max-w-[38rem] px-4 py-8 md:py-12">
            <div className="reader-content space-y-6">
              {content.paragraphs.map((para, i) => (
                <p
                  key={para.id}
                  id={`p-${i}`}
                  data-paragraph={i}
                  className="text-base leading-[1.8] text-srf-navy md:text-[1.125rem] md:leading-[1.85]"
                >
                  <RichText
                    text={para.content}
                    formatting={para.formatting}
                    footnotes={content.footnotes}
                    dropCap={i === 0}
                  />
                </p>
              ))}
            </div>

            {/* Print-only citation */}
            <div className="print-citation">
              {content.book.author}, <em>{content.book.title}</em>,{" "}
              {t("printChapter")} {content.chapter.chapterNumber}:{" "}
              {content.chapter.title}. {t("printCopyright")}.{" "}
              {PORTAL.canonical.replace("https://", "")}
            </div>
          </article>

          {/* Related Teachings — the golden thread (M3c-3, ADR-050) */}
          <RelatedTeachings
            relations={chapterRelations.paragraphs}
            thread={chapterRelations.thread}
            paragraphChunkIds={content.paragraphs.map((p) => p.id)}
            bookSlug={bookSlug}
            chapterNumber={chapterNumber}
            chapterTitle={content.chapter.title}
            locale={locale}
          />
        </div>
      </ChapterBreath>

      {/* Ephemeral highlights — M3c-6 (double-tap/click gold border) */}
      <EphemeralHighlights />

      {/* Chapter footnotes — PRI-01 verbatim fidelity */}
      <ChapterNotes footnotes={content.footnotes} />

      {/* Session closure — M2b-9 (DES-014) */}
      <PartingWord locale={locale} />

      {/* Chapter navigation */}
      <nav
        className="border-t border-(--theme-border) bg-(--theme-surface)"
        aria-label="Chapter navigation"
      >
        <div className="mx-auto flex max-w-[38rem] items-stretch">
          {content.prevChapter ? (
            <ChapterNavLink
              href={`/books/${bookSlug}/${content.prevChapter.chapterNumber}`}
              rel="prev"
              className="flex flex-1 flex-col px-4 py-4 text-start transition-colors hover:bg-warm-cream min-h-[44px]"
            >
              <span className="text-xs text-srf-navy/40">{t("previous")}</span>
              <span className="text-sm text-srf-navy">
                {content.prevChapter.chapterNumber}.{" "}
                {content.prevChapter.title}
              </span>
            </ChapterNavLink>
          ) : (
            <div className="flex-1" />
          )}

          <div className="w-px bg-srf-navy/10" />

          {content.nextChapter ? (
            <ChapterNavLink
              href={`/books/${bookSlug}/${content.nextChapter.chapterNumber}`}
              rel="next"
              className="flex flex-1 flex-col px-4 py-4 text-end transition-colors hover:bg-warm-cream min-h-[44px]"
            >
              <span className="text-xs text-srf-navy/40">{t("next")}</span>
              <span className="text-sm text-srf-navy">
                {content.nextChapter.chapterNumber}.{" "}
                {content.nextChapter.title}
              </span>
            </ChapterNavLink>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </nav>
    </main>
  );
}
