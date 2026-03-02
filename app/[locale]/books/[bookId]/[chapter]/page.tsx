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
import { getChapterContent, getEquivalentBook } from "@/lib/services/books";
import { BookmarkButton } from "@/app/components/BookmarkButton";
import { ScrollIndicator } from "@/app/components/ScrollIndicator";
import { KeyboardNav } from "@/app/components/KeyboardNav";
import { DwellMode } from "@/app/components/DwellMode";
import { ContextualQuiet } from "@/app/components/ContextualQuiet";
import { ReaderModes } from "@/app/components/ReaderModes";
import { ThemeSelector } from "@/app/components/ThemeSelector";
import { FontSizeSelector } from "@/app/components/FontSizeSelector";
import { PartingWord } from "@/app/components/PartingWord";
import type { Metadata } from "next";

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
  const content = await getChapterContent(pool, bookId, chapterNumber);
  if (!content) return {};
  const prefix = locale === "en" ? "" : `/${locale}`;
  const base = `https://teachings.yogananda.org${prefix}/books/${bookId}`;

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
      canonical: `${prefix}/books/${bookId}/${chapter}`,
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

  const content = await getChapterContent(pool, bookId, chapterNumber);
  if (!content) notFound();

  // Cross-language redirect: if book language doesn't match locale,
  // redirect to the equivalent book's same chapter (PRI-06)
  if (content.book.language !== locale) {
    const equivalent = await getEquivalentBook(pool, bookId, locale);
    if (equivalent) {
      redirect(`/${locale}/books/${equivalent.id}/${chapterNumber}`);
    }
    // No equivalent — show this content (ADR-077 cross-language fallback)
  }

  const readingTime = estimateReadingTime(content.paragraphs);

  const bookUrl = `https://teachings.yogananda.org/${locale}/books/${bookId}`;
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
          item: `https://teachings.yogananda.org/${locale}/books`,
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
              `/${locale}/books/${bookId}/${content.nextChapter.chapterNumber}`,
            ],
          },
        ]
      : [],
    prefetch: content.prevChapter
      ? [
          {
            urls: [
              `/${locale}/books/${bookId}/${content.prevChapter.chapterNumber}`,
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

      {/* Keyboard navigation — M2b-2 */}
      <KeyboardNav
        bookId={bookId}
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
            <Link href={`/books/${bookId}`} className="hover:text-srf-navy/80">
              {content.book.title}
            </Link>
          </nav>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-xl text-srf-navy md:text-2xl">
                <span className="me-2 text-srf-navy/40">
                  {content.chapter.chapterNumber}.
                </span>
                {content.chapter.title}
              </h1>
              <p className="mt-1 text-sm text-srf-navy/50">
                {content.book.author}
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span aria-label={t("readingTime", { minutes: readingTime })}>
                  ~{readingTime} {t("minuteAbbrev")}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2" data-no-focus data-no-present>
              {/* Font size — M2b stretch */}
              <FontSizeSelector />
              {/* Color theme — M2b stretch */}
              <ThemeSelector />
              {/* Reading modes — M2b-8, M2b-15 */}
              <ReaderModes />
              {/* Lotus bookmark — M2b-3 */}
              <BookmarkButton
              bookId={bookId}
              bookTitle={content.book.title}
              bookAuthor={content.book.author}
              chapterNumber={content.chapter.chapterNumber}
              chapterTitle={content.chapter.title}
            />
            </div>
          </div>
        </div>
      </header>

      {/* Dwell contemplation — M2b-1 */}
      <DwellMode />

      {/* Contextual Quiet Corner — M2b-7 */}
      <ContextualQuiet
        bookId={bookId}
        bookTitle={content.book.title}
        chapterNumber={content.chapter.chapterNumber}
        chapterTitle={content.chapter.title}
      />

      {/* Reading content — M2b-4 typography: drop caps, paper texture */}
      <article className="reader-texture mx-auto max-w-[38rem] px-4 py-8 md:py-12">
        <div className="reader-content space-y-6">
          {content.paragraphs.map((para, i) => (
            <p
              key={para.id}
              id={`p-${i}`}
              data-paragraph={i}
              className="text-base leading-[1.8] text-srf-navy md:text-[1.125rem] md:leading-[1.85]"
            >
              {para.content}
            </p>
          ))}
        </div>

        {/* Print-only citation */}
        <div className="print-citation">
          {content.book.author}, <em>{content.book.title}</em>, Chapter{" "}
          {content.chapter.chapterNumber}: {content.chapter.title}. ©
          Self-Realization Fellowship. teachings.yogananda.org
        </div>
      </article>

      {/* Session closure — M2b-9 (DES-014) */}
      <PartingWord locale={locale} />

      {/* Chapter navigation */}
      <nav
        className="border-t border-(--theme-border) bg-(--theme-surface)"
        aria-label="Chapter navigation"
      >
        <div className="mx-auto flex max-w-[38rem] items-stretch">
          {content.prevChapter ? (
            <Link
              href={`/books/${bookId}/${content.prevChapter.chapterNumber}`}
              rel="prev"
              className="flex flex-1 flex-col px-4 py-4 text-start transition-colors hover:bg-warm-cream min-h-[44px]"
            >
              <span className="text-xs text-srf-navy/40">{t("previous")}</span>
              <span className="text-sm text-srf-navy">
                {content.prevChapter.chapterNumber}.{" "}
                {content.prevChapter.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          <div className="w-px bg-srf-navy/10" />

          {content.nextChapter ? (
            <Link
              href={`/books/${bookId}/${content.nextChapter.chapterNumber}`}
              rel="next"
              className="flex flex-1 flex-col px-4 py-4 text-end transition-colors hover:bg-warm-cream min-h-[44px]"
            >
              <span className="text-xs text-srf-navy/40">{t("next")}</span>
              <span className="text-sm text-srf-navy">
                {content.nextChapter.chapterNumber}.{" "}
                {content.nextChapter.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </nav>
    </main>
  );
}
