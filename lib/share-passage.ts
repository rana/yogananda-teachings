/**
 * Passage Sharing — format and share Yogananda's words.
 *
 * Formats a passage with full attribution (PRI-02) and shares it
 * via the Web Share API (native OS sharing) or copies to clipboard.
 *
 * The shared text is a gift — beautiful, complete, and honest.
 * Full citation always included. The technology disappears (PRI-03).
 *
 * DELTA-compliant: no tracking of share targets (PRI-09).
 */

export interface ShareablePassage {
  /** The verbatim text to share */
  content: string;
  /** Author of the passage */
  author: string;
  /** Book title */
  bookTitle: string;
  /** Book URL slug */
  bookSlug: string;
  /** Chapter number */
  chapterNumber: number;
  /** Chapter title */
  chapterTitle: string;
  /** Chunk ID for Passage Arrival deep link */
  chunkId: string;
  /** Page number (optional) */
  pageNumber?: number;
}

/**
 * Format a passage as shareable text with full attribution.
 */
export function formatShareText(passage: ShareablePassage): string {
  const lines: string[] = [];

  // Opening quote — verbatim
  lines.push(`"${passage.content}"`);
  lines.push("");

  // Attribution — always full (PRI-02)
  let citation = `— ${passage.author}, ${passage.bookTitle}`;
  citation += `, Ch. ${passage.chapterNumber}`;
  if (passage.pageNumber) {
    citation += ` (p. ${passage.pageNumber})`;
  }
  lines.push(citation);

  return lines.join("\n");
}

/**
 * Build the deep link URL for the shared passage.
 * Uses Passage Arrival hash for exact positioning.
 */
export function buildShareUrl(
  passage: ShareablePassage,
  locale: string,
): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/${locale}/books/${passage.bookSlug}/${passage.chapterNumber}#passage-${passage.chunkId}`;
}

export interface ShareResult {
  /** How the content was shared */
  method: "native" | "clipboard";
  /** Whether the operation succeeded */
  success: boolean;
}

/**
 * Share a passage. Tries Web Share API first, falls back to clipboard.
 *
 * Returns which method was used and whether it succeeded.
 */
export async function sharePassage(
  passage: ShareablePassage,
  locale: string,
): Promise<ShareResult> {
  const text = formatShareText(passage);
  const url = buildShareUrl(passage, locale);

  // Try native Web Share API (mobile browsers, some desktop)
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share({
        text,
        url,
      });
      return { method: "native", success: true };
    } catch (err) {
      // User cancelled — not an error
      if (err instanceof Error && err.name === "AbortError") {
        return { method: "native", success: false };
      }
      // Fall through to clipboard
    }
  }

  // Clipboard fallback
  const clipboardText = `${text}\n\n${url}`;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(clipboardText);
      return { method: "clipboard", success: true };
    }
  } catch {
    // Clipboard API failed — try legacy approach
  }

  // Legacy clipboard fallback
  try {
    const textarea = document.createElement("textarea");
    textarea.value = clipboardText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return { method: "clipboard", success: true };
  } catch {
    return { method: "clipboard", success: false };
  }
}
