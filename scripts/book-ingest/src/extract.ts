#!/usr/bin/env npx tsx
/**
 * Book Page Extraction Script
 *
 * Sends captured page images to Claude Vision for structured text extraction.
 * Produces per-page JSON files with text, formatting, and metadata.
 *
 * Usage:
 *   npx tsx src/extract.ts --book autobiography-of-a-yogi [--resume-from 100] [--concurrency 5]
 */

import Anthropic from '@anthropic-ai/sdk';
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import fs from 'fs/promises';
import path from 'path';
import { getBookPaths, getPipelineConfig } from './config.js';
import { PageExtraction, CaptureMeta } from './types.js';
import {
  ensureDir, readJson, writeJson, padPage, log, sleep, fileExists
} from './utils.js';

/** Create an Anthropic client — prefers Bedrock if AWS credentials are available */
function createClient(): Anthropic | AnthropicBedrock {
  if (process.env.CLAUDE_CODE_USE_BEDROCK === 'true' || process.env.AWS_BEARER_TOKEN_BEDROCK) {
    log.info('Using AWS Bedrock for Claude API access');
    return new AnthropicBedrock({
      awsRegion: process.env.AWS_REGION || 'us-west-2',
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    log.info('Using direct Anthropic API');
    return new Anthropic();
  }
  // Try Bedrock as fallback (will use default AWS credential chain)
  log.info('No ANTHROPIC_API_KEY found, falling back to AWS Bedrock');
  return new AnthropicBedrock({
    awsRegion: process.env.AWS_REGION || 'us-west-2',
  });
}

/** Convert a model name to Bedrock model ID if using Bedrock */
function resolveModelId(model: string, client: Anthropic | AnthropicBedrock): string {
  if (client instanceof AnthropicBedrock) {
    // Map short model names to Bedrock model IDs
    const bedrockModels: Record<string, string> = {
      'claude-sonnet-4-20250514': 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      'claude-haiku-4-5-20251001': 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
      'claude-opus-4-5-20250101': 'us.anthropic.claude-opus-4-5-20250101-v1:0',
    };
    const resolved = bedrockModels[model] || model;
    if (resolved !== model) {
      log.info(`Resolved model ${model} → ${resolved}`);
    }
    return resolved;
  }
  return model;
}

/** Language-specific OCR guidance */
const LANGUAGE_GUIDANCE: Record<string, string> = {
  en: 'Preserve ALL diacritical marks exactly (ā, ī, ū, ṛ, ṣ, ṇ, ṭ, ḍ, ś, ñ, etc.).',
  es: 'This book is in Spanish. Preserve ALL Spanish diacritical marks (á, é, í, ó, ú, ñ, ü) and inverted punctuation (¿, ¡) exactly. Sanskrit terms (guru, yoga, swami, samādhi, etc.) appear untranslated — preserve their diacritics too (ā, ī, ū, ṛ, ṣ, ṇ, ṭ, ḍ, ś).',
  hi: 'This book is in Hindi (Devanāgarī script). Transcribe all Devanāgarī text exactly as rendered. Preserve conjunct characters, nukta marks, and chandrabindu. Any romanized terms should preserve their diacritics.',
};

/** Build the system prompt for a specific book */
function buildSystemPrompt(bookTitle: string, bookAuthor: string, language: string): string {
  const langGuide = LANGUAGE_GUIDANCE[language] || LANGUAGE_GUIDANCE['en'];

  return `You are extracting text from a high-resolution page image of a published book (${bookTitle} by ${bookAuthor}).

Your job is to produce a perfectly faithful transcription with structural and aesthetic markup as a JSON object. The output feeds a contemplative reading surface — every classification you make determines how this text will be typeset and experienced.

CRITICAL RULES:
1. Transcribe EXACTLY what you see. Do not correct, improve, or modernize any text.
2. Preserve ALL formatting: italics, bold, small caps.
3. ${langGuide}
4. Preserve line breaks in poetry/verse. Prose paragraphs are single text blocks.
5. Identify the page type accurately.
6. Detect chapter boundaries (chapter label + title = isChapterStart: true).
7. Distinguish body text from running headers, page numbers, footnotes, and captions.
8. For photographs: describe the image, capture any caption text, and note which content block the photograph relates to.
9. If text is cut off at page top, set continuedFromPreviousPage: true on the first content block.
10. If text is cut off at page bottom, set continuesOnNextPage: true on the last content block.
11. Rate your confidence 1-5 for this page (5 = perfect, 1 = major uncertainty).
12. Footnote superscripts in the text should be captured as-is in the text (e.g., "guru¹").

FORMATTING:
Mark formatting spans with character offsets in the text string:
- "italic" for italic text
- "bold" for bold text
- "bold-italic" for both
- "small-caps" for small capitals (common in "CHAPTER N" labels)
- "superscript" for footnote markers

PAGE TYPES:
- "title-page": Book title, author, publisher, possibly with decorative elements or logos
- "copyright": Copyright notice, edition info, ISBN
- "dedication": Dedication text
- "toc": Table of contents listing
- "illustrations-list": List of illustrations/photographs
- "foreword" / "preface" / "introduction": Front matter sections
- "chapter-start": New chapter begins (has chapter number and/or title)
- "body": Regular text pages within a chapter
- "photograph": Page dominated by a photograph with optional caption
- "illustration": Drawings, diagrams, decorative full-page art
- "glossary": Glossary entries
- "index": Index entries
- "blank": Empty or nearly empty page (just decorative elements)
- "back-matter": Back matter content (resources, about author, etc.)
- "other": Anything that doesn't fit above

CONTENT BLOCK TYPES:
- "heading": Chapter title (large text)
- "chapter-label": "CHAPTER 1" or similar label above the heading
- "subheading": Section heading within a chapter
- "paragraph": Regular prose paragraph (narrative, exposition)
- "dialogue": A paragraph that is predominantly direct speech — more than half the text is within quotation marks. The guru's words, conversations, reported speech. Do NOT use for paragraphs that merely contain a brief quote embedded in narrative.
- "epigraph": Opening quote/verse at chapter start (often italic, indented)
- "verse": Poetry or verse (preserve line breaks with \\n). Add "verseSource" to indicate origin: "scripture" (Bible, Gita, Upanishads, Sutras), "poetry" (literary poetry — Tagore, Tennyson, Omar Khayyám, etc.), "original" (author's own composition), or "unknown".
- "footnote": Footnote text at bottom of page
- "footnote-ref": Just the footnote number/marker
- "caption": Photo or illustration caption
- "running-header": Header text at top of page (chapter title, author name)
- "page-number": Printed page number on the page
- "decorative": Ornamental dividers (———•———, ❀, ※, etc.), SRF logos, decorative elements
- "publisher-info": Publisher name, address, website

AESTHETIC DIMENSION (rasa):
For each page, classify the dominant emotional flavor from the Indian aesthetic tradition. This determines the atmospheric treatment in the reading surface. Choose ONE:
- "shanta": Peace, stillness, meditative calm. The default for teaching passages.
- "adbhuta": Wonder, amazement, the miraculous. Supernatural events, visions, encounters with the divine.
- "karuna": Compassion, tenderness, poignancy. Separations, deaths, suffering, empathy.
- "vira": Courage, determination, spiritual heroism. Confrontations, tests, fierce resolve.
- "bhakti": Devotion, love, surrender. Prayer, worship, the guru-disciple relationship at its most tender.

Rate your confidence 1-5 (5 = clearly dominant, 1 = ambiguous/mixed).

OUTPUT: Return a single JSON object matching this schema. Do NOT wrap in markdown code fences. Pure JSON only.

{
  "pageNumber": <number>,
  "pageType": "<PageType>",
  "chapterNumber": <number|null>,
  "chapterTitle": "<string|null>",
  "content": [
    {
      "type": "<ContentBlockType>",
      "text": "<exact transcription>",
      "formatting": [
        { "start": <number>, "end": <number>, "style": "<style>" }
      ],
      "continuedFromPreviousPage": <boolean>,
      "continuesOnNextPage": <boolean>,
      "verseSource": "<scripture|poetry|original|unknown — only for type=verse>"
    }
  ],
  "images": [
    {
      "description": "<what the image shows>",
      "caption": "<caption text if any>",
      "position": "<top-center|full-page|etc>",
      "nearestContentIndex": <0-based index of the content block this image relates to, or null>,
      "isPhotograph": <boolean>,
      "isIllustration": <boolean>,
      "isDecorative": <boolean>,
      "isLogo": <boolean>
    }
  ],
  "metadata": {
    "hasFootnotes": <boolean>,
    "hasSanskrit": <boolean>,
    "sanskritTerms": ["<term1>", "<term2>"],
    "hasPoetry": <boolean>,
    "hasDialogue": <boolean>,
    "hasItalics": <boolean>,
    "isChapterStart": <boolean>,
    "isChapterEnd": <boolean>,
    "runningHeader": "<string|null>",
    "continuedFromPrevious": <boolean>,
    "continuesOnNext": <boolean>
  },
  "rasa": {
    "dominant": "<shanta|adbhuta|karuna|vira|bhakti>",
    "confidence": <1-5>,
    "secondary": "<optional second rasa if the page has a clear blend, else null>"
  },
  "validation": {
    "confidence": <1-5>,
    "pageNumberAgreement": <boolean>,
    "flags": ["<flag1>", "<flag2>"],
    "needsHumanReview": <boolean>
  }
}`;
}

/** Parse CLI arguments */
function parseArgs() {
  const args = process.argv.slice(2);
  let bookSlug = 'autobiography-of-a-yogi';
  let resumeFrom: number | undefined;
  let concurrency = 5;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--book' && args[i + 1]) {
      bookSlug = args[i + 1];
      i++;
    } else if (args[i] === '--resume-from' && args[i + 1]) {
      resumeFrom = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--concurrency' && args[i + 1]) {
      concurrency = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { bookSlug, resumeFrom, concurrency };
}

/** Extract text from a single page image */
async function extractPage(
  client: Anthropic | AnthropicBedrock,
  imagePath: string,
  pageNumber: number,
  model: string,
  systemPrompt: string
): Promise<PageExtraction> {
  const imageData = await fs.readFile(imagePath);
  const base64 = imageData.toString('base64');
  const mediaType = 'image/png';

  const userPrompt = `Extract all text and metadata from this book page image.
Physical page number (from reader footer): ${pageNumber}

Respond with a JSON object matching the PageExtraction schema described in the system prompt.`;

  // Cast to Anthropic to satisfy TS — AnthropicBedrock has the same messages.create() API
  const response = await (client as Anthropic).messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64
            }
          },
          {
            type: 'text',
            text: userPrompt
          }
        ]
      }
    ]
  });

  // Parse the response
  const textContent = response.content.find((c: { type: string }) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error(`No text response for page ${pageNumber}`);
  }

  let jsonText = textContent.text.trim();

  // Strip markdown code fences if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  // Try parsing, with fallback JSON repair for common LLM issues
  let extraction: PageExtraction;
  try {
    extraction = JSON.parse(jsonText) as PageExtraction;
  } catch (firstErr) {
    // Attempt repair: fix unescaped quotes inside JSON string values
    try {
      const repaired = repairJsonText(jsonText);
      extraction = JSON.parse(repaired) as PageExtraction;
      log.warn(`Page ${pageNumber}: JSON required repair (unescaped quotes)`);
    } catch {
      // Save raw response for debugging
      const debugPath = imagePath.replace('/pages/', '/extracted/debug-').replace('.png', '.txt');
      await fs.writeFile(debugPath, jsonText);
      throw new Error(`Failed to parse JSON for page ${pageNumber}: ${firstErr}\nResponse: ${jsonText.substring(0, 500)}`);
    }
  }

  // Ensure page number matches
  extraction.pageNumber = pageNumber;
  return extraction;
}

/** Repair common JSON issues from LLM output (unescaped quotes in string values) */
function repairJsonText(text: string): string {
  // Strategy: try progressively more aggressive repairs until one works

  // Pass 1: Replace smart/curly quotes with escaped regular quotes
  let attempt = text.replace(/[\u201C\u201D]/g, '\\"');
  try { JSON.parse(attempt); return attempt; } catch {}

  // Pass 2: Character-by-character repair of unescaped interior quotes
  attempt = repairInteriorQuotes(text);
  try { JSON.parse(attempt); return attempt; } catch {}

  // Pass 3: Regex-based repair — find "text": "..." patterns and escape interior quotes
  // This handles cases where the look-ahead heuristic fails
  attempt = text.replace(
    /("text"\s*:\s*")((?:[^"\\]|\\.)*)(")/g,
    (match, prefix, content, suffix) => {
      // Already properly escaped — return as-is
      return match;
    }
  );
  // Actually, let's use a more robust approach: extract all string values and re-escape them
  attempt = repairAllStringValues(text);
  try { JSON.parse(attempt); return attempt; } catch {}

  // Pass 4: Nuclear option — strip all content between matched braces, rebuild
  // Try removing trailing commas (another common LLM issue)
  attempt = repairAllStringValues(text).replace(/,\s*([}\]])/g, '$1');
  try { JSON.parse(attempt); return attempt; } catch {}

  // Give up — return the best attempt
  return attempt;
}

function repairInteriorQuotes(text: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      if (!inString) {
        inString = true;
        result += ch;
      } else {
        // Check if this quote ends the string or is an unescaped interior quote
        // Look ahead: if next non-whitespace is : , } ] or end, this is a real close
        const rest = text.slice(i + 1).trimStart();
        if (rest.length === 0 || /^[,:}\]\n\r]/.test(rest)) {
          inString = false;
          result += ch;
        } else {
          // Interior unescaped quote — escape it
          result += '\\"';
        }
      }
    } else {
      // Replace smart/curly quotes inside strings with escaped regular quotes
      if (inString && (ch === '\u201C' || ch === '\u201D')) {
        result += '\\"';
      } else {
        result += ch;
      }
    }
  }

  return result;
}

/** More robust string value repair: find JSON string boundaries using structural analysis */
function repairAllStringValues(text: string): string {
  // Strategy: parse the JSON structure char-by-char, tracking depth.
  // When we enter a string value (after : or [ or ,), find its true end by looking
  // for the closing " that's followed by a structural character.
  // Escape all interior quotes.
  const result: string[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '"') {
      // Find the true end of this string by scanning for a " followed by structural char
      result.push('"');
      i++;

      // Scan for the end of the string value
      let stringContent = '';
      while (i < text.length) {
        const c = text[i];

        if (c === '\\' && i + 1 < text.length) {
          // Already-escaped character — keep it
          stringContent += c + text[i + 1];
          i += 2;
          continue;
        }

        if (c === '"') {
          // Is this the real end of the string?
          const rest = text.slice(i + 1).trimStart();
          if (rest.length === 0 || /^[,:}\]\n\r]/.test(rest)) {
            // Real end
            result.push(stringContent);
            result.push('"');
            i++;
            break;
          } else {
            // Interior quote — escape it
            stringContent += '\\"';
            i++;
            continue;
          }
        }

        // Replace smart quotes inside strings
        if (c === '\u201C' || c === '\u201D') {
          stringContent += '\\"';
        } else {
          stringContent += c;
        }
        i++;
      }
    } else {
      result.push(ch);
      i++;
    }
  }

  return result.join('');
}

/** Process pages with concurrency control */
async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items];
  const active: Promise<void>[] = [];

  while (queue.length > 0 || active.length > 0) {
    while (active.length < concurrency && queue.length > 0) {
      const item = queue.shift()!;
      const promise = processor(item).then(() => {
        active.splice(active.indexOf(promise), 1);
      });
      active.push(promise);
    }

    if (active.length > 0) {
      await Promise.race(active);
    }
  }
}

/** Main extraction loop */
async function runExtraction(bookSlug: string, resumeFrom?: number, concurrency = 5): Promise<void> {
  const config = getPipelineConfig(bookSlug);
  const paths = getBookPaths(bookSlug);

  // Ensure directories exist
  await ensureDir(paths.extracted);

  // Read capture metadata
  const captureMeta = await readJson<CaptureMeta>(paths.captureMeta);
  const totalPages = captureMeta.book.totalPages;

  log.info(`Starting extraction for "${captureMeta.book.title}" (${totalPages} pages)`);
  log.info(`Model: ${config.extraction.model}, Concurrency: ${concurrency}`);

  // Initialize Anthropic client (Bedrock or direct API)
  const client = createClient();
  const modelId = resolveModelId(config.extraction.model, client);

  // Build language-aware system prompt
  const systemPrompt = buildSystemPrompt(
    config.book.title,
    config.book.author,
    config.book.language
  );
  log.info(`Language: ${config.book.language}, System prompt: ${systemPrompt.length} chars`);

  // Find pages to extract
  const pagesToExtract: number[] = [];
  for (let p = resumeFrom ?? 1; p <= totalPages; p++) {
    const imagePath = path.join(paths.pages, `page-${padPage(p)}.png`);
    const extractedPath = path.join(paths.extracted, `page-${padPage(p)}.json`);

    // Skip if already extracted
    if (await fileExists(extractedPath)) {
      continue;
    }

    // Skip if no image
    if (!await fileExists(imagePath)) {
      log.warn(`No image for page ${p}, skipping`);
      continue;
    }

    pagesToExtract.push(p);
  }

  log.info(`${pagesToExtract.length} pages to extract (${totalPages - pagesToExtract.length} already done)`);

  let extracted = 0;
  let errors = 0;

  await processWithConcurrency(pagesToExtract, concurrency, async (pageNum) => {
    const imagePath = path.join(paths.pages, `page-${padPage(pageNum)}.png`);
    const extractedPath = path.join(paths.extracted, `page-${padPage(pageNum)}.json`);

    try {
      const extraction = await extractPage(client, imagePath, pageNum, modelId, systemPrompt);
      await writeJson(extractedPath, extraction);
      extracted++;
      log.progress(extracted, pagesToExtract.length,
        `Extracted page ${pageNum} (${extraction.pageType}, confidence: ${extraction.validation.confidence})`);
    } catch (err) {
      errors++;
      log.error(`Failed to extract page ${pageNum}: ${err}`);

      // Save error marker
      await writeJson(extractedPath + '.error', {
        pageNumber: pageNum,
        error: String(err),
        timestamp: new Date().toISOString()
      });

      // Rate limiting: if we get errors, slow down
      if (String(err).includes('rate') || String(err).includes('429')) {
        log.warn('Rate limited, waiting 30 seconds...');
        await sleep(30000);
      }
    }
  });

  log.info(`Extraction complete! ${extracted} pages extracted, ${errors} errors.`);
}

// Run if called directly
const { bookSlug, resumeFrom, concurrency } = parseArgs();
runExtraction(bookSlug, resumeFrom, concurrency).catch(err => {
  log.error('Extraction failed:', err);
  process.exit(1);
});
