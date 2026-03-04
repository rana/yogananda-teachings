#!/usr/bin/env npx tsx
/**
 * Photo Extraction & Cropping Script
 *
 * Extracts individual photographs from raw Kindle page screenshots.
 * Uses Claude Vision to identify photo regions and crop coordinates,
 * then delegates to ImageMagick (convert) for the actual cropping.
 *
 * Input:  data/book-ingest/{slug}/assets/photo-manifest.json + photo-*.png
 * Output: data/book-ingest/{slug}/assets/cropped/ directory with individual photos
 *
 * Usage:
 *   npx tsx src/crop-photos.ts --book autobiography-of-a-yogi
 *   npx tsx src/crop-photos.ts --book autobiography-of-a-yogi --dry-run
 *   npx tsx src/crop-photos.ts --book autobiography-of-a-yogi --page 6
 *
 * Requires: ANTHROPIC_API_KEY (or CLAUDE_API_KEY), ImageMagick (convert command)
 */

import path from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { getBookPaths } from './config.js';
import { log } from './utils.js';

// ── Types ───────────────────────────────────────────────────────

interface PhotoManifestEntry {
  assetFile: string;
  pageNumber: number;
  screenIndex: number;
  fileSizeBytes: number;
  likelyContent: string;
  caption: string | null;
  captionSource: string;
  imageDescription: string | null;
  pageType: string;
  isPhotograph: boolean;
  isIllustration: boolean;
}

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CroppedPhoto {
  sourceFile: string;
  outputFile: string;
  pageNumber: number;
  caption: string | null;
  description: string | null;
  cropRegion: CropRegion;
  subject: string;
}

// ── Configuration ───────────────────────────────────────────────

const CROP_PROMPT = `You are analyzing a screenshot of a Kindle book page that contains a photograph. Identify the photograph region — the actual photographic image, NOT the surrounding text or caption.

Return ONLY a JSON object with the crop coordinates as percentages (0-100) of the image dimensions:

{
  "hasPhoto": true,
  "crop": {
    "topPercent": 25.0,
    "leftPercent": 10.0,
    "widthPercent": 80.0,
    "heightPercent": 50.0
  },
  "subject": "Brief description of the photo subject (e.g., 'Portrait of Sri Yukteswar', 'Group photo at Ranchi school')"
}

If there is no photograph on this page (only text), return:
{ "hasPhoto": false }

Be precise with the crop region — include only the photograph itself, not captions or text below/above it. Include a small margin (1-2%) around the photo edges.`;

// ── Helpers ─────────────────────────────────────────────────────

async function detectCropRegion(
  imagePath: string,
  apiKey: string,
): Promise<{ hasPhoto: boolean; crop?: { topPercent: number; leftPercent: number; widthPercent: number; heightPercent: number }; subject?: string }> {
  const imageData = readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const mediaType = 'image/png';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: CROP_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json() as { content: { type: string; text: string }[] };
  const text = data.content[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse crop response: ${text}`);

  return JSON.parse(jsonMatch[0]);
}

function cropImage(
  inputPath: string,
  outputPath: string,
  region: CropRegion,
): void {
  // Use ImageMagick convert for cropping
  const cmd = `convert "${inputPath}" -crop ${region.width}x${region.height}+${region.x}+${region.y} +repage "${outputPath}"`;
  execSync(cmd, { stdio: 'pipe' });
}

function getImageDimensions(imagePath: string): { width: number; height: number } {
  const output = execSync(`identify -format "%w %h" "${imagePath}"`, { encoding: 'utf-8' });
  const [w, h] = output.trim().split(' ').map(Number);
  return { width: w, height: h };
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const bookIdx = args.indexOf('--book');
  if (bookIdx === -1 || !args[bookIdx + 1]) {
    console.error('Usage: npx tsx src/crop-photos.ts --book <slug> [--dry-run] [--page N]');
    process.exit(1);
  }
  const bookSlug = args[bookIdx + 1];
  const dryRun = args.includes('--dry-run');
  const pageIdx = args.indexOf('--page');
  const singlePage = pageIdx !== -1 ? parseInt(args[pageIdx + 1]) : null;

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY or CLAUDE_API_KEY not set.');
    process.exit(1);
  }

  // Check ImageMagick availability
  try {
    execSync('which convert', { stdio: 'pipe' });
  } catch {
    console.error('ImageMagick (convert) not found. Install with: sudo apt install imagemagick');
    process.exit(1);
  }

  const paths = getBookPaths(bookSlug);
  const assetsDir = paths.assets;
  const manifestPath = path.join(assetsDir, 'photo-manifest.json');

  if (!existsSync(manifestPath)) {
    console.error(`Photo manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest: PhotoManifestEntry[] = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const photos = manifest.filter(
    (e) => e.isPhotograph && (singlePage === null || e.pageNumber === singlePage),
  );

  // Deduplicate: prefer the primary screen capture (no -s2/-s3 suffix) or largest file
  const byPage = new Map<number, PhotoManifestEntry>();
  for (const photo of photos) {
    const existing = byPage.get(photo.pageNumber);
    if (!existing || photo.fileSizeBytes > existing.fileSizeBytes) {
      byPage.set(photo.pageNumber, photo);
    }
  }

  const outputDir = path.join(assetsDir, 'cropped');
  if (!dryRun) mkdirSync(outputDir, { recursive: true });

  log.info(`Processing ${byPage.size} photo pages for "${bookSlug}"`);
  if (dryRun) log.info('DRY RUN — no files written');

  const results: CroppedPhoto[] = [];

  for (const [pageNum, entry] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
    const inputPath = path.join(assetsDir, entry.assetFile);
    if (!existsSync(inputPath)) {
      log.warn(`  Page ${pageNum}: File not found: ${entry.assetFile}`);
      continue;
    }

    try {
      const detection = await detectCropRegion(inputPath, apiKey);

      if (!detection.hasPhoto || !detection.crop) {
        log.info(`  Page ${pageNum}: No photo detected (${entry.assetFile})`);
        continue;
      }

      const dims = getImageDimensions(inputPath);
      const cropRegion: CropRegion = {
        x: Math.round(dims.width * detection.crop.leftPercent / 100),
        y: Math.round(dims.height * detection.crop.topPercent / 100),
        width: Math.round(dims.width * detection.crop.widthPercent / 100),
        height: Math.round(dims.height * detection.crop.heightPercent / 100),
      };

      const outputFile = `photo-p${String(pageNum).padStart(3, '0')}-cropped.png`;
      const outputPath = path.join(outputDir, outputFile);

      if (!dryRun) {
        cropImage(inputPath, outputPath, cropRegion);
      }

      const result: CroppedPhoto = {
        sourceFile: entry.assetFile,
        outputFile,
        pageNumber: pageNum,
        caption: entry.caption,
        description: entry.imageDescription || detection.subject || null,
        cropRegion,
        subject: detection.subject || 'Unknown',
      };
      results.push(result);

      log.info(
        `  Page ${pageNum}: ${detection.subject} → ${outputFile} (${cropRegion.width}x${cropRegion.height})`,
      );
    } catch (err) {
      log.warn(`  Page ${pageNum}: Failed: ${err}`);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  // Write crop manifest
  const cropManifestPath = path.join(outputDir, 'crop-manifest.json');
  if (!dryRun) {
    writeFileSync(cropManifestPath, JSON.stringify(results, null, 2));
    log.info(`\nCropped ${results.length} photos → ${outputDir}/`);
    log.info(`Manifest: ${cropManifestPath}`);
  } else {
    log.info(`\nWould crop ${results.length} photos.`);
  }
}

main().catch((err) => {
  log.error('Photo cropping failed:', err);
  process.exit(1);
});
