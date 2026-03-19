# SRF Online Teachings Portal — Roadmap

| Status | Stage | Track | Focus |
|--------|-------|-------|-------|
| Complete | [STG-001: Prove](#stg-001-prove) | Portal | English search proof |
| Complete | [STG-002: Bilingual](#stg-002-bilingual) | Portal | Spanish bilingual search |
| Complete | [STG-003: Deploy](#stg-003-deploy) | Portal | Infrastructure, Vercel, observability |
| Complete | [STG-004: Build](#stg-004-build) | Portal | All pages, i18n, accessibility |
| Complete | [STG-005: Refine](#stg-005-refine) | Portal | Reader experience, PWA, design system |
| **Current** | **[STG-006: Corpus](#stg-006-corpus)** | **Portal** | **Multi-book catalog, cross-book search** |
| Planned | [STG-007: Editorial](#stg-007-editorial) | Portal | Theme tagging, editorial operations |
| Planned | [STG-008: Intelligence](#stg-008-intelligence) | Portal | Related Teachings, cross-book connections |
| Planned | [STG-009: Complete](#stg-009-complete) | Portal | Full corpus, observability |
| Complete | STG-010: SDK Spike | Platform | Claude Agent SDK validation |
| Complete | STG-011: Minimal Loop | Platform | First experiment end-to-end |
| **Current** | **STG-012: Real Pipeline** | **Platform** | **Full pipeline with approval gate** |
| Planned | STG-013: Production Readiness | Platform | Convocation 2027 |
| — | [Future Directions](#future-directions) | — | Service, Languages, Distribution, Media, Community |
| — | [Unscheduled Features](#unscheduled-features) | — | Ideas not yet assigned to a stage |

Each stage delivers a working, demonstrable increment. **Stage ordering follows the reachable population metric (FTR-011):** when stages are architecturally independent, the one serving more people ships first. Where deliverables have no technical dependency on another stage's organizational prerequisites, they proceed in parallel — build on schedule, activate via feature flags when the organization is ready (FTR-012). Features not ready for stage assignment are tracked as FTR files with state `proposed` or `deferred` and reviewed at stage boundaries.

---

## Current

### STG-006: Corpus

**Goal:** Ingest high-impact books to reach critical mass of quotable, thematically diverse content. Expand cross-book search and content pools. This stage can proceed independently of SRF editorial staffing decisions.

**Book ingestion priority** (per FTR-120 — life-impact ordering):

| Wave | Books | Rationale |
|------|-------|-----------|
| **First** | *Where There Is Light*, *Sayings of Paramahansa Yogananda*, *Scientific Healing Affirmations* | Short, topically structured, low chunking complexity. Directly power Today's Wisdom, Doors of Entry, and Quiet Corner. |
| **Second** | *Man's Eternal Quest*, *The Divine Romance* | Collected talks — rich, practical, accessible. Moderate chunking complexity. |
| **Third** | *How You Can Talk With God*, *Metaphysical Meditations*, *Journey to Self-Realization* | Short works and third volume of collected talks. |
| **Fourth** | *Wine of the Mystic*, *The Second Coming of Christ* (2 vols), *God Talks With Arjuna* (2 vols) | Niche or massive multi-volume works requiring verse-aware chunking. |

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-006-1 | **Ingest first-wave books** | *Where There Is Light*, *Sayings of Paramahansa Yogananda*, *Scientific Healing Affirmations*. Short, topically organized, low-complexity. Claude classifies passage accessibility level (universal/accessible/deep) at ingestion time — spot-checked by reviewer. (FTR-005 E3) |
| STG-006-2 | **Expand Today's Wisdom pool** | Populate `daily_passages` from *Sayings* (entire book is standalone quotes) and *Where There Is Light*. Add optional seasonal affinity tags and circadian `time_affinity` tags (dawn/morning/afternoon/evening/night). Claude classifies tone (consoling/joyful/challenging/contemplative/practical) per passage — selection algorithm ensures tonal variety across the week. Default to accessibility level 1–2 passages for newcomer-friendly homepage. Circadian weighting ensures 2 AM visitors encounter consolation, not productivity. (FTR-005 E8, E3) |
| STG-006-3 | **Expand Quiet Corner pool** | Populate `affirmations` from *Scientific Healing Affirmations* and *Metaphysical Meditations*. |
| STG-006-4 | **Cross-book search** | Search spans all books by default. Optional book filter. Results show which books address a topic. |
| STG-006-5 | **Expanded book catalog** | Books (`/books`) and book landing pages (`/books/[slug]`) established in STG-004 now display the full multi-book catalog. Book cards show cross-book search availability. Sort/filter by theme or publication year. |
| STG-006-6 | **Deploy batch Lambda functions** | Lambda infrastructure already provisioned in STG-004-22. Deploy book ingestion and chunk relation computation Lambda functions (`/lambda/handlers/`). Replace manual scripts that would exceed Vercel timeouts. CLI wrappers in `/scripts/` for local development. (FTR-106, FTR-107) |
| STG-006-7 | **Passage resonance instrumentation** | Anonymous, aggregated counters: share count, dwell count, relation traversal count per passage. Skip count per daily passage. Simple integers, no timestamps, no session correlation. Rate-limited (1 increment per IP per hour). Editorial "Resonance" view in admin portal showing top-resonating passages. (FTR-031) |
| STG-006-8 | **"What's New in Books" indicator** | Subtle `--srf-gold` dot (6px) beside "Books" in navigation when new books exist since last Books visit. On the Books page, new books show a "New" label. `localStorage`-based, disappears after seeker visits Books. No tracking. |
| STG-006-9 | **Search suggestions — multi-book + bridge + curated** | Expand suggestion index across all ingested books — each ingestion updates `suggestion_dictionary` and triggers static JSON rebuild (FTR-029 Tier A). Activate bridge-powered suggestions: when prefix matches a `spiritual-terms.json` key, response includes Yogananda's vocabulary for that concept (e.g., "mindful" → "concentration, one-pointed attention"). Bridge hints continue into search results page. Add theme names from `teaching_topics` to suggestion index. Expand curated query suggestions editorially. `/lib/data/curated-queries.json` maintained by SRF-aware editors. (FTR-029, FTR-029) |
| STG-006-10 | **`/browse` grows — themes, glossary, Quiet textures** | Auto-generated `/browse` page expands to include active teaching topics (all categories), glossary terms (A–Z), and Quiet Corner texture categories. Still zero editorial overhead — all sections generated from database queries at build time. (FTR-056) |
| STG-006-11 | **HyDE search evaluation** | *(Reclassified from STG-005-12. Implementation done — `lib/services/hyde.ts`, feature-flagged in search.ts.)* Evaluate HyDE lift on literary/spiritual queries vs. standard vector search using expanded multi-book golden retrieval set. A/B comparison: standard query embedding vs. HyDE document-space embedding. Decide whether to enable by default. (FTR-027) |
| STG-006-12 | **Cohere Rerank evaluation** | *(Reclassified from STG-005-13. Implementation done — `lib/services/rerank.ts`, feature-flagged in search.ts.)* Benchmark Cohere Rerank 3.5 cross-encoder precision against RRF-only ranking using expanded multi-book golden retrieval set. Evaluate latency tradeoff. Decide whether to enable by default. (FTR-027) |

### Success Criteria

- First-wave books ingested with correct chunking and citations
- Cross-book search returns results from multiple books for thematic queries
- Today's Wisdom draws from expanded pool with tonal variety
- Quiet Corner draws from *Scientific Healing Affirmations* content
- Lambda batch functions deploy and execute successfully
- Search suggestions include multi-book vocabulary and bridge terms

---

### STG-007: Editorial

**Goal:** Establish editorial operations, build the theme navigation system, and deliver the staff tooling that transforms the portal from a technical project into a running content operation.

**Feature-flag activation pattern (FTR-012):** STG-007 infrastructure ships on schedule regardless of SRF editorial staffing status. All editorial queues, review workflows, and curation tools are built and deployed behind feature flags. When SRF identifies editorial staff, queues activate via environment configuration — no code changes, no redeployment. The AE team can serve as lightweight interim editors until monastics are assigned. This decouples the build timeline from organizational readiness. (See stage deliverable tables.)

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-007-1 | **Teaching topic tagging pipeline** | Semi-automated: embed theme descriptions → cosine similarity against all chunks → candidates above threshold get `tagged_by='auto'` → optional Claude classification for ambiguous cases → mandatory human review → `tagged_by='reviewed'`. Three-state provenance: `manual`, `auto`, `reviewed`. Only `manual` and `reviewed` tags served to users. Initial pass: six quality themes (Peace, Courage, Healing, Joy, Purpose, Love) plus **Grief & Loss as the first situation theme** — elevated as a primary empathic entry point because grief is arguably the most common reason someone turns to spiritual literature. Add remaining situation themes (Relationships, Parenting, Work, etc.) and practice themes (Meditation, Concentration, Affirmation, etc.) incrementally — editorial judgment decides when a topic has enough depth to publish (no fixed minimum count). (FTR-121, FTR-122) |
| STG-007-2 | **Doors of Entry + Explore all themes** | Activate `/themes/[slug]` pages with curated passages from across all books. Each visit shows a different random selection. Homepage shows six quality-theme doors; "Explore all themes →" links to `/themes` index page with sections for quality, situation, and practice themes. Replace STG-004 placeholder doors with live theme navigation. Person, principle, and scripture categories added in STG-008 when multi-book content enables meaningful coverage. (FTR-121, FTR-122) |
| STG-007-3 | **Calendar-aware content surfacing** | `calendar_events` and `calendar_event_passages` tables. Editorially curated date-to-passage associations for Yogananda's life events, Hindu/Christian calendar, and universal observances. Homepage "Today's Wisdom" draws from the calendar pool when a relevant date falls. (FTR-065) |
| STG-007-4 | **The Quiet Index** | Combine E3 (accessibility rating) and E8 (tone classification) into browsable routes: `/quiet/contemplative`, `/quiet/practical`, `/quiet/devotional`, `/quiet/philosophical`, `/quiet/narrative`. Extends the Quiet Corner with texture-based passage browsing. (FTR-065) |
| STG-007-5a | **Editorial review portal — foundation and theme review** | Auth0-protected `/admin` route group built with the portal's calm design system. Auth0 roles: `editor`, `reviewer`. Editorial home screen with role-filtered summary. Theme tag review queue (keyboard-driven: `a` approve, `r` reject, `→` next). Ingestion QA review (flagged passages with Claude suggestions). Content preview ("preview as seeker" for theme pages). Session continuity (resume where you left off). (FTR-060) |
| STG-007-5b | **Editorial review portal — curation workflows** | Daily passage curation with 7-day lookahead and tone badge display. Calendar event ↔ passage association management. Tone/accessibility spot-check workflow. Content preview for daily passages. Email digest for daily review notifications via scheduled serverless function. (FTR-060) |
| STG-007-6 | **Early impact view** | Lightweight, DELTA-compliant mission reporting in the admin portal: countries reached (Vercel Analytics geo data), anonymized search themes ("What is humanity seeking?"), content served (passages, books), languages available. Not engagement tracking — mission reporting. Answers: "Are the teachings reaching the world?" Visible to `editor`, `reviewer`, and `leadership` roles. (FTR-032) |
| STG-007-7 | **Living Glossary** | `/glossary` page: browsable, searchable spiritual terminology. Each entry: term, brief definition (editorial), Yogananda's own explanation (verbatim passage with citation), related themes. Inline reader highlighting (opt-in toggle in reader settings): dotted underline on recognized terms, tooltip with definition. Seeded from Vocabulary Bridge Layer 2 entries (FTR-028, FTR-028), enriched per-book via FTR-028 extraction lifecycle. (FTR-062) |
| STG-007-8 | **Practice bridge after search** | Contextual practice signpost below search results when intent classifier detects practice-oriented queries (meditation, healing, Kriya). Links to SRF Lessons, Quiet Corner, center locator. Editorial text in `messages/en.json`. Signpost, not funnel — no click tracking. |
| STG-007-9 | **Seeker feedback mechanism** | "Report a citation error" link on every passage. "I didn't find what I needed" option on empty/sparse search results. `/feedback` page linked from footer. `seeker_feedback` table. All DELTA-compliant — no user identifiers stored. Feedback review queue added to editorial portal. (FTR-061) |
| STG-007-10 | **`/guide` — The Spiritual Guide** | Editorially curated recommendation page organized by seeker context: "If you are new to Yogananda's teachings," "If you are exploring meditation," "If you are dealing with loss," etc. 20–30 pathways, each with 2–3 specific recommendations and brief editorial framing (never paraphrasing Yogananda). Three-state provenance: Claude drafts initial text (`auto`), human review required (`reviewed`/`manual`). Linked from footer ("Where to begin") and "Start Here" newcomer path. Cultural adaptation deferred to STG-021. (FTR-056, FTR-054) |
| STG-007-11 | **Operational playbook** | `/docs/operational/playbook.md` documenting procedural knowledge: how to add a new book (pre-ingestion checklist through post-publication verification), how to handle a citation error, how to create a curation brief, how to onboard a new staff member to `/admin`. Written alongside the editorial portal it documents. Updated as new workflows are added in subsequent stages. Referenced from the admin portal's help section. |
| STG-007-12 | **Queue health monitoring** | Editorial home screen includes queue health indicators: oldest unreviewed item per queue, items exceeding age thresholds (48 hours for citation errors, 7 days for standard items), queue depth trend (14-day rolling window). Email digest highlights overdue items. Portal coordinator receives separate notification if any queue exceeds 2× its age threshold. `/lib/services/queue-health.ts`. |
| STG-007-13 | **Portal updates page + AI draft pipeline** | `/updates` page ("The Library Notice Board") with `portal_updates` table. AI drafts seeker-facing release notes from deployment metadata in portal voice (FTR-054); human review mandatory before publication. `updates` review queue in editorial portal. Retrospective entries for STG-001–STG-007. Footer link: "What's new in the portal." (FTR-092, FTR-092) |
| STG-007-14 | **Graph intelligence batch pipeline** | Python + NetworkX/igraph batch job loads full graph from Postgres tables (entity_registry, extracted_relationships, concept_relations). Runs PageRank, community detection, and betweenness centrality. Writes results to centrality_score, community_id, bridge_score columns on entity and chunk rows. Scheduled as Lambda or Vercel cron (nightly). Community detection outputs inform theme tagging proposals. (FTR-034, FTR-034) |
| STG-007-15 | **Three-path retrieval activation** | Activate Path C (graph-augmented retrieval) in the search pipeline: entity recognition in queries via entity_registry → SQL traversal across extracted_relationships → pgvector similarity ranking → merge with Path A (vector) and Path B (BM25) via RRF. Search pipeline evolves from two-path to three-path. Monitor retrieval quality: Path C must improve relevance on entity-rich queries without degrading keyword queries. (FTR-034, FTR-027, FTR-020) |

### Key Challenges

- **Theme tagging quality:** Semi-automated tagging (embeddings) must be validated by human reviewers. A bad theme assignment (a passage about death tagged as "Joy") would undermine trust. Only `manual` and `reviewed` tags are served to users — never unreviewed `auto` tags. (FTR-121)
- **Theme taxonomy expansion:** Multi-category taxonomy: six quality themes on the homepage (stable); situation, practice, person, principle, scripture, and yoga_path categories added incrementally. No fixed minimum passage count — editorial judgment decides when a topic has enough depth to publish. (FTR-121, FTR-122)
- **Editorial staffing gate:** STG-007 requires SRF to have identified a portal coordinator, content editor, and theological reviewer. The editorial review portal provides tooling — the organizational question of *who* uses it requires SRF input.

### Success Criteria

- Teaching topic tagging pipeline produces accurate theme assignments validated by human review
- Doors of Entry pages show curated passages from multiple books, refreshing on each visit
- Editorial review portal operational with Auth0 authentication and role-filtered views
- Theme tag review queue supports keyboard-driven workflow (approve/reject/next)
- Daily passage curation 7-day lookahead functional
- Queue health indicators visible on editorial home screen
- `/glossary` page displays at least 50 terms with definitions and linked passages
- `/guide` page offers 20+ curated pathways with editorial framing
- `/updates` page displays retrospective entries for STG-001–STG-007, reviewed and published by portal coordinator

---

### STG-008: Intelligence

**Goal:** Launch the Related Teachings system — pre-computed chunk relations, reader side panel, "Continue the Thread" end-of-chapter suggestions, and graph traversal across the library. This is the feature that makes the portal irreplaceable: no physical book, PDF, or ebook can surface cross-book connections while you read. (FTR-030)

**Parallel workstream note:** Chunk relation computation (STG-008-1), the related content API (STG-008-2), and the quality evaluation suite (STG-008-5) are purely algorithmic — they depend on the multi-book corpus (STG-006), not on STG-007's editorial portal. These deliverables can proceed in parallel with STG-007. Human quality review of relations (STG-008-5) is validated via the test suite; editorial portal integration enhances but does not gate the computation. (FTR-012)

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-008-1 | **Chunk relation computation** | Batch job to compute `chunk_relations` for all ingested books. Incremental mode for new books, full mode for embedding model changes. Excludes same-chapter adjacent paragraphs. Stores top 30 per chunk. For top 10 cross-book relations per chunk, Claude classifies the relation type (`same_topic`, `develops_further`, `personal_story`, `practical`) — enables contextual labels like "Yogananda explores this idea at greater length in..." in the side panel. Spot-checked by reviewer. (FTR-030, FTR-005 E6) |
| STG-008-2 | **Related content API** | `/api/v1/passages/[id]/related` (per-paragraph, on-demand tier) and `/api/v1/books/[slug]/chapters/[number]/relations` (batch prefetch — all paragraph relations for an entire chapter in one response, ~30–50KB). `/api/v1/books/[slug]/chapters/[number]/thread` (chapter-level aggregation for "Continue the Thread"). All chapter sub-resources consolidated under `/books/[slug]/chapters/[number]/` (FTR-087). Filter support: by book, language, theme, content type. Realtime vector fallback when pre-computed results are sparse. **Batch prefetch API is a core STG-008 deliverable, not deferred as optimization** — it enables the reading session (STG-008-10) and instant side panel updates. (FTR-030) |
| STG-008-3 | **Improved reader with Related Teachings** | Related Teachings side panel powered by pre-computed `chunk_relations`. Settled paragraph model: Intersection Observer with focus zone root margin, prominence scoring, 1.2s debounce — side panel updates quietly as reader settles. Source indication in side panel header ("Related to: 'My body became...'"). Dwell mode as manual override (immediate update, no debounce). Two-axis progressive enhancement: screen width determines presentation (side panel ≥ 1024px, pill + bottom sheet < 1024px); data budget determines loading (batch prefetch / on-demand / none). "Continue the Thread" in side panel below per-paragraph relations (not inline in reading column). Next Chapter is the primary end-of-chapter invitation. Graph traversal navigation branded as **"Following the Thread"** in user-facing UI — the portal's most distinctive feature, named to communicate its contemplative nature. (FTR-030) |
| STG-008-4 | **Editorial cross-references** | `chunk_references` table for human-curated cross-references (explicit mentions like "As my guru Sri Yukteswar taught..." → link to that passage). Supplements automatic embedding-based relations. |
| STG-008-5 | **Related content quality evaluation** | Test suite of ~50 representative paragraphs with human-judged expected relations. Validates thematic relevance, cross-book diversity, no false friends. Regression gate for content re-ingestion and embedding model changes. |
| STG-008-6 | **Ephemeral reading highlights** | Double-tap (mobile) / double-click (desktop) on any paragraph adds a subtle gold left-border highlight. Session-only — in-memory, not stored. At chapter end, if highlights exist, a gentle prompt offers to convert them to lotus bookmarks. Keyboard shortcut: `h`. No storage, no analytics. |
| STG-008-7 | **Editorial reading threads** | `editorial_threads` and `thread_passages` tables. Curated multi-book reading paths: human-selected passages sequenced to trace a spiritual theme as a coherent progression. `/threads` index and `/threads/[slug]` reading experience. Optional editorial transition notes between passages. `is_published` human review gate. (FTR-063) |
| STG-008-8 | **Reverse bibliography** | `external_references` and `chunk_external_references` tables. Claude extracts external source references (Bhagavad Gita, Bible, Patanjali, Kabir, Einstein, etc.) from each chunk at ingestion time. `/references` index and `/references/[slug]` pages showing every passage where Yogananda engages with that source. Three-state `tagged_by` provenance. (FTR-064) |
| STG-008-9 | **Exploration theme categories** | Activate `person`, `principle`, and `scripture` theme categories. Seed themes: Christ, Krishna, Lahiri Mahasaya, Sri Yukteswar, Patanjali, Divine Mother (person); 10 Yama/Niyama principles (principle); Yoga Sutras, Bhagavad Gita, Bible, Rubaiyat (scripture). Same tagging pipeline as quality/situation themes. `/themes` page gains new sections. (FTR-122) |
| STG-008-10 | **Reading session — proactive chapter caching** | Service Worker detects sequential chapter reading (2+ chapters from same book). Proactively caches next 2 chapters (HTML + relations data for batch tier). LRU eviction: current + 2 ahead + 2 behind. Offline chapter transitions serve from cache with offline banner. Uncached chapters show gentle redirect to nearest cached chapter. No reading history stored — ephemeral SW state only. |
| STG-008-11 | **Calendar reading journey schema** | Extend `editorial_threads` with journey columns: `journey_type` (evergreen/seasonal/annual), `journey_duration_days`, `journey_start_month`, `journey_start_day`. Foundation for time-bound reading experiences delivered via daily email in STG-020. (FTR-056) |
| STG-008-12 | **Spiritual Figures — monastics, gurus, and historical figures as entities** | `people` table with biographical metadata (name, slug, role, era, description, image) and monastic/lineage extensions: `person_type` enum (`spiritual_figure`, `guru_lineage`, `monastic`, `historical`), `honorific`, `is_living`. `person_relations` extended with `start_year`, `end_year`, `description`, `display_order` for temporal relationships. New relation types: `succeeded_by`, `preceded_by`, `mentored_by`, `edited_works_of`, `collaborated_with`. `chunk_people` junction table linking passages to persons mentioned or quoted. Person pages at `/people/[slug]` showing biography, In Memoriam presentation (birth–passing years for applicable figures), all referencing passages, and cross-links to themes and external references. `/people` index gains "Lineage of SRF Presidents" vertical timeline section using `succeeded_by` relations with service dates. `/api/v1/people/lineage` endpoint for presidential succession. Seed entities: Sri Yukteswar, Lahiri Mahasaya, Krishna, Christ, Divine Mother, Babaji, Anandamayi Ma, plus presidential succession entries (Yogananda, Rajarsi Janakananda, Daya Mata, Mrinalini Mata, Brother Chidananda) with service periods. Same three-state tagging pipeline as themes (auto → reviewed → manual). Linked from exploration theme categories (person type). (FTR-074, FTR-074) |
| STG-008-13 | **`/browse` grows — people, references, threads** | Auto-generated `/browse` page expands to include Spiritual Figures entries, External References (reverse bibliography), and Editorial Reading Threads. All auto-generated from database. `/browse` now covers the full content space and serves as the text-mode alternative to the Knowledge Graph (FTR-124). Bidirectional link between `/browse` and `/explore`. (FTR-056) |

### Key Challenges

- **Related content quality:** Pre-computed chunk relations must be thematically relevant, cross-book diverse, and free of "false friends" (superficially similar text with unrelated meaning). The quality test suite (STG-008-5) is the regression gate.
- **Relation computation at scale:** As the corpus grows from ~2K chunks (STG-001–STG-005) to ~50K (all books), incremental relation updates must remain efficient. Each new book triggers O(N_new × N_existing) comparisons — manageable with vectorized computation but must be monitored.

---

### STG-009: Complete

**Goal:** Ingest the remaining book waves to complete the full Yogananda library. Add production observability.

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-009-1 | **Ingest second- and third-wave books** | Collected talks (*Man's Eternal Quest*, *The Divine Romance*) and shorter works (*How You Can Talk With God*, *Metaphysical Meditations*, *Journey to Self-Realization*). Standard chunking. Incremental chunk relation computation for each new book. |
| STG-009-2 | **Verse-aware chunking** | Adapt chunking strategy for verse-by-verse commentary structure. Required before fourth-wave ingestion. |
| STG-009-3 | **Ingest fourth-wave books** | *The Second Coming of Christ* (2 vols), *God Talks With Arjuna* (2 vols), *Wine of the Mystic*. |
| STG-009-4 | **Search analytics + "What Is Humanity Seeking?" public dashboard** | Staff dashboard (FTR-149) showing anonymized query trends. Nightly Lambda aggregation job populates `search_theme_aggregates` table — search queries classified by theme, geography (country-level), and time period. Minimum aggregation threshold: suppress theme + country combinations with < 10 queries. **Public-facing `/seeking` dashboard:** contemplative visualization of top themes, geographic view (warm-toned world map), seasonal rhythm, and common questions. Warm tones, Merriweather typography — not a SaaS dashboard. Linked from footer and About page. **Note:** "What Is Humanity Seeking?" is also a strategic communications asset for the philanthropist's foundation (FTR-154) — communications planning (standalone subdomain, annual report, media syndication) may begin before this dashboard ships. (FTR-032, FTR-154) |
| STG-009-5 | **Amplitude analytics (DELTA-compliant)** | Amplitude configured with explicit event allowlist. No user identification, no session tracking, no autocapture. Events: `page_viewed` (with `requested_language` for unmet language demand), `passage_served`, `share_link_generated`, `center_locator_clicked`, `search_performed` (with `zero_results` flag). See FTR-082 for full property schema and Standing Operational Metrics. (FTR-082) |
| STG-009-6 | **New Relic APM integration** | New Relic agent for API route performance, database query timing, Claude API call monitoring. Synthetic uptime checks on key endpoints. (FTR-082) |
| STG-009-7 | **Edge latency audit + standing geographic monitors** | Measure portal latency from Global South regions (India, Brazil, Nigeria) via New Relic Synthetics or WebPageTest. Verify Vercel serves from nearby edge PoPs. Validate per-region Core Web Vitals. Remediate if FCP exceeds 1.5s on 3G from target regions. **Standing monitors:** After initial audit, convert New Relic Synthetic checks into permanent monitors running from target regions on a recurring schedule (e.g., every 15 minutes from Mumbai, São Paulo, Lagos). Alert if FCP degrades past 1.5s sustained over 24 hours. Geographic performance is a direct measure of the Global-First principle (FTR-006) — a dependency update or infrastructure change that degrades Bihar but not Los Angeles should be caught immediately, not at the next quarterly review. |
| STG-009-8 | **Side-by-side commentary view** | Split-pane reader for verse-commentary books (*Second Coming of Christ*, *God Talks With Arjuna*, *Wine of the Mystic*). Wide screens: scripture verse pinned left, commentary scrolls right. Narrow screens: verse as highlighted block above commentary. Verse navigation: up/down arrows cycle through verses. Depends on verse-aware chunking (STG-009-2). |
| STG-009-9 | **Scripture-in-Dialogue** | For Yogananda's scriptural commentaries (*God Talks with Arjuna*, *The Second Coming of Christ*): verse-level Scripture entities in entity_registry, CROSS_TRADITION_EQUIVALENT relationships in extracted_relationships between Gita and Gospel verses where Yogananda draws explicit parallels. Dual-commentary navigation: original verse pinned alongside Yogananda's interpretation. Extends the side-by-side commentary view (STG-009-8) with graph-powered cross-tradition linking. (FTR-034, FTR-070) |
| STG-009-10 | **Living Commentary** | Enrichment pipeline extracts internal cross-references from Yogananda's commentaries ("as I explained in Chapter X"). Cross-references become navigable inline reference cards: verbatim preview of the referenced passage without leaving the current reading position. Hypertext-ified cross-references transform dense commentaries into a connected web of teachings. (FTR-026, FTR-030, FTR-070) |
| STG-009-11 | **Knowledge graph visualization** | Interactive visual map of the teaching corpus at `/explore`. STG-009 nodes: books, passages, themes, persons, scriptures. Edges: chunk relations, theme memberships, external references. Client-side rendering (`d3-force` with Canvas) from pre-computed graph JSON (nightly Lambda, served from S3). **Extensible JSON schema** with `schema_version`, `node_types`, and `edge_types` arrays — designed to accommodate magazine, video, audio, and image nodes in later stages without visualization code changes (FTR-035). **Lineage filter mode:** shows only person nodes connected by `guru_of`, `disciple_of`, `succeeded_by`, `preceded_by` edges, rendered as a directed vertical layout — visualizes both the spiritual lineage and presidential succession (FTR-074). Warm tones, contemplative animation, `prefers-reduced-motion` static layout. ~50-80KB JS, loaded only on `/explore`. Graph Data API: `GET /api/v1/graph`, `/graph/subgraph`, `/graph/cluster`, `/graph.json`. Linked from Books and themes pages. (FTR-124, FTR-035, FTR-074) |

### Key Challenges

- **Verse-aware chunking** for the scriptural commentaries (fourth wave) requires a different strategy than narrative or collected-talk books. The verse-commentary structure needs special handling to preserve the verse → commentary relationship in search results and the reader.

### Success Criteria

- All published Yogananda books ingested and searchable — search quality evaluation passes (≥ 80%) across the full corpus
- Side-by-side commentary view renders verse-commentary books correctly on both wide and narrow screens
- Scripture-in-Dialogue cross-tradition linking surfaces explicit parallels Yogananda draws between Gita and Gospel verses
- `/seeking` public dashboard displays anonymized search themes, geographic view, and seasonal rhythm
- Amplitude events fire on the allowlist only — no autocapture, no user identification, no session tracking
- New Relic APM reports API route performance, database query timing, and Claude API call latency
- Standing geographic monitors confirm FCP < 1.5s from Mumbai, São Paulo, and Lagos
- `/explore` knowledge graph visualization renders books, passages, themes, persons, and scriptures with navigable edges

---
## Future Directions

> **Beyond STG-009, these are aspirations, not plans.** They will be shaped by what we learn building STG-001–STG-009, by SRF stakeholder input, and by seeker usage patterns. Detailed planning happens at each stage boundary, not years in advance. The provisional FTRs governing these directions are tracked as `proposed` or `deferred` FTR files in `features/`.

**Service** — Study tools, PDF export, Study Workspace, magazine integration, Contentful Custom Apps, multi-environment CI/CD. Transforms portal content into formats for group study, satsangs, and talks.

**Languages** — Remaining 8 core languages (Hindi Tier 1 when authorized YSS source available, plus Tiers 2–3). Each language ships independently when it clears the readiness gate: book ingested + UI strings translated + human reviewer confirmed + search quality evaluation passes. FTR-011 reachable population metric governs sequencing. **Hindi unblock potential (FTR-119):** YSS authorization of the Hindi *Autobiography* for the shared corpus could resolve the source availability barrier without solving the ebook purchasing problem. If authorized, Hindi (~425M reachable) could activate earlier than STG-021. **YSS-contributed languages:** Tamil (~51M reachable), Telugu (~58M reachable), and Kannada (~38M reachable) may enter the platform through YSS content partnership, outside SRF's 10-language scope. YSS-published editions carry full lineage authority (Yogananda founded YSS in 1917). See FTR-119.

**Distribution** — Daily email, social media quote images, WhatsApp, RSS, calendar reading journeys, webhook event system. Graph intelligence features surface deep cross-lineage connections.

**Media** — Video transcription (YouTube → Whisper), audio ingestion, image management, cross-media search, unified content hub. Knowledge Graph expansion across all content types.

**Community** — Optional accounts (DELTA-Relaxed Authenticated Experience), bookmarks/highlights sync, events, local center discovery, SMS/Telegram access, VLD curation, Community Collections gallery.

**Provisional stage mapping.** FTR files and root documents reference future stages by number as scheduling markers. These are provisional — actual stage boundaries and stage structure will be determined at the STG-009 retrospective. The mapping below documents the convention currently in use across ~100 references in 42+ files:

| Old | Direction | What It References | Example Uses |
|-------------|-----------|-------------------|--------------|
| STG-020 | Service + Distribution | Study tools, magazine integration, concept graph, daily email, social media, WhatsApp, RSS | FTR-034, FTR-035, FTR-044, FTR-056, FTR-134, FTR-154 |
| STG-021 | Languages | Hindi + remaining 7 core languages (Tiers 2–3). Execution order row 6. | FTR-011, FTR-020, FTR-024, FTR-058, FTR-131, CONTEXT.md |
| STG-022 | Media | Video transcripts, audio recordings, images, cross-media search, knowledge graph expansion | FTR-008, FTR-035, FTR-044, FTR-059, FTR-089, FTR-141 |
| STG-023 | Community (accounts) | Optional Auth0 accounts, bookmark sync, authenticated API access | FTR-015, FTR-046, FTR-114, CLAUDE.md, PRINCIPLES.md |
| STG-024 | Community (curation) | VLD curation, Community Collections gallery, study circle sharing | FTR-035, FTR-040, FTR-143 |

*STG-020+ are provisional — scheduling placeholders for future directions, not committed stages. Actual scope and boundaries will be determined at the STG-009 retrospective.*

---

## Unscheduled Features

> Summary view of features not yet assigned to a stage. Each entry is a FTR file with state `proposed` or `deferred` in `features/`. This table is reviewed at every stage boundary during the retrospective.

### Validated — Awaiting Scheduling

| FTR | Feature | Governing Refs | Re-evaluate At |
|-----|---------|----------------|----------------|
| FTR-098 | SRF Corpus MCP — Three-Tier Architecture | FTR-098, FTR-083 | STG-009 boundary |
| FTR-078 | SRF Lessons Integration | FTR-022, FTR-009 | Stakeholder request |

### Deferred / Suspended

| FTR | Feature | Original Stage | Re-evaluate At |
|-----|---------|----------------|----------------|
| FTR-153 | Design Tooling (Figma + Storybook) | STG-004 | If team grows beyond AI-human pair |
| FTR-142 | Cross-Media Intelligence (video, audio, chant, content hub) | Future | STG-009 boundary |
| FTR-150 | Sacred Image Management (watermarking, multi-size) | Future | STG-009 boundary |
| FTR-143 | Study & Community Tools (workspace, collections, VLD) | Future | Post-STG-009 |
| FTR-154 | Brand Distribution (dashboard, email, social) | Future | Post-STG-009 |
| FTR-155 | Magazine API Rationalization | Future | Post-STG-009 |

### Proposed — Awaiting Evaluation

| FTR | Feature | Type |
|-----|---------|------|
| FTR-136 | Spoken Teachings — Human Narration Program | Feature (Content + Portal) |
| FTR-119 | Teachings Platform — Shared Foundation for SRF and YSS | Feature (Platform) |
| FTR-137 | Audio-visual ambiance toggle (temple/nature sounds) | Enhancement |
| FTR-114 | Neon Auth as Auth0 Alternative | Enhancement |
| FTR-115 | pg_cron for In-Database Scheduling | Enhancement |
| FTR-116 | Logical Replication for Analytics CDC | Feature |
| FTR-125 | Scientific-Spiritual Bridge Themes (cosmic life, abundance, vibration/AUM) | Theme |
| FTR-126 | Word-Level Graph Navigation | Feature |
| FTR-148 | Proactive Editorial AI Agent | Enhancement |
| FTR-099 | Internal Autonomous Agent Archetypes | Feature |
| FTR-151 | AWS SES as SendGrid Alternative for Email Delivery | Enhancement |
| FTR-130 | Cross-Tradition Concordance as Primary Search Lens | Feature |
| FTR-156 | Dream a Feature — AI-Driven Prototyping Workflow | Feature |
| FTR-157 | Living Golden Set — Seeker-Fed Search Quality | Enhancement |
| FTR-158 | Spec Fidelity System | Enhancement |
| FTR-159 | Feature Lifecycle Portal — Calm Operations for Engineering Leadership | Feature |
| FTR-144 | Cross-Site Harmony — yogananda.org Ecosystem Integration | Feature (Experience) |
| FTR-146 | Circadian as Independent Behavior Modifier | Enhancement (Experience) |
| FTR-168–176 | AI Agent Platform (9 FTRs) — Autonomous agent orchestration, experiment lifecycle, workflow engine, role registry, validation gates, comparative analysis, glass box ops, deep research, staff empowerment | Feature (Platform) |

*Migration notes: FTR-096 consolidated four operational surface items (Release Tagging, Operational Health, Document Integrity CI, Design-Artifact Traceability). FTR-117 validated and scheduled as STG-003-12. FTR-001 multi-author expansion adopted 2026-02-25.*

---

## Completed Stages

| Stage | Completed | Key Metric |
|-----------|-----------|------------|
| STG-001: Prove | 2026-02 | 92% Recall@3, 275ms avg |
| STG-002: Bilingual | 2026-02 | 1,113 es chunks, 100% eval |
| STG-003: Deploy | 2026-02 | 18 deliverables, full infra |
| STG-004: Build | 2026-03 | 198 tests, all pages live |
| STG-005: Refine | 2026-03 | 480 tests, ≤ 130KB JS |

Full deliverable details for completed stages are preserved below for reference.

---

### STG-001: Prove

**Goal:** Answer the existential question: does pure hybrid search (vector + BM25 + RRF) across Yogananda's English text return high-quality, relevant, verbatim passages with accurate citations? Deliver the minimum vertical slice: ingest → search → read, in English only. Everything else waits until this works. Pure hybrid search — with no AI services in the search path — is the **primary search mode** for the portal, not a stepping stone to AI-enhanced search. (FTR-027)

*STG-001 is deliberately small — English only, no Terraform, no bilingual. The design is 164 FTR files deep — the risk is no longer under-design but over-design without empirical contact. Prove that search works on one language first, then validate bilingual in 1b and deploy in 1c.* (FTR-091)

**Focus book:** Autobiography of a Yogi — **English** only (Spanish in STG-002)

**Build methodology (PRI-12):** Claude executes all deliverables autonomously — as architect, designer, implementer, and operator. No human-in-the-loop gates. The human principal reviews at their discretion, not as a blocking step. MCP servers are the primary operational interface. This applies to the development methodology — PRINCIPLES.md § "Human Review as Mandatory Gate" governs the production portal's content governance, not the build process.

### Prerequisites

**Tooling:** See `docs/guides/getting-started.md` for account setup and `docs/guides/credentials.md` for credential inventory.

**Conversations (all resolved):** These were blocking conversations that happened before ingestion could begin:

1. **~~Edition confirmation:~~** *(Resolved 2026-02-24.)* Use edition indicated in PDF source (spiritmaji.com). Configure as parameter per FTR-012 for later adjustment when SRF confirms canonical edition.
2. **~~PDF source confirmation:~~** *(Resolved 2026-02-24.)* spiritmaji.com PDF accepted for STG-001 proof. Non-PDF digital text will replace before launch.
3. **~~English ebook extraction:~~** *(Resolved 2026-02-26.)* Amazon Cloud Reader ebook (ASIN B00JW44IAI) extracted via `scripts/book-ingest/` pipeline — Playwright capture + Claude Vision OCR. 522 pages, 49 chapters, 94,584 words at 5.0/5.0 confidence. Ready for Contentful import. See `scripts/book-ingest/DESIGN.md`.
4. **~~Spanish source confirmation:~~** *(Resolved 2026-02-28.)* Spanish SRF edition purchased from Amazon Kindle for STG-001 proof. Hindi deferred — authorized YSS ebook only purchasable from India/Nepal/Sri Lanka (Razorpay); Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates in STG-021 when authorized source becomes available. SRF/YSS-provided digital text will replace before launch.

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-001-1 | **Repository + development environment** | Create Next.js + TypeScript + Tailwind + pnpm repository. Configure ESLint, Prettier, `.env.example`. Establish `/lib/services/`, `/app/api/v1/`, `/migrations/`, `/scripts/`, `/messages/` directory structure. **Mobile-first CSS convention:** Tailwind mobile-first breakpoints (`px-4 md:px-8`, not the reverse). Viewport meta tag in root layout. All components built mobile-first and enhanced upward — this costs nothing at project start and is expensive to retrofit (PRI-07, FTR-006). No `bootstrap.sh`, no CI pipeline yet — those are STG-003 concerns. (FTR-036) |
| STG-001-2 | **Neon project + initial schema** | Neon project created via Neon MCP. **PostgreSQL 18**. **MCP-driven verification:** Claude verifies via Neon MCP: project exists with correct PG version and Scale tier (`list_projects`), all 5 extensions install on PG18 (`run_sql` → `SELECT extname FROM pg_extension`), retrieves connection strings for `.env.local` (`get_connection_string`). Fallback: PG17, no code changes. Create dev branch for local development. Write `001_initial_schema.sql` covering all search tables (books, chapters, book_chunks, entity_registry, sanskrit_terms, suggestion_dictionary, teaching_topics, chunk_topics, daily_passages, affirmations, chunk_relations, extracted_relationships, search_queries, search_theme_aggregates, chapter_study_notes, book_chunks_archive, vocabulary_bridge, bridge_seed_passages, bridge_gaps — per FTR-028). All primary keys use `DEFAULT uuidv7()` for time-ordered UUIDs (FTR-094 § UUIDv7 convention). All content tables include `updated_at` column with auto-set trigger and composite `(updated_at, id)` index for timestamp-filtered pagination (FTR-087). Tables include full column specification: books (with `bookstore_url`, `edition`, `edition_year` per FTR-021), book_chunks (with `embedding_model` versioning per FTR-024, `content_hash` for stable deep links per FTR-132, enrichment columns per FTR-026), teaching_topics (with `category` and `description_embedding` per FTR-121), chunk_topics (three-state `tagged_by` per FTR-121). BM25 index via pg_search (FTR-025). Run via dbmate. Verify tables, indexes, BM25 index, and entity_registry via MCP `run_sql`. Time Travel queries available immediately for development debugging (FTR-094). (FTR-080, FTR-030, FTR-121, FTR-132, FTR-032, FTR-021, FTR-025, FTR-026, FTR-033, FTR-094) |
| STG-001-3 | **Contentful space + content model** | Create Contentful space. Configure content types: Book → Chapter → Section → TextBlock per FTR-021 § Contentful Content Model. Enable **English locale only** (Spanish locale added in STG-002). Configure Contentful Personal Access Token in `.env`. Verify content model by creating a test Book entry. Contentful is the editorial source of truth from STG-001 (FTR-102). |
| STG-001-4 | **English Contentful import + Neon sync** | **Status: Complete.** Contentful populated (1 Book, 49 Chapters, 49 Sections, 3,920 TextBlocks) via `scripts/ingest/import-contentful.ts`. Neon ingested with 100% `contentful_id` linkage (1,568 chunks). Webhook handler operational (`app/api/v1/webhooks/contentful/route.ts`). English text already extracted via `scripts/book-ingest/` pipeline (522 pages, 49 chapters, `book.json` ready — see `scripts/book-ingest/DESIGN.md`). Remaining work: build Contentful import script (`book.json` → Contentful Management API: Book → Chapter → Section → TextBlock entries). Typographic normalization applied during extraction (smart quotes, proper dashes, ellipsis glyphs). Compute SHA-256 per chapter and store in `chapters.content_hash` (FTR-123). Resolve 2 critical text gaps (pages 188, 216) via physical book. **Branch-isolated Neon ingestion:** Create `ingest-{timestamp}` branch from dev via Neon MCP (`create_branch`). Batch sync from Contentful to the ingestion branch: read TextBlocks from Delivery API → chunk by paragraphs (FTR-023: paragraph-based, 100–500 token range, special handling for epigraphs and poetry) → generate embeddings via Voyage voyage-4-large → insert with `contentful_id` linkage. Verify chunk counts, embedding dimensions, and citation integrity on the branch (`run_sql`). If verification passes, apply to dev branch. If not, delete branch, iterate. Note: 1a ingestion produces plain chunks without entity resolution or enrichment metadata — those are STG-003 concerns (STG-003-12 entity registry, STG-003-13 enrichment prompts). Re-enrichment of 1a chunks happens after STG-003-12/STG-003-13 are complete. |
| STG-001-5 | **Search API** | Next.js API route (`/api/v1/search`) implementing hybrid search (vector + FTS + RRF). Returns ranked verbatim passages with citations. No query expansion or intent classification yet — pure hybrid search. (FTR-015, FTR-020) |
| STG-001-6 | **Search UI** | Search results page: ranked verbatim quoted passages with book/chapter/page citations. "Read in context" deep links. Search bar with prompt "What did Yogananda say about...?" (FTR-039: recognition-first — frames expectation correctly: verbatim retrieval, not AI generation) Mobile-first responsive layout: full-width stacked cards on small viewports, 44×44px minimum touch targets on all interactive elements. Usable on a 320px-wide screen — the majority of the Hindi/Spanish audience (FTR-011) is mobile-first. (FTR-006) |
| STG-001-7 | **Basic book reader** | Chapter-by-chapter reading view serving content from Contentful Delivery API. Deep-link anchors, optimal line length (English: 65–75 chars / `max-width: 38rem` on desktop, responsive fluid width on mobile), prev/next chapter navigation with 44×44px touch targets, "Find this book" SRF Bookstore links, basic reader accessibility (skip links, semantic HTML). Reading column must be comfortable on a 320px phone screen — not a scaled-down desktop layout. (FTR-006) |
| STG-001-8 | **Search quality evaluation (English)** | Test suite of ~58 English queries with expected passages (golden retrieval set). Seven difficulty categories: **Direct** (~10 queries, baseline ~95%), **Conceptual** (~12 queries, baseline ~85%), **Emotional** (~12 queries, baseline ~70%), **Metaphorical** (~8 queries, baseline ~65%), **Technique-boundary** (~8 queries, must correctly route to Practice Bridge, baseline 100%), **Dark Night** (~8 queries — fragmentary, pre-linguistic, distressed: "I can't stop crying," "nothing matters anymore," "why am I here" — evaluated not by Recall@3 but by "does this passage meet the seeker where they are?" per FTR-028 vocabulary bridge; Opus judges retrieval intent match), **Adversarial** (~8 queries — off-topic, misspelled, multi-intent, prompt-injection — must route to no-results or degrade gracefully). Claude drafts the query set after corpus ingestion (STG-001-4), evaluates results, and judges quality autonomously. Metrics: Recall@3 per category (primary gate), MRR@10 (diagnostic). Per-category breakdowns reveal WHERE search needs improvement. Threshold: ≥ 80% Recall@3 overall. Golden set data in `/data/eval/golden-set-en.json`, evaluation script in `/scripts/eval/search-quality.ts`. Full methodology: FTR-037. (FTR-005 E5) |
| STG-001-9 | **Document integrity validation (`doc-validate.sh`)** | Shell script validating cross-reference integrity across all project documents. Scans markdown for FTR-NNN declarations, verifies all references resolve, confirms FEATURES.md index completeness. Runs in CI on markdown changes. Advisory (non-blocking) in STG-001. Full specification: FTR-096 § Layer 3. (FTR-096, FTR-084) |
| STG-001-10 | **AI self-orientation script (`status.sh`)** | Claude's first action in any development session. Prints version, stage progress, branch, last deploy, health, document integrity summary, pending proposed FTRs, and open questions. Sources: git tags, CI artifacts, FEATURES.md parsing, CONTEXT.md grep. Full specification: FTR-096 § Layer 3. (FTR-096) |
| STG-001-11 | **Release tagging script (`release-tag.sh`)** | Creates annotated git tags with deployment metadata: version, stage, commits since last tag, `design_refs` (from `@implements`/`@validates` annotations), and auto-classified blast tier (T1–T5). Tag naming: `v{stage}.{patch}`. Full specification: FTR-096 § Layer 3. (FTR-096) |

### Technology

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Next.js (local dev; Vercel in 1c) | $0 |
| CMS | Contentful | $0 |
| Database | Neon PostgreSQL 18 + pgvector + pg_search (Scale tier) | ~$20/mo |
| Embeddings | Voyage voyage-4-large (1024d, FTR-024) | ~$0.30 one-time |
| Migrations | dbmate (open-source) | $0 |
| SCM | GitHub | $0 |

### Success Criteria

- `pnpm dev` starts a working Next.js application locally
- `dbmate status` shows migration 001 applied
- Contentful space contains English Autobiography content (Book, Chapters, Sections, TextBlocks)
- A seeker can type "How do I overcome fear?" and receive relevant, verbatim Yogananda quotes with accurate book/chapter/page citations
- "Read in context" links navigate to the correct passage in the reader
- Simple keyword searches ("divine mother") work without any LLM involvement
- Search latency < 2 seconds for hybrid queries
- Zero AI-generated content appears in any user-facing result
- The book reader enforces 65–75 character line length on desktop and comfortable reading width on mobile (320px viewport usable)
- Search UI and reader are usable on a mobile phone: touch targets ≥ 44×44px, no horizontal scrolling, text readable without zooming
- "Find this book" links are present on every passage and link to the SRF Bookstore
- Search quality evaluation passes: ≥ 80% of English test queries return at least one relevant passage in the top 3 results
- Per-category evaluation breakdowns available for all six difficulty categories
- `./scripts/doc-validate.sh` runs clean: all cross-references resolve, all dual-homed titles match
- `./scripts/status.sh` prints a complete orientation briefing (version, stage, health, docs integrity, pending PROs)
- `./scripts/release-tag.sh` creates annotated tags with design refs and blast tier classification

### What If Search Quality Fails?

If the ≥ 80% threshold is not met, the following contingencies apply before proceeding to STG-002:

1. **Chunking adjustment.** Yogananda's prose is long-form and metaphorical. Test 200, 300, and 500 token chunk sizes. Evaluate paragraph-boundary vs. sliding-window chunking.
2. **Embedding model swap.** Benchmark against Cohere embed-v3, BGE-M3, or multilingual-e5-large-instruct using the same test suite. The `embedding_model` column on `book_chunks` supports migration (FTR-024).
3. **Manual curation bridge.** Tag the 30 test queries with expected passages manually. Use these as a curated fallback while improving automated retrieval. The portal can launch with curated results for common queries and automated results for long-tail.
4. **Hybrid weighting tuning.** Adjust the RRF k-constant and the relative weight of vector vs. FTS results.
5. **Per-category analysis.** Use the seven difficulty categories to target improvements: if Emotional queries fail but Direct queries pass, the Vocabulary Bridge (FTR-028, FTR-028) may be the fix rather than embedding model changes. If Dark Night queries fail, the bridge's state mappings and retrieval intent routing need strengthening.

---

### STG-002: Bilingual

**Goal:** Does bilingual search work in Spanish? Validate FTR-011's breadth-first bet. Contentful already exists from 1a — add Spanish locale and content.

*STG-002 depends on STG-001's English search quality evaluation passing. If search doesn't work in English, multilingual search is premature.* (FTR-091)

**Focus book:** Autobiography of a Yogi — **Spanish** edition (FTR-011 Tier 1). Hindi deferred — authorized YSS ebook only purchasable from India/Nepal/Sri Lanka; Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates in STG-021 when authorized source becomes available.

**Conditional Hindi path.** If YSS authorizes the Hindi source text during early development (see FTR-119 § YSS Value Proposition), Hindi could enter alongside or shortly after Spanish — converting STG-002 from bilingual to trilingual. Additional scope: Romanized Hindi transliteration pipeline, Hindi golden-set queries (~15), Hindi UI strings, human reviewer. The language readiness gate (FTR-058) applies regardless of timing.

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-002-1 | **Spanish Autobiography ingestion** | **Status: Complete.** Contentful populated (1 Book, 49 Chapters, 49 Sections, 2,632 TextBlocks in `es` locale). Neon ingested with 100% `contentful_id` linkage (1,113 chunks). `canonical_book_id` cross-language link active. Reuses existing `scripts/book-ingest/` pipeline: add BookConfig entry for Spanish edition, run capture → extract → assemble → validate. Import to Contentful Spanish locale (add locale to existing Contentful space from STG-001-3) → Neon sync → chunk → embed with Voyage voyage-4-large (natively multilingual). Create `canonical_book_id` cross-language link between the two editions. Validate: Spanish queries return Spanish passages, cross-language fallback works (English results shown when target language has no match, clearly marked `[EN]`). (FTR-058, FTR-011) |
| STG-002-2 | **Bilingual search quality evaluation** | ~15 Spanish queries with expected passages. Same six difficulty categories as STG-001-8 (weighted toward Direct and Conceptual given smaller corpus). Claude drafts the query set, evaluates results, and judges quality autonomously. Per-category breakdowns. Threshold: ≥ 80% Recall@3. Golden set data in `/data/eval/golden-set-es.json`. Full methodology: FTR-037. (FTR-005 E5, FTR-011, FTR-058) |
| STG-002-3 | **Cross-language fallback verification** | English `[EN]` marking when target language has no match. `canonical_book_id` linking between editions. Spanish line length (65–75 chars, same as English). Reader view works for both languages. |

### Success Criteria

- Spanish *Autobiography* ingested with correct citations and `language: 'es'`
- Spanish search queries return Spanish passages
- Bilingual search quality evaluation passes: ≥ 80% Recall@3 for Spanish
- Per-category evaluation breakdowns available for Spanish
- Cross-language fallback: English results shown (marked `[EN]`) when target language has no match

---

### STG-003: Deploy

**Goal:** Build proper infrastructure (CI/CD, platform setup), deploy to Vercel, add homepage, observability, and all enhancement features. Pure hybrid search (vector + BM25 + RRF) is the primary search mode — no AI services in the search hot path. STG-003 transforms the working local proof into a deployed, observable portal.

*STG-003 depends on STG-002's bilingual search quality evaluation passing. If multilingual search doesn't work, deploying is premature.* (FTR-091)

*AI-enhanced search (query expansion, Claude passage ranking, Cohere reranking) is deferred to STG-005, conditional on 1a/1b evaluation. If pure hybrid search meets quality targets comfortably (≥ 90% of test queries return relevant passages in top 3), AI enhancements may not be needed. See FTR-027.*

**Focus book:** Autobiography of a Yogi (English, Spanish)

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-003-1 | **Infrastructure bootstrap + platform setup** | Create `scripts/bootstrap.sh` — idempotent bootstrap script that automates S3 bucket, DynamoDB table, OIDC provider, IAM role creation via AWS CLI, prompts for Neon org key and Sentry token, and sets all GitHub secrets via `gh secret set` (FTR-110). Create `terraform/bootstrap/trust-policy.json` for IAM OIDC trust policy. Establish `.github/workflows/` directory structure. Vendor resources (Vercel project, Neon branches, Sentry project) managed by Platform MCP `project_bootstrap` from `teachings.json` config — not Terraform (FTR-106 revised). CI pipeline (`ci.yml`) operational. Enable Neon branch protection on production branch. Create project-scoped API key for CI (FTR-094 § API Key Scoping). Configure automated Neon snapshots: daily at 03:00 UTC, weekly Sunday, monthly 1st — via Neon API (FTR-109 Layer 2). (FTR-106, FTR-110, FTR-036) |
| STG-003-2 | **Vercel project + Sentry project** | Link repository to Vercel. Configure environment variables. Deploy stub `/api/v1/health` endpoint. Create Sentry project, configure DSN, verify error capture. (FTR-082) |
| STG-003-3 | **Shared service layer + API conventions** | All business logic in `/lib/services/` (not in Server Components). API routes use `/api/v1/` prefix, accept both cookie and Bearer token auth, return cursor-based pagination on list endpoints, include Cache-Control headers. (FTR-015) |
| STG-003-4 | **Minimal homepage** | Today's Wisdom (random passage on each visit, hero position — the portal speaks first), "Show me another" link (new random passage, no page reload). Search bar with prompt "What did Yogananda say about...?" (FTR-039: recognition-first — frames expectation correctly: verbatim retrieval, not AI generation). Practice Bridge: single quiet line linking to SRF Lessons information (PRI-04). Minimal secondary nav: `Books | About`. Styled with SRF design tokens. Cross-fade animation added in STG-004. Full multi-lens homepage (four entry lenses, Wanderer's Path, tradition entry) is STG-004 (FTR-139). (FTR-039) |
| STG-003-5 | **Observability foundation** | Sentry error tracking with Next.js source maps. Structured logging via `/lib/logger.ts` (JSON, request ID correlation). Health check endpoint (`/api/v1/health`). Vercel Analytics for Core Web Vitals. (FTR-082) |
| STG-003-6 | **Search API rate limiting** | Two-layer rate limiting: Vercel Firewall rules (15 searches/min per IP) + application-level limiter. Crawler-tier rate limits: known bots (Googlebot, GPTBot, PerplexityBot, ClaudeBot) get 120 req/min vs. 30 req/min anonymous (FTR-059). Pure hybrid search is the primary mode — no AI services in the hot path. CI-agnostic deployment scripts in `/scripts/` (FTR-108). Permissive `robots.txt` (allow all, block `/admin/`). (FTR-097, FTR-108, FTR-059) |
| STG-003-7 | **Contentful webhook sync service** | Event-driven sync replacing STG-001 batch script: Contentful publish → Vercel Function → extract plain text from Rich Text AST → chunk → enrich → embed → upsert Neon (matched by `contentful_id`). Handles create, update, and unpublish events. Logs sync events for monitoring. (FTR-102, FTR-022) |
| STG-003-8 | **Search suggestions — static JSON + pg_trgm fuzzy fallback** | Three-tier suggestion architecture (FTR-029). **Tier A:** Pre-computed static JSON prefix files at Vercel CDN edge — bilingual vocabulary (en/es) from the Autobiography, chapter titles, zero-state chips per language. Client-side prefix filtering. < 10ms globally. **Tier B:** `GET /api/v1/search/suggest` pg_trgm fuzzy fallback for misspellings and transliterated input. ARIA combobox pattern. Mobile: max 5 suggestions, 44×44px touch targets. Seed with ~50 corpus-derived suggestions (not 300 — grow from real search data). (FTR-029, FTR-029) |
| STG-003-9 | **Crisis query detection and interstitial** | Heuristic keyword-based crisis detection against a curated keyword list (`/lib/data/crisis-terms.json`). Calm interstitial above search results with locale-appropriate crisis helpline information. Search results not suppressed. (FTR-051, FTR-051) |
| STG-003-10 | **Entity registry seed** | Claude generates initial canonical vocabulary for `entity_registry` and `sanskrit_terms` tables from domain knowledge. Covers teachers, divine names, techniques, Sanskrit terms, and key concepts. Entity registry populated BEFORE re-enrichment of 1a chunks. (FTR-033) |
| STG-003-11 | **Enrichment prompt design sprint** | Design and test the unified enrichment prompt (FTR-026) against 20–30 actual passages spanning all document types. Claude designs, tests against passages, and iterates autonomously. |
| STG-003-12 | **Copyright communication layer** | `/llms.txt` with copyright section. JSON-LD `copyrightHolder` on content pages. Stub `/legal` page with copyright notice (full legal page in STG-004-20). Final licensing terms deferred to SRF legal counsel review. (FTR-059 §3a; FTR-117) |
| STG-003-13 | **Text-only mode** | Toggle in site footer. No images, no decorative elements, no web fonts (system serif stack). Stored in `localStorage`. STG-004-11 extends with reader settings integration. (FTR-006 §1) |
| STG-003-14 | **Minimal Service Worker** | Cache app shell (HTML, CSS, JS, fonts) for instant repeat visits. Offline indicator banner. ~50 lines of code. STG-004-12 extends with enhanced caching strategy. (FTR-006 §4) |
| STG-003-15 | **Low-bandwidth detection** | When `navigator.connection.effectiveType` reports `2g` or `slow-2g`, display gentle banner suggesting text-only mode. Progressive enhancement — no-op on browsers without the API. (FTR-006 §1, FTR-044) |
| STG-003-16 | **Operational dashboard — moved to platform** | Operational dashboarding responsibility moved to the platform MCP server (`yogananda-platform`). The platform provides `deploy_status`, `environment_describe`, and `environment_list` tools that aggregate per-project health from `/api/v1/health`. The teachings app exposes data; the platform provides the surface. (FTR-096, FTR-096 § Layer 2) |
| STG-003-17 | **Deploy manifest + blast tier classification** | Each deployment generates a JSON manifest (`/.well-known/deploy-manifest.json`) with version, timestamp, stage, blast tier (T1–T5 auto-classified from git diff), design refs, commit count, and health check result. Consumed by platform operational tools and `status.sh`. Full specification: FTR-096 § Layer 3. (FTR-096) |
| STG-003-18 | **Deployment ceremony script (`deploy.sh`)** | Orchestrates full deployment: doc-validate → test suite → release tag → deploy manifest → Vercel deploy → health check verification → push tag. CI-agnostic per FTR-108. Full specification: FTR-096 § Layer 3. (FTR-096, FTR-096) |

Search intent classification + passage ranking stays **deferred to STG-005** (conditional on 1a/1b evaluation, FTR-027). Pure hybrid search is the primary search mode. Crisis query detection (STG-003-9) uses heuristic keyword matching rather than Claude intent classification.

**Removed from 1c (2026-03-01):** Vocabulary Bridge (FTR-028 Layers 1-2) — conditional on STG-001-8 search quality evaluation results. If vocabulary mismatch is the primary failure mode in Emotional/Dark Night query categories, build Layers 1-2 before 1b. Otherwise defer to 2b. Cultural design consultation reclassified as continuous posture, not a deliverable. Query intent taxonomy and golden suggestion set (300) deferred — start with ~50 corpus-derived suggestions, grow from evaluation data. Copyright layer simplified (llms.txt + JSON-LD + /legal stub; X-Copyright headers deferred to 2a).

### Technology

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Next.js on Vercel (Pro tier) | ~$20/mo |
| Database | Neon PostgreSQL 18 + pgvector + pg_search (Scale tier, FTR-094) | ~$20/mo |
| AI | Claude API (index-time enrichment, search eval — not in search hot path, FTR-027) | ~$5-10/mo |
| Embeddings | Voyage voyage-4-large (FTR-024) | ~$0.30 one-time |
| Language detection | fastText (open-source) | $0 |
| Fonts | Google Fonts (Merriweather, Lora, Open Sans) | $0 |
| Error tracking | Sentry (Team tier) | ~$26/mo |
| Migrations | dbmate (open-source) | $0 |
| Analytics | Vercel Analytics (included with Pro) | $0 |
| SCM | GitHub | $0 |
| CI/CD | GitHub Actions | $0 |
| IaC | Platform MCP + `teachings.json` (FTR-106 revised) | $0 |

### Success Criteria

- Platform MCP `project_bootstrap` creates all vendor resources (Neon project formalized, Sentry project, Vercel project); `project_audit` shows no drift
- `bootstrap.sh` completes successfully for AWS security resources (OIDC, IAM, S3, Budget alarm)
- CI pipeline (`ci.yml`) runs green on a test PR
- `/api/v1/health` returns `200 OK` on both local and Vercel
- Sentry test error appears in dashboard
- `.env.example` documents all required environment variables
- Pure hybrid search handles conceptual queries ("How do I find inner peace?") — no AI services in the search path
- Search p95 < 500ms from any continent (FTR-111 § Regional Latency Targets)
- The homepage displays a different Yogananda passage on each visit ("Today's Wisdom")
- "Show me another" loads a new random passage without page reload
- Sentry captures errors, structured logging works with request ID correlation
- Search suggestions return results in < 10ms for prefix matches (CDN-served static JSON) and < 80ms for fuzzy fallback (pg_trgm)
- `/llms.txt` serves citation guidance with copyright section
- Text-only mode toggle works: disables images, decorative elements, web fonts when activated from footer
- Service Worker caches app shell; offline indicator displays when connectivity drops
- Low-bandwidth detection banner appears on 2G connections; one-tap enables text-only mode
- All pages usable on a 320px mobile viewport: no horizontal scrolling, touch targets ≥ 44×44px, text readable without zooming
- Platform `deploy_status` returns system health from `/api/v1/health` for any managed environment
- Deploy manifest generated at `/.well-known/deploy-manifest.json` with version, blast tier, and design refs
- `./scripts/deploy.sh` orchestrates full deployment ceremony: validate → test → tag → manifest → deploy → verify

### Open Questions to Resolve

See CONTEXT.md § Open Questions for the consolidated list of technical and stakeholder questions. Questions live there so they're visible at session start and move to "Resolved" as work progresses.

---
### STG-004: Build

**Goal:** Build every page, establish the SRF visual identity, deliver a complete portal experience that a stakeholder can navigate end-to-end, and establish the testing pipeline, infrastructure-as-code, and component library that enable confident, automated development for all subsequent stages. Engineering infrastructure is built alongside the portal, not after it.

**Progress (2026-03-02):** 22 of 24 deliverables complete across 16 commits (`811bb81` through `c951b15`). All pages built and navigable. i18n framework operational (next-intl v4, en + es). Design system established (self-hosted WOFF2 fonts, Tailwind v4 @theme tokens, zero raw hex). SEO layer comprehensive (sitemap with lastmod, JSON-LD, Google Scholar tags, OG images). Testing pipeline active (198 Vitest tests across 18 test files: 7 service tests, 4 API route tests, 5 component tests, 1 a11y test, 1 preferences test). SRF brand identity established: official lotus SVG (`SrfLotus.tsx` from yogananda.org Gold-lotus-transparent.svg), book title attribution on passages (PRI-02). Cross-language book redirect for locale switching (PRI-06). External links audited and corrected. Dynamic imports for JS budget compliance (all pages ≤ 120KB). Reader preference service with unified localStorage. DB-backed Quiet Corner reflections. ReaderSettings popover (STG-004-11): unified text-only toggle, font size selector, and language switcher with WCAG focus trap and 44px touch targets. Remaining: EXIF/XMP image metadata (STG-004-16), Lambda + database backup infrastructure (STG-004-22).

**UI finetuning study (2026-03-02).** Studied yogananda.org, convocation.yogananda.org, and yogananda.org/teachings for visual patterns. Key observations: navy primary (`#1a2744`), gold accents (`#dcbd23`), lotus SVG motifs throughout, card-based content discovery, warm photography with editorial overlay text, hierarchical teaching categories. The portal already aligns on color palette and typography. Remaining finetuning (card patterns, lotus dividers, photography treatments, navigation hover states) is addressed in STG-005-4 (reader typography refinements) and the Calm Technology design system (STG-005 stretch goals). Dedicated visual polish pass not needed as a separate stage — it's woven throughout STG-005 deliverables.

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-004-1 | **Full homepage — "The Living Library"** | **Done.** Placeholder thematic doors (linked to pre-built search queries until STG-007 populates the theme system), "Seeking..." empathic entry points, latest YouTube videos section using RSS feed + YouTube Data API (categorized playlists, ISR revalidation), and "Show me another" cross-fade upgrade. |
| STG-004-2 | **Books and Book Landing** | **Done.** `/books` page ("Books") listing available books with cover images, editorial descriptions, chapter counts, and SRF Bookstore links. `/books/[slug]` book landing page with cover, metadata, featured quote, editorial description, and full chapter list. Warm, unhurried design even with a single book — honest "More books are being added" note with SRF Bookstore signpost. |
| STG-004-3 | **The Quiet Corner** | **Done.** Single-page micro-sanctuary (`/quiet`): random affirmation from curated pool (circadian-aware selection), optional gentle timer (1/5/15 min), chime at completion with haptic singing bowl pattern. Timer completion flow: chime → 3s stillness → crossfade to parting passage (FTR-040). Self-contained page: header collapses to lotus mark only, footer suppressed. No tracking, no accounts. Initially sourced from Autobiography's most contemplative passages. Restricted to `accessible` passages (FTR-052). |
| STG-004-4 | **About page** | **Done.** `/about`: Yogananda biography, line of gurus (with official portraits), SRF overview, "Go Deeper" links to SRF Lessons, center locator, Online Meditation Center, bookstore, app. |
| STG-004-5 | **Navigation and footer** | **Done.** Persistent header nav (Search, Books, Videos, Quiet Corner, About). Footer with SRF ecosystem links and small Yogananda portrait (FTR-073) on every page. External links to yogananda.org, SRF Lessons, Online Meditation Center, SRF Bookstore, center locator, app, YouTube. Unified lotus SVG motif as section dividers and favicon (FTR-040). |
| STG-004-6 | **Passage sharing** | **Done.** Every passage gets a quiet share icon. Mobile: `navigator.share` opens the native share sheet (surfaces WhatsApp, Telegram, SMS, etc.) — "Save as image" and "Save as PDF" in overflow menu. Desktop: custom share menu (copy link, email passage, save as image, save as PDF). Generates `/passage/[id]` URL with OG meta tags and content-hash parameter for stable deep links (FTR-132). Quote image generation via `@vercel/og`. PDF: single-page, Merriweather, warm cream, lotus watermark, A4. File size displayed on all downloads ("Download PDF (2.1 MB)"). No social media buttons or tracking scripts. (FTR-048, FTR-132, FTR-048) |
| STG-004-7 | **SEO and machine access foundations** | **Done.** Comprehensive machine-readability layer per FTR-059. **Structured data:** JSON-LD per page type — `Book` with `ReadAction` (free read in SERPs), `Chapter`, `Quotation` with `SpeakableSpecification` (voice assistant read-aloud), `BreadcrumbList` (on all deep pages), `WebSite` + `SearchAction`, `Organization` + `Person` with `sameAs` (Wikidata, Wikipedia, yogananda.org for Knowledge Panel association), `AudioObject`, `VideoObject`. **Meta tags:** Google Scholar citation tags on passage pages. Twitter Card tags (`summary_large_image` on content pages, `summary` on utility pages). `<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1">` on all content pages (Google Discover eligibility). **Canonical URLs:** `<link rel="canonical">` on every page per FTR-059 §9. **Sitemaps:** Per-content-type XML sitemaps (`/sitemap-books.xml`, `/sitemap-themes.xml`, etc.) with `<lastmod>` and `<changefreq>`. **Machine files:** `llms.txt` with AI citation guidance; `llms-full.txt` with corpus metadata inventory (passage-level content deferred to STG-020+); `indexnow-key.txt` for IndexNow domain verification; `/.well-known/security.txt` (RFC 9116). **Content negotiation:** `Accept: application/json` on page routes returns structured JSON with fidelity metadata (FTR-059 §11). **IndexNow:** Pings fired on content changes (book ingestion, daily passage rotation). **Feeds:** RSS auto-discovery `<link rel="alternate">` tags in `<head>` (feed content in STG-020). **Rendering:** All content pages ISR/SSR with complete server-rendered HTML; client-only pages (`/bookmarks`, `/study`, `/feedback`) are `noindex`. OG quote images generated at minimum 1200×630px. Google Search Console + Bing Webmaster Tools setup. (FTR-059) |
| STG-004-8 | **Accessibility foundation** | **Done.** WCAG 2.1 AA from day one. Semantic HTML, ARIA landmarks, keyboard navigation, skip links, focus indicators, screen reader testing, color contrast compliance, `prefers-reduced-motion` support, 44×44px touch targets. Automated a11y testing in CI via axe-core. Claude-generated reverential alt text for all Yogananda photographs (About page, footer, book covers), reviewed by SRF editors. ARIA labels written as warm speech (FTR-053). Progressive homepage disclosure for first visits (FTR-052). (FTR-003, FTR-005 E7, FTR-052, FTR-053) |
| STG-004-9 | **i18n infrastructure + bilingual UI** | **Done.** All UI strings externalized to `messages/en.json`. **Spanish UI strings translated** via Claude draft → human review workflow (FTR-135): spiritual terminology glossary (`glossary-es.json`) bootstrapped from existing SRF published terminology; `scripts/translate-ui.ts` generates `{locale}.draft.json` from `en.json` + glossary + string context (`en.context.json`); human reviewer approves into production `{locale}.json`. `next-intl` configured with `en`, `es` locales (Hindi added in STG-021). CSS logical properties throughout (`ms-*` not `ml-*`). `lang` attribute on `<html>`. No hardcoded strings in components. `topic_translations` table created (empty until STG-021). pg_search BM25 indexes configured with language-appropriate ICU tokenization (FTR-025). All content-serving API endpoints accept `language` parameter. STG-001–STG-005 content and UI chrome are bilingual (en/es); architecture supports adding remaining 8 core languages with zero rework. UI copy follows micro-copy standards (FTR-054): "seeker" not "user," warm error messages, contemplative ARIA labels. Playwright visual snapshots verify Spanish UI renders correctly — no truncation, Spanish string length accommodated. (FTR-058, FTR-058, FTR-054, FTR-135, FTR-011) |
| STG-004-10 | **Print stylesheet** | **Done.** `@media print` stylesheet for reader and passage pages. Remove navigation, footer, side panel. Full-width text at optimal reading width. English/Spanish: Merriweather at 11pt. Hindi print support (Noto Serif Devanagari at 12pt, 40–50 aksharas line length per FTR-131) added in STG-021 when Hindi content activates. Citation below each passage. Portal URL in small footer. Page breaks between chapters. No background colors. |
| STG-004-11 | **Text-only mode — design system integration** | **Done.** Foundation established in STG-003-13 (footer toggle, `localStorage`, disables images/fonts/decorative). Integrated into unified `ReaderSettings` popover in Header: text-only toggle (switch control), font size selector (default/large/larger via `html` class), language switcher. Popover has WCAG focus trap, Escape close, click-outside dismiss, aria-modal dialog, 44px touch targets. Replaced standalone `LanguageSwitcher` in Header and `TextOnlyToggle` in Footer. Font size preferences persist in `localStorage` via preferences service (PRI-10). `.font-large` (112.5%) and `.font-larger` (125%) CSS classes in `globals.css`. Settings strings i18n'd in en/es. (FTR-006) |
| STG-004-12 | **Service Worker — enhanced caching** | **Done.** Foundation established in STG-003-14 (app shell caching, offline indicator). 2a extends: cache strategy for all new 2a pages, font caching for self-hosted WOFF2 files (STG-004-19), integration with text-only mode (skip font caching when text-only enabled). Verify offline indicator works across all navigation patterns. (FTR-006) |
| STG-004-13 | **"Start Here" — Newcomer path** | **Done.** Editorially curated starting points on homepage (below Today's Wisdom) and books page. Three entry paths: the curious reader, the person in need, the meditation seeker. Warm cream card, Merriweather Light, quiet and inviting. Content in `messages/en.json` (i18n-ready). **Per-locale cultural adaptation in STG-021:** Entry paths are editorial content in locale files, not hardcoded. The three English archetypes (curious reader, person in need, meditation seeker) are Western spiritual archetypes. STG-021 cultural consultants should author locale-specific entry paths — e.g., Hindi locale may foreground the devotee (already committed, seeking deeper practice) and the family (communal engagement). Japanese locale may add the student (academic/comparative religion interest). |
| STG-004-14 | **Quiet Corner audio cues** | **Done.** Two discrete audio files: singing bowl strike at timer start (~15KB), gentle chime at timer end (~15KB). Web Audio API with singing bowl harmonics, fixed 15% volume. Static assets bundled in app shell. Not ambient loops — just two moments of sound marking the boundaries of contemplative pause. |
| STG-004-15 | **Content integrity hashes** | **Done.** SHA-256 per chapter computed at ingestion time, stored in `chapters.content_hash`. `/integrity` page listing all books and chapter hashes with verification instructions. API endpoint: `GET /api/v1/books/{slug}/integrity`. (FTR-123) |
| STG-004-16 | **EXIF/XMP metadata on served images** | All portal-served images carry Copyright ("© Self-Realization Fellowship"), Source ("teachings.yogananda.org"), and Description metadata. Applied server-side during image processing. Baseline provenance layer. (FTR-150 Tier 1) |
| STG-004-17 | **Language-aware URL conventions** | **Done.** Implement the hybrid language routing design: locale path prefix on frontend pages (`/{locale}/books/...`, default English omits prefix), `language` query parameter on API routes (`/api/v1/search?language=hi`). `next-intl` middleware detects locale from URL, `Accept-Language` header, or stored preference. Theme slugs remain in English for URL stability; display names localized via `topic_translations`. Each system uses the pattern natural to its consumers — SEO-friendly pages, clean API contract. (FTR-058) |
| STG-004-18 | **`/browse` — The Complete Index (initial)** | **Done.** High-density text page listing all navigable content, organized by category. STG-004 version: books only (by editorial category, with chapter counts). Designed text-first — semantic HTML heading hierarchy, zero JavaScript, zero images, < 20KB. Auto-generated from database at build time (ISR). Cacheable by Service Worker as offline artifact. Ideal screen reader experience (heading-level navigation). ARIA label: "Browse all teachings — a complete index of the portal's contents." Linked from site footer ("Browse all teachings"). Grows automatically as content types are added in later stages. (FTR-056) |
| STG-004-19 | **Self-hosted fonts** | **Done.** Replace Google Fonts CDN with self-hosted WOFF2 files in `/public/fonts/`. Eliminates IP transmission to Google servers (German GDPR compliance, LG München I). Improves performance (no external DNS lookup). `@font-face` with `font-display: swap`. (FTR-085) |
| STG-004-20 | **Privacy policy and legal pages** | **Done.** `/privacy` page: human-readable privacy policy in contemplative voice — what data is collected, why, retention periods, sub-processors, data subject rights. `/legal` page: terms of use, copyright, content licensing. Linked from footer on every page. Record of Processing Activities (ROPA) document created. (FTR-085) |
| STG-004-21 | **Testing infrastructure** | **Done.** Vitest + React Testing Library: 198 tests across 18 files (7 service tests, 4 API route tests, 5 component tests, 1 a11y suite, 1 preferences suite). Playwright for E2E tests (smoke spec scaffolding). axe-core WCAG 2.1 AA tests in CI (landmarks, headings, images, forms, nav, ARIA, color contrast, document lang). `@vitejs/plugin-react` for JSX transform. Neon branch-per-test-run isolation. (FTR-081) |
| STG-004-22 | **Lambda + database backup** | Lambda infrastructure (IAM roles, layers, VPC config) and EventBridge Scheduler provisioned via Platform MCP. Database backup: S3 bucket + Lambda pg_dump via EventBridge Scheduler, nightly, 90-day retention. Neon Snapshots schedule configured (daily/weekly/monthly). Lambda infrastructure provisioned here — subsequent stages add functions to already-working infrastructure. `.env.example` for local development. Quarterly restore drill: test restore from random backup to Neon branch. OpenTelemetry export configured for database observability. (FTR-106, FTR-108, FTR-109, FTR-107, FTR-094) |
| STG-004-23 | **OpenAPI specification** | **Done.** Hand-authored `/api/v1/openapi.json` (auto-generation may replace in a future stage). Machine-readable API documentation. Enables auto-generated client libraries and API explorers. (FTR-059) |
| STG-004-24 | **Timestamp filtering on book endpoints** | **Done.** `updated_since` and `created_since` query parameters on `GET /api/v1/books` and `GET /api/v1/books/[slug]/chapters`. Response includes `sync` metadata with `latest_timestamp` for incremental sync consumers (Zapier, Lambda, partner integrations). Builds on STG-001 `updated_at` columns and triggers. (FTR-087) |

### Success Criteria

- All pages exist and are navigable: homepage, search, reader, books, book landing, Quiet Corner, about, passage share, browse
- Homepage has all sections: Today's Wisdom with cross-fade "Show me another", thematic doors, "Seeking..." entry points, YouTube videos
- The Quiet Corner displays an affirmation with a working gentle timer and chime
- About page shows Yogananda biography, line of gurus, "Go Deeper" links
- Passage sharing generates working OG preview cards
- Share menu offers: copy link, email passage, save as image, save as PDF
- Passage PDF generates clean A4 page with warm cream background, Merriweather type, lotus watermark, citation
- SEO structured data validates via Google's Rich Results Test
- All pages pass axe-core: zero critical or serious violations
- No hardcoded UI strings — all in `messages/en.json`
- Spanish UI strings (`messages/es.json`) translated via Claude draft → human review and deployed to production
- Spanish UI strings accommodate ~20% length expansion — no truncation in nav, buttons, or labels
- Playwright visual snapshots pass for both locales (en, es)
- Spiritual terminology glossary (`glossary-es.json`) committed and referenced by translation script
- The portal's visual design is recognizably SRF (Merriweather type, gold accents, warm palette, lotus motif)
- The video section displays recent @YoganandaSRF uploads and categorized playlists without manual intervention
- Print stylesheet works cleanly for reader and passage pages
- Text-only mode (established in STG-003-13) integrated into reader settings popover and consistent across all 2a pages
- Service Worker (established in STG-003-14) enhanced with caching for all 2a pages and self-hosted fonts
- "Start Here" section appears on homepage and books page with three entry paths
- Quiet Corner singing bowl plays on timer start, chime on timer end
- Content integrity hashes computed and displayed on `/integrity` page
- Homepage initial payload < 50KB (HTML + critical CSS + inline JS)
- Fonts loaded from `/public/fonts/` — zero requests to `fonts.googleapis.com`
- `/privacy` page exists and discloses all data collection, retention, and sub-processors
- `/legal` page exists with terms of use and copyright information
- CI pipeline runs all test layers (lint, type check, unit, integration, E2E, a11y, Lighthouse) on every PR — all must pass before merge
- Platform MCP `environment_create` provisions a complete development environment from scratch
- `GET /api/v1/books?updated_since=...` returns only recently modified books; response includes `sync.latest_timestamp`

- **Done.** Opening moment — portal threshold: lotus SVG fade on first session visit (FTR-040)

---

### STG-005: Refine

**Goal:** Add the contemplative reader interactions that distinguish the portal from a standard web reader — dwell mode, keyboard navigation, bookmarks, typography refinements, and offline support.

**Progress (2026-03-02):** 13 of 13 numbered deliverables complete. **Stretch goals advancing:** Color theme system with 5 themes (auto/light/sepia/dark/meditate) via `data-theme` on `<html>`, with high-contrast support and theme-aware surfaces (`bg-(--theme-surface)` replacing all `bg-white`). Meditation theme (`#0a1633` deep navy, `#d4cfc7` text, gold at 60%) for contemplative reading. Color theme selector in ReaderSettings popover. Font size selector (3 sizes, class on `<html>`). Circadian color temperature (FTR-040: morning/midday/evening warmth shifts via `data-time-band`). "Breath Between Chapters" transition (FTR-040: 1.2s title pause + 400ms fade on prev/next navigation). PWA manifest (standalone, installable). Centralized cross-site URL registry (`/lib/config/srf-links.ts` with 80+ URLs, all hardcoded URLs migrated). HyDE search (STG-005-12) and Cohere Rerank (STG-005-13) reclassified to STG-006-11/STG-006-12 for multi-book corpus evaluation. STG-005-14 (Vercel KV) skipped — trigger conditions not met. **Latest (session 4):** FTR-040 Opening Moment implemented (lotus SVG portal threshold on first session visit). `ReadingProgress.tsx` saves/restores reading position per chapter (localStorage, debounced, 50-entry bounded). Offline fallback page (`public/offline.html`). SW bumped to v3 with offline navigation fallback. `text-white` theme bug fixed (3 instances → `text-warm-cream`). `aria-current="page"` on active Header nav links. Print citation i18n'd (en/es). E2E test expansion to 36 tests (reader features, PWA, visual regression, bookmarks, accessibility). **Session 5:** Keyboard help overlay expanded (d/b/? shortcuts wired to DwellMode, BookmarkButton, help modal). Haptic dwell confirmation (`navigator.vibrate(10)` with `prefers-reduced-motion` respect). Line spacing preference (`default/relaxed/spacious` in ReaderSettings, globals.css, preferences service). Test coverage expansion: KeyboardNav (17 tests), TodaysWisdom (7), ShareButton (6), ScrollIndicator (4), AdaptiveImage (6), QuietCornerClient (18). ChapterNavLink (3), ServiceWorkerRegistration (3). All React components now have unit tests. OpenAPI route migrated from hardcoded URLs to PORTAL config (FTR-012). **480 Vitest tests across 43 files (all passing).** Performance: all pages ≤ 130KB First Load JS.

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| STG-005-1 | **"Dwell" passage contemplation mode** | **Done.** Long-press (mobile, 500ms) or click hover-revealed dwell icon (desktop) on any paragraph dims surrounding text to 15% opacity, passage remains vivid. `Escape` exits. Screen reader announcements on enter/exit. `prefers-reduced-motion`: instant transitions. Desktop: hover over paragraph for 1.5s reveals dwell activation icon. CSS via `[data-dwell-active]` attribute. 7 tests. (FTR-040) |
| STG-005-2 | **Keyboard-first reading navigation** | **Done.** `j`/`k` paragraphs with gold highlight (`kb-focus` class), `→`/`←` chapters, `/` search bar. Suppressed when input/textarea/select focused. Smooth scroll to center. (FTR-040) |
| STG-005-3 | **Lotus bookmarks** | **Done.** localStorage-based bookmarks. Lotus SVG icon (`--srf-gold`) in reader header — gold outline unbookmarked, filled gold bookmarked. `/bookmarks` page listing all saved chapters/passages by book. `lib/services/bookmarks.ts` framework-agnostic service with subscribe pattern. 47 tests (39 service + 8 component). No server interaction. (FTR-046) |
| STG-005-4 | **Reader typography refinements** | **Done.** Drop capitals at chapter starts (Merriweather 700, `--srf-navy`, 3.5em `::first-letter`). Decorative gold quotation marks on epigraphs (48px, 40% opacity). CSS-only paper texture (inline SVG fractalNoise at 3% opacity). Optical margin alignment (`hanging-punctuation: first allow-end`). Citation formatting with em dash `::before`. All in `globals.css`. (FTR-040) |
| STG-005-5 | **Reading time estimate + scroll position** | **Done.** Reading time estimate below chapter title (~X min at 230 WPM, server-side calculated). Scroll position indicator (`ScrollIndicator.tsx`, 2px `--srf-gold` at 30% opacity, fixed top of viewport). `role="presentation" aria-hidden="true"`. No percentage, no countdown. |
| STG-005-6 | **Last-read chapter caching** | **Done.** Service Worker `srf-last-read-v1` cache: network-first, replaces previous cached chapter on each read. Route pattern: `/^\/[a-z]{2}\/books\/[^/]+\/\d+$/`. Graceful offline fallback. (FTR-006) |
| STG-005-7 | **Contextual Quiet Corner** | **Done.** `ContextualQuiet.tsx`: "Pause with this" button appears during dwell mode. Transitions paragraph into in-place contemplation with timer (1/5/15 min), singing bowl + chime audio, passage bookmark option on completion. CSS mode `data-mode="quiet"` hides all chrome. MutationObserver watches dwell state. 11 tests. (FTR-052) |
| STG-005-8 | **Focus reading mode** | **Done.** "Focus" toggle in reader header (crosshair icon). CSS mode `data-mode="focus"` hides header/footer/`[data-no-focus]`. Stored in `localStorage` via preferences service. Mutually exclusive with presentation mode. 17 tests (combined with STG-005-15). (FTR-052) |
| STG-005-9 | **Session closure moments** | **Done.** `PartingWord.tsx` server component with 16 curated Yogananda quotes from Autobiography. Date-seeded selection for SSR determinism. Lotus SVG divider, `reader-citation` attribution. Placed at chapter end (above Next Chapter) and passage detail bottom. 12 tests. (FTR-040) |
| STG-005-10 | **Non-search journey polish** | **Done.** Passage detail page (`/passage/[id]`) enhanced: "From {book}" framing context at top, book invitation card ("This passage is from {book} — explore the full text freely") with "Explore the book" and "Search the teachings" CTAs, parting word at bottom. i18n strings in `passage` namespace. (FTR-047) |
| STG-005-11 | **Prerender hints (Speculation Rules)** | **Done.** `<script type="speculationrules">` on chapter reader: prerender next chapter, prefetch previous chapter. Progressive enhancement — ignored by unsupported browsers. (FTR-059 §13) |
| STG-005-12 | ~~HyDE search enhancement~~ | **Reclassified → STG-006-11. Implementation done.** `lib/services/hyde.ts`: Claude Haiku via Bedrock generates hypothetical passage in Yogananda's register (en/es system prompts). Embedded via Voyage `input_type: "document"` for document-space search. Three-path RRF (query vector + HyDE vector + FTS) in `search.ts`. Feature-flagged via `?enhance=hyde`. Graceful fallback on Claude/Bedrock failure. 6 tests. Evaluation against multi-book corpus is the remaining STG-006 work. |
| STG-005-13 | ~~Cohere Rerank integration~~ | **Reclassified → STG-006-12. Implementation done.** `lib/services/rerank.ts`: Cohere Rerank 3.5 cross-encoder via REST API. Multilingual-native. Applied post-RRF fusion on top candidates. Feature-flagged via `?enhance=rerank`. Graceful fallback to RRF scores on Cohere failure. 6 tests. Evaluation against multi-book corpus is the remaining STG-006 work. |
| STG-005-14 | ~~Vercel KV suggestion cache~~ | **Skipped.** Trigger conditions not met: static JSON achieves < 10ms globally, dictionary < 50K entries/language. Re-evaluate at STG-009 boundary if dictionary grows significantly. |
| STG-005-15 | **Presentation mode** | **Done.** "Present" button in reader header (expand icon). CSS mode `data-mode="present"`: 1.5rem text, hides all chrome, warm cream fills viewport, 48rem max-width. Session-only (not persisted). Escape exits. For group reading, satsang, study circles. Mutually exclusive with focus mode. (FTR-006) |
| STG-005-16 | **Low-bandwidth detection — extended adaptation** | **Done.** Banner upgraded: `localStorage` with 30-day expiry (was `sessionStorage`), i18n via `useTranslations("lowBandwidth")`. `AdaptiveImage.tsx`: halved dimensions + blur on 2G, lazy on 3G. `useAdaptiveDebounce` hook: 3x delay on 2G, 1.5x on 3G. 16 tests (10 banner + 6 debounce). (FTR-006) |

### Success Criteria

- "Dwell" interaction works: long-press (mobile) / hover-revealed icon click (desktop) dims surrounding text, shows share/bookmark icons. Related Teachings side panel updates immediately on dwell. (FTR-040)
- Full keyboard navigation: `j`/`k` paragraphs, `d` dwell, `b` bookmark, `→`/`←` chapters, `?` help overlay (FTR-040)
- Lotus bookmarks work via `localStorage` — bookmark chapters and passages without an account, view on `/bookmarks` page (FTR-046)
- Drop capitals appear at chapter starts, decorative gold quotation marks on displayed passages, chapter epigraphs styled distinctly (FTR-040)
- Reading time estimate displayed below chapter title, scroll position indicator works
- Reader settings (text size, color theme, line spacing) persist in localStorage
- Last-read chapter available offline via Service Worker cache
- Focus mode toggle reduces reader to reading + Next Chapter only (FTR-052)
- Parting-word passages appear at natural session endpoints (chapter end, search bottom, theme bottom) (FTR-040)
- Shared passage page (`/passage/[chunk-id]`) includes framing context and book invitation (FTR-047)
- Dwell mode triggers haptic confirmation on mobile
- Speculation Rules active: next chapter prerenders from reader page (verified in Chrome DevTools → Application → Speculative loads)
- Presentation mode fills viewport with readable text, no chrome visible, arrow-key navigation works (FTR-006)
- Low-bandwidth detection (established in STG-003-15) extended with adaptive image quality and `localStorage` persistence upgrade (FTR-006)

**Additional deliverables (stretch goals — not in the numbered deliverable table but expected by stage gate):**
- Calm Technology design system as shared npm package
- Formal WCAG 2.1 AA third-party audit with real-user assistive technology testing
- **Done.** Reading mode: 5 color themes (auto/light/sepia/dark/meditate) with theme selector in ReaderSettings, adjustable font, high-contrast (`prefers-contrast`), theme-aware surfaces across all pages
- **Done.** Circadian color temperature and "Breath Between Chapters" transitions (FTR-040, FTR-040)
- **Done.** Progressive Web App: manifest.webmanifest (standalone, installable), apple-icon.tsx, sw.js v3 (shell + font + last-read chapter caching), offline fallback page (`public/offline.html`). Offline book reading: last-read chapter cached by SW. (FTR-103)
- **Done.** Responsive design polish: enhanced print stylesheet (@page margins, page breaks, citation styling), interaction modality detection (hover/pointer CSS for touch vs desktop), responsive presentation mode (24px→36px across 4 tiers), tablet reader margins (48–64px), phone landscape line-length capping (FTR-044)
- **Done.** Visual regression testing: Playwright E2E expanded to 36 tests including screenshot baselines for 4 key pages (homepage, search, books, quiet corner) with `toHaveScreenshot` and `maxDiffPixelRatio: 0.01`

**Additional success criteria:** WCAG 2.1 AA audit passes with zero critical violations. PWA installs on mobile and serves cached chapters offline. `prefers-reduced-motion` disables all animations.

---
## PWA-First Strategy (No Native App)

A native mobile app is not planned. The rationale:

1. **The PWA (STG-005) covers the use case.** Offline reading, home screen installation, and full search — all via the browser. For reading and searching Yogananda's teachings, a PWA is functionally equivalent to a native app for the vast majority of seekers.
2. **SRF already has a native app.** The SRF/YSS app (iOS/Android) has an eReader for the private Lessons. A second SRF reading app would create organizational confusion.
3. **The API-first architecture keeps the option open.** If a native app is ever warranted, it consumes the same `/api/v1/` endpoints. Zero backend changes needed.
4. **STG-005 is the evaluation point.** After the PWA ships, measure: Are seekers installing it? What are the limitations? Does SRF want portal features inside the existing app?

If a native app is warranted post-STG-005, React Native or Capacitor wrapping the existing codebase is the likely path. The calm design system and API layer already exist.

---

## Stage Gates

Each stage has prerequisites that must be satisfied before work begins. Hard prerequisites block the stage entirely; soft prerequisites improve quality but aren't strictly required.

| Stage | Hard Prerequisites | Soft Prerequisites |
|-----------|---|---|
| **STG-001 (Prove)** | ~~Edition confirmed, PDF source confirmed~~ *(Resolved 2026-02-24)*. ~~English ebook extraction~~ *(Resolved 2026-02-26)* | — |
| **STG-002 (Bilingual)** | STG-001 English search quality evaluation passes (≥ 80%) | Spanish ebook purchased |
| **STG-003 (Deploy)** | STG-002 bilingual search quality evaluation passes (≥ 80% for Spanish) | SRF AE team availability for kickoff |
| **STG-004 (Build)** | STG-003 complete | Embedding model benchmarks started |
| **STG-005 (Refine)** | STG-004 complete | — |
| **STG-006 (Corpus)** | STG-005 numbered deliverables complete (13/13). Stretch goals progressing (color themes, font size, circadian, chapter breath, PWA manifest done; WCAG audit remaining) — architecturally independent of corpus expansion. | — |
| **STG-007 (Editorial)** | STG-006 complete | Theme taxonomy reviewed by theological advisor. Editorial governance decided and portal coordinator identified are *activation* prerequisites (feature-flag pattern, FTR-012), not *build* prerequisites. Infrastructure ships on schedule; queues activate when staffed. |
| **STG-008 (Intelligence)** | STG-006 multi-book corpus available | STG-007 editorial review portal operational. Algorithmic deliverables (STG-008-1–STG-008-4, STG-008-6) can proceed in parallel with STG-007. |
| **STG-009 (Complete)** | STG-008 chunk relations computed | — |

*Gates for post-STG-009 directions will be defined at the STG-009 boundary retrospective.*

**Critical decision gates** (require SRF input before the stage begins):
- **STG-007 (Editorial):** Who owns editorial governance? Who is the portal coordinator? (See CONTEXT.md § Operational Staffing)

**Unscheduled feature review:** Every stage gate includes a triage of unscheduled FTRs. Deferred items are evaluated first; validated items are considered for the upcoming stage; proposed items are principle-checked if relevant to the next stage's scope.

---

## Cost Trajectory

| Stage | Estimated Monthly Cost | Notes |
|-----------------|----------------------|-------|
| STG-001–STG-002 (Prove + Bilingual) | ~$20-30 | Neon Scale tier (~$20/mo baseline), local dev only, one-time embedding cost (~$0.30 en, ~$0.30 es). |
| STG-003–STG-005 (Deploy through Refine) | ~$80-100 | Neon Scale (~$20), Vercel Pro (~$20), Sentry Team (~$26), Claude API (~$15-25). S3 backup < $1/mo. |
| STG-006–STG-009 | ~$80-120 (base) + ~$10-20 (incremental) | Base infrastructure continues from STG-002–STG-005. Incremental: more embedding generation for multi-book corpus and chunk relations. Lambda for batch ingestion (pennies per invocation). |
| Post-STG-009 | Evaluated at STG-009 boundary | Cost projections for future directions (email, SMS, media hosting, multi-language embeddings, regional replicas) will be developed with concrete scope. |

---

## Dependencies and Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **OCR quality** | Corrupted text → bad search results | Claude validates autonomously during ingestion (5.0/5.0 confidence achieved for English). Physical book recovery for edge cases (2 pages). SRF provides non-PDF digital text before launch. |
| **Contentful capacity** | Full corpus at paragraph level may require tier evaluation | One book (~3K TextBlocks) fits comfortably. Evaluate capacity needs at STG-006 (multi-book). Hybrid option: section-level in Contentful, paragraph-level in Neon only. |
| **Embedding model quality** | Poor retrieval for Yogananda's vocabulary | Benchmark multiple models in STG-001. Yogananda uses precise, sometimes archaic spiritual terminology. |
| **Chunk size sensitivity** | Too small = orphaned fragments. Too large = imprecise retrieval. | Empirical testing in STG-001 with diverse query types. |
| **Stakeholder expectation** | "AI search" may imply a chatbot | Clear communication: this is a librarian, not an oracle. No synthesis. |
| **SEO discoverability** | Portal serves only people who already know it exists | Deliberate SEO strategy from STG-004: structured data, theme pages as entry points, meta tags, sitemap. |
| **Portal/app overlap** | Building a duplicate reader alongside the SRF/YSS app | Clarify relationship with SRF AE team early. Portal may complement (search + public reading) rather than replace (private Lessons reading) the app. |
| **Editorial governance** | No defined process for theme tagging, daily passage curation, content QA | Establish editorial roles and workflows before STG-007. Determine whether monastic order, AE team, or dedicated editor owns this. The editorial review portal (FTR-060, deliverables STG-007-5a/STG-007-5b) provides the tooling; the organizational question of *who* uses it requires SRF input. |
| **Copyright/licensing ambiguity** | Unclear terms for free access (read-only vs. downloadable vs. printable) | Resolved: full crawlability with copyright retention. Content gating architecturally prohibited (FTR-059 §3a). Copyright communicated via multi-layered metadata: `llms.txt` copyright section, `X-Copyright` headers, JSON-LD, `/legal` page. Copyright communication layer ships as STG-003-12. Final licensing terms (CC-BY-NC vs. all-rights-reserved with permissions) require SRF legal counsel review before STG-003 deployment (FTR-117). |
| **Global South accessibility** | Many seekers access via mobile on limited bandwidth (India, Africa, Latin America) | Mobile-first design. Performance budgets (< 100KB initial load). Low-bandwidth text-only mode. Consider PWA for offline access of bookmarked passages. |
| **"What next" gap** | Seeker is moved by a passage but portal offers no path to practice | "Go Deeper" section in About, footer ecosystem links, and Quiet Corner all point toward SRF Lessons, local centers, and online meditation. Not a sales funnel — a signpost. |
| **Search API abuse** | Public, unauthenticated search API with Claude API cost per query | Two-layer rate limiting (Vercel Firewall + application) from STG-003. Claude API monthly budget cap. Graceful degradation to database-only search when rate-limited. (FTR-097) |
| **Operational staffing** | Editorial review portal provides tooling, but who uses it? Theme tagging, daily passage curation, translation review, and content QA require dedicated staff time. | Establish editorial roles before STG-007. Key roles to fill: portal coordinator (cross-queue health), content editor, theological reviewer, book ingestion operator. VLD coordinator needed by STG-024. Operational playbook (deliverable STG-007-11) documents procedures so year-3 staff can operate without the builders. See CONTEXT.md § Operational Staffing. |
| **Editorial queue backlog** | Review queues grow with every stage. If the monastic editor is unavailable for weeks, AI-proposed tags accumulate and daily passage curation has no attention. | Queue health monitoring (deliverable STG-007-12) with age thresholds and escalation to portal coordinator. Email digest highlights overdue items. Minimum editorial coverage model: determine how many review hours/week each stage requires. |
| **Database disaster recovery** | Canonical content (book text, embeddings, theme tags, chunk relations) lives only in Neon. | Three-layer recovery: 30-day PITR (Scale tier), automated Neon Snapshots, nightly pg_dump to S3 (FTR-109, FTR-094). Time Travel Queries for pre-restore verification. Quarterly restore drill. |
| **Edition changes** | SRF publishes revised editions; page numbers and paragraph boundaries change. All portal citations become inaccurate. | Edition tracking in data model (FTR-021). Content-addressable deep links survive re-ingestion (FTR-132). Old edition archived, not deleted. |
| **Shared passage link permanence** | Re-ingestion with different chunking breaks shared links in emails, WhatsApp messages, bookmarks. | Content-hash deep links (FTR-132). Resolution chain: exact match → content-hash in same chapter → content-hash in same book → graceful "passage may have moved" fallback. |

