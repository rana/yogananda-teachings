/**
 * Unified enrichment prompt — M1c-11 (FTR-026).
 *
 * Used at index-time only (never in search hot path).
 * Claude via AWS Bedrock enriches each passage with metadata:
 * summary, topics, entities, domain, depth, emotion, voice.
 *
 * This prompt is the result of the M1c-11 design sprint.
 */

export const ENRICHMENT_PROMPT = `You are enriching a passage from Paramahansa Yogananda's published works for a search and discovery system. Analyze the passage and return a JSON object with the following fields. Be precise and conservative — only include what is clearly present in the text.

IMPORTANT: You are analyzing verbatim published text. Never generate, paraphrase, or reinterpret. Only describe what is present.

Return ONLY a JSON object with these fields:

{
  "summary": "1-2 sentence summary of the passage's main point (max 200 chars)",
  "topics": ["array of 1-5 topic labels from the passage, lowercase"],
  "entities": ["array of named entities: people, places, divine names, Sanskrit terms"],
  "domain": "one of: philosophy, practice, biography, nature, devotion, science, narrative",
  "depth_level": "1 (introductory), 2 (intermediate), or 3 (advanced/esoteric)",
  "emotion": "primary emotional register: devotional, contemplative, joyful, sorrowful, awe, instructional, narrative",
  "voice": "one of: teaching, storytelling, devotional_prayer, dialogue, description",
  "cross_references": ["chapters or concepts this passage connects to, if clearly referenced"],
  "semantic_density": "low (simple narrative), medium (mixed), or high (dense philosophy/metaphor)"
}

Rules:
- topics should use the portal's vocabulary: "meditation", "cosmic consciousness", "guru-disciple", "kriya yoga", "self-realization", "karma", "reincarnation", "divine mother", "miracles", "death", "healing", "devotion", "science", "nature", "education", etc.
- entities should match canonical forms: "Paramahansa Yogananda" (not just "Yogananda"), "Sri Yukteswar" (not "Yukteswar Giri"), "Lahiri Mahasaya", "Mahavatar Babaji"
- depth_level 1: accessible to newcomers; 2: assumes some familiarity; 3: advanced metaphysics or esoteric content
- Return ONLY valid JSON, no markdown, no explanation`;

/**
 * Build the enrichment request for a single passage.
 */
export function buildEnrichmentRequest(content: string, context: {
  bookTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  author: string;
  language: string;
}): string {
  return `${ENRICHMENT_PROMPT}

PASSAGE CONTEXT:
- Book: ${context.bookTitle}
- Chapter ${context.chapterNumber}: ${context.chapterTitle}
- Author: ${context.author}
- Language: ${context.language}

PASSAGE:
"""
${content}
"""`;
}
