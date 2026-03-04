/**
 * ChapterReader — the heart of the portal.
 *
 * Server Component. Renders a complete chapter with the full design
 * language: sacred register, reading typography, drop cap, footnotes,
 * motif dividers, attribution, and chapter navigation.
 *
 * Zero JavaScript. The content arrives as complete HTML styled by CSS.
 * Interactive features (dwell mode, keyboard nav) hydrate separately.
 *
 * Source pattern: patterns/reading-surface.pattern.json
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import type { ChapterContent } from "@/lib/services/books";
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

export function ChapterReader({
  content,
  threadParagraphs,
  publication,
}: ChapterReaderProps) {
  const { chapter, book, paragraphs, footnotes, images } = content;
  const isPublished = !!publication;

  return (
    <Surface
      as="article"
      register="sacred"
      rasa="shanta"
      publication={publication}
      className="center"
    >
      {/* Chapter header */}
      <header className="chapter-header">
        <span className="chapter-label">
          Chapter {chapter.chapterNumber}
        </span>
        <h1 className="chapter-title">{chapter.title}</h1>
        <Attribution book={book} />
      </header>

      {/* Chapter body */}
      <div className="chapter-body">
        {paragraphs.map((para, i) => {
          const hasThread = threadParagraphs?.has(i);
          const image = findImageForPosition(images, para.pageNumber, i, paragraphs.length);

          return (
            <div key={para.id}>
              {image && (
                <figure className="chapter-figure">
                  <img
                    src={image.imagePath}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                  />
                  {image.caption && (
                    <figcaption>{image.caption}</figcaption>
                  )}
                </figure>
              )}
              <p
                id={`p-${i}`}
                data-paragraph={i}
                data-has-thread={hasThread || undefined}
                className={hasThread ? "golden-thread-passage" : undefined}
              >
                <RichText
                  text={para.content}
                  formatting={para.formatting}
                  footnotes={footnotes}
                  dropCap={i === 0}
                />
              </p>
            </div>
          );
        })}
      </div>

      {/* Chapter close motif */}
      <Motif role="close" voice={isPublished ? "crimson" : "sacred"} />

      {/* Footnotes */}
      {footnotes.length > 0 && (
        <FootnoteList footnotes={footnotes} />
      )}

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
 * Find an image that should appear before the given paragraph position.
 * Images are sorted by page number and inserted at the paragraph closest
 * to their original page position.
 */
function findImageForPosition(
  images: ChapterContent["images"],
  paraPageNumber: number | null,
  paraIndex: number,
  totalParagraphs: number,
): ChapterContent["images"][number] | undefined {
  if (!images || images.length === 0) return undefined;
  // Simple heuristic: show each image before the paragraph at proportional position
  for (const img of images) {
    const imgPosition = Math.round(
      (img.pageNumber / (images[images.length - 1].pageNumber + 1)) * totalParagraphs
    );
    if (imgPosition === paraIndex) return img;
  }
  return undefined;
}
