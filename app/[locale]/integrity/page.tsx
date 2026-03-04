/**
 * Content integrity page — verification hashes.
 *
 * Lists all books and chapter SHA-256 hashes.
 * Ensures verbatim fidelity is independently verifiable.
 * Server Component.
 *
 * Governed by: PRI-01 (verbatim fidelity)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import pool from "@/lib/db";
import { getBooks } from "@/lib/services/books";
import { Surface } from "@/app/components/design/Surface";

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

  const booksWithHashes = await Promise.all(
    books.map(async (book) => {
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
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>

      <Surface as="header" register="instructional" className="center">
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", opacity: 0.6, marginBlockStart: "var(--space-compact)" }}>
          {t("description")}
        </p>
      </Surface>

      <div className="center stack-generous">
        {booksWithHashes.map((book) => (
          <section key={book.id}>
            <h2 className="section-heading">{book.title}</h2>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ch.</th>
                    <th>Title</th>
                    <th>SHA-256</th>
                  </tr>
                </thead>
                <tbody>
                  {book.chapters.map((ch) => (
                    <tr key={ch.chapterNumber}>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>
                        {ch.chapterNumber}
                      </td>
                      <td>{ch.title}</td>
                      <td style={{ fontFamily: "monospace", opacity: 0.5 }}>
                        {ch.hash === "pending" ? "\u2014" : ch.hash.slice(0, 16) + "..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
