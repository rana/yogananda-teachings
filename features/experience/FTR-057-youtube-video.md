---
ftr: 57
title: YouTube Video Integration
summary: "Hybrid RSS and YouTube Data API integration for auto-updating categorized video library"
state: approved
domain: experience
governed-by: [PRI-09, PRI-10]
---

# FTR-057: YouTube Video Integration

## Rationale

### Context

SRF operates an active YouTube channel (@YoganandaSRF) with hundreds of videos: How-to-Live monastic talks, guided meditations, convocation sessions, and commemorative events. The Gemini research document emphasizes the importance of integrating this multimedia content with the book corpus.

Options for auto-updating YouTube content:

| Option | Cost | Content Available | Categorization |
|--------|------|-------------------|----------------|
| YouTube RSS feed | Free (no API key) | ~15 most recent only | None |
| YouTube Data API v3 | Free (10,000 units/day) | All videos, all playlists | Full (via playlists) |
| Manual curation | Free | Whatever is curated | Full (manual) |
| RSS + API hybrid | Free | Latest (RSS) + full library (API) | Full |

**Critical quota insight:** The `search.list` endpoint costs **100 units per call**. The `playlistItems.list` endpoint costs **1 unit per call** and returns the same data. Never use `search.list`.

### Decision

Use a **hybrid RSS + YouTube Data API** approach:

1. **RSS feed** (free, no key) for "Latest Videos" — the ~15 most recent uploads, revalidated hourly via Next.js ISR
2. **YouTube Data API v3** (10,000 units/day quota) for the full categorized library — playlists mapped to site categories, revalidated every 6 hours via ISR
3. Videos categorized by mapping YouTube playlist titles to portal categories
4. Videos embedded via `youtube-nocookie.com` for privacy-enhanced playback

### Rationale

- **Auto-updating:** ISR ensures the portal reflects new YouTube content without manual intervention
- **Minimal cost:** ~50-100 API units/day (0.5-1% of free quota)
- **No new vendor:** YouTube is already SRF's video platform (the tech stack brief specifies Vimeo for *private* video; YouTube content is public)
- **Categorization via playlists:** SRF already organizes content into playlists — we map these to portal sections
- **Privacy:** `youtube-nocookie.com` embedding avoids tracking cookies until the user plays a video

### Consequences

- Requires a YouTube Data API key (free, obtained via Google Cloud Console)
- Playlist-to-category mapping needs initial configuration and occasional maintenance
- RSS provides only ~15 recent videos — the API is needed for the full library
- A future milestone can add video transcription for cross-media search (book passages + video segments)


## Specification


### Design Principle

The video section auto-updates from the @YoganandaSRF YouTube channel without manual intervention. SRF's YouTube repository contains hundreds of How-to-Live monastic talks, guided meditations, convocation sessions, and commemorative events. The portal surfaces this content in an organized, searchable way.

### Data Strategy: Hybrid RSS + YouTube API

```
┌─────────────────────────────────────────────────────────────┐
│ │
│ "Latest Videos" section (homepage + /videos) │
│ ┌─────────────────────────────────────┐ │
│ │ YouTube RSS Feed │ │
│ │ (no API key, no quota, free) │ │
│ │ │ │
│ │ URL: youtube.com/feeds/videos.xml │ │
│ │ ?channel_id=CHANNEL_ID │ │
│ │ │ │
│ │ Returns: ~15 most recent videos │ │
│ │ Fields: title, videoId, thumbnail, │ │
│ │ description, published, │ │
│ │ view count │ │
│ │ │ │
│ │ ISR revalidate: 1 hour │ │
│ └─────────────────────────────────────┘ │
│ │
│ "All Videos" (categorized by playlist) │
│ ┌─────────────────────────────────────┐ │
│ │ YouTube Data API v3 │ │
│ │ (API key, 10,000 units/day free) │ │
│ │ │ │
│ │ 1. channels.list (1 unit) │ │
│ │ → get uploads playlist ID │ │
│ │ │ │
│ │ 2. playlists.list (1 unit/page) │ │
│ │ → get all channel playlists │ │
│ │ → map to site categories │ │
│ │ │ │
│ │ 3. playlistItems.list (1 unit/page) │ │
│ │ → get videos per playlist │ │
│ │ → up to 50 per page │ │
│ │ │ │
│ │ 4. videos.list (1 unit per 50) │ │
│ │ → full metadata: duration, │ │
│ │ views, thumbnails, tags │ │
│ │ │ │
│ │ ISR revalidate: 6 hours │ │
│ └─────────────────────────────────────┘ │
│ │
│ NEVER use search.list — costs 100 units per call. │
│ Use playlistItems.list instead (1 unit per call). │
│ │
│ Estimated daily quota usage: ~50-100 units (of 10,000) │
│ │
└─────────────────────────────────────────────────────────────┘
```

### Video Categorization

SRF organizes YouTube content into playlists. We map these to portal categories:

```typescript
// Configuration: YouTube playlist → portal category
const PLAYLIST_CATEGORIES = {
 // Map SRF YouTube playlist titles to portal categories
 'How-to-Live Inspirational Talks': { slug: 'how-to-live', label: 'How-to-Live Talks' },
 'Guided Meditations': { slug: 'meditations', label: 'Guided Meditations' },
 'World Convocation': { slug: 'convocation', label: 'Convocation Sessions' },
 'Mahasamadhi Commemorations': { slug: 'commemorations', label: 'Commemorations' },
 'SRF Lessons Introduction': { slug: 'introduction', label: 'Introduction to the Teachings' },
 // Unmapped playlists appear under "More Videos"
};
```

### ISR Revalidation Schedule

| Content | Revalidation | Rationale |
|---------|-------------|-----------|
| Latest videos (RSS) | 1 hour | Free, catches new uploads promptly |
| Channel info | 24 hours | Rarely changes |
| Playlist list | 6 hours | New playlists are infrequent |
| Playlist videos | 6 hours | Videos may be added to playlists |
| Video details (duration, views) | 6 hours | View counts change but freshness is non-critical |

### API Routes

#### `GET /api/v1/videos/latest`

```
Source: YouTube RSS feed (free, no API key)
ISR: revalidate every 1 hour

Response:
{
 "videos": [
 {
 "videoId": "PiywKdIdQik",
 "title": "2026 New Year Message from Brother Chidananda",
 "published": "2026-01-01T00:00:00Z",
 "thumbnail": "https://i.ytimg.com/vi/PiywKdIdQik/hqdefault.jpg",
 "description": "...",
 "viewCount": "45230"
 },
 ...
 ]
}
```

#### `GET /api/v1/videos/catalog`

```
Source: YouTube Data API v3 (API key required)
ISR: revalidate every 6 hours

Response:
{
 "categories": [
 {
 "slug": "how-to-live",
 "label": "How-to-Live Talks",
 "playlistId": "PLxxxxxx",
 "videoCount": 47,
 "videos": [
 {
 "videoId": "KYxMO7svgPQ",
 "title": "The Art of Introspection for God-Realization",
 "published": "2024-08-15T00:00:00Z",
 "thumbnail": "https://i.ytimg.com/vi/KYxMO7svgPQ/maxresdefault.jpg",
 "duration": "PT1H12M34S",
 "viewCount": "125000",
 "description": "..."
 },
 ...
 ]
 },
 ...
 ]
}
```

### Video Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Videos from @YoganandaSRF │
│ │
│ Latest │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ ▶ thumb │ │ ▶ thumb │ │ ▶ thumb │ │ ▶ thumb │ → │
│ │ title │ │ title │ │ title │ │ title │ │
│ │ 2d ago │ │ 1w ago │ │ 2w ago │ │ 3w ago │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│ │
│ ────────────────────────────────────────────────────── │
│ │
│ How-to-Live Talks View all → │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ ▶ thumb │ │ ▶ thumb │ │ ▶ thumb │ │
│ │ title │ │ title │ │ title │ │
│ │ 1h 12m │ │ 55m │ │ 1h 3m │ │
│ │ 125K │ │ 89K │ │ 67K │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│ │
│ Guided Meditations View all → │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ ... │ │ ... │ │ ... │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│ │
└──────────────────────────────────────────────────────────────┘
```

### Video Embedding

Videos play via YouTube's embedded player (no Vimeo needed for public YouTube content):

```html
<iframe
 src="https://www.youtube-nocookie.com/embed/{videoId}"
 title="{video title}"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowfullscreen
 loading="lazy"
></iframe>
```

Using `youtube-nocookie.com` for privacy-enhanced mode (no tracking cookies until play).

### FTR-142: Future: Video-to-Book Cross-Reference (Milestone 5b)

When monastic talks are transcribed, the transcripts become a new content type alongside book chunks, enabling unified cross-media search and time-synced playback.

#### Transcript Sources

| Source | Timestamps | Quality | Cost |
|--------|-----------|---------|------|
| **YouTube auto-captions** | Word-level (~0.1s accuracy) | Good for clear English speech | Free (YouTube Data API `captions.download`) |
| **YouTube manual captions** | Word-level | Highest (SRF-uploaded) | Free |
| **OpenAI Whisper API** | Word-level (`timestamp_granularities` param) | Excellent for monastic talks | $0.006/min (~$0.36 per 60-min talk) |
| **Deepgram** | Word-level + paragraph-level | Excellent, with speaker diarization | Similar to Whisper |

**Recommended approach:** Start with YouTube's own captions (free, already in the data pipeline). Use Whisper as the quality upgrade for talks where YouTube captions are insufficient. Estimated one-time cost for SRF's full YouTube library (~500 videos): $150–300.

#### Schema Extension

```sql
-- ============================================================
-- VIDEO TRANSCRIPTS (future milestones)
-- ============================================================
CREATE TABLE video_transcripts (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 video_id TEXT NOT NULL, -- YouTube video ID
 video_title TEXT, -- cached from YouTube API
 language TEXT NOT NULL DEFAULT 'en',
 transcript_full TEXT NOT NULL, -- complete transcript text
 source TEXT NOT NULL DEFAULT 'youtube', -- 'youtube', 'whisper', 'deepgram', 'manual'
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

-- ============================================================
-- VIDEO CHUNKS (time-synced, embeddable, searchable — future milestones)
-- ============================================================
-- Same chunking strategy as book_chunks. Each chunk carries start/end
-- timestamps enabling direct links to the exact video playback moment.
CREATE TABLE video_chunks (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 transcript_id UUID NOT NULL REFERENCES video_transcripts(id) ON DELETE CASCADE,
 content TEXT NOT NULL, -- chunk text (same strategy as book_chunks)
 start_seconds FLOAT NOT NULL, -- timestamp where this chunk begins in the video
 end_seconds FLOAT NOT NULL, -- timestamp where this chunk ends
 embedding VECTOR(1024), -- same embedding model as book_chunks (Voyage voyage-4-large, FTR-024)
 -- BM25 search via pg_search index (same FTS strategy as book_chunks, FTR-025)
 language TEXT NOT NULL DEFAULT 'en',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_video_chunks_embedding ON video_chunks
 USING hnsw (embedding vector_cosine_ops);
-- BM25 index for video_chunks created via pg_search (same pattern as chunks_bm25_icu)
```

#### Cross-Media Search Architecture

Because `video_chunks` uses the same embedding model and FTS strategy as `book_chunks`, unified search is natural:

```
Search query: "overcoming fear"
 │
 ▼
 HYBRID SEARCH (extended)
 ├── book_chunks → ranked verbatim book passages with citations
 └── video_chunks → ranked video segments with timestamps
 │
 ▼
 UNIFIED RRF RANKING
 Results interleave book passages and video segments by relevance
 │
 ▼
 RESULT PRESENTATION
 ┌──────────────────────────────────────────────┐
 │ Book result: │
 │ "The soul is ever free..." — AoY, Ch. 12 │
 │ [Read in context →] │
 ├──────────────────────────────────────────────┤
 │ Video result: │
 │ Brother Chidananda on overcoming fear │
 │ "How-to-Live Talk" (12:34–13:15) │
 │ [Watch at 12:34 →] │
 └──────────────────────────────────────────────┘
```

Video results link to `https://youtube.com/watch?v={video_id}&t={start_seconds}` — dropping the seeker into the exact moment. YouTube's embed API also supports `start` parameters for in-portal embedding.

#### Cross-Media Chunk Relations

Pre-computed `chunk_relations` can span book chunks and video chunks. When a seeker reads a passage in *Autobiography of a Yogi*, the Related Teachings panel can show: *"Brother Chidananda discusses this teaching in a 2023 How-to-Live talk (12:34)"* — with a direct link to that timestamp. This is the feature that makes the portal's cross-media intelligence unique.

#### Synchronized Transcript Display

The video player page (`/videos/[slug]`) shows a synchronized transcript panel alongside the embedded player:

- Transcript text scrolls to follow playback position
- Each paragraph is clickable — clicking jumps the video to that timestamp
- Book passages referenced in the talk appear as margin cards linking to the reader
- The transcript is searchable within the page (browser find or custom search)

---

## Notes

Merged from FTR-057 (rationale) and FTR-057 (specification) per FTR-084.
