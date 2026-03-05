/**
 * Locale layout — provides next-intl context and page shell.
 *
 * Server Component. Uses design system tokens for styling.
 * Header and footer are minimal — the reading surface is the focus.
 *
 * Governed by: global-first rendering (docs/global-first-rendering.md)
 */

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { PORTAL, SRF } from "@/lib/config/srf-links";
import { Surface } from "@/app/components/design/Surface";
import { Motif } from "@/app/components/design/Motif";
import { ThemeSwitcher } from "@/app/components/design/ThemeSwitcher";
import { ReaderPreferences } from "@/app/components/design/ReaderPreferences";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    title: {
      default: messages.metadata.title,
      template: `%s — ${messages.metadata.title}`,
    },
    description: messages.metadata.description,
    metadataBase: new URL(PORTAL.canonical),
    alternates: {
      canonical: `${prefix}/`,
      languages: {
        en: "/",
        es: "/es/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      siteName: messages.metadata.title,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Site header — functional register, minimal chrome */}
      <Surface as="header" register="functional" className="app-header">
        <div className="app-header-inner">
          <a href={`/${locale}`} className="app-site-name">
            SRF Teachings
          </a>
          <nav className="cluster" aria-label="Site navigation">
            <a href={`/${locale}/books`}>Library</a>
            <a href={`/${locale}/search`}>Search</a>
            <ReaderPreferences />
            <ThemeSwitcher />
          </nav>
        </div>
      </Surface>

      {/* Main content — the bindu */}
      <main id="main-content">
        {children}
      </main>

      {/* Site footer — ambient register */}
      <Surface as="footer" register="ambient" className="app-footer">
        <div className="center">
          <Motif role="close" voice="sacred" glyph="lotus-03" />
          <p>
            Teachings of Paramahansa Yogananda ·{" "}
            <a href={SRF.home}>Self-Realization Fellowship</a>
          </p>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href={`/${locale}/about`}>About</a>
            <a href={`/${locale}/legal`}>Legal</a>
            <a href={`/${locale}/privacy`}>Privacy</a>
            <a href={`/${locale}/integrity`}>Integrity</a>
          </nav>
        </div>
      </Surface>
    </NextIntlClientProvider>
  );
}
