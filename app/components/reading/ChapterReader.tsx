/**
 * ChapterReader — the heart of the portal.
 *
 * Server Component. Renders a complete chapter with the full design
 * language: sacred register, content-type-aware typography, section
 * grouping with scene breaks, drop cap, footnotes, motif dividers,
 * attribution, chapter epigraph, and chapter navigation.
 *
 * Content types flow from extraction → assembly → database → here:
 *   prose     → <p>                 (default)
 *   verse     → <div.reader-verse>  (preserved line breaks, centered)
 *   epigraph  → <blockquote.reader-epigraph> + optional .reader-citation
 *   dialogue  → <p.reader-dialogue> (tighter rhythm)
 *   caption   → <p.book-caption>    (near images)
 *
 * Sections (from assembly's sectionIndex) are separated by scene
 * breaks — <hr.reader-scene-break> — the swelled gold/crimson rule
 * from css/typography/features.css.
 *
 * Multi-lingual: sets lang attribute from book.language (not UI locale).
 * CSS responds via :lang() selectors — Devanagari gets narrower measure
 * and taller line-height (registers.css), Latin gets drop caps (FTR-131).
 *
 * Zero JavaScript. Interactive features hydrate separately.
 *
 * Source pattern: patterns/reading-surface.pattern.json
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import type { ChapterContent, ChapterParagraph, ContentType } from "@/lib/services/books";
import { RichText } from "@/app/components/RichText";
import { Surface } from "@/app/components/design/Surface";
import { Motif } from "@/app/components/design/Motif";
import { Attribution } from "./Attribution";
import { ChapterNav } from "./ChapterNav";
import { FootnoteList } from "./FootnoteList";

interface ChapterReaderProps {
  content: ChapterContent;
  /** Paragraph IDs that have related teachings (golden thread). */
  threadParagraphs?: Set<number>;
  /** Publication slug (activates crimson structural voice). */
  publication?: string;
}

/** Scripts where drop caps are inappropriate (no clear initial letter). */
const NO_DROP_CAP_LANGS = new Set(["hi", "bn", "ta", "te", "kn", "ml", "gu", "or", "pa"]);

export function ChapterReader({
  content,
  threadParagraphs,
  publication,
}: ChapterReaderProps) {
  const { chapter, book, paragraphs, footnotes, images } = content;
  const isPublished = !!publication;
  const rasa = chapter.rasa ?? "shanta";
  const allowDropCap = !NO_DROP_CAP_LANGS.has(book.language);

  // Group paragraphs into sections by sectionIndex.
  // Each group renders as a unit; scene breaks appear between groups.
  const sections = groupBySections(paragraphs);

  // Pre-compute image positions (paragraph index → image).
  const imageMap = buildImageMap(images, paragraphs);

  // Track whether we've seen the first prose paragraph (for drop cap).
  let firstProseRendered = false;

  // Chapter-level epigraph paragraphs are included in the paragraph
  // stream with contentType "epigraph" — we render them inline in their
  // section position, not duplicated from chapter metadata. The chapter
  // metadata fields (epigraph, epigraphAttribution) are available for
  // structured data (JSON-LD) and search indexing.

  return (
    <Surface
      as="article"
      register="sacred"
      rasa={rasa}
      publication={publication}
      className="center"
      lang={book.language}
    >
      {/* Chapter header */}
      <header className="chapter-header">
        <nav className="chapter-breadcrumb" aria-label="Breadcrumb">
          <a href={`/books/${book.slug}`} title="Table of Contents">{book.title}</a>
        </nav>
        <span className="chapter-label">
          Chapter {chapter.chapterNumber}
        </span>
        <h1 className="chapter-title">{chapter.title}</h1>
        <Attribution book={book} />
      </header>

      {/* Chapter body — sections separated by scene breaks */}
      <div className="chapter-body reader-content">
        {sections.map((section, sectionIdx) => (
          <div key={`section-${section.index}`}>
            {/* Scene break between sections (not before the first) */}
            {sectionIdx > 0 && (
              <hr className="reader-scene-break" aria-hidden="true" />
            )}

            {section.paragraphs.map((para, paraLocalIdx) => {
              const globalIdx = para._globalIndex;
              const hasThread = threadParagraphs?.has(globalIdx);
              const image = imageMap.get(globalIdx);

              // Drop cap: only on the first prose paragraph in the chapter,
              // only for scripts with clear initial letters (Latin, etc.),
              // and only if the paragraph starts with an uppercase letter or
              // opening quotation (guards against mid-sentence chunk artifacts).
              // Consume the slot even if the paragraph doesn't qualify —
              // drop cap never cascades to later paragraphs.
              const isFirstProseSlot = !firstProseRendered
                && para.contentType === "prose";
              if (isFirstProseSlot) firstProseRendered = true;
              const isFirstProse = isFirstProseSlot
                && allowDropCap
                && /^[\u201c\u201e"'\u2018\u00ab\u2014\u2015(¡¿]?[A-Z\u00C0-\u024F]/.test(para.content);

              return (
                <div key={para.id}>
                  {image && (
                    <figure className="book-figure">
                      <img
                        className="book-figure-img"
                        src={image.imagePath}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                      />
                      {image.caption && (
                        <figcaption className="book-caption">
                          {image.caption.split("\n").map((line, i) => (
                            <span key={i} className={i === 0 ? "book-caption-name" : "book-caption-desc"}>
                              {line}
                            </span>
                          ))}
                        </figcaption>
                      )}
                    </figure>
                  )}
                  {renderParagraph(
                    para,
                    globalIdx,
                    isFirstProse,
                    hasThread,
                    footnotes,
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footnotes — still chapter content, before the closing ornament */}
      {footnotes.length > 0 && (
        <FootnoteList footnotes={footnotes} />
      )}

      {/* Chapter close motif — the terminal ornament, after all content */}
      <Motif role="close" voice={isPublished ? "crimson" : "sacred"} />

      {/* Print-only: full provenance at chapter end (PRI-02) */}
      <div className="print-citation" aria-hidden="true">
        <p>
          {book.author}, <cite>{book.title}</cite>
          {book.publicationYear && ` (${book.publicationYear})`}
        </p>
        <p>
          Chapter {chapter.chapterNumber}: &ldquo;{chapter.title}&rdquo;
        </p>
        <p>Self-Realization Fellowship &middot; yogananda.tech</p>
      </div>

      {/* Chapter navigation */}
      <ChapterNav
        bookSlug={book.slug}
        prev={content.prevChapter}
        next={content.nextChapter}
      />
    </Surface>
  );
}

/**
 * Render a single paragraph with content-type-aware markup.
 * The closed vocabulary loop: database content_type → HTML class → CSS rule.
 */
function renderParagraph(
  para: ChapterParagraph & { _globalIndex: number },
  globalIdx: number,
  dropCap: boolean,
  hasThread: boolean | undefined,
  footnotes: ChapterContent["footnotes"],
) {
  const threadProps = hasThread
    ? { "data-has-thread": true, className: "golden-thread-passage" }
    : {};

  switch (para.contentType) {
    case "verse":
      return (
        <div
          id={`passage-${para.id}`}
          data-paragraph={globalIdx}
          data-content-type="verse"
          className="reader-verse"
          {...threadProps}
        >
          <RichText
            text={para.content}
            formatting={para.formatting}
            footnotes={footnotes}
          />
        </div>
      );

    case "epigraph":
      return (
        <blockquote
          id={`passage-${para.id}`}
          data-paragraph={globalIdx}
          data-content-type="epigraph"
          className="reader-epigraph"
          {...threadProps}
        >
          <RichText
            text={para.content}
            formatting={para.formatting}
            footnotes={footnotes}
          />
        </blockquote>
      );

    case "caption":
      // Captions without paired images are hidden — they appear orphaned
      // without visual context. Will render when chapters.images is populated
      // with SRF-authorized photographs (content pipeline task, not code).
      return null;

    case "dialogue":
      return (
        <p
          id={`passage-${para.id}`}
          data-paragraph={globalIdx}
          data-content-type="dialogue"
          className={cn("reader-dialogue", threadProps.className)}
          {...(hasThread ? { "data-has-thread": true } : {})}
        >
          <RichText
            text={para.content}
            formatting={para.formatting}
            footnotes={footnotes}
          />
        </p>
      );

    case "prose":
    default:
      return (
        <p
          id={`passage-${para.id}`}
          data-paragraph={globalIdx}
          data-content-type="prose"
          className={threadProps.className || undefined}
          {...(hasThread ? { "data-has-thread": true } : {})}
        >
          <RichText
            text={para.content}
            formatting={para.formatting}
            footnotes={footnotes}
            dropCap={dropCap}
          />
        </p>
      );
  }
}

/** Minimal className joiner — avoids a dependency for two strings. */
function cn(...parts: (string | undefined | false)[]): string | undefined {
  const joined = parts.filter(Boolean).join(" ");
  return joined || undefined;
}

/** Paragraph with its global index preserved for data-paragraph attributes. */
type IndexedParagraph = ChapterParagraph & { _globalIndex: number };

interface Section {
  index: number;
  paragraphs: IndexedParagraph[];
}

/**
 * Group paragraphs by sectionIndex into renderable sections.
 * Each section boundary becomes a scene break in the output.
 */
function groupBySections(paragraphs: ChapterParagraph[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  paragraphs.forEach((para, globalIdx) => {
    const indexed = { ...para, _globalIndex: globalIdx };

    if (!current || para.sectionIndex !== current.index) {
      current = { index: para.sectionIndex, paragraphs: [indexed] };
      sections.push(current);
    } else {
      current.paragraphs.push(indexed);
    }
  });

  return sections;
}

/**
 * Build a map from paragraph globalIndex → image for that position.
 *
 * Each image appears before the first paragraph whose page number
 * meets or exceeds the image's page number. Images without a matching
 * paragraph are placed proportionally.
 */
function buildImageMap(
  images: ChapterContent["images"],
  paragraphs: ChapterParagraph[],
): Map<number, ChapterContent["images"][number]> {
  const map = new Map<number, ChapterContent["images"][number]>();
  if (!images || images.length === 0) return map;

  for (const img of images) {
    // Find the first paragraph at or after the image's page
    let targetIdx = -1;
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].pageNumber != null && paragraphs[i].pageNumber! >= img.pageNumber) {
        targetIdx = i;
        break;
      }
    }
    // Fallback: proportional placement
    if (targetIdx === -1) {
      targetIdx = Math.min(
        Math.round((img.pageNumber / (images[images.length - 1].pageNumber + 1)) * paragraphs.length),
        paragraphs.length - 1,
      );
    }
    // Don't overwrite — first image at a position wins
    if (!map.has(targetIdx)) {
      map.set(targetIdx, img);
    }
  }
  return map;
}
