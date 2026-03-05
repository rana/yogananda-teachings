/**
 * Chapter page — the reading surface.
 *
 * Server Component. Fetches chapter content and renders the full
 * reading experience via ChapterReader. Zero JavaScript for content.
 *
 * Phase 1: Server-rendered chapter with sacred register, attribution,
 *          publication voice, golden thread, motifs, chapter nav.
 * Phase 2: Client islands for immersion — scroll indicator, keyboard
 *          paragraph nav (j/k), dwell contemplation, reading modes
 *          (focus/present). All CSS from reading-surface.css.
 *
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 * Source pattern: patterns/reading-surface.pattern.json
 */

import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getEquivalentBook, resolveChapterContent } from "@/lib/services/books";
import { getChapterRelations } from "@/lib/services/relations";
import { ChapterReader } from "@/app/components/reading/ChapterReader";
import { ReadingImmersion } from "@/app/components/design/ReadingImmersion";
import { ReadingModes } from "@/app/components/design/ReadingModes";
import { ReadingTracker } from "@/app/components/design/ReadingTracker";
import { ChapterBookmark } from "@/app/components/design/ChapterBookmark";
import { GoldenThread } from "@/app/components/design/GoldenThread";
import { PassageArrival } from "@/app/components/PassageArrival";
import { ChapterProgress } from "@/app/components/design/ChapterProgress";

import type { RelatedPassage } from "@/lib/services/relations";
import type { Metadata } from "next";
import { PORTAL } from "@/lib/config/srf-links";

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

  // rel="prev"/"next" for sequential chapter navigation
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
    // No equivalent — show this content (cross-language fallback)
  }

  // Batch prefetch: all paragraph relations for the entire chapter.
  // Single DB round-trip, included in SSR — zero client-side fetching.
  const chapterRelations = await getChapterRelations(
    pool,
    content.book.id,
    chapterNumber,
    content.book.language,
  );

  // Build set of paragraph indices that have golden thread connections,
  // and a parallel map of paragraph index → related passages for the
  // GoldenThread client island (SSR'd, zero client-side fetching).
  const threadParagraphs = new Set<number>();
  const threadByParagraph: Record<number, RelatedPassage[]> = {};
  content.paragraphs.forEach((para, i) => {
    const relations = chapterRelations.paragraphs[para.id];
    if (relations && relations.length > 0) {
      threadParagraphs.add(i);
      threadByParagraph[i] = relations;
    }
  });

  // JSON-LD structured data
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

  // Speculation Rules: prerender next chapter, prefetch previous
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {(speculationRules.prerender.length > 0 ||
        speculationRules.prefetch.length > 0) && (
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(speculationRules),
          }}
        />
      )}

      <ChapterProgress
        bookTitle={content.book.title}
        chapterNumber={chapterNumber}
        chapterTitle={content.chapter.title}
        bookSlug={bookSlug}
        locale={locale}
      />

      <ChapterReader
        content={content}
        threadParagraphs={threadParagraphs}
        publication={bookSlug}
      />

      {/* PartingWord deferred → PRO-049 */}

      {/* Client islands: reading journey + immersive features */}
      <ReadingTracker
        bookSlug={bookSlug}
        bookTitle={content.book.title}
        bookAuthor={content.book.author}
        chapterNumber={chapterNumber}
        chapterTitle={content.chapter.title}
      />
      <ReadingImmersion />
      <ReadingModes />
      <ChapterBookmark
        bookId={content.book.id}
        bookSlug={bookSlug}
        bookTitle={content.book.title}
        bookAuthor={content.book.author}
        chapterNumber={chapterNumber}
        chapterTitle={content.chapter.title}
      />
      {Object.keys(threadByParagraph).length > 0 && (
        <GoldenThread
          paragraphs={threadByParagraph}
          thread={chapterRelations.thread}
          locale={locale}
        />
      )}
      <PassageArrival
        paragraphChunkIds={content.paragraphs.map((p) => p.id)}
      />
    </>
  );
}
