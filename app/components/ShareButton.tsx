"use client";

/**
 * Share button — M2a-6 (DES-006).
 *
 * Uses Web Share API where available, falls back to clipboard copy.
 * Shares passage text with full citation (PRI-02: full attribution always).
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { sendResonance } from "@/lib/resonance-beacon";

interface ShareButtonProps {
  /** Passage text for citation-based sharing (search results) */
  passage?: string;
  citation?: {
    author: string;
    book: string;
    chapter: string;
    chapterNumber: number;
    page?: number | null;
  };
  /** Simplified props for passage page sharing */
  url?: string;
  text?: string;
  title?: string;
  /** Chunk ID for resonance tracking (M3a-7) */
  chunkId?: string;
}

export function ShareButton({ passage, citation, url, text, title, chunkId }: ShareButtonProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const shareText = passage && citation
    ? `"${passage}"\n\n— ${citation.author}, ${citation.book}, Ch. ${citation.chapterNumber}: ${citation.chapter}${citation.page ? `, p. ${citation.page}` : ""}`
    : text || "";

  const shareTitle = citation
    ? `${citation.book} — ${citation.chapter}`
    : title || "";

  const handleShare = useCallback(async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    // Web Share API (mobile, supported browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        // M3a-7: record share resonance
        if (chunkId) sendResonance(chunkId, "share");
        return;
      } catch {
        // User cancelled or API failed — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // M3a-7: record share resonance (copy counts as share)
      if (chunkId) sendResonance(chunkId, "share");
    } catch {
      // Clipboard API unavailable
    }
  }, [shareText, shareTitle, url, chunkId]);

  return (
    <button
      type="button"
      onClick={handleShare}
      data-no-print
      className="share-btn"
      aria-label={t("button")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .799l6.732 3.365a2.5 2.5 0 1 1-.671 1.341l-6.732-3.365a2.5 2.5 0 1 1 0-3.482l6.732-3.365A2.52 2.52 0 0 1 13 4.5Z" />
      </svg>
      {copied ? t("copied") : t("button")}
    </button>
  );
}
