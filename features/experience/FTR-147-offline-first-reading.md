---
ftr: 147
title: Offline-First Sacred Reading
state: proposed
domain: experience
arc: "2"
---

# FTR-147: Offline-First Sacred Reading

## Rationale

**Type:** Enhancement (Experience)
**Governing Refs:** PRI-05 (Global-First), PRI-03 (Honoring the Spirit), FTR-006 § 4 (Intermittent Connectivity), FTR-103 (PWA)
**Target:** Arc 2–3 (evaluation); implementation depends on corpus size and Service Worker maturity
**Dependencies:** Service Worker infrastructure (M2b — already shipped), multi-book corpus (M3a+)

#### Context

FTR-006 § 4 establishes the portal's offline posture as *offline-tolerant*: the Service Worker caches the app shell (M1c), extends to all pages and fonts (M2a), and reactively caches the last-read chapter (M2b). The offline indicator says: *"You're reading offline. Search requires a connection."*

This posture handles the common case — re-reading what you just read when connectivity drops. But it does not serve the seeker who *anticipates* being offline: the devotee heading to a retreat center without WiFi, the monk in a rural ashram, the seeker on a long bus ride in Bihar. These seekers know they will be offline. They need to prepare.

The current design treats offline as a degradation to recover from. For sacred text reading — where seekers reread passages as spiritual practice — offline could be the *primary* mode.

#### What This Proposes

A "Save for offline" capability in the book reader:

1. **Chapter download.** A download icon in the chapter reader header. Tapping it caches that chapter's full HTML + CSS in the Service Worker. A subtle lotus indicator shows which chapters are saved. No account needed — uses Cache API directly.

2. **Book download.** On the book landing page, a "Save entire book for offline" button. Downloads all chapters progressively (background fetch if supported, sequential fetch otherwise). Progress indicator. Stored in Service Worker cache with content-hashed keys.

3. **Offline library view.** The `/bookmarks` page (or a new `/library/offline` section) shows what's cached locally. Seekers can manage their offline library — remove chapters, see storage used, refresh stale content.

4. **Offline search (limited).** Over downloaded chapters only — simple text search using a client-side index (e.g., lightweight trigram matching over cached chapter text). Not the full hybrid search — just "find this phrase in what I've downloaded." Better than nothing when the seeker remembers a phrase but not which chapter.

5. **Download queue.** If the seeker requests a book download on a slow connection, queue the chapters and sync them as bandwidth allows. Resume interrupted downloads. Notify when complete (if notification permission granted — never push; PRI-08).

#### What This Does NOT Change

Search architecture (server-side hybrid search remains primary), content pipeline, API design, analytics posture, authentication model. This is purely a Service Worker and client-side enhancement.

#### Sizing

Medium. The Service Worker infrastructure exists. The main work is UI (download controls, offline library, progress indicators), background fetch logic, and client-side search index. Estimated: 3–5 days implementation, 1–2 days testing.

#### Open Questions

- Storage limits vary by device. A full book (~500KB–2MB HTML) is small, but 15 books × 10 languages = 150–300MB. Need a storage budget and graceful handling when quota is exceeded.
- Should offline content expire? Or is cached sacred text permanent until the seeker removes it?
- Background Fetch API has limited browser support (~70%). Progressive enhancement: browsers without it get sequential download. Is this sufficient, or should the feature wait for broader support?

**Re-evaluate At:** M3a completion (multi-book corpus provides realistic test), Arc 2 planning
**Decision Required From:** Architecture (storage strategy, client-side search approach), Human principal (whether offline-first aligns with the portal's identity or over-engineers for a minority use case)
**Origin:** Explore-act analysis of PRI-05 offline posture gap, 2026-03-03


## Notes

Migrated from FTR-147 per FTR-084.
