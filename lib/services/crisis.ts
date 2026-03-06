/**
 * Crisis query detection — M1c-9 (FTR-051).
 *
 * Heuristic keyword-based detection. Does NOT suppress search results —
 * displays a calm interstitial ABOVE results with crisis helpline info.
 *
 * Framework-agnostic (PRI-10).
 */

import crisisData from "@/lib/data/crisis-terms.json";

export interface CrisisInfo {
  detected: boolean;
  helpline?: {
    name: string;
    action: string;
    url: string;
    available: string;
  };
}

/**
 * Check if a query matches crisis terms for the given language.
 * Uses simple substring matching — intentionally sensitive (false positives
 * are acceptable; false negatives are not).
 */
export function detectCrisis(query: string, language: string = "en"): CrisisInfo {
  const terms = crisisData.terms[language as keyof typeof crisisData.terms] || crisisData.terms.en;
  const helpline = crisisData.helplines[language as keyof typeof crisisData.helplines] || crisisData.helplines.en;

  const normalized = query.toLowerCase().trim();
  const detected = terms.some((term) => normalized.includes(term));

  if (!detected) return { detected: false };

  return { detected: true, helpline };
}
