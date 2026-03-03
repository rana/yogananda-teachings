"use client";

/**
 * Thread Return Bar — "Following the Thread" breadcrumb (ADR-050).
 *
 * When a seeker has followed golden thread links between chapters,
 * this bar appears above the reading area with a quiet "Return"
 * link to their previous reading position.
 *
 * Design: minimal, warm, non-intrusive. A thin bar with a gold accent
 * that says where you came from. Disappears when the stack is empty.
 * Hidden in focus/present modes (data-no-focus, data-no-present).
 *
 * Uses Passage Arrival (#passage-{chunkId}) for exact return positioning.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  peekThreadPosition,
  popThreadPosition,
  getThreadDepth,
} from "@/lib/thread-memory";

interface ThreadReturnBarProps {
  locale: string;
}

export function ThreadReturnBar({ locale }: ThreadReturnBarProps) {
  const router = useRouter();
  const [returnTo, setReturnTo] = useState<{
    chapterTitle: string;
    bookSlug: string;
    chapterNumber: number;
    chunkId: string;
    depth: number;
  } | null>(null);

  useEffect(() => {
    const position = peekThreadPosition();
    if (position) {
      setReturnTo({
        ...position,
        depth: getThreadDepth(),
      });
    }
  }, []);

  const handleReturn = useCallback(() => {
    const position = popThreadPosition();
    if (!position) return;
    router.push(
      `/${locale}/books/${position.bookSlug}/${position.chapterNumber}#passage-${position.chunkId}`,
    );
  }, [locale, router]);

  if (!returnTo) return null;

  return (
    <div
      className="border-b border-srf-gold/15 bg-srf-gold/[0.03]"
      data-no-focus
      data-no-present
      data-no-print
    >
      <div className="mx-auto flex max-w-[38rem] items-center gap-2 px-4 py-2">
        {/* Thread depth indicator — small gold dots */}
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: Math.min(returnTo.depth, 5) }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-srf-gold/40"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleReturn}
          className="min-h-11 inline-flex items-center gap-1.5 text-xs text-srf-navy/45 transition-colors hover:text-srf-navy/70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Return to Ch. {returnTo.chapterNumber}: {returnTo.chapterTitle}
          </span>
        </button>
      </div>
    </div>
  );
}
