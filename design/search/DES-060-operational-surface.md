## DES-060: Operational Surface — Health, Deployment, and Traceability

**Status: Implemented** — see `app/ops/`, `scripts/status.sh`, `scripts/deploy.sh`, `scripts/release-tag.sh`, `scripts/doc-validate.sh`

A unified operational layer providing health monitoring, deployment ceremony, document integrity validation, and design-artifact traceability. Consolidates PRO-035 (Release Tagging), PRO-036 (Operational Health), PRO-037 (Document Integrity CI), and PRO-039 (Design-Artifact Traceability) into a single implementation specification.

### Governing Decisions

- ADR-095 (Observability Strategy) — SLI/SLO targets
- ADR-018 (CI-Agnostic Deployment Scripts) — scripts in `/scripts/`
- ADR-020 (Multi-Environment Infrastructure Design) — branch=environment
- ADR-098 (Documentation Architecture) — document integrity
- ADR-094 (Testing Strategy) — test traceability
- PRO-035 (Release Tagging and Deployment Ceremony)
- PRO-036 (Operational Health Surface and SLI/SLO Framework)
- PRO-037 (Document Integrity Validation in CI)
- PRO-039 (Design-Artifact Traceability)

### Milestone Delivery

| Milestone | What Ships |
|-----------|-----------|
| **1a** | `doc-validate.sh` (identifier cross-reference integrity), `status.sh` (AI self-orientation), `release-tag.sh` (semantic release tagging) |
| **1c** | `/api/v1/health` (JSON health endpoint), deploy manifest generation, `deploy.sh` (deployment ceremony script) |
| **2a** | CI traceability roll-up, `@implements`/`@validates` coverage reporting |

---

### Layer 1: Health Endpoint — `/api/v1/health`

**Milestone 1c.** JSON endpoint returning system health for synthetic monitoring and the platform's `deploy_status` tool.

```
GET /api/v1/health

Response:
{
  "status": "ok" | "degraded" | "down",
  "version": "1a.3",
  "checks": {
    "database": { "status": "ok", "latency_ms": 12 },
    "contentful": { "status": "ok", "latency_ms": 45 },
    "search": { "status": "ok", "latency_ms": 87 }
  },
  "deployment": {
    "tag": "v1a.3",
    "deployed_at": "2026-11-15T14:30:00Z",
    "environment": "production"
  },
  "timestamp": "2026-11-15T15:00:00Z"
}
```

**SLI/SLO Numeric Targets (PRO-036):**

| SLI | Target | Measurement |
|-----|--------|-------------|
| Search p95 latency | < 500ms | New Relic APM / Vercel Analytics |
| Availability | 99.5% uptime | New Relic Synthetics (2-min check interval) |
| First Contentful Paint | < 1.5s | Vercel Analytics Core Web Vitals |
| Error rate | < 0.1% of requests | Sentry error count / Vercel request count |
| Search quality | >= 80% Recall@3 | Golden set evaluation (DES-058) |

These targets are tunable parameters per ADR-123 — initial values based on pre-production estimates. Revisit after first month of production traffic.

---

### Layer 2: Operational Dashboard — Moved to Platform

**Moved to platform MCP server (2026-03-01).** The operational dashboard responsibility belongs to the platform, not individual applications. The platform's `deploy_status` MCP tool calls `/api/v1/health` to surface app health. Corpus stats, search activity, and SLI/SLO data are available through the health API and future per-project API endpoints that the platform aggregates.

The platform MCP server (`yogananda-platform`) provides: `environment_list`, `environment_describe`, `deploy_status`, and `environment_promote` — covering the operational surface for all managed projects from a single tool set.

**Data sources remain:** `/api/v1/health` (live), deploy manifest JSON (static file at `/.well-known/deploy-manifest.json`), `doc-validate.sh` output (CI artifact), traceability roll-up (CI artifact, Milestone 2a).

---

### Layer 3: Scripts

All scripts follow ADR-018 (CI-agnostic, runnable locally or from GitHub Actions).

#### `scripts/status.sh` — AI Self-Orientation (Milestone 1a)

Claude's first action in any development session. Prints a concise briefing:

```bash
./scripts/status.sh

# Output:
# Portal Status — 2026-11-15
# ──────────────────────────
# Version:     v1a.3
# Milestone:   1c (Deploy) — 12/15 deliverables complete
# Branch:      feature/crisis-detection
# Last deploy: v1a.3 (2 hours ago)
# Health:      ● OK (all checks passing)
#
# Document Integrity:
#   Identifiers: 234 total (130 ADR, 63 DES, 41 PRO)
#   Cross-ref errors: 0
#   Last validated: 2 hours ago (CI)
#
# Pending PROs: 18 proposed, 2 validated awaiting scheduling
# Open questions: 4 (see CONTEXT.md § Open Questions)
```

Sources: git tags, CI artifacts, PROPOSALS.md index parsing, CONTEXT.md open questions grep.

#### `scripts/doc-validate.sh` — Document Integrity (Milestone 1a)

Validates cross-reference integrity across all project documents:

1. **Identifier registry:** Scans all markdown files for ADR-NNN, DES-NNN, PRO-NNN declarations. Builds a registry.
2. **Cross-reference check:** Every identifier referenced in prose must exist in the registry. Flags dangling references.
3. **Title consistency:** For dual-homed identifiers (ADR/DES in both DECISIONS and design files), verifies titles match.
4. **Navigation table completeness:** Every DES file in `design/` has a row in DESIGN.md's navigation table.
5. **Index completeness:** Every PRO body has an index entry in PROPOSALS.md.

```bash
./scripts/doc-validate.sh

# Output:
# Document Integrity Check — 2026-11-15
# ──────────────────────────────────────
# Identifiers found: 234 (130 ADR, 63 DES, 41 PRO)
# Cross-references checked: 1,847
# ✓ All cross-references resolve
# ✓ All dual-homed titles match
# ✓ All design files indexed in DESIGN.md
# ✓ All PRO bodies have index entries
```

Runs in CI on every push to `main` that touches markdown files. Non-blocking in Arc 1 (advisory warnings); blocking in Arc 2+.

#### `scripts/release-tag.sh` — Release Tagging (Milestone 1a)

Creates annotated git tags with deployment metadata:

```bash
./scripts/release-tag.sh v1a.3

# Creates annotated tag with:
# - Version: v1a.3
# - Milestone: 1a
# - Commits since last tag
# - design_refs: [identifiers from @implements/@validates in changed files]
# - blast_tier: T1-T5 (auto-classified from git diff)
```

**Tag naming convention:** `v{arc}{milestone}.{patch}` — e.g., `v1a.1`, `v1a.2`, `v1c.0`, `v2a.1`. Milestone boundaries get `.0` tags. Patches increment within a milestone.

**Blast radius classification** (auto-detected from `git diff` since last tag):

| Tier | Scope | Detection Heuristic |
|------|-------|-------------------|
| T1 | Cosmetic | Only CSS, copy, or static asset changes |
| T2 | Single page | Changes in one `/app/` route |
| T3 | Multi-page | Changes in multiple `/app/` routes or `/lib/services/` |
| T4 | Data model | Changes in `/migrations/` or `/lib/services/` + schema |
| T5 | Cross-service | Changes in platform config, `.github/workflows/`, or external API contracts |

#### `scripts/deploy.sh` — Deployment Ceremony (Milestone 1c)

Orchestrates the full deployment:

```bash
./scripts/deploy.sh v1c.0

# 1. Run doc-validate.sh (abort on errors)
# 2. Run test suite (abort on failures)
# 3. Create release tag via release-tag.sh
# 4. Generate deploy manifest (JSON)
# 5. Deploy to Vercel production
# 6. Verify /api/v1/health returns 200
# 7. Update deploy manifest with deployment URL
# 8. Push tag and manifest to GitHub
```

**Deploy manifest** (`/.well-known/deploy-manifest.json`):

```json
{
  "tag": "v1c.0",
  "deployed_at": "2026-12-01T14:30:00Z",
  "milestone": "1c",
  "blast_tier": "T3",
  "design_refs": ["DES-004", "ADR-048", "DES-058"],
  "commits": 23,
  "health_check": "ok",
  "environment": "production"
}
```

---

### Layer 4: Design-Artifact Traceability (PRO-039)

**Convention established Milestone 1a. CI roll-up Milestone 2a.**

Source files carry `@implements` comments; test files carry `@validates` comments. See PRO-039 for the full specification with examples.

**CI traceability step (Milestone 2a):** A GitHub Actions step greps the codebase for `@implements` and `@validates` annotations, cross-references against the identifier registry from `doc-validate.sh`, and produces a coverage report:

```
Identifier Coverage Report (v1a.3)
─────────────────────────────────
DES-004  Data Model           ██████████ implemented ✓  tested ✓  deployed v1a.1
DES-058  Search Quality       ████████░░ implemented ✓  tested ✓  deployed v1a.3
ADR-048  Chunking Strategy    ██████░░░░ implemented ✓  tested ○  not deployed
DES-017  Homepage             ░░░░░░░░░░ not started
```

Advisory in Arc 1 — no enforcement gate. Arc 2+ may add minimum coverage thresholds.

---

### Layer 5: Infrastructure-as-Intelligence

**Available from Milestone 1c.** The portal's infrastructure stack (Vercel Analytics, New Relic APM, CDN logs, structured application logs) already captures product-relevant signals at zero marginal cost and zero DELTA risk. Read these as product intelligence before adding explicit Amplitude events.

| Infrastructure Source | Signal | Product Intelligence | Available From |
|----------------------|--------|---------------------|----------------|
| **Vercel Analytics** | Core Web Vitals by route | FCP/LCP by page → which pages are slow for which populations? Hindi reading pages loading slowly = PRI-05 failure | Milestone 1c |
| **Vercel Analytics** | Traffic by route | Page popularity without any analytics events. `/search` vs. `/read/[book]` vs. `/quiet` — which surfaces do seekers use most? | Milestone 1c |
| **Vercel Analytics** | Geographic distribution | Country-level traffic heatmap. Validates `page_viewed` country data from a second source | Milestone 1c |
| **New Relic APM** | API latency by endpoint | `/api/v1/search` call volume = search usage. `/api/v1/passages` call volume = reading usage. Latency by endpoint reveals performance bottlenecks per feature | Milestone 3d |
| **CDN logs** | Bandwidth by asset type | Audio file bandwidth vs. font bandwidth vs. image bandwidth → audio demand volume without any explicit audio events | Milestone 1c |
| **CDN logs** | Cache hit rate by asset | High cache hit rate = repeat visitors (without identifying individuals). Low cache hit rate on audio = streaming vs. progressive download question | Milestone 1c |
| **Structured logs** | Search query patterns | Already logged (ADR-095). Zero-result queries → golden set candidates (DES-058). Query language distribution → real demand data for ADR-128 prioritization | Milestone 1c |
| **Structured logs** | Request volume by locale | `language` field on every request → real language demand, more granular than Amplitude's `requested_language` | Milestone 1c |
| **Sentry** | Error clustering by route and device | Errors concentrated on specific devices or browsers → broken experience for specific populations (PRI-05 failure detection) | Milestone 1c |

**Reading cadence:** Infrastructure-as-intelligence is not a dashboard — it is a periodic reading practice. At arc boundaries and milestone reviews, the human principal and AI review infrastructure signals for patterns that explicit analytics might miss. The platform operational surface may surface selected infrastructure metrics in future milestones.

**Relationship to Amplitude:** Infrastructure signals answer "how much" and "how fast." Amplitude events answer "which feature" and "in what context." They are complementary. When an infrastructure signal (e.g., audio CDN bandwidth spike) raises a question, an Amplitude event (e.g., `audio_play_started` by language) provides the context. Do not duplicate: if infrastructure already answers a question, do not add an Amplitude event for the same signal.

### Accessibility

- Status indicators use both color and icon (●/◌/✕) — not color alone
- All operational data available as JSON via `/api/v1/health` for programmatic access

---

### Relationship to Other Sections

- **DES-039** (Infrastructure and Deployment) — DES-060 adds the operational *surface* (health endpoint, dashboard, deploy ceremony) to DES-039's infrastructure *foundation* (Platform MCP, CI, bootstrap)
- **DES-037** (Observability) — DES-060's SLI/SLO targets complement DES-037's logging and error tracking
- **DES-038** (Testing Strategy) — Design-artifact traceability (Layer 4) links tests back to governing specs
- **PRO-041** (Docs as Executable Specs) — Extracts testable assertions from design prose; PRO-039/DES-060 links existing tests back to design identifiers. Complementary directions.

---
