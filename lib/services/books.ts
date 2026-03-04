/**
 * Book and chapter services.
 *
 * Framework-agnostic (PRI-10). Receives a pg.Pool as dependency.
 */

import type pg from "pg";

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  language: string;
  publicationYear: number | null;
  coverImageUrl: string | null;
  bookstoreUrl: string | null;
}

export type ContentType = "prose" | "verse" | "epigraph" | "dialogue" | "caption";
export type Rasa = "shanta" | "adbhuta" | "karuna" | "vira" | "bhakti";

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  sortOrder: number;
  epigraph: string | null;
  epigraphAttribution: string | null;
  rasa: Rasa | null;
}

export interface FormattingSpan {
  start: number;
  end: number;
  style: string;
}

export interface Footnote {
  marker: string;
  text: string;
  pageNumber: number;
}

export interface ChapterImage {
  pageNumber: number;
  imagePath: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
}

export interface ChapterParagraph {
  id: string;
  content: string;
  formatting: FormattingSpan[];
  pageNumber: number | null;
  paragraphIndex: number | null;
  contentType: ContentType;
  sectionIndex: number;
  sortOrder: number | null;
  rasa: Rasa | null;
}

export interface ChapterContent {
  chapter: Chapter;
  book: Book;
  paragraphs: ChapterParagraph[];
  footnotes: Footnote[];
  images: ChapterImage[];
  prevChapter: { id: string; chapterNumber: number; title: string } | null;
  nextChapter: { id: string; chapterNumber: number; title: string } | null;
}

/** Timestamp filters for incremental sync (M2a-24). */
export interface TimestampFilter {
  updatedSince?: string | null;
  createdSince?: string | null;
}

/**
 * Get books, optionally filtered by language and/or timestamps.
 */
export async function getBooks(
  pool: pg.Pool,
  language?: string,
  filters?: TimestampFilter,
): Promise<Book[]> {
  const conditions: string[] = [];
  const params: string[] = [];
  let idx = 1;

  if (language) {
    conditions.push(`language = $${idx++}`);
    params.push(language);
  }
  if (filters?.updatedSince) {
    conditions.push(`updated_at > $${idx++}`);
    params.push(filters.updatedSince);
  }
  if (filters?.createdSince) {
    conditions.push(`created_at > $${idx++}`);
    params.push(filters.createdSince);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT id, slug, title, author, language, publication_year, cover_image_url, bookstore_url
     FROM books ${where} ORDER BY language, title`,
    params,
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    author: r.author,
    language: r.language,
    publicationYear: r.publication_year,
    coverImageUrl: r.cover_image_url,
    bookstoreUrl: r.bookstore_url,
  }));
}

export async function getChapters(
  pool: pg.Pool,
  bookId: string,
  filters?: TimestampFilter,
): Promise<Chapter[]> {
  const conditions: string[] = [`book_id = $1`];
  const params: string[] = [bookId];
  let idx = 2;

  if (filters?.updatedSince) {
    conditions.push(`updated_at > $${idx++}`);
    params.push(filters.updatedSince);
  }
  if (filters?.createdSince) {
    conditions.push(`created_at > $${idx++}`);
    params.push(filters.createdSince);
  }

  const { rows } = await pool.query(
    `SELECT id, book_id, chapter_number, title, sort_order,
            epigraph, epigraph_attribution, rasa
     FROM chapters WHERE ${conditions.join(" AND ")} ORDER BY sort_order`,
    params,
  );
  return rows.map((r) => ({
    id: r.id,
    bookId: r.book_id,
    chapterNumber: r.chapter_number,
    title: r.title,
    sortOrder: r.sort_order,
    epigraph: r.epigraph ?? null,
    epigraphAttribution: r.epigraph_attribution ?? null,
    rasa: r.rasa ?? null,
  }));
}

/**
 * Find the equivalent book in a target language (cross-language linking, PRI-06).
 * Matches by author + same chapter count — works for translations of the same work.
 * Future: use a dedicated `work_id` column for explicit cross-language linking.
 */
export async function getEquivalentBook(
  pool: pg.Pool,
  bookId: string,
  targetLanguage: string,
): Promise<Book | null> {
  const { rows } = await pool.query(
    `SELECT b2.id, b2.slug, b2.title, b2.author, b2.language, b2.publication_year,
            b2.cover_image_url, b2.bookstore_url
     FROM books b1
     JOIN books b2 ON b2.author = b1.author AND b2.language = $2 AND b2.id != b1.id
     WHERE b1.id = $1
     LIMIT 1`,
    [bookId, targetLanguage],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    author: r.author,
    language: r.language,
    publicationYear: r.publication_year,
    coverImageUrl: r.cover_image_url,
    bookstoreUrl: r.bookstore_url,
  };
}

export interface Passage {
  id: string;
  slug: string;
  content: string;
  language: string;
  pageNumber: number | null;
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterTitle: string;
  chapterNumber: number;
}

/** Get a single passage (book chunk) by ID with full citation. */
export async function getPassage(
  pool: pg.Pool,
  passageId: string,
): Promise<Passage | null> {
  const { rows } = await pool.query(
    `SELECT bc.id, bc.slug, bc.content, bc.language, bc.page_number,
            b.id AS book_id, b.slug AS book_slug, b.title AS book_title,
            b.author AS book_author,
            c.title AS chapter_title, c.chapter_number
     FROM book_chunks bc
     JOIN books b ON b.id = bc.book_id
     JOIN chapters c ON c.id = bc.chapter_id
     WHERE bc.id = $1`,
    [passageId],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    slug: r.slug,
    content: r.content,
    language: r.language,
    pageNumber: r.page_number,
    bookId: r.book_id,
    bookSlug: r.book_slug,
    bookTitle: r.book_title,
    bookAuthor: r.book_author,
    chapterTitle: r.chapter_title,
    chapterNumber: r.chapter_number,
  };
}

/**
 * Resolve a passage by slug or UUID (backward-compatible).
 * Tries slug first (the common frontend path), falls back to UUID
 * for old bookmarks and external links.
 */
export async function resolvePassage(
  pool: pg.Pool,
  identifier: string,
): Promise<Passage | null> {
  const { rows } = await pool.query(
    `SELECT bc.id, bc.slug, bc.content, bc.language, bc.page_number,
            b.id AS book_id, b.slug AS book_slug, b.title AS book_title,
            b.author AS book_author,
            c.title AS chapter_title, c.chapter_number
     FROM book_chunks bc
     JOIN books b ON b.id = bc.book_id
     JOIN chapters c ON c.id = bc.chapter_id
     WHERE bc.slug = $1 OR bc.id::text = $1
     LIMIT 1`,
    [identifier],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    slug: r.slug,
    content: r.content,
    language: r.language,
    pageNumber: r.page_number,
    bookId: r.book_id,
    bookSlug: r.book_slug,
    bookTitle: r.book_title,
    bookAuthor: r.book_author,
    chapterTitle: r.chapter_title,
    chapterNumber: r.chapter_number,
  };
}

export async function getChapterContent(
  pool: pg.Pool,
  bookId: string,
  chapterNumber: number,
): Promise<ChapterContent | null> {
  // Get chapter (with footnotes, epigraph, rasa)
  const chResult = await pool.query(
    `SELECT c.id, c.book_id, c.chapter_number, c.title, c.sort_order,
            c.footnotes, c.images, c.epigraph, c.epigraph_attribution, c.rasa,
            b.slug as book_slug, b.title as book_title, b.author as book_author,
            b.language, b.publication_year, b.cover_image_url, b.bookstore_url
     FROM chapters c
     JOIN books b ON b.id = c.book_id
     WHERE c.book_id = $1 AND c.chapter_number = $2`,
    [bookId, chapterNumber],
  );

  if (chResult.rows.length === 0) return null;
  const ch = chResult.rows[0];

  // Get paragraphs with content structure fields.
  // sort_order is the canonical ordering (gapless within chapter).
  // Falls back to paragraph_index for data ingested before migration 008.
  const paraResult = await pool.query(
    `SELECT id, content, formatting, page_number, paragraph_index,
            content_type, section_index, sort_order, rasa
     FROM book_chunks
     WHERE chapter_id = $1
     ORDER BY COALESCE(sort_order, paragraph_index), created_at`,
    [ch.id],
  );

  // Get prev/next chapters
  const navResult = await pool.query(
    `SELECT id, chapter_number, title, sort_order
     FROM chapters WHERE book_id = $1
     AND sort_order IN ($2, $3)
     ORDER BY sort_order`,
    [bookId, ch.sort_order - 1, ch.sort_order + 1],
  );

  const prev = navResult.rows.find((r) => r.sort_order < ch.sort_order) || null;
  const next = navResult.rows.find((r) => r.sort_order > ch.sort_order) || null;

  return {
    chapter: {
      id: ch.id,
      bookId: ch.book_id,
      chapterNumber: ch.chapter_number,
      title: ch.title,
      sortOrder: ch.sort_order,
      epigraph: ch.epigraph ?? null,
      epigraphAttribution: ch.epigraph_attribution ?? null,
      rasa: ch.rasa ?? null,
    },
    book: {
      id: ch.book_id,
      slug: ch.book_slug,
      title: ch.book_title,
      author: ch.book_author,
      language: ch.language,
      publicationYear: ch.publication_year,
      coverImageUrl: ch.cover_image_url,
      bookstoreUrl: ch.bookstore_url,
    },
    paragraphs: paraResult.rows.map((r) => ({
      id: r.id,
      content: r.content,
      formatting: r.formatting || [],
      pageNumber: r.page_number,
      paragraphIndex: r.paragraph_index,
      contentType: (r.content_type as ContentType) || "prose",
      sectionIndex: r.section_index ?? 0,
      sortOrder: r.sort_order ?? null,
      rasa: (r.rasa as Rasa) ?? null,
    })),
    footnotes: ch.footnotes || [],
    images: (ch.images || []).map((img: ChapterImage) => ({
      pageNumber: img.pageNumber,
      imagePath: img.imagePath,
      alt: img.alt,
      caption: img.caption,
      width: img.width,
      height: img.height,
    })),
    prevChapter: prev
      ? { id: prev.id, chapterNumber: prev.chapter_number, title: prev.title }
      : null,
    nextChapter: next
      ? { id: next.id, chapterNumber: next.chapter_number, title: next.title }
      : null,
  };
}

/**
 * Resolve a book by slug or UUID (backward-compatible).
 * Tries slug first (the common frontend path), falls back to UUID
 * for old bookmarks and external links.
 */
export async function resolveBook(
  pool: pg.Pool,
  identifier: string,
): Promise<Book | null> {
  const { rows } = await pool.query(
    `SELECT id, slug, title, author, language, publication_year,
            cover_image_url, bookstore_url
     FROM books
     WHERE slug = $1 OR id::text = $1
     LIMIT 1`,
    [identifier],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    author: r.author,
    language: r.language,
    publicationYear: r.publication_year,
    coverImageUrl: r.cover_image_url,
    bookstoreUrl: r.bookstore_url,
  };
}

/**
 * Get chapter content by book slug or UUID (backward-compatible).
 * Resolves the book first, then delegates to getChapterContent.
 */
export async function resolveChapterContent(
  pool: pg.Pool,
  bookIdentifier: string,
  chapterNumber: number,
): Promise<ChapterContent | null> {
  const book = await resolveBook(pool, bookIdentifier);
  if (!book) return null;
  return getChapterContent(pool, book.id, chapterNumber);
}
