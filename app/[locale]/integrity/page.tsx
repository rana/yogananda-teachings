/**
 * Content integrity page — M2a-15 (ADR-039).
 *
 * Lists all books and chapter hashes with verification instructions.
 * SHA-256 per chapter computed at ingestion time.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import pool from "@/lib/db";
import { getBooks } from "@/lib/services/books";

export const revalidate = 86400; // 24 hours

export default async function IntegrityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("integrity");

  const books = await getBooks(pool);

  // Get chapters with content hashes for each book
  const booksWithHashes = await Promise.all(
    books.map(async (book) => {
      // Get content hashes from book_chunks
      const { rows } = await pool.query(
        `SELECT c.chapter_number, c.title,
                encode(sha256(string_agg(bc.content, '' ORDER BY bc.paragraph_index)::bytea), 'hex') as content_hash
         FROM chapters c
         LEFT JOIN book_chunks bc ON bc.chapter_id = c.id
         WHERE c.book_id = $1
         GROUP BY c.id, c.chapter_number, c.title, c.sort_order
         ORDER BY c.sort_order`,
        [book.id],
      );
      return {
        ...book,
        chapters: rows.map((r: { chapter_number: number; title: string; content_hash: string | null }) => ({
          chapterNumber: r.chapter_number,
          title: r.title,
          hash: r.content_hash || "pending",
        })),
      };
    }),
  );

  return (
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="mb-2 font-display text-2xl text-srf-navy md:text-3xl">
          {t("heading")}
        </h1>
        <p className="mb-2 text-sm text-srf-navy/60">{t("subtitle")}</p>
        <p className="mb-8 text-xs text-srf-navy/40">{t("description")}</p>

        {booksWithHashes.map((book) => (
          <section key={book.id} className="mb-8">
            <h2 className="mb-3 font-display text-lg text-srf-navy">
              {book.title}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-srf-navy/10 bg-(--theme-surface)">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-srf-navy/5">
                    <th className="px-3 py-2 text-start font-sans font-semibold text-srf-navy/60">
                      Ch.
                    </th>
                    <th className="px-3 py-2 text-start font-sans font-semibold text-srf-navy/60">
                      Title
                    </th>
                    <th className="px-3 py-2 text-start font-sans font-semibold text-srf-navy/60">
                      SHA-256
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {book.chapters.map((ch) => (
                    <tr
                      key={ch.chapterNumber}
                      className="border-b border-srf-navy/5 last:border-0"
                    >
                      <td className="px-3 py-1.5 tabular-nums text-srf-navy/50">
                        {ch.chapterNumber}
                      </td>
                      <td className="px-3 py-1.5 text-srf-navy/80">
                        {ch.title}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-srf-navy/40">
                        {ch.hash === "pending" ? "—" : ch.hash.slice(0, 16) + "..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
