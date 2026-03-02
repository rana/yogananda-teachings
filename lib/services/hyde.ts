/**
 * HyDE — Hypothetical Document Embedding (M2b-12, ADR-119).
 *
 * Generates a hypothetical passage in Yogananda's register via Claude Bedrock.
 * The passage is then embedded as a document (not a query) and used for
 * vector search in document-space.
 *
 * Framework-agnostic (PRI-10). No framework imports.
 */

import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import {
  HYDE_BEDROCK_MODEL,
  HYDE_MAX_TOKENS,
} from "@/lib/config";
import { logger } from "@/lib/logger";

// ── Prompt ────────────────────────────────────────────────────────

const HYDE_SYSTEM_PROMPT = `You are a faithful librarian of Paramahansa Yogananda's published writings. Given a seeker's question, write a short passage (100-200 words) that reads as if it were an excerpt from Yogananda's published works answering this question. Use Yogananda's characteristic voice: warm, direct, mixing practical wisdom with cosmic perspective, occasionally using Sanskrit terms naturally. Do NOT fabricate quotes — generate text in the *style* of his published works. Output ONLY the passage text, no preamble or attribution.`;

const HYDE_SYSTEM_PROMPT_ES = `Eres un bibliotecario fiel de los escritos publicados de Paramahansa Yogananda. Dado la pregunta de un buscador espiritual, escribe un pasaje breve (100-200 palabras) que se lea como si fuera un extracto de las obras publicadas de Yogananda respondiendo a esta pregunta. Usa la voz característica de Yogananda: cálida, directa, mezclando sabiduría práctica con perspectiva cósmica, usando ocasionalmente términos en sánscrito de forma natural. NO inventes citas — genera texto en el *estilo* de sus obras publicadas. Produce SOLO el texto del pasaje, sin preámbulo ni atribución.`;

// ── Client ────────────────────────────────────────────────────────

let client: AnthropicBedrock | null = null;

function getClient(): AnthropicBedrock | null {
  if (client) return client;

  const region = process.env.AWS_REGION;
  if (!region) return null;

  client = new AnthropicBedrock({
    awsRegion: region,
  });
  return client;
}

// ── Generation ────────────────────────────────────────────────────

/**
 * Generate a hypothetical passage that would answer the query
 * in Yogananda's writing style.
 *
 * Returns null if Bedrock is unavailable or generation fails.
 * Callers should fall back to standard query embedding.
 */
export async function generateHypotheticalDocument(
  query: string,
  language: string = "en",
): Promise<string | null> {
  const bedrock = getClient();
  if (!bedrock) return null;

  const systemPrompt =
    language === "es" ? HYDE_SYSTEM_PROMPT_ES : HYDE_SYSTEM_PROMPT;

  try {
    const response = await bedrock.messages.create({
      model: HYDE_BEDROCK_MODEL,
      max_tokens: HYDE_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => ("text" in block ? block.text : ""))
      .join("");

    if (!text || text.length < 20) return null;

    return text;
  } catch (err) {
    logger.warn("HyDE generation failed, falling back to standard search", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/** Reset client for testing */
export function _resetClient(): void {
  client = null;
}
