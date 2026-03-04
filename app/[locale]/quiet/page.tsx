/**
 * The Quiet Corner — micro-sanctuary.
 *
 * Random affirmation, optional gentle timer, chime at completion.
 * No tracking, no accounts. Server Component wraps client island.
 */

import { setRequestLocale } from "next-intl/server";
import { LazyQuietCorner } from "@/app/components/LazyQuietCorner";
import pool from "@/lib/db";
import { getReflectionPassage } from "@/lib/services/passages";

export default async function QuietCornerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const passage = await getReflectionPassage(pool, locale === "es" ? "es" : "en");

  return <LazyQuietCorner passage={passage} />;
}
