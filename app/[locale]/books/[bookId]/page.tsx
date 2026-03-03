/**
 * Book landing page — M2a-2.
 *
 * Cover, metadata, editorial description, and full chapter list.
 * Warm, unhurried design with SRF Bookstore signpost.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getChapters, getEquivalentBook, resolveBook } from "@/lib/services/books";
import type { Metadata } from "next";
import { PORTAL } from "@/lib/config/srf-links";

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
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-srf-navy/50" aria-label="Breadcrumb">
          <Link href="/books" className="hover:text-srf-navy/80">
            {rt("breadcrumbBooks")}
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-srf-navy/80">{book.title}</span>
        </nav>

        {/* Book header */}
        <header className="mb-8">
          <h1 className="mb-1 font-display text-2xl text-srf-navy md:text-3xl">
            {book.title}
          </h1>
          <p className="text-sm text-srf-navy/60">
            {book.author}
            {book.publicationYear && ` (${book.publicationYear})`}
          </p>
        </header>

        {/* Chapter list */}
        {chapters.length === 0 ? (
          <p className="py-12 text-center text-srf-navy/50">
            No chapters available yet.
          </p>
        ) : (
          <ol className="space-y-0.5" aria-label="Chapters">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <Link
                  href={`/books/${book.slug}/${ch.chapterNumber}`}
                  className="flex items-baseline gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-(--theme-surface) min-h-[44px]"
                >
                  <span className="min-w-[2rem] text-end text-sm tabular-nums text-srf-navy/40">
                    {ch.chapterNumber}
                  </span>
                  <span className="text-srf-navy">{ch.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {/* Bookstore signpost */}
        {book.bookstoreUrl && (
          <p className="mt-8 text-center text-sm">
            <a
              href={book.bookstoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-srf-navy/50 underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-navy"
            >
              {t("bookstoreSignpost")}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
