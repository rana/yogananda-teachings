/**
 * Browse — The Complete Index — M2a-18 (DES-047).
 *
 * High-density text page listing all navigable content.
 * Milestone 2a: books only (by language, with chapter counts).
 * Designed text-first — semantic HTML, zero JavaScript, zero images.
 * Auto-generated from database at build time (ISR).
 * < 20KB total. Ideal screen reader experience.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import pool from "@/lib/db";
import { getBooks, getChapters } from "@/lib/services/books";
import { localeNames } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export const revalidate = 86400; // 24 hours

export default async function BrowsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("browse");

  const books = await getBooks(pool);

  // Group books by language and get chapter counts
  const booksByLanguage: Record<string, (typeof books[number] & { chapterCount: number })[]> = {};
  for (const book of books) {
    const chapters = await getChapters(pool, book.id);
    const enriched = { ...book, chapterCount: chapters.length };
    if (!booksByLanguage[book.language]) {
      booksByLanguage[book.language] = [];
    }
    booksByLanguage[book.language].push(enriched);
  }

  return (
    <main
      id="main-content"
      className="min-h-screen"
      aria-label={t("heading")}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="mb-2 font-display text-2xl text-srf-navy md:text-3xl">
          {t("heading")}
        </h1>
        <p className="mb-8 text-sm text-srf-navy/60">{t("subtitle")}</p>

        {/* Books section */}
        <section>
          <h2 className="mb-4 font-display text-lg text-srf-navy">
            {t("booksSection")}
          </h2>

          {Object.entries(booksByLanguage).map(([lang, langBooks]) => (
            <div key={lang} className="mb-6">
              <h3 className="mb-2 text-xs font-sans font-semibold uppercase tracking-widest text-srf-navy/40">
                {localeNames[lang as Locale] || lang}
              </h3>
              <ul className="space-y-1">
                {langBooks.map((book) => (
                  <li key={book.id}>
                    <Link
                      href={`/books/${book.slug}`}
                      className="inline text-sm text-srf-navy hover:text-srf-gold"
                    >
                      {book.title}
                    </Link>
                    <span className="text-xs text-srf-navy/40">
                      {" "}
                      — {book.author} ({book.chapterCount} ch.)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
