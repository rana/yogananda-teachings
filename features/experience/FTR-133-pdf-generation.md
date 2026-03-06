# FTR-133: PDF Generation Strategy

- **State:** Approved
- **Domain:** experience
- **Arc:** 4
- **Governed by:** FTR-133

## Rationale


### Context

The portal generates PDFs for multiple content types: full books, individual chapters, audio transcripts, video transcripts, talk outlines, and arbitrary passage collections. A coherent PDF strategy must address three concerns: (1) where PDF routes live in the API, (2) which PDFs are pre-rendered vs. dynamic, and (3) the generation technology.

### Decision

**Principle: PDF is a format of a resource, not a separate resource type.** When a resource supports PDF export, the PDF route is a `/pdf` sub-path of that resource — not a parallel namespace. This keeps the API navigable: if you know where a resource lives, you know where its PDF lives.

### API Surface

```
# ── Pre-rendered PDFs (GET, cacheable, served from S3 via CloudFront) ──

GET /api/v1/books/{slug}/pdf → Full book PDF
GET /api/v1/books/{slug}/chapters/{n}/pdf → Chapter PDF
GET /api/v1/audio/{slug}/transcript/pdf → Audio transcript PDF
GET /api/v1/videos/{slug}/transcript/pdf → Video transcript PDF

# ── Dynamic PDFs (on-demand generation) ──

GET /api/v1/study/outlines/{id}/pdf → Study outline PDF
POST /api/v1/exports/pdf → Arbitrary content PDF
 Body: { "type": "passages", "ids": ["uuid", ...] }
 Body: { "type": "search", "query": "...", "language": "en" }
```

### Pre-rendered vs. Dynamic

| PDF Type | Strategy | Trigger | Cache |
|----------|----------|---------|-------|
| Full book | Pre-rendered, S3 + CloudFront | Generated at ingestion time. Regenerated on content update (Contentful webhook or re-ingestion). | Long-lived. CloudFront TTL: 30 days. Invalidated on content change. |
| Chapter | Pre-rendered, S3 + CloudFront | Same as book. | Same. |
| Audio transcript | Pre-rendered, S3 + CloudFront | Generated when transcript status reaches `approved`. Regenerated on transcript update. | Same. |
| Video transcript | Pre-rendered, S3 + CloudFront | Same as audio transcript. | Same. |
| Talk outline | Dynamic, Lambda | On-demand when preparer clicks "Export PDF." | Not cached (private, user-specific). |
| Passage collection | Dynamic, Lambda | On-demand when seeker clicks "Download as PDF." | Short-lived: 1 hour. Keyed by sorted passage IDs. |
| Search results | Dynamic, Lambda | On-demand. | Short-lived: 1 hour. Keyed by query + filters. |

### Transcript Sub-Resource Pattern

Audio and video transcripts are sub-resources that serve dual purpose — as JSON for the synchronized player, and as PDF for download:

```
GET /api/v1/audio/{slug}/transcript → JSON (timestamped segments for player)
GET /api/v1/audio/{slug}/transcript/pdf → PDF (formatted transcript for reading/printing)

GET /api/v1/videos/{slug}/transcript → JSON (timestamped chunks for player)
GET /api/v1/videos/{slug}/transcript/pdf → PDF (formatted transcript for reading/printing)
```

The `/transcript` endpoint is useful on its own — it's what the synchronized audio player and video player consume. The `/transcript/pdf` endpoint is a formatted view of the same data.

### Generation Technology

**`@react-pdf/renderer`** for all PDF generation. Rationale:

- Produces PDFs from React components — the PDF layout shares design tokens (Merriweather serif, SRF Gold accents, warm cream) with the web reader.
- Runs in Node.js (Lambda and Vercel Serverless Functions) without a headless browser.
- Lighter and faster than Puppeteer/Playwright approaches.
- The portal's PDFs are structurally simple (text + citations + headers) — no need for full browser rendering.

### PDF Design Treatment

All PDFs share a consistent visual language:

- **Cover page** (books only): Title, author, SRF/YSS logo, lotus watermark
- **Running header**: Content source (book title, recording title, "Search Results")
- **Running footer**: "From the SRF Online Teachings Portal — teachings.yogananda.org" + page number
- **Typography**: Merriweather serif for body, Open Sans for headers and metadata
- **Citations**: Every passage includes book/chapter/page or recording/timestamp
- **Page size**: A4 default (global standard). US Letter as `?pageSize=letter` query param.
- **File size display**: Download buttons show estimated file size (FTR-048 principle — honest about what the seeker is downloading, especially for Global South bandwidth constraints)
- **Accessibility**: PDF/UA tagged for screen reader compatibility. Language attribute set. Bookmarks for chapters/sections.

### Why Not `/api/v1/pdf/books/{slug}`

A separate `/pdf/` namespace creates a parallel hierarchy where every resource path is duplicated. This is harder to discover, harder to document, and means two places to maintain when routes change. By anchoring PDFs to their parent resource (`/books/{slug}/pdf`), the API remains navigable — a developer or seeker who knows the resource URL can append `/pdf` to get the downloadable version.

### The `POST /api/v1/exports/pdf` Exception

Pre-renderable PDFs are GET endpoints on their parent resources. But a seeker who selects 7 passages from a search wants a PDF of an *ad-hoc collection* that doesn't correspond to a single existing resource. `POST /api/v1/exports/pdf` handles this:

- POST because the request body can be complex (list of UUIDs, search query with filters)
- POST because it's a generation action, not retrieval of a pre-existing document
- The `type` field in the body disambiguates: `"passages"` (explicit IDs) vs. `"search"` (re-execute a query and format results)

### Rationale

- **Consistent pattern.** Every content type that supports PDF export does it the same way: `/{resource}/pdf`. No exceptions, no parallel namespaces.
- **Pre-rendering where possible.** Books and transcripts change rarely. Generating PDFs at ingestion time and serving from CloudFront means zero generation latency for the seeker and zero compute cost per download.
- **Dynamic where necessary.** Talk outlines and passage collections are unique per request. Lambda handles these on-demand with short-lived caching for popular search queries.
- **Shared design system.** `@react-pdf/renderer` with shared design tokens ensures every PDF — book, transcript, outline, passage collection — looks like it came from the same portal.

### Consequences

- Pre-rendered PDFs added to ingestion pipeline: book PDFs generated after book ingestion, transcript PDFs generated after transcript approval
- S3 bucket structure: `s3://srf-teachings-{env}-assets/pdf/books/{slug}.pdf`, `s3://srf-teachings-{env}-assets/pdf/books/{slug}/chapters/{n}.pdf`, `s3://srf-teachings-{env}-assets/pdf/audio/{slug}-transcript.pdf`, `s3://srf-teachings-{env}-assets/pdf/videos/{slug}-transcript.pdf`
- Lambda function for dynamic PDF generation (`/lambda/pdf-generator/`)
- `@react-pdf/renderer` added as a dependency (or in a shared package if Lambda and Vercel both generate PDFs)
- CloudFront invalidation on content update (book re-ingestion, transcript edit)
- File size stored in metadata and displayed on download buttons
- Arc 4: Book and chapter PDFs (pre-rendered)
- Arc 4: Talk outline PDFs (dynamic)
- Arc 6+: Audio and video transcript PDFs (pre-rendered)
- Future: Passage collection and search result PDFs (dynamic, Milestone 7a+ or as demand warrants)


## Notes

Migrated from FTR-133 per FTR-084.
