#!/usr/bin/env npx tsx
/**
 * Rasa Classification Script
 *
 * Classifies the prevailing aesthetic flavor (rasa) for each chapter
 * using Claude API. Updates Neon chapters.rasa column.
 *
 * The five rasas from the design system (emotional-registers.language.json):
 *   shanta   — peace, equanimity, reflective stillness
 *   adbhuta  — wonder, awe, cosmic vastness, miracles
 *   karuna   — compassion, tenderness, love through loss
 *   vira     — courage, discipline, determination, renunciation
 *   bhakti   — devotion, prayer, ecstatic love, surrender
 *
 * Usage:
 *   npx tsx src/classify-rasa.ts --book autobiography-of-a-yogi
 *   npx tsx src/classify-rasa.ts --book autobiography-of-a-yogi --dry-run
 *   npx tsx src/classify-rasa.ts --book autobiography-of-a-yogi --chapter 14
 *
 * Requires: AWS credentials (Bedrock), NEON_DATABASE_URL_DIRECT
 */

import path from 'path';
import { readFileSync } from 'fs';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getBookPaths } from './config.js';
import { log } from './utils.js';

// ── Types ───────────────────────────────────────────────────────

type Rasa = 'shanta' | 'adbhuta' | 'karuna' | 'vira' | 'bhakti';

interface ChapterJson {
  chapterNumber: number;
  title: string;
  slug: string;
  sections: { heading: string | null; paragraphs: { text: string }[] }[];
  metadata: Record<string, unknown>;
}

interface RasaClassification {
  chapterNumber: number;
  title: string;
  rasa: Rasa;
  confidence: number;
  reasoning: string;
}

// ── Configuration ───────────────────────────────────────────────

const CLASSIFICATION_PROMPT = `You are classifying the prevailing aesthetic flavor (rasa) of a chapter from a spiritual autobiography. The rasa determines the visual atmosphere of the reading surface — whitespace, motion, typography.

The five rasas (from the Indian aesthetic tradition, adapted for the Yogananda design system):

**shanta** (śānta) — Peace, equanimity, reflective stillness.
Content: calm narrative, intellectual discourse, biographical milestones, travel descriptions, reflective passages. The reader feels settled, contemplative, unhurried.

**adbhuta** (अद्भुत) — Wonder, awe, cosmic vastness, miracles.
Content: supernatural events, cosmic consciousness, miraculous healings, materialization, levitation, bilocation, encounters with the impossible. The reader feels expanded, astonished, touched by the numinous.

**karuna** (karuṇā) — Compassion, tenderness, love through loss.
Content: death of loved ones, parting from the guru, familial bonds, vulnerable moments, grief transformed by spiritual understanding. The reader feels held, moved, intimate.

**vira** (vīra) — Courage, discipline, determination, renunciation.
Content: spiritual discipline, renunciation, overcoming obstacles, founding institutions, missionary work, confronting fate, moral courage. The reader feels fortified, resolute, inspired to act.

**bhakti** (भक्ति) — Devotion, prayer, ecstatic love, surrender.
Content: guru-disciple love, devotional poetry, prayer, chanting, pilgrimage, encounters with saints radiating devotion, surrender to the Divine. The reader feels warm, yearning, heart-opened.

Classify the PREVAILING rasa — the mood that pervades most of the chapter. Most chapters have a clear primary rasa even if moments of other rasas appear.

Respond with ONLY a JSON object:
{
  "rasa": "shanta|adbhuta|karuna|vira|bhakti",
  "confidence": 0.0-1.0,
  "reasoning": "One sentence explaining why."
}`;

const MAX_CHAPTER_TOKENS = 2000; // First ~2000 tokens of chapter text

// ── Helpers ─────────────────────────────────────────────────────

function extractChapterText(chapter: ChapterJson): string {
  const parts: string[] = [];
  let tokenEstimate = 0;

  for (const section of chapter.sections) {
    if (section.heading) {
      parts.push(`[${section.heading}]`);
      tokenEstimate += section.heading.split(/\s+/).length;
    }
    for (const para of section.paragraphs) {
      const words = para.text.split(/\s+/).length;
      if (tokenEstimate + words > MAX_CHAPTER_TOKENS) {
        // Take partial
        const remaining = MAX_CHAPTER_TOKENS - tokenEstimate;
        parts.push(para.text.split(/\s+/).slice(0, remaining).join(' ') + '...');
        tokenEstimate = MAX_CHAPTER_TOKENS;
        break;
      }
      parts.push(para.text);
      tokenEstimate += words;
    }
    if (tokenEstimate >= MAX_CHAPTER_TOKENS) break;
  }

  return parts.join('\n\n');
}

// COG-3 Batch → Opus (DES-062: aesthetic judgment across five experiential qualities)
const BEDROCK_MODEL = 'us.anthropic.claude-opus-4-6-v1';

function createBedrockClient(): BedrockRuntimeClient {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2';
  return new BedrockRuntimeClient({ region });
}

async function classifyWithClaude(
  chapterTitle: string,
  chapterText: string,
  client: BedrockRuntimeClient,
): Promise<{ rasa: Rasa; confidence: number; reasoning: string }> {
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `${CLASSIFICATION_PROMPT}\n\n---\n\nChapter: "${chapterTitle}"\n\n${chapterText}`,
      },
    ],
  });

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  const text = result.content?.[0]?.type === 'text' ? result.content[0].text : '';

  // Parse JSON from response (may be wrapped in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse rasa classification: ${text}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validRasas: Rasa[] = ['shanta', 'adbhuta', 'karuna', 'vira', 'bhakti'];
  if (!validRasas.includes(parsed.rasa)) {
    throw new Error(`Invalid rasa: ${parsed.rasa}`);
  }

  return {
    rasa: parsed.rasa,
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
    reasoning: parsed.reasoning || '',
  };
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const bookIdx = args.indexOf('--book');
  if (bookIdx === -1 || !args[bookIdx + 1]) {
    console.error('Usage: npx tsx src/classify-rasa.ts --book <slug> [--dry-run] [--chapter N]');
    process.exit(1);
  }
  const bookSlug = args[bookIdx + 1];
  const dryRun = args.includes('--dry-run');
  const chapterIdx = args.indexOf('--chapter');
  const singleChapter = chapterIdx !== -1 ? parseInt(args[chapterIdx + 1]) : null;

  // Bedrock client (uses AWS credential provider chain — profile, role, env vars)
  const bedrockClient = createBedrockClient();

  // Database (unless dry-run)
  const dbUrl = process.env.NEON_DATABASE_URL_DIRECT;
  if (!dryRun && !dbUrl) {
    console.error('NEON_DATABASE_URL_DIRECT not set. Use --dry-run for classification without DB update.');
    process.exit(1);
  }

  // Load book manifest
  const paths = getBookPaths(bookSlug);
  const manifest = JSON.parse(readFileSync(paths.bookManifest, 'utf-8'));
  const chaptersDir = paths.chapters;

  log.info(`Classifying rasa for "${manifest.book.title}" (${manifest.book.language})`);
  if (dryRun) log.info('DRY RUN — no database updates');

  // Load and classify chapters
  const classifications: RasaClassification[] = [];

  for (const chapterMeta of manifest.structure.chapters) {
    if (singleChapter !== null && chapterMeta.number !== singleChapter) continue;

    const chapterPath = path.join(chaptersDir, path.basename(chapterMeta.dataFile));
    const chapter: ChapterJson = JSON.parse(readFileSync(chapterPath, 'utf-8'));
    const text = extractChapterText(chapter);

    try {
      const result = await classifyWithClaude(chapter.title, text, bedrockClient);
      classifications.push({
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        ...result,
      });
      log.info(
        `  Ch ${chapter.chapterNumber}: ${chapter.title} → ${result.rasa} (${(result.confidence * 100).toFixed(0)}%) — ${result.reasoning}`,
      );
    } catch (err) {
      log.warn(`  Ch ${chapter.chapterNumber}: Classification failed: ${err}`);
      classifications.push({
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        rasa: 'shanta', // Default fallback
        confidence: 0,
        reasoning: `Classification failed: ${err}`,
      });
    }

    // Rate limiting: small delay between API calls
    await new Promise((r) => setTimeout(r, 200));
  }

  // Distribution summary
  const dist: Record<string, number> = {};
  for (const c of classifications) {
    dist[c.rasa] = (dist[c.rasa] || 0) + 1;
  }
  log.info(`\nDistribution: ${Object.entries(dist).map(([r, n]) => `${r}=${n}`).join(', ')}`);

  // Update Neon
  if (!dryRun && dbUrl) {
    const pg = await import('pg');
    const client = new pg.default.Client({ connectionString: dbUrl });
    await client.connect();

    // Find book ID
    const bookResult = await client.query(
      'SELECT id FROM books WHERE slug = $1',
      [bookSlug],
    );
    if (bookResult.rows.length === 0) {
      log.error(`Book not found in Neon: ${bookSlug}`);
      await client.end();
      process.exit(1);
    }
    const bookId = bookResult.rows[0].id;

    // Update each chapter
    let updated = 0;
    for (const c of classifications) {
      await client.query(
        'UPDATE chapters SET rasa = $1 WHERE book_id = $2 AND chapter_number = $3',
        [c.rasa, bookId, c.chapterNumber],
      );
      updated++;
    }

    await client.end();
    log.info(`Updated ${updated} chapters in Neon.`);
  }

  // Write classification file for reference
  const outputPath = path.join(paths.root, 'rasa-classifications.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(outputPath, JSON.stringify(classifications, null, 2));
  log.info(`Classifications saved to ${outputPath}`);
}

main().catch((err) => {
  log.error('Rasa classification failed:', err);
  process.exit(1);
});
