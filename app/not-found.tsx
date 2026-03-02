/**
 * Global 404 page — M2a-8.
 *
 * Catches requests outside locale prefixes.
 * Uses plain HTML (no next-intl context available).
 */

import Link from "next/link";
import { SrfLotus } from "@/app/components/SrfLotus";

export default function GlobalNotFound() {
  return (
    <main id="main-content" className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SrfLotus size="xl" className="mb-2 w-12 h-12 text-srf-gold" />
      <h1 className="mb-3 font-display text-xl text-srf-navy">
        This page could not be found
      </h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-srf-navy/50">
        The path you followed may have changed. The teachings await you at any
        of these places:
      </p>
      <nav className="flex flex-wrap justify-center gap-3" aria-label="Helpful links">
        <Link
          href="/en"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-gold/30 px-4 py-2 text-sm text-srf-navy transition-colors hover:bg-(--theme-surface) hover:border-srf-gold"
        >
          Home
        </Link>
        <Link
          href="/en/search"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy/70 transition-colors hover:bg-(--theme-surface) hover:text-srf-navy"
        >
          Search
        </Link>
        <Link
          href="/en/books"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy/70 transition-colors hover:bg-(--theme-surface) hover:text-srf-navy"
        >
          Books
        </Link>
      </nav>
    </main>
  );
}
