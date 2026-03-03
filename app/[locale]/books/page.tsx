/**
 * Books catalog — M2a-2.
 *
 * Lists available books with cover images, editorial descriptions,
 * chapter counts, and SRF Bookstore links.
 * Warm, unhurried design even with few books.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import pool from "@/lib/db";
import { getBooks, getChapters } from "@/lib/services/books";
import { localeNames } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import { PORTAL } from "@/lib/config/srf-links";
import { SRF_BOOKSTORE } from "@/lib/config/srf-links";
import { MarkBooksSeen } from "@/app/components/MarkBooksSeen";
import { NewBookBadge } from "@/app/components/NewBookBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("books");
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("heading"),
    alternates: {
      canonical: `${prefix}/books`,
      languages: { en: "/books", es: "/es/books" },
    },
  };
}

export default async function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("books");
  // Show books matching the current locale first; fall back to all books
  // only if no books exist in the current locale (ADR-077 cross-language fallback)
  let books = await getBooks(pool, locale);
  const hasLocaleBooks = books.length > 0;
  if (!hasLocaleBooks) {
    books = await getBooks(pool);
  }

  // Get chapter counts for each book
  const booksWithChapters = await Promise.all(
    books.map(async (book) => {
      const chapters = await getChapters(pool, book.id);
      return { ...book, chapterCount: chapters.length };
    }),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("heading"),
    url: `${PORTAL.canonical}/${locale}/books`,
    hasPart: booksWithChapters.map((book) => ({
      "@type": "Book",
      name: book.title,
      author: { "@type": "Person", name: book.author },
      inLanguage: book.language,
      ...(book.publicationYear && { datePublished: String(book.publicationYear) }),
      url: `${PORTAL.canonical}/${locale}/books/${book.slug}`,
      numberOfPages: book.chapterCount,
      copyrightHolder: {
        "@type": "Organization",
        name: "Self-Realization Fellowship",
      },
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="mb-2 font-display text-2xl text-srf-navy md:text-3xl">
          {t("heading")}
        </h1>
        <p className="mb-8 text-sm text-srf-navy/60">
          {t("subtitle")}
        </p>

        {booksWithChapters.length === 0 ? (
          <p className="py-12 text-center text-srf-navy/50">
            {t("noBooks")}
          </p>
        ) : (
          <>
            {/* M3a-8: mark catalog as seen when seeker visits Books */}
            <MarkBooksSeen bookIds={booksWithChapters.map((b) => b.id)} />

            <div className="space-y-4">
              {booksWithChapters.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  className="block rounded-lg border border-srf-navy/10 bg-(--theme-surface) p-6 transition-colors hover:border-srf-gold/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="mb-1 font-display text-lg text-srf-navy md:text-xl">
                        {book.title}
                        {/* M3a-8: "New" badge for unseen books */}
                        <NewBookBadge
                          bookId={book.id}
                          allBookIds={booksWithChapters.map((b) => b.id)}
                        />
                      </h2>
                      <p className="text-sm text-srf-navy/60">
                        {book.author}
                        {book.publicationYear && ` (${book.publicationYear})`}
                      </p>
                      <p className="mt-1 text-xs text-srf-navy/40">
                        {book.chapterCount} chapters
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-srf-navy/5 px-2 py-0.5 text-xs text-srf-navy/60">
                      {localeNames[book.language as Locale] || book.language}
                    </span>
                  </div>
                  </Link>
              ))}
            </div>

            {/* Honest "more coming" note */}
            <p className="mt-8 text-center text-sm text-srf-navy/40 italic">
              {t("moreComingSoon")}
            </p>

            {/* SRF Bookstore signpost */}
            <p className="mt-4 text-center text-sm">
              <a
                href={SRF_BOOKSTORE.home}
                target="_blank"
                rel="noopener noreferrer"
                className="text-srf-navy/50 underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-navy"
              >
                {t("bookstoreSignpost")}
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
