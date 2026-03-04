/**
 * Root layout — locale-agnostic shell.
 *
 * Sets up global CSS (design system), DesignProvider (org/theme/mode),
 * JSON-LD structured data, and the skip navigation link.
 *
 * The design system's calm.css provides body defaults (font-family,
 * antialiased rendering, smooth scroll). The design system's
 * foundations.css provides all custom properties.
 */

import type { Viewport } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { DesignProvider } from "@/app/components/design/DesignProvider";
import { SRF, SRF_SOCIAL, SRF_SAME_AS, PORTAL } from "@/lib/config/srf-links";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a2744",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir="ltr" data-org="srf" data-theme="light">
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
      <body>
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <DesignProvider>
          {children}
        </DesignProvider>
      </body>
    </html>
  );
}
