/**
 * Sync motif assets from yogananda-design to public/.
 *
 * Next.js serves static assets from public/ only. The design system
 * (installed as a git dependency) owns the canonical SVG glyphs and
 * icons. This script copies them so they're available at runtime.
 *
 * Runs on: postinstall, prebuild.
 */

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const src = resolve(root, "node_modules/yogananda-design/motifs/srf");
const dest = resolve(root, "public/motifs/srf");

if (!existsSync(src)) {
  console.log("sync-motifs: yogananda-design not installed yet, skipping.");
  process.exit(0);
}

// Ensure destination directories exist
mkdirSync(resolve(dest, "glyphs"), { recursive: true });
mkdirSync(resolve(dest, "icons"), { recursive: true });

// Copy glyphs and icons
cpSync(resolve(src, "glyphs"), resolve(dest, "glyphs"), { recursive: true });
cpSync(resolve(src, "icons"), resolve(dest, "icons"), { recursive: true });

console.log("sync-motifs: copied motifs/srf/{glyphs,icons} to public/.");
