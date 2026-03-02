/**
 * Locale layout — M2a-9 (ADR-075, ADR-076).
 *
 * Provides next-intl translation context and sets lang attribute.
 * Wraps all locale-aware pages.
 */

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { PORTAL } from "@/lib/config/srf-links";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

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
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </NextIntlClientProvider>
  );
}
