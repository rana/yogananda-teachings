/**
 * Cross-encoder reranking via Cohere Rerank API (M3a-12, FTR-027).
 *
 * After hybrid search returns RRF-fused candidates, the reranker
 * sees query + passage pairs and produces true relevance scores.
 * Multilingual-native — no language routing needed.
 *
 * Framework-agnostic (PRI-10). Uses fetch — no SDK dependency.
 */

import { RERANK_MODEL, RERANK_TOP_N } from "@/lib/config";
import { logger } from "@/lib/logger";

// ── Types ────────────────────────────────────────────────────────

export interface RerankCandidate {
  id: string;
  content: string;
}

export interface RerankResult {
  index: number;
  relevance_score: number;
}

// ── API ──────────────────────────────────────────────────────────

const COHERE_API_URL = "https://api.cohere.com/v2/rerank";

/**
 * Rerank search results using Cohere cross-encoder.
 *
 * Returns reranked indices with relevance scores, or null if
 * Cohere is unavailable. Callers should fall back to RRF scores.
 */
export async function rerank(
  query: string,
  candidates: RerankCandidate[],
  topN: number = RERANK_TOP_N,
): Promise<RerankResult[] | null> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) return null;

  if (candidates.length === 0) return [];

  try {
    const response = await fetch(COHERE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: RERANK_MODEL,
        query,
        documents: candidates.map((c) => c.content),
        top_n: Math.min(topN, candidates.length),
      }),
    });

    if (!response.ok) {
      logger.warn("Cohere Rerank API returned non-OK", {
        status: response.status,
      });
      return null;
    }

    const data = (await response.json()) as {
      results: { index: number; relevance_score: number }[];
    };

    return data.results;
  } catch (err) {
    logger.warn("Cohere Rerank failed, falling back to RRF scores", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
