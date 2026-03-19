---
ftr: 96
title: Operational Surface
summary: "Unified health monitoring, release tagging, document integrity validation, and design traceability"
state: implemented
domain: operations
governed-by: [PRI-12]
depends-on: [FTR-082, FTR-108]
---

# FTR-096: Operational Surface

## Specification

**Status: Implemented** — see `app/ops/`, `scripts/status.sh`, `scripts/deploy.sh`, `scripts/release-tag.sh`, `scripts/doc-validate.sh`

A unified operational layer providing health monitoring, deployment ceremony, document integrity validation, and design-artifact traceability. Consolidates FTR-096 (Release Tagging), FTR-096 (Operational Health), FTR-096 (Document Integrity CI), and FTR-096 (Design-Artifact Traceability) into a single implementation specification.

### Governing Decisions

- FTR-082 (Observability Strategy) — SLI/SLO targets
- FTR-108 (CI-Agnostic Deployment Scripts) — scripts in `/scripts/`
- FTR-110 (Multi-Environment Infrastructure Design) — branch=environment
- FTR-084 (Documentation Architecture) — document integrity
- FTR-081 (Testing Strategy) — test traceability
- FTR-096 (Release Tagging and Deployment Ceremony)
- FTR-096 (Operational Health Surface and SLI/SLO Framework)
- FTR-096 (Document Integrity Validation in CI)
- FTR-096 (Design-Artifact Traceability)

### Milestone Delivery

| Milestone | What Ships |
|-----------|-----------|
| **1a** | `doc-validate.sh` (identifier cross-reference integrity), `status.sh` (AI self-orientation), `release-tag.sh` (semantic release tagging) |
| **1c** | `/api/v1/health` (JSON health endpoint), deploy manifest generation, `deploy.sh` (deployment ceremony script) |
| **2a** | CI traceability roll-up, `@implements`/`@validates` coverage reporting |

---

### Layer 1: Health Endpoint — `/api/v1/health`

**STG-003.** JSON endpoint returning system health for synthetic monitoring and the platform's `deploy_status` tool.

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

**SLI/SLO Numeric Targets (FTR-096):**

| SLI | Target | Measurement |
|-----|--------|-------------|
| Search p95 latency | < 500ms | New Relic APM / Vercel Analytics |
| Availability | 99.5% uptime | New Relic Synthetics (2-min check interval) |
| First Contentful Paint | < 1.5s | Vercel Analytics Core Web Vitals |
| Error rate | < 0.1% of requests | Sentry error count / Vercel request count |
| Search quality | >= 80% Recall@3 | Golden set evaluation (FTR-037) |

These targets are tunable parameters per FTR-012 — initial values based on pre-production estimates. Revisit after first month of production traffic.

---

### Layer 2: Operational Dashboard — Moved to Platform

**Moved to platform MCP server (2026-03-01).** The operational dashboard responsibility belongs to the platform, not individual applications. The platform's `deploy_status` MCP tool calls `/api/v1/health` to surface app health. Corpus stats, search activity, and SLI/SLO data are available through the health API and future per-project API endpoints that the platform aggregates.

The platform MCP server (`yogananda-platform`) provides: `environment_list`, `environment_describe`, `deploy_status`, and `environment_promote` — covering the operational surface for all managed projects from a single tool set.

**Data sources remain:** `/api/v1/health` (live), deploy manifest JSON (static file at `/.well-known/deploy-manifest.json`), `doc-validate.sh` output (CI artifact), traceability roll-up (CI artifact, STG-004).

---

### Layer 3: Scripts

All scripts follow FTR-108 (CI-agnostic, runnable locally or from GitHub Actions).

#### `scripts/status.sh` — AI Self-Orientation (STG-001)

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

#### `scripts/doc-validate.sh` — Document Integrity (STG-001)

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

Runs in CI on every push to `main` that touches markdown files. Non-blocking through STG-003 (advisory warnings); blocking from STG-004 onward.

#### `scripts/release-tag.sh` — Release Tagging (STG-001)

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

**Tag naming convention:** `v{phase}{milestone}.{patch}` — e.g., `v1a.1`, `v1a.2`, `v1c.0`, `v2a.1`. Milestone boundaries get `.0` tags. Patches increment within a milestone.

**Blast radius classification** (auto-detected from `git diff` since last tag):

| Tier | Scope | Detection Heuristic |
|------|-------|-------------------|
| T1 | Cosmetic | Only CSS, copy, or static asset changes |
| T2 | Single page | Changes in one `/app/` route |
| T3 | Multi-page | Changes in multiple `/app/` routes or `/lib/services/` |
| T4 | Data model | Changes in `/migrations/` or `/lib/services/` + schema |
| T5 | Cross-service | Changes in platform config, `.github/workflows/`, or external API contracts |

#### `scripts/deploy.sh` — Deployment Ceremony (STG-003)

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
  "design_refs": ["FTR-021", "FTR-023", "FTR-037"],
  "commits": 23,
  "health_check": "ok",
  "environment": "production"
}
```

---

### Layer 4: Spec Fidelity and Traceability

**Convention established organically from STG-001. Formalized as the Spec Fidelity System (FTR-158).**

Traceability uses two lightweight mechanisms:

1. **FTR/PRI references in test comments.** Test files reference their governing specifications in file-level or test-level comments (e.g., `// STG-005-3 (FTR-046)`, `// PRI-02`). This convention emerged organically and is already present across the test suite. No formal annotation syntax (`@implements`/`@validates`) is needed — the existing pattern is sufficient.

2. **Fitness function test file.** `tests/fitness/spec-fidelity.test.ts` (FTR-158) contains deterministic checks for structural, architectural, and prohibition assertions drawn from FTR files. Each test block references its governing FTR/PRI. The file serves as both the verification mechanism and the traceability manifest — you read it to see what's verified.

**Coverage reporting (STG-006+):** A CI step greps the test suite for `FTR-\d{3}` and `PRI-\d{2}` references, cross-references against the FTR registry from `doc-validate.sh`, and reports which FTRs have test coverage. Advisory — no enforcement gate.

See FTR-158 for the full 3-layer verification architecture (Sentinels, Fitness Functions, Deep Verification).

---

### Layer 5: Infrastructure-as-Intelligence

**Available from STG-003.** The portal's infrastructure stack (Vercel Analytics, New Relic APM, CDN logs, structured application logs) already captures product-relevant signals at zero marginal cost and zero DELTA risk. Read these as product intelligence before adding explicit Amplitude events.

| Infrastructure Source | Signal | Product Intelligence | Available From |
|----------------------|--------|---------------------|----------------|
| **Vercel Analytics** | Core Web Vitals by route | FCP/LCP by page → which pages are slow for which populations? Hindi reading pages loading slowly = PRI-05 failure | STG-003 |
| **Vercel Analytics** | Traffic by route | Page popularity without any analytics events. `/search` vs. `/read/[book]` vs. `/quiet` — which surfaces do seekers use most? | STG-003 |
| **Vercel Analytics** | Geographic distribution | Country-level traffic heatmap. Validates `page_viewed` country data from a second source | STG-003 |
| **New Relic APM** | API latency by endpoint | `/api/v1/search` call volume = search usage. `/api/v1/passages` call volume = reading usage. Latency by endpoint reveals performance bottlenecks per feature | STG-009 |
| **CDN logs** | Bandwidth by asset type | Audio file bandwidth vs. font bandwidth vs. image bandwidth → audio demand volume without any explicit audio events | STG-003 |
| **CDN logs** | Cache hit rate by asset | High cache hit rate = repeat visitors (without identifying individuals). Low cache hit rate on audio = streaming vs. progressive download question | STG-003 |
| **Structured logs** | Search query patterns | Already logged (FTR-082). Zero-result queries → golden set candidates (FTR-037). Query language distribution → real demand data for FTR-011 prioritization | STG-003 |
| **Structured logs** | Request volume by locale | `language` field on every request → real language demand, more granular than Amplitude's `requested_language` | STG-003 |
| **Sentry** | Error clustering by route and device | Errors concentrated on specific devices or browsers → broken experience for specific populations (PRI-05 failure detection) | STG-003 |

**Reading cadence:** Infrastructure-as-intelligence is not a dashboard — it is a periodic reading practice. At milestone boundaries, the human principal and AI review infrastructure signals for patterns that explicit analytics might miss. The platform operational surface may surface selected infrastructure metrics in future milestones.

**Relationship to Amplitude:** Infrastructure signals answer "how much" and "how fast." Amplitude events answer "which feature" and "in what context." They are complementary. When an infrastructure signal (e.g., audio CDN bandwidth spike) raises a question, an Amplitude event (e.g., `audio_play_started` by language) provides the context. Do not duplicate: if infrastructure already answers a question, do not add an Amplitude event for the same signal.

### Accessibility

- Status indicators use both color and icon (●/◌/✕) — not color alone
- All operational data available as JSON via `/api/v1/health` for programmatic access

---

### Relationship to Other Sections

- **FTR-095** (Infrastructure and Deployment) — FTR-096 adds the operational *surface* (health endpoint, dashboard, deploy ceremony) to FTR-095's infrastructure *foundation* (Platform MCP, CI, bootstrap)
- **FTR-082** (Observability) — FTR-096's SLI/SLO targets complement FTR-082's logging and error tracking
- **FTR-081** (Testing Strategy) — Design-artifact traceability (Layer 4) links tests back to governing specs
- **FTR-158** (Spec Fidelity System) — 3-layer verification architecture (Sentinels, Fitness Functions, Deep Verification) that ensures FTR assertions are enforced. Layer 4 above is the traceability mechanism; FTR-158 is the full verification design.

## Notes

**Provenance:** FTR-096 → FTR-096

FTR-096 (Release Tagging), FTR-096 (Operational Health), FTR-096 (Document Integrity CI), and FTR-096 (Design-Artifact Traceability) were all adopted into FTR-096.
