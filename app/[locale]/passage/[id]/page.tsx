/**
 * Passage detail page — M2a-6, M2b-10 (ADR-022, ADR-067, ADR-068).
 *
 * Single passage with full citation, OG meta tags for rich
 * link previews, share functionality, framing context, and
 * book invitation for non-search visitors.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { getPassage } from "@/lib/services/books";
import { PORTAL } from "@/lib/config/srf-links";
import { ShareButton } from "@/app/components/ShareButton";
import { PartingWord } from "@/app/components/PartingWord";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const passage = await getPassage(pool, id);
  if (!passage) return {};

  const truncated =
    passage.content.length > 160
      ? passage.content.slice(0, 157) + "..."
      : passage.content;

  const citation = `${passage.bookAuthor}, ${passage.bookTitle}, Ch. ${passage.chapterNumber}`;

  const ogImageUrl = `/api/og?${new URLSearchParams({
    text: passage.content.slice(0, 280),
    author: passage.bookAuthor,
    book: passage.bookTitle,
    chapter: `Ch. ${passage.chapterNumber}: ${passage.chapterTitle}`,
  })}`;

  return {
    title: `"${truncated}" — ${passage.bookAuthor}`,
    description: `${truncated} — ${citation}`,
    openGraph: {
      type: "article",
      title: `"${truncated}"`,
      description: citation,
      siteName: "SRF Teachings Portal",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: truncated }],
    },
    twitter: {
      card: "summary_large_image",
      title: `"${truncated}"`,
      description: citation,
      images: [ogImageUrl],
    },
    other: {
      "citation_title": passage.bookTitle,
      "citation_author": passage.bookAuthor,
      "citation_publication_date": "1946",
      "citation_publisher": "Self-Realization Fellowship",
      "citation_language": passage.language,
    },
  };
}

export default async function PassagePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("passage");

  const passage = await getPassage(pool, id);
  if (!passage) notFound();

  const passageUrl = `${PORTAL.canonical}/${locale}/passage/${id}`;
  const citation = `${passage.bookAuthor}, ${passage.bookTitle}, Ch. ${passage.chapterNumber}: ${passage.chapterTitle}${passage.pageNumber ? `, p. ${passage.pageNumber}` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    text: passage.content,
    author: { "@type": "Person", name: passage.bookAuthor },
    isPartOf: {
      "@type": "Book",
      name: passage.bookTitle,
      author: { "@type": "Person", name: passage.bookAuthor },
    },
    copyrightHolder: {
      "@type": "Organization",
      name: "Self-Realization Fellowship",
    },
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[38rem] px-4 py-8 md:py-16">
        {/* Framing context for external arrivals — M2b-10 (ADR-067) */}
        <p className="mb-6 text-sm text-srf-navy/50">
          {t("fromBook", { book: passage.bookTitle })}
        </p>

        {/* The passage */}
        <blockquote className="mb-6 border-l-2 border-srf-gold/40 pl-6 text-lg leading-relaxed text-srf-navy md:text-xl md:leading-relaxed">
          &ldquo;{passage.content}&rdquo;
        </blockquote>

        {/* Citation */}
        <p className="mb-8 text-sm text-srf-navy/60">&mdash; {citation}</p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/books/${passage.bookId}/${passage.chapterNumber}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy transition-colors hover:bg-(--theme-surface)"
          >
            {t("readInContext")}
          </Link>
          <ShareButton
            url={passageUrl}
            text={`"${passage.content.slice(0, 100)}..." — ${passage.bookAuthor}`}
            title={passage.bookTitle}
          />
        </div>

        {/* Book invitation — M2b-10 */}
        <div className="mt-10 rounded-lg border border-srf-gold/20 bg-(--theme-surface) p-6">
          <p className="mb-3 text-sm font-medium text-srf-navy">
            {t("bookInvitation", { book: passage.bookTitle })}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/books/${passage.bookId}`}
              className="inline-flex min-h-11 items-center rounded-lg bg-srf-navy px-4 py-2 text-sm text-warm-cream transition-colors hover:bg-srf-navy/90"
            >
              {t("exploreBook")}
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy transition-colors hover:bg-warm-cream"
            >
              {t("searchTeachings")}
            </Link>
          </div>
        </div>

        {/* Parting word — M2b-9 */}
        <div className="mt-10">
          <PartingWord locale={locale} />
        </div>

        {/* Copyright notice */}
        <p className="mt-12 text-xs text-srf-navy/30">
          All content is the verbatim published work of{" "}
          {passage.bookAuthor} and is copyrighted by Self-Realization
          Fellowship. Made freely accessible for reading and personal study.
        </p>
      </div>
    </main>
  );
}
