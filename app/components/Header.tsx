/**
 * Site header — M2a-5.
 *
 * Persistent navigation: Search, Books, Quiet Corner, About.
 * Locale-aware links via next-intl.
 * Lotus mark as home link.
 */

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { ReaderSettings } from "./ReaderSettings";
import { SrfEmblem } from "./SrfEmblem";
import { NewBooksIndicator } from "./NewBooksIndicator";

export function Header() {
  const t = useTranslations("nav");
  const a11y = useTranslations("a11y");
  const pathname = usePathname();

  const navItems = [
    { href: "/search" as const, label: t("search") },
    { href: "/books" as const, label: t("books") },
    { href: "/library" as const, label: t("library") },
    { href: "/quiet" as const, label: t("quiet") },
    { href: "/about" as const, label: t("about") },
  ];

  return (
    <header className="border-b border-srf-navy/5 bg-warm-cream">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
        aria-label={a11y("mainNavigation")}
      >
        <Link
          href="/"
          className="font-serif text-lg text-srf-navy transition-colors hover:text-srf-gold"
          aria-label={t("home")}
        >
          {/* SRF tri-lotus star — brand mark */}
          <SrfEmblem className="inline-block h-6 w-auto text-srf-gold" />
          <span className="ml-1.5 hidden text-sm font-normal sm:inline">
            Teachings
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href);
            const isBooks = item.href === "/books";
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-md px-2 py-1.5 text-xs sm:text-sm transition-colors min-h-11 inline-flex items-center ${
                  isActive
                    ? "text-srf-navy font-medium"
                    : "text-srf-navy/60 hover:text-srf-navy"
                }`}
              >
                {item.label}
                {isBooks && <NewBooksIndicator />}
              </Link>
            );
          })}
          <ReaderSettings />
        </div>
      </nav>
    </header>
  );
}
