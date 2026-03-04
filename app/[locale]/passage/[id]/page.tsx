/**
 * Passage detail page — shareable single teaching.
 *
 * Full citation, OG meta tags for rich link previews,
 * share functionality, framing context, book invitation.
 * Server Component.
 *
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { resolvePassage } from "@/lib/services/books";
import { PORTAL } from "@/lib/config/srf-links";
import { ShareButton } from "@/app/components/ShareButton";
import { Surface } from "@/app/components/design/Surface";
import { Motif } from "@/app/components/design/Motif";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const passage = await resolvePassage(pool, id);
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
    title: `\u201c${truncated}\u201d \u2014 ${passage.bookAuthor}`,
    description: `${truncated} \u2014 ${citation}`,
    openGraph: {
      type: "article",
      title: `\u201c${truncated}\u201d`,
      description: citation,
      siteName: "SRF Teachings Portal",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: truncated }],
    },
    twitter: {
      card: "summary_large_image",
      title: `\u201c${truncated}\u201d`,
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

  const passage = await resolvePassage(pool, id);
  if (!passage) notFound();

  const passageUrl = `${PORTAL.canonical}/${locale}/passage/${passage.slug}`;
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
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="center" style={{ maxInlineSize: "38em" }}>
        {/* Framing context for external arrivals */}
        <p className="page-subtitle">
          {t("fromBook", { book: passage.bookTitle })}
        </p>
      </div>

      {/* The passage */}
      <div className="center" style={{ maxInlineSize: "38em" }}>
        <Surface as="section" register="sacred" rasa="shanta">
          <blockquote className="passage-quote" style={{ textAlign: "start" }}>
            &ldquo;{passage.content}&rdquo;
          </blockquote>
          <p className="passage-citation" style={{ textAlign: "start" }}>
            &mdash; {citation}
          </p>
        </Surface>
      </div>

      {/* Actions */}
      <div className="center cluster" style={{ maxInlineSize: "38em" }}>
        <Link
          href={`/books/${passage.bookSlug}/${passage.chapterNumber}`}
          className="btn-secondary"
        >
          {t("readInContext")}
        </Link>
        <ShareButton
          url={passageUrl}
          text={`\u201c${passage.content.slice(0, 100)}...\u201d \u2014 ${passage.bookAuthor}`}
          title={passage.bookTitle}
        />
      </div>

      <Motif role="breath" voice="sacred" />

      {/* Book invitation */}
      <div className="center" style={{ maxInlineSize: "38em" }}>
        <Surface as="section" register="instructional">
          <p style={{ fontSize: "0.875rem", fontWeight: 500, marginBlockEnd: "var(--space-default)" }}>
            {t("bookInvitation", { book: passage.bookTitle })}
          </p>
          <div className="cluster">
            <Link href={`/books/${passage.bookSlug}`} className="btn-primary">
              {t("exploreBook")}
            </Link>
            <Link href="/search" className="btn-secondary">
              {t("searchTeachings")}
            </Link>
          </div>
        </Surface>
      </div>

      {/* Copyright notice */}
      <div className="center" style={{ maxInlineSize: "38em" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", opacity: 0.5, marginBlockStart: "var(--space-spacious)" }}>
          All content is the verbatim published work of{" "}
          {passage.bookAuthor} and is copyrighted by Self-Realization
          Fellowship. Made freely accessible for reading and personal study.
        </p>
      </div>
    </div>
  );
}
