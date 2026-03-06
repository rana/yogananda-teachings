# FTR-045: Platform Parity Mobile

- **State:** Approved
- **Domain:** experience
- **Arc:** 2
- **Governed by:** FTR-045

## Rationale


The portal is a web application, but its API surface will likely be consumed by native mobile apps eventually — either a standalone portal app, integration into the existing SRF mobile app, or both. FTR-015 establishes the architectural conventions that make this possible at zero Arc 1 cost.

### Shared Service Layer

All business logic lives in `/lib/services/` as plain TypeScript functions. Server Components and API routes both call these functions — never the other way around.

```
/lib/services/
 search.ts → findPassages(query, language, options)
 daily-passage.ts → getDailyPassage(date, language)
 themes.ts → getThemes(language), getThemePassages(slug, language, cursor, limit)
 books.ts → getBooks(language), getBook(slug), getChapter(bookSlug, chapterNumber, language)
 quiet.ts → getAffirmation(language)
 relations.ts → getRelatedChunks(chunkId, filters, limit)
 thread.ts → getChapterThread(bookSlug, chapterNumber)
 glossary.ts → getGlossaryTerms(language, category), getTermBySlug(slug, language)
 audio.ts → getRecordings(cursor, limit, filters), getRecording(slug)
 videos.ts → getVideos(cursor, limit, filters), getVideo(slug)
 magazine.ts → getIssues(cursor, limit, filters), getIssue(slug), getArticles(cursor, limit, filters), getArticle(slug)
 seeking.ts → getSeekingDashboard, getThemeTrends(period)
 journeys.ts → getJourneys(language), getJourney(slug)
 resonance.ts → getResonanceSignals(type, limit)
```

**The rule:** Never put business logic in a Server Component or Route Handler that doesn't delegate to a service function. If a Server Component needs data, it calls a service function directly (in-process). If a mobile app needs the same data, it calls the API route, which calls the same service function.

### Database Connection Strategy

```typescript
// /lib/db.ts — Neon serverless connection
import { neon } from '@neondatabase/serverless';

// For Vercel Functions (edge and serverless):
// - @neondatabase/serverless uses HTTP-based queries (no persistent connections)
// - HTTP mode limit: 64MB request/response (irrelevant for API queries; batch ingestion uses Pool)
// - Each function invocation creates a lightweight client, no pool management needed
// - Neon's built-in connection pooler (PgBouncer-compatible) handles concurrency server-side
// - Wrap queries in async-retry with exponential backoff for transient connection drops
//   (config: DB_RETRY_COUNT, DB_RETRY_FACTOR, DB_RETRY_MIN_TIMEOUT_MS in /lib/config.ts)
//
// For Lambda batch workloads (Milestone 3a+, FTR-107):
// - Use Neon's pooled connection string (port 5432 → pooler endpoint)
// - Connection limit scales with compute size (up to 4,000 at 9+ CU)
// - Scale tier: autoscaling up to 16 CU, protected branches, 30-day PITR
// - Batch scripts should use connection pooling via pg Pool with max: 5
//
// For local development:
// - Direct connection to Neon dev branch (non-pooled endpoint)
// - dbmate uses direct connection string for migrations

const sql = neon(process.env.NEON_DATABASE_URL!);
export { sql };
```

### API Conventions

| Convention | Rule | Rationale |
|------------|------|-----------|
| **Versioning** | All routes prefixed `/api/v1/`. Never break v1 after mobile apps ship. | Mobile apps can't force-update users. |
| **Auth** | All routes public (no auth) through Arc 6. Auth added only if/when Milestone 7a accounts are implemented. | Frictionless access is the mission. Auth is additive, never a gate on reading or search. |
| **Pagination** | Cursor-based: `{ results, cursor, hasMore }`. No page-number pagination. | Stable across data changes; mobile infinite scroll. |
| **Cache headers** | Explicit `Cache-Control` on every response. Book text: long-lived. Search: no-store. Daily passage: 1 hour. | Mobile apps cache intelligently without custom logic. |
| **Response shape** | Presentation-agnostic JSON. No HTML in responses. No assumptions about rendering. | Same response serves web, mobile, and any future consumer. |
| **`reader_url` convention** | All `reader_url` fields are locale-relative paths (e.g., `/books/autobiography-of-a-yogi/26#chunk-uuid`). The client prepends the locale prefix (e.g., `/es`). The API never embeds locale into URLs — that's a presentation concern. | Keeps the API locale-agnostic; web and mobile clients handle routing differently. |
| **Language parameter** | All content-serving endpoints accept `language` (optional, default `'en'`). The parameter means "the user's locale," not "detected query language." The service layer handles English fallback when locale results are insufficient (FTR-058). | Locale-first search: trust the user's language choice. |

### Cache-Control Strategy

| Endpoint | Header | Rationale |
|----------|--------|-----------|
| `/api/v1/books/[slug]/chapters/[number]` | `max-age=86400, stale-while-revalidate=604800` | Book text is effectively immutable |
| `/api/v1/daily-passage` | `max-age=3600` | Changes daily, not every second |
| `/api/v1/themes/[slug]/passages` | `max-age=3600` | Theme curation changes infrequently |
| `/api/v1/affirmations` | `max-age=300` | Affirmation rotates but isn't time-critical |
| `/api/v1/search` | `no-store` | Query-dependent, not cacheable |
| `/api/v1/themes` | `max-age=86400` | Theme list rarely changes |
| `/api/v1/books` | `max-age=86400` | Book catalog rarely changes |
| `/api/v1/books/{slug}` | `max-age=86400, stale-while-revalidate=604800` | Book metadata is effectively immutable |
| `/api/v1/passages/[id]/related` | `max-age=86400, stale-while-revalidate=604800` | Relations stable; only change on new content ingestion |
| `/api/v1/books/[slug]/chapters/[number]/thread` | `max-age=86400, stale-while-revalidate=604800` | Same as related — changes only on new content |
| `/api/v1/magazine/issues` | `max-age=86400` | Issue catalog changes rarely |
| `/api/v1/magazine/issues/{slug}` | `max-age=86400, stale-while-revalidate=604800` | Issue metadata is effectively immutable |
| `/api/v1/magazine/articles` | `max-age=86400` | Article catalog changes rarely |
| `/api/v1/magazine/articles/{slug}` | `max-age=86400, stale-while-revalidate=604800` | Article text is effectively immutable |
| `/api/v1/audio` | `max-age=86400` | Audio catalog changes infrequently |
| `/api/v1/audio/{slug}` | `max-age=86400, stale-while-revalidate=604800` | Audio metadata is effectively immutable |
| `/api/v1/videos` | `max-age=86400` | Video catalog changes infrequently |
| `/api/v1/videos/{slug}` | `max-age=86400, stale-while-revalidate=604800` | Video metadata is effectively immutable |
| `/api/v1/glossary` | `max-age=86400` | Glossary changes infrequently |
| `/api/v1/seeking` | `max-age=86400` | Aggregated nightly, not real-time |

### Cache Invalidation Strategy

| Trigger | Mechanism | Scope |
|---------|-----------|-------|
| Content correction (Milestone 1c+) | Contentful webhook → sync service → Vercel revalidation API | Revalidate by path or tag (e.g., `book:autobiography`, `chapter:autobiography-1`) |
| Daily passage rotation | TTL-based (`max-age=3600`) | No explicit invalidation — 1-hour cache is acceptable for daily content |
| Theme tag changes | On-demand revalidation via Vercel API | Theme pages and related API responses |
| New book ingestion | Automated revalidation of `/books` catalog and search index | Book catalog, search results |
| Static assets (JS/CSS) | Content-hashed filenames (`main.abc123.js`) | Infinite cache, new deploy = new hash |
| Emergency content fix | Vercel `revalidatePath('/', 'layout')` or redeploy | Last resort — clears all cached pages |

**Implementation:** Next.js ISR with on-demand revalidation (`revalidatePath` / `revalidateTag`). The webhook sync service (Milestone 1c+) calls the Vercel revalidation endpoint with matching tags after each Contentful publish event. For Milestone 1a (batch sync, no webhooks), cache invalidation is handled by redeployment — acceptable given the low frequency of content changes during initial ingestion.

### Deep Link Readiness

Passage URLs (`/passage/[chunk-id]`) are designed for universal link interception:

| Platform | File | Location |
|----------|------|----------|
| iOS | `apple-app-site-association` | Domain root (`/.well-known/`) |
| Android | `assetlinks.json` | `/.well-known/` |

These files are added when a native app launches. The URL structure that makes them work is established now.

### PWA Readiness (Distributed Across Arcs)

Before native apps, a Progressive Web App provides offline reading, home screen installation, and a lighter footprint. See FTR-103.

| Component | Implementation |
|-----------|---------------|
| **Web App Manifest** | `manifest.json` with SRF branding (SRF Gold theme color, portal icon, `standalone` display) |
| **Service Worker** | Cache-first for book chapters, stale-while-revalidate for daily passage, network-only for search |
| **Offline indicator** | Subtle banner: "You're reading offline. Search requires a connection." |
| **Installable** | Meets PWA installability criteria (manifest + Service Worker + HTTPS) |

Offline reading aligns with the Calm Technology principle — a seeker can download a book chapter and read it on a flight, in a forest, or in a place with no connectivity. The technology fades into the background.

---

## Notes

Migrated from FTR-045 per FTR-084.
