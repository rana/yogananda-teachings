/**
 * Books catalog — the library threshold.
 *
 * Lists available books with editorial descriptions,
 * chapter counts, and SRF Bookstore signpost.
 * Warm, unhurried. Server Component.
 *
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import pool from "@/lib/db";
import { getBooks, getChapters } from "@/lib/services/books";
import type { Metadata } from "next";
import { PORTAL, SRF_BOOKSTORE } from "@/lib/config/srf-links";
import { Surface } from "@/app/components/design/Surface";
import { Motif } from "@/app/components/design/Motif";

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
  if (books.length === 0) {
    books = await getBooks(pool);
  }

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
    <div className="stack-generous" style={{ paddingBlock: "var(--space-generous)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="center">
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </section>

      {booksWithChapters.length === 0 ? (
        <div className="empty-state">
          <Motif role="breath" voice="sacred" />
          <p className="page-subtitle">{t("noBooks")}</p>
        </div>
      ) : (
        <>
          <div className="center stack">
            {booksWithChapters.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="card"
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-default)" }}>
                  {book.coverImageUrl && (
                    <img
                      src={book.coverImageUrl}
                      alt=""
                      loading="lazy"
                      style={{
                        flexShrink: 0,
                        width: "auto",
                        height: "120px",
                        borderRadius: "var(--radius-gentle, 4px)",
                        boxShadow: "0 1px 4px color-mix(in oklch, var(--color-text), transparent 90%)",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                      {book.title}
                    </strong>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBlockStart: "var(--space-compact)" }}>
                      {book.author}
                      {book.publicationYear && ` (${book.publicationYear})`}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", opacity: 0.6, marginBlockStart: "2px" }}>
                      {t("chapters", { count: book.chapterCount })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="signpost">
            <p style={{ fontStyle: "italic", opacity: 0.7 }}>
              {t("moreComingSoon")}
            </p>
          </div>

          <div className="signpost">
            <p>
              <a
                href={SRF_BOOKSTORE.home}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("bookstoreSignpost")}
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
