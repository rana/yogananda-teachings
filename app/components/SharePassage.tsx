"use client";

/**
 * Share Passage — paragraph-level sharing for the chapter reader.
 *
 * A subtle share icon appears in the right margin when the seeker
 * hovers a paragraph (desktop) or settles on one (mobile via dwell).
 * Clicking it shares the passage with full attribution via Web Share API
 * or copies to clipboard — then shows a brief gold confirmation.
 *
 * Design: the technology disappears (PRI-03). The share action feels
 * like offering a gift, not broadcasting. No share counts, no social
 * media icons, no tracking (PRI-08, PRI-09).
 *
 * Interaction model:
 * - Desktop: share icon appears on paragraph hover (right margin)
 * - Mobile: share icon appears when paragraph enters the focus zone
 *   (uses the same settled paragraph detection as RelatedTeachings)
 * - Both: gold "Shared" / "Copied" toast fades after 2s
 * - Hidden in focus/present modes (data-no-focus, data-no-present)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  sharePassage,
  type ShareablePassage,
  type ShareResult,
} from "@/lib/share-passage";
import { sendResonance } from "@/lib/resonance-beacon";

interface SharePassageProps {
  /** Ordered paragraphs with their metadata */
  paragraphs: {
    id: string;
    content: string;
    pageNumber?: number;
  }[];
  bookTitle: string;
  bookAuthor: string;
  bookSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  locale: string;
}

/** Toast states */
type ToastState =
  | { visible: false }
  | { visible: true; paragraphIndex: number; method: "native" | "clipboard" };

// Share icon — minimal, 16x16
const SHARE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L8.3 5.226a.75.75 0 1 0 1.06 1.061l2.713-2.712a.25.25 0 0 1 .354.354L9.714 6.64a.75.75 0 1 0 1.06 1.06l2.714-2.712a1.75 1.75 0 0 0 0-2.475ZM4.286 9.36a.75.75 0 0 0-1.061-1.06L.513 11.012a1.75 1.75 0 0 0 2.475 2.475L5.7 10.774a.75.75 0 1 0-1.06-1.06L1.927 12.426a.25.25 0 0 1-.354-.354L4.286 9.36Zm6.058-1.702a.75.75 0 0 0-1.06-1.06L5.342 10.54a.75.75 0 0 0 1.06 1.06l3.942-3.942Z"/></svg>`;

const SHARE_STYLES = `
  /* Share button container — positioned relative to each paragraph */
  [data-paragraph] {
    position: relative;
  }

  /* Share button — right margin, subtle */
  .share-passage-btn {
    position: absolute;
    right: -2.5rem;
    top: 0.25rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--theme-gold, #dcbd23);
    opacity: 0;
    transition: opacity 150ms ease-out, background-color 150ms ease-out;
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
  }

  /* Desktop: show on paragraph hover */
  @media (hover: hover) {
    [data-paragraph]:hover .share-passage-btn {
      opacity: 0.5;
    }
    .share-passage-btn:hover {
      opacity: 1 !important;
      background-color: rgba(220, 189, 35, 0.08);
    }
  }

  /* Mobile: show on settled paragraph (via class toggle) */
  [data-paragraph].share-visible .share-passage-btn {
    opacity: 0.5;
  }

  /* Hide on narrow screens where there's no right margin */
  @media (max-width: 768px) {
    .share-passage-btn {
      right: -0.25rem;
      top: -1.75rem;
    }
  }

  /* Toast confirmation */
  .share-toast {
    position: absolute;
    right: -2.5rem;
    top: 0.25rem;
    white-space: nowrap;
    font-size: 0.6875rem;
    color: var(--theme-gold, #dcbd23);
    opacity: 0;
    animation: share-toast-show 2s ease-out forwards;
  }

  @media (max-width: 768px) {
    .share-toast {
      right: 0;
      top: -1.75rem;
    }
  }

  @keyframes share-toast-show {
    0% { opacity: 0; transform: translateY(2px); }
    10% { opacity: 1; transform: translateY(0); }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

export function SharePassage({
  paragraphs,
  bookTitle,
  bookAuthor,
  bookSlug,
  chapterNumber,
  chapterTitle,
  locale,
}: SharePassageProps) {
  const t = useTranslations("reader");
  const [toast, setToast] = useState<ToastState>({ visible: false });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject share buttons into paragraph DOM elements
  useEffect(() => {
    const buttons: HTMLButtonElement[] = [];

    paragraphs.forEach((_, i) => {
      const el = document.querySelector(
        `[data-paragraph="${i}"]`,
      ) as HTMLElement | null;
      if (!el) return;

      // Don't add duplicate buttons
      if (el.querySelector(".share-passage-btn")) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "share-passage-btn";
      btn.setAttribute("aria-label", t("sharePassage"));
      btn.setAttribute("data-no-focus", "");
      btn.setAttribute("data-no-present", "");
      btn.innerHTML = SHARE_ICON;
      btn.dataset.shareIndex = String(i);
      el.appendChild(btn);
      buttons.push(btn);
    });

    return () => {
      buttons.forEach((btn) => btn.remove());
    };
  }, [paragraphs, t]);

  // Handle share clicks via event delegation
  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(
        ".share-passage-btn",
      ) as HTMLElement | null;
      if (!btn) return;

      const idx = parseInt(btn.dataset.shareIndex || "-1", 10);
      if (idx < 0 || idx >= paragraphs.length) return;

      const para = paragraphs[idx];
      const passage: ShareablePassage = {
        content: para.content,
        author: bookAuthor,
        bookTitle,
        bookSlug,
        chapterNumber,
        chapterTitle,
        chunkId: para.id,
        pageNumber: para.pageNumber,
      };

      const result = await sharePassage(passage, locale);

      // Record resonance (share event)
      if (result.success) {
        sendResonance(para.id, "share");
      }

      // Show toast
      if (result.success) {
        setToast({
          visible: true,
          paragraphIndex: idx,
          method: result.method,
        });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setToast({ visible: false });
        }, 2200);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [paragraphs, bookTitle, bookAuthor, bookSlug, chapterNumber, chapterTitle, locale]);

  // Mobile: toggle share-visible class on settled paragraph
  useEffect(() => {
    const handleDwell = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Remove from all paragraphs
      document
        .querySelectorAll("[data-paragraph].share-visible")
        .forEach((el) => el.classList.remove("share-visible"));
      // Add to the settled one
      if (detail?.paragraphIndex != null) {
        const el = document.querySelector(
          `[data-paragraph="${detail.paragraphIndex}"]`,
        );
        if (el) el.classList.add("share-visible");
      }
    };

    document.addEventListener("srf:dwell-toggle", handleDwell);
    return () =>
      document.removeEventListener("srf:dwell-toggle", handleDwell);
  }, []);

  // Render toast onto the correct paragraph
  useEffect(() => {
    if (!toast.visible) return;
    const el = document.querySelector(
      `[data-paragraph="${toast.paragraphIndex}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    // Remove any existing toast
    el.querySelector(".share-toast")?.remove();

    const toastEl = document.createElement("span");
    toastEl.className = "share-toast";
    toastEl.textContent =
      toast.method === "native" ? t("shared") : t("copiedToClipboard");
    el.appendChild(toastEl);

    return () => {
      toastEl.remove();
    };
  }, [toast, t]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: SHARE_STYLES }} />;
}
