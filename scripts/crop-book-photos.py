#!/usr/bin/env python3
"""
Crop ebook page screenshots to extract only the photograph.

These images are full Kindle page captures (1232×1572) containing:
- Body text (black on white)
- Photo captions (crimson italic on white)
- The actual photograph
- Footnotes, decorative dividers, etc.

Strategy:
1. Convert to grayscale
2. Compute per-row "photo score" — fraction of mid-tone pixels (30–225)
3. Find runs of rows above a low threshold (0.15)
4. Merge nearby runs (gap < 60 rows where gap still has some content)
5. Take the largest merged run as the photo region
6. Refine horizontal bounds within that block
7. Validate: photo must be tall enough and dense enough

Text-only pages (no photo) are detected and skipped.
"""

import json
import sys
from pathlib import Path

from PIL import Image
import numpy as np


# Mid-tone range: pixels between these values are "photo content"
MID_LO = 30
MID_HI = 225

# Row score threshold for initial detection
ROW_THRESHOLD = 0.15

# Minimum score in a gap to allow merging
GAP_MIN_SCORE = 0.05

# Maximum gap (in rows) to bridge between runs
MAX_GAP = 60

# Minimum height of a photo region (in pixels)
MIN_PHOTO_HEIGHT = 150

# Minimum average score in the detected region to be a real photo (not text)
MIN_AVG_SCORE = 0.18

# Padding around detected photo region (pixels)
PAD = 8

# Manual crop overrides for images the algorithm can't handle well.
# Format: filename_stem → (x0, y0, x1, y1) in pixels on the 1232×1572 source.
MANUAL_OVERRIDES = {
    # Babaji pencil drawing — very light strokes at top (head/hair)
    "photo-p341": (380, 80, 848, 660),
}


def row_photo_scores(gray: np.ndarray) -> np.ndarray:
    """Fraction of mid-tone pixels per row."""
    mid = ((gray >= MID_LO) & (gray <= MID_HI)).astype(float)
    return mid.mean(axis=1)


def find_runs(scores: np.ndarray, threshold: float) -> list[tuple[int, int]]:
    """Find contiguous runs of rows above threshold. Returns [(start, end), ...]."""
    runs = []
    start = None
    for i, s in enumerate(scores):
        if s > threshold:
            if start is None:
                start = i
        else:
            if start is not None:
                runs.append((start, i))
                start = None
    if start is not None:
        runs.append((start, len(scores)))
    return runs


def merge_runs(runs: list[tuple[int, int]], scores: np.ndarray) -> list[tuple[int, int]]:
    """Merge runs separated by small gaps where the gap still has some photo content."""
    if len(runs) <= 1:
        return runs

    merged = [runs[0]]
    for start, end in runs[1:]:
        prev_start, prev_end = merged[-1]
        gap = start - prev_end
        if gap <= MAX_GAP:
            # Check if gap rows have some photo content
            gap_scores = scores[prev_end:start]
            if len(gap_scores) == 0 or gap_scores.mean() > GAP_MIN_SCORE:
                merged[-1] = (prev_start, end)
                continue
        merged.append((start, end))
    return merged


def find_photo_region(scores: np.ndarray) -> tuple[int, int] | None:
    """Find the photo region as the largest merged run of high-scoring rows."""
    runs = find_runs(scores, ROW_THRESHOLD)
    if not runs:
        return None

    merged = merge_runs(runs, scores)

    # Find the largest run
    best = max(merged, key=lambda r: r[1] - r[0])
    y0, y1 = best

    if y1 - y0 < MIN_PHOTO_HEIGHT:
        return None

    # Validate average score — real photos score higher than text
    avg = scores[y0:y1].mean()
    if avg < MIN_AVG_SCORE:
        return None

    return (y0, y1)


def find_photo_cols(gray: np.ndarray, y0: int, y1: int) -> tuple[int, int]:
    """Find horizontal extent of photo within the row band."""
    region = gray[y0:y1, :]
    col_scores = ((region >= MID_LO) & (region <= MID_HI)).astype(float).mean(axis=0)

    threshold = 0.10
    above = col_scores > threshold
    indices = np.where(above)[0]
    if len(indices) == 0:
        return (0, gray.shape[1])
    return (int(indices[0]), int(indices[-1]) + 1)


def crop_photo(img_path: Path, out_path: Path) -> bool:
    """Crop a single ebook page screenshot to just the photo. Returns True if cropped."""
    img = Image.open(img_path).convert("RGB")
    gray = np.array(img.convert("L"))

    scores = row_photo_scores(gray)
    bounds = find_photo_region(scores)

    if bounds is None:
        return False

    y0, y1 = bounds
    x0, x1 = find_photo_cols(gray, y0, y1)

    # Apply padding
    h, w = gray.shape
    y0 = max(0, y0 - PAD)
    y1 = min(h, y1 + PAD)
    x0 = max(0, x0 - PAD)
    x1 = min(w, x1 + PAD)

    cropped = img.crop((x0, y0, x1, y1))
    cropped.save(out_path, "WEBP", quality=85)
    print(f"  ✓ {img_path.name} → {out_path.name}  ({x1-x0}×{y1-y0})")
    return True


def main():
    src_dir = Path("data/book-ingest/autobiography-of-a-yogi/assets")
    out_dir = Path("public/book-images/autobiography-of-a-yogi")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Process only base screenshots (not -s2, -s3 variants)
    sources = sorted(src_dir.glob("photo-p*.png"))
    base_sources = [p for p in sources if "-s" not in p.name]

    skipped = []
    cropped_files = []

    for src in base_sources:
        page_num = src.stem.replace("photo-p", "")
        out_name = f"photo-p{page_num}.webp"
        out_path = out_dir / out_name

        if src.stem in MANUAL_OVERRIDES:
            img = Image.open(src).convert("RGB")
            box = MANUAL_OVERRIDES[src.stem]
            img.crop(box).save(out_path, "WEBP", quality=85)
            w, h = box[2] - box[0], box[3] - box[1]
            print(f"  ✓ {src.name} → {out_path.name}  ({w}×{h}) [manual]")
            ok = True
        else:
            ok = crop_photo(src, out_path)
        if ok:
            cropped_files.append(src.name)
        else:
            skipped.append(src.name)
            print(f"  ✗ {src.name} — no photo detected (text-only page)")

    print(f"\nCropped: {len(cropped_files)}")
    print(f"Skipped (text-only): {len(skipped)}")
    if skipped:
        print(f"  {skipped}")


if __name__ == "__main__":
    main()
