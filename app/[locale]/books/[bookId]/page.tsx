/**
 * Book landing page — table of contents.
 *
 * Book title, attribution, and full chapter list.
 * Warm, unhurried. The threshold to deep reading.
 * Server Component.
 *
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getChapters, getEquivalentBook, resolveBook } from "@/lib/services/books";
import type { Metadata } from "next";
import { PORTAL } from "@/lib/config/srf-links";
import { Surface } from "@/app/components/design/Surface";
import { Motif } from "@/app/components/design/Motif";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; bookId: string }>;
}): Promise<Metadata> {
  const { locale, bookId } = await params;
  const book = await resolveBook(pool, bookId);
  if (!book) return {};
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    title: book.title,
    description: `${book.title} by ${book.author} — read chapters online`,
    alternates: {
      canonical: `${prefix}/books/${book.slug}`,
    },
  };
}

export default async function BookLandingPage({
  params,
}: {
  params: Promise<{ locale: string; bookId: string }>;
}) {
  const { locale, bookId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("books");
  const rt = await getTranslations("reader");

  const book = await resolveBook(pool, bookId);
  if (!book) notFound();

  const chapters = await getChapters(pool, book.id);

  // Cross-language redirect: if book language doesn't match locale,
  // redirect to the equivalent book in the current locale (PRI-06)
  if (book.language !== locale) {
    const equivalent = await getEquivalentBook(pool, book.id, locale);
    if (equivalent) {
      redirect(`/${locale}/books/${equivalent.slug}`);
    }
    // No equivalent exists — show this book (ADR-077 cross-language fallback)
  }

  const bookUrl = `${PORTAL.canonical}/${locale}/books/${book.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      author: { "@type": "Person", name: book.author },
      inLanguage: book.language,
      ...(book.publicationYear && { datePublished: String(book.publicationYear) }),
      url: bookUrl,
      copyrightHolder: {
        "@type": "Organization",
        name: "Self-Realization Fellowship",
      },
      publisher: {
        "@type": "Organization",
        name: "Self-Realization Fellowship",
      },
      hasPart: chapters.map((ch) => ({
        "@type": "Chapter",
        name: ch.title,
        position: ch.chapterNumber,
        url: `${bookUrl}/${ch.chapterNumber}`,
      })),
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
          name: book.title,
          item: bookUrl,
        },
      ],
    },
  ];

  return (
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="breadcrumb center" aria-label="Breadcrumb">
        <Link href="/books">{rt("breadcrumbBooks")}</Link>
        <span aria-hidden="true"> / </span>
        <span>{book.title}</span>
      </nav>

      {/* Book header */}
      <Surface as="header" register="reverential" className="center">
        <h1 className="page-title">{book.title}</h1>
        <p className="page-subtitle">
          {book.author}
          {book.publicationYear && ` (${book.publicationYear})`}
        </p>
      </Surface>

      <Motif role="breath" voice="sacred" />

      {/* Chapter list */}
      {chapters.length === 0 ? (
        <div className="empty-state">
          <p className="page-subtitle">No chapters available yet.</p>
        </div>
      ) : (
        <nav className="center">
          <ol className="chapter-list" aria-label="Chapters">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <Link
                  href={`/books/${book.slug}/${ch.chapterNumber}`}
                  className="chapter-list-item"
                >
                  <span className="chapter-list-number">{ch.chapterNumber}</span>
                  <span className="chapter-list-title">{ch.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Bookstore signpost */}
      {book.bookstoreUrl && (
        <div className="signpost">
          <p>
            <a
              href={book.bookstoreUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("bookstoreSignpost")}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
