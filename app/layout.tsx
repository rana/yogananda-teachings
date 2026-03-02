/**
 * Root layout — M2a-9, M2a-19 (ADR-075, ADR-099).
 *
 * Locale-agnostic shell. Sets up fonts, global CSS, JSON-LD,
 * and utilities that work across all locales.
 * Header and Footer are in the [locale] layout (locale-aware).
 */

import type { Viewport } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/app/components/ServiceWorkerRegistration";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { CircadianProvider } from "@/app/components/CircadianProvider";
import { SRF, SRF_SOCIAL, SRF_SAME_AS, PORTAL } from "@/lib/config/srf-links";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a2744",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "SRF Teachings Portal",
                url: PORTAL.canonical,
                description:
                  "Paramahansa Yogananda's published teachings — freely accessible worldwide",
                copyrightHolder: {
                  "@type": "Organization",
                  name: "Self-Realization Fellowship",
                  url: SRF.home,
                },
                publisher: {
                  "@type": "Organization",
                  name: "Self-Realization Fellowship",
                  url: SRF.home,
                },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      `${PORTAL.canonical}/en/search?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Self-Realization Fellowship",
                url: SRF.home,
                sameAs: [
                  SRF_SAME_AS.orgWikidata,
                  SRF_SAME_AS.orgWikipedia,
                  SRF_SOCIAL.youtube,
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Paramahansa Yogananda",
                url: SRF.yogananda,
                sameAs: [
                  SRF_SAME_AS.yoganandaWikidata,
                  SRF_SAME_AS.yoganandaWikipedia,
                ],
                birthDate: "1893-01-05",
                deathDate: "1952-03-07",
                birthPlace: {
                  "@type": "Place",
                  name: "Gorakhpur, India",
                },
                description:
                  "Indian Hindu monk, yogi, and guru who introduced millions of westerners to the teachings of meditation and Kriya Yoga through his organization Self-Realization Fellowship.",
              },
            ]),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-serif text-srf-navy bg-warm-cream">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-srf-navy focus:px-4 focus:py-2 focus:text-warm-cream"
        >
          Skip to main content
        </a>
        <ThemeProvider />
        <CircadianProvider />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
