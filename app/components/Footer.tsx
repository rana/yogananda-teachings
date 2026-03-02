/**
 * Site footer — M2a-5 (ADR-088).
 *
 * SRF ecosystem links and copyright.
 * Locale-aware via next-intl.
 */

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const a11y = useTranslations("a11y");

  return (
    <footer className="border-t border-srf-navy/10 bg-warm-cream">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Navigation links */}
        <nav aria-label={a11y("footerNavigation")} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-srf-navy/50">
          <Link href="/" className="hover:text-srf-navy transition-colors">
            {nav("home")}
          </Link>
          <Link href="/books" className="hover:text-srf-navy transition-colors">
            {nav("books")}
          </Link>
          <Link href="/search" className="hover:text-srf-navy transition-colors">
            {nav("search")}
          </Link>
          <Link href="/quiet" className="hover:text-srf-navy transition-colors">
            {nav("quiet")}
          </Link>
          <Link href="/browse" className="hover:text-srf-navy transition-colors">
            {t("browseAll")}
          </Link>
          <Link href="/privacy" className="hover:text-srf-navy transition-colors">
            {nav("privacy")}
          </Link>
          <Link href="/legal" className="hover:text-srf-navy transition-colors">
            {nav("legal")}
          </Link>
        </nav>

        {/* External SRF links */}
        <nav aria-label={a11y("srfEcosystem")} className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-srf-navy/40">
          <a
            href="https://yogananda.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-srf-navy/60 transition-colors"
          >
            {t("yoganandaOrg")}
          </a>
          <a
            href="https://yogananda.org/lessons"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-srf-navy/60 transition-colors"
          >
            {t("lessons")}
          </a>
          <a
            href="https://bookstore.yogananda-srf.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-srf-navy/60 transition-colors"
          >
            {t("bookstore")}
          </a>
          <a
            href="https://www.youtube.com/@YoganandaSRF"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-srf-navy/60 transition-colors"
          >
            YouTube
          </a>
        </nav>

        {/* Copyright */}
        <p className="mt-4 text-center text-xs text-srf-navy/30">{t("copyright")}</p>
      </div>
    </footer>
  );
}
