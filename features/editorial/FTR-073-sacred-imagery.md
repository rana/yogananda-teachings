---
ftr: 73
title: Sacred Imagery Strategy
summary: "Images as first-class searchable content type with data model, browse experience, and cross-media relations"
state: approved
domain: editorial
governed-by: [PRI-01, PRI-02, PRI-03, PRI-07]
---

# FTR-073: Sacred Imagery Strategy

## Rationale

### FTR-073: Image Content Type — Photographs as First-Class Content

### Context

SRF possesses a photographic archive spanning nearly a century — historical photographs of Paramahansa Yogananda across decades of his life, portraits of the guru lineage (Sri Yukteswar, Lahiri Mahasaya, artistic depictions of Babaji and Krishna), photographs of SRF/YSS properties and biographical sites, event documentation from convocations and commemorations, and devotional artwork. The portal currently treats images as decorative assets: book covers on `books.cover_image_url`, About page portraits, Sacred Places property photographs. But photographs of Yogananda are sacred artifacts — equivalent in spiritual significance to his voice recordings — and the broader photographic archive is a content dimension that no other medium provides.

A seeker reading Autobiography's account of Yogananda at the Ranchi school cannot see the school in a physical book's photo section (unless they own that edition). A seeker exploring Sacred Places cannot see historical photographs alongside modern Street View links. A seeker studying Sri Yukteswar's teachings cannot see the guru's portrait alongside the passages. The portal can close these gaps by treating images as searchable, browsable, relatable content.

### Decision

Images become a primary content type with their own data model, browse/search experience, and participation in the cross-media content fabric (Related Teachings, editorial threads, theme tagging, place connections).

**Schema:**

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  alt_text TEXT NOT NULL,          -- Accessibility: mandatory, Claude-drafted, human-reviewed
  caption TEXT,                    -- Short display caption
  photographer TEXT,
  date_taken DATE,
  date_approximate TEXT,           -- "circa 1935" when exact date unknown
  era TEXT,                        -- 'india_early', 'america_early', 'encinitas', 'modern'
  location TEXT,
  subject_type TEXT NOT NULL CHECK (subject_type IN (
    'portrait', 'group', 'place', 'event', 'artifact',
    'illustration', 'book_cover', 'devotional'
  )),
  subjects TEXT[],                 -- ['yogananda', 'sri_yukteswar'] — who/what appears
  is_yogananda_subject BOOLEAN NOT NULL DEFAULT false,
  source_collection TEXT,          -- '1920s_india', 'encinitas_hermitage', 'convocation'
  s3_key TEXT NOT NULL,
  cloudfront_url TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL DEFAULT 'jpg',
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now
);

-- Image descriptions embedded for semantic search
-- Images don't have body text to chunk; the description is the searchable proxy
CREATE TABLE image_descriptions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  description_text TEXT NOT NULL,  -- Rich contextual description for embedding
  embedding vector(1024),
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

-- Image ↔ Place spatial connections
CREATE TABLE image_places (
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES sacred_places(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'depicts'
    CHECK (relationship IN ('depicts', 'taken_at', 'related_to')),
  PRIMARY KEY (image_id, place_id)
);
```

**Frontend:**

- `/images` — gallery browse with filters (subject type, era, collection, place)
- `/images/[slug]` — image detail page: full-resolution view, metadata, related passages, related places, related images from same era/collection

**API:**

- `GET /api/v1/images` — browse and filter (cursor-based pagination)
- `GET /api/v1/images/{slug}` — image detail with full metadata
- `GET /api/v1/images/{slug}/related` — cross-media related content (passages, other images, places, media)

**Key principles:**

- `is_yogananda_subject` triggers sacred artifact treatment — a visual provenance indicator, same pattern as `is_yogananda_voice` in FTR-142
- Alt text is mandatory on every image. Claude drafts descriptive, reverential alt text at ingestion time; human review is mandatory before publishing (FTR-005 E7 pattern)
- Image descriptions are the searchable proxy — the description text is embedded for vector search, since the image file itself is not textually searchable. One image, one embedding — no chunking needed.
- Content authority: images are supplementary to Yogananda's verbatim words. In search results and Related Teachings, a photograph never displaces a passage in ranking.
- Images cannot be machine-generated, AI-enhanced, or colorized. Photographic authenticity is paramount. The portal presents images as they are.
- Responsive image serving: five named tiers (thumb 300px, small 640px, medium 1200px, large 2400px, original) generated at upload time in WebP + JPEG dual format. User-facing download options on image detail pages. See FTR-150 for full size tier specification.

### Consequences

- `images` and `image_descriptions` tables added to the initial schema (empty until content ingestion)
- Image ingestion pipeline, gallery, and player added when the image content type goes live
- S3 storage for images uses the same bucket and CloudFront distribution as audio files (FTR-142)
- Image search integration via unified content hub (FTR-142) when cross-media features arrive
- Claude drafts alt text and rich descriptions at ingestion time; human review mandatory before publishing
- Image descriptions are localized alongside other content in STG-021 (Multi-Language) via `image_descriptions.language`
- Sacred Places pages (FTR-049) gain a photographs section — images connected via `image_places`
- **Extends** FTR-005 E7 (Claude-generated alt text) — from About page photos to the entire image archive
- **Extends** FTR-142 (audio sacred artifacts) — same `is_yogananda_subject` pattern for visual sacred artifacts

### FTR-073: Sacred Image Usage Guidelines

### Context

The portal has access to 16 official photographs of the SRF line of gurus (Mahavatar Babaji, Lahiri Mahasaya, Swami Sri Yukteswar, Paramahansa Yogananda), plus photographs of SRF's physical properties (Lake Shrine, Encinitas Hermitage, Mount Washington, meditation gardens). These images require handling that reflects their sacred significance in the SRF tradition.

### Decision

Establish strict image usage guidelines that treat guru photographs as sacred objects and nature/property photographs as atmospheric elements.

**Guru photographs — rules:**

| Rule | Rationale |
|------|-----------|
| Guru images appear in exactly two places: the About section (lineage display) and the Quiet Corner (single portrait above the affirmation) | Restraint creates reverence. Their absence from the rest of the portal makes their presence meaningful. |
| Never crop, filter, overlay, or apply visual effects to guru photographs | These are portraits of realized masters. Digital manipulation would be disrespectful. |
| Never place guru images adjacent to UI controls (buttons, form fields, error states) | Avoids juxtaposing sacred images with mundane interface elements. |
| Never use guru images as background wallpaper, with opacity overlays, or as decorative elements | The images are not decoration — they are objects of devotion. |
| Never use guru images in loading states, error pages, or empty states | These are transient, technical UI states — not appropriate for sacred imagery. |
| Yogananda's portrait appears on each book's landing page as the author photo, positioned like a frontispiece in a physical book | This is the one additional context where a guru image is appropriate — authorship attribution. |
| All guru images must include alt text with the guru's full name and title | Accessibility and respect. |
| Never generate AI imagery of gurus — no synthetic portraits, no AI-animated photographs, no AI "enhancement" that alters appearance. Only authentic photographs are permitted. (FTR-008) | These are portraits of realized masters. Synthetic fabrication — however skillful — is theologically impermissible. Standard restoration (denoising, color correction) that preserves the original is engineering and is permitted. |

**Nature/property photographs — uses:**

| Context | Image Type | Treatment |
|---------|-----------|-----------|
| Quiet Corner | Lake Shrine, gardens | Subtle: small image below affirmation or very low-opacity background. Never competing with the text. |
| Theme pages | Nature associated with each theme (still water for Peace, mountains for Courage, etc.) | Ambient atmosphere. Small, muted, never dominant. |
| 404 / empty states | Garden photograph | Gentle message alongside: "This page doesn't exist yet, but perhaps you were meant to find this instead..." with search bar. |
| Seasonal homepage accent | Season-appropriate nature | Very subtle. A suggestion of season, not a hero image. |

**Images NOT sourced from SRF:**
- No stock photography. Every image should be either an official SRF photograph or a nature image from SRF properties.
- If SRF property images are not available, prefer no image over a generic stock photo.

### Rationale

- **Theological alignment:** In the SRF tradition, guru photographs are placed on the meditation altar and treated with reverence. The portal's image handling should reflect this practice.
- **Design restraint:** The portal's power comes from the words. Images support; they never compete. The homepage has no images at all — just Yogananda's words on warm cream. This is deliberate.
- **Calm Technology:** Images that are ambient and atmospheric support the "digital silence" principle. Images that are decorative or attention-grabbing violate it.

### Consequences

- The About section needs a carefully designed lineage display (4 guru portraits in sequence)
- The Quiet Corner needs a curated pool of SRF property/nature images
- The 404 page needs a garden image and gentle copy
- SRF must provide or approve all images used. The 16 official guru photos are available; property photographs may need to be sourced from SRF's media library.
- Each image needs proper licensing/attribution confirmation from SRF

### FTR-073: SRF Imagery Strategy in the Portal

### Context

SRF has extraordinary imagery: the Encinitas hermitage cliffs, Lake Shrine gardens, the Pacific coastline, official portraits of Paramahansa Yogananda and the line of gurus. The portal must use this imagery with care — images should serve the reading experience, not compete with it. FTR-073 establishes guidelines for guru portraits. This ADR extends those guidelines to cover nature photography, homepage imagery, and the overall imagery philosophy.

### Decision

1. **The reading experience is text-only.** No images appear in the book reader column. Imagery would compete with Yogananda's words, and his words always win. The side panel may show video thumbnails (future stages) but never photographs.

2. **Homepage hero:** A single, wide, soft-focus photograph of an SRF property (Encinitas coastline, Lake Shrine) overlaid with "Today's Wisdom" in white Merriweather on a semi-transparent `--srf-navy` band. Updated seasonally (4 images per year). If SRF cannot provide or approve photographs, the homepage uses the warm cream background with no hero image — the design works without it.

3. **Quiet Corner background:** An extremely subtle, desaturated nature photograph at 5–8% opacity beneath the warm cream. A hint of sky, a suggestion of water. Visible only if you look for it. Applied via `background-image` with low opacity. If no approved image is available, the page uses `--portal-bg-alt` alone — the quiet stillness works without the image.

4. **Guru portrait in footer:** A small (approximately 48–60px wide), sepia-toned portrait of Paramahansa Yogananda in the site footer beside "Teachings of Paramahansa Yogananda." Not decoration — attribution. Present on every page.

5. **No stock photography.** Ever. If SRF-approved imagery is not available for a use case, the design uses typography and color alone. The warm cream palette and gold lotus motif are sufficient to create a sacred atmosphere without photographs.

6. **Photo-optional design.** Every layout works without images. When SRF photographs are available, they enhance the experience. When they are not, the warm cream palette and gold lotus motif are sufficient to create a sacred atmosphere.

### Rationale

- The portal is a library, not a gallery — text is the primary content
- SRF's properties are genuinely beautiful and carry spiritual significance for practitioners
- Seasonal homepage rotation keeps the portal feeling alive without requiring ongoing editorial effort
- The footer portrait provides a human, reverential anchor on every page
- The "no stock photography" rule prevents the generic spiritual aesthetic that undermines authenticity

### Consequences

- The homepage hero component is conditional — it gracefully degrades to text-only if no image is configured
- A `portal_images` configuration (or simple env var/CMS field) stores the current seasonal hero image
- The Quiet Corner background image is optional and loaded with `loading="lazy"` and low priority
- FTR-073's guidelines on guru portraits remain in effect — this feature adds the footer portrait and nature photography strategy
- The footer component gains a small portrait element with alt text "Paramahansa Yogananda"
