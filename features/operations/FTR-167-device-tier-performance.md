---
ftr: 167
title: "Device-Tier Performance Framework"
summary: "Four audience tiers with per-tier SLOs, network-throttled testing, and CI enforcement — PRI-05 made measurable"
state: approved-provisional
domain: operations
governed-by: [PRI-05, PRI-07, PRI-03]
depends-on: [FTR-081, FTR-082]
---

# FTR-167: Device-Tier Performance Framework

## Rationale

### The Gap

PRI-05 declares: "A seeker in rural Bihar on 2G and a seeker in Los Angeles on fiber both get the complete experience." FTR-081 specifies the test pyramid. FTR-082 specifies SLI/SLO targets. But neither breaks down performance by who the seeker is.

FTR-082's SLOs are aggregate: "FCP < 1.5s," "Search p95 < 500ms." These targets are achievable on fiber and impossible on 2G. Without per-population targets, we optimize for T4 (10% of seekers on desktop fiber) and assume T1 (15% on 2G in rural India) will be acceptable. This is the opposite of global-first.

### Decision

Define **four device tiers** representing the portal's global audience. Every performance-sensitive feature specifies SLO targets per tier. CI enforces the worst-tier target, not the best-tier target. A feature ships when all four tiers pass.

This framework is the enforcement mechanism for PRI-05. It turns "serve all humans equally" from aspiration into a testable contract.

### Why Not Extend FTR-081 or FTR-082?

FTR-081 specifies *what* to test and *which tools* to use. FTR-082 specifies *what to observe* and *aggregate targets*. This FTR specifies *for whom* — the audience segmentation that makes both testing and observability actionable. It depends on both but is architecturally distinct: a lens, not a layer.

The device-tier definitions are also consumed beyond testing and observability — they inform design decisions (font sizes at 240px), CSS breakpoints, image delivery (FTR-160), and progressive enhancement strategy. A dedicated FTR makes them discoverable across domains.

### Consequences

- Every new feature with performance implications specifies SLO targets using this framework's tier table
- FTR-081's Playwright E2E suite gains a `perf` project with network-throttled tests
- FTR-082's aggregate SLOs remain as composite targets; this FTR adds the per-tier decomposition
- CI gates on the worst-tier target (T1-2G) — if the Bihar JioPhone passes, everyone passes
- New Relic synthetic monitors (STG-009+) use these tier profiles for geographic testing

## Specification

### Device Tiers

Four tiers derived from FTR-011 audience demographics (reachable population analysis, device/bandwidth data from ITU, GSMA, DataReportal).

| Tier | Profile | Represents | Network | Viewport | Audience Share |
|------|---------|-----------|---------|----------|----------------|
| **T1** | 2G / KaiOS / 240px | Rural India, Sub-Saharan Africa. JioPhone, feature phones. | 50 Kbps down, 20 Kbps up, 800ms RTT | 240 × 320 @1x | ~15% |
| **T2** | 3G / Budget Android / 360px | Urban developing world. $50–100 Android devices. | 400 Kbps down, 150 Kbps up, 300ms RTT | 360 × 640 @2x | ~40% |
| **T3** | LTE / Mid-range / 390px | Global urban. $200–400 smartphones. | 10 Mbps down, 5 Mbps up, 50ms RTT | 390 × 844 @3x | ~35% |
| **T4** | Fiber / Desktop / 1440px | Developed world. Desktop/laptop on broadband. | 50 Mbps down, 20 Mbps up, 5ms RTT | 1440 × 900 @1x | ~10% |

**T1 is the design target.** If T1 passes, T2–T4 pass by definition (faster network, larger viewport, more capable device). The framework tests all four to catch regressions that affect mid-tier seekers (a T3 regression wouldn't show in T1 or T4 testing).

**Audience share estimates** are directional, not precise. They represent the portal's addressable audience by language coverage (English, Spanish, eventually Hindi) crossed with FTR-011's bandwidth/device data. The important fact: T1+T2 represent ~55% of seekers. The majority experience is the constrained experience.

### Canonical Profiles

The single source of truth for tier definitions is `e2e/device-tiers.ts`. This file exports:

- `DeviceTier` interface: viewport, network params, device scale factor, touch capability, user-agent string
- `NetworkProfile` interface: Chrome DevTools Protocol format (consumed directly by Playwright CDP sessions and portable to New Relic synthetic scripts)
- `TIER_1_2G`, `TIER_2_3G`, `TIER_3_LTE`, `TIER_4_FIBER` constants
- SLO target records keyed by tier name

All consumers import from this file. No hardcoded network params elsewhere.

### Page-Level SLOs

Core Web Vitals targets per tier. These supersede FTR-082's aggregate FCP target for per-tier enforcement while remaining compatible (FTR-082's "FCP < 1.5s" maps to the T3 target).

| Metric | T1 (2G) | T2 (3G) | T3 (LTE) | T4 (Fiber) | Measurement |
|--------|---------|---------|----------|------------|-------------|
| First Contentful Paint | 5s | 3s | 1.5s | 800ms | Lighthouse CI / Playwright |
| Largest Contentful Paint | 8s | 5s | 2.5s | 1.5s | Lighthouse CI / Playwright |
| Cumulative Layout Shift | 0.1 | 0.1 | 0.1 | 0.1 | Lighthouse CI |
| Total JS (uncompressed) | 100KB | 100KB | 100KB | 100KB | Build audit (PRI-07) |

**T1 FCP at 5s:** On a 50 Kbps connection with 800ms RTT, the minimum TCP handshake + TLS + first byte takes ~3s. A 5s FCP target allows ~2s for HTML parsing and first paint — tight but achievable with server-rendered HTML (no JS required for first paint). Progressive enhancement makes this possible: the HTML is the experience, JS enhances.

**CLS is tier-invariant.** Layout shift is a rendering problem, not a bandwidth problem. 0.1 everywhere.

**100KB JS is tier-invariant.** PRI-07 sets this budget. On 2G it means ~16s to load all JS — which is why JS must never be required for first meaningful interaction.

### Feature-Level SLOs

Each performance-sensitive feature defines its own SLO table using the four tiers. Initial feature SLOs:

#### Autosuggestion (FTR-029)

| Metric | T1 | T2 | T3 | T4 | Measurement |
|--------|-----|-----|-----|-----|-------------|
| Zero-state render (focus → chips) | 3s | 1.5s | 500ms | 200ms | Playwright CDP |
| Prefix suggestions (keystroke → results) | 3s | 1.5s | 500ms | 300ms | Playwright CDP |
| Tier B fuzzy fallback | 5s | 3s | 1s | 500ms | Playwright CDP |

**Rationale for T1 3s suggestion target:** The `_zero.json` file is ~500 bytes. On 2G (50 Kbps, 800ms RTT): DNS + TLS + request ≈ 2.4s, transfer ≈ 80ms, parse + render ≈ 200ms = ~2.7s. The 3s target has ~300ms of margin. Prefix files (max 7.4KB) push into ~3s territory. These targets are realistic, not aspirational.

#### Search Results (FTR-020)

| Metric | T1 | T2 | T3 | T4 | Measurement |
|--------|-----|-----|-----|-----|-------------|
| Query to first result visible | 8s | 4s | 2s | 1s | Playwright CDP |
| Results page interactive | 10s | 5s | 2.5s | 1.5s | Playwright CDP |

#### Chapter Reading (FTR-041)

| Metric | T1 | T2 | T3 | T4 | Measurement |
|--------|-----|-----|-----|-----|-------------|
| Chapter text visible | 6s | 3s | 1.5s | 800ms | Playwright CDP |
| Next chapter navigation | 4s | 2s | 1s | 500ms | Playwright CDP |

These initial targets are provisional (state: `approved-provisional`). Refine after production measurement (item 2 below).

### Testing Infrastructure

#### Playwright Network Throttling

The `perf` project in `playwright.config.ts` runs network-throttled tests using Chrome DevTools Protocol sessions. Chromium-only (CDP requirement).

```
e2e/
├── device-tiers.ts                    # Canonical tier definitions + SLO targets
├── suggestion-performance.spec.ts     # FTR-029 per-tier tests
├── search-performance.spec.ts         # FTR-020 per-tier tests (planned)
├── reading-performance.spec.ts        # FTR-041 per-tier tests (planned)
└── smoke.spec.ts                      # Existing functional E2E (unchanged)
```

**Test pattern:** Each spec file iterates over `ALL_TIERS`, sets viewport/device params via `test.use()`, throttles via CDP session, measures action-to-visible timing, asserts against the tier's SLO target.

**Run commands:**
```bash
npx playwright test --project perf                    # All performance tests, all tiers
npx playwright test --project perf --grep "T1-2G"     # T1 only
npx playwright test --project perf --grep "static"    # Asset size checks only
```

#### Static Asset Size Gates

Separate from per-tier timing tests. These assert structural properties:

| Asset | Limit | Rationale |
|-------|-------|-----------|
| `_zero.json` | < 2KB | Must load in < 1s on 2G |
| `_bridge.json` | < 5KB | Loaded once per session |
| Any prefix file | < 15KB | Max transfer budget on 2G |
| Total JS bundle | < 100KB | PRI-07 budget |

#### CI Integration

The `perf` project is separate from the default `chromium` and `mobile-chrome` projects to avoid blocking PRs on timing-sensitive tests that require a running server. Integration path:

- **Phase 1 (now):** Manual runs with `npx playwright test --project perf`. Developer validates before PR.
- **Phase 2 (CI):** Add `perf` project to CI pipeline. Asset size gates block merges. Timing tests run as informational (logged, not blocking) until targets are validated against production.
- **Phase 3 (enforcement):** After 30 days of production data, timing tests become blocking. Targets adjusted based on real measurements.

### Measurement Stack

Four layers, from synthetic to real:

| Layer | Tool | What It Measures | When | Per-Tier? |
|-------|------|-----------------|------|-----------|
| **Synthetic local** | Playwright + CDP | Action-to-visible timing under throttled network | Every PR (Phase 2+) | Yes — four tiers |
| **Synthetic remote** | New Relic Synthetics (STG-009+) | Same tests from geographic locations (Mumbai, São Paulo, Lagos) | Continuous (5-min intervals) | Yes — real networks approximate tiers |
| **Real aggregate** | Vercel Web Vitals | Core Web Vitals from real visitors | Continuous | No — aggregate only |
| **Real segmented** | Client Web Vitals + `effectiveType` tag | Core Web Vitals tagged with network speed | Continuous | Approximate — 4G/3G/2G buckets |

**Real segmented measurement (planned):** A ~10-line addition to the root layout that reads the Network Information API's `effectiveType` and tags it onto the Vercel Web Vitals beacon. DELTA-compliant — no user identity, just page-level metric with connection type. This bridges the gap between "real but aggregate" (Vercel) and "per-tier but synthetic" (Playwright).

### Degradation Policy

When an SLO is breached, the seeker experience should degrade gracefully, not fail. The framework defines a degradation cascade:

| Breach | Response | Example |
|--------|----------|---------|
| Suggestion SLO breach | Skip Tier B (fuzzy fallback). Show Tier A results only. | On 2G, if prefix file loads but API is slow, show prefix results without waiting for fuzzy. |
| Search SLO breach | Show loading skeleton immediately. Partial results as they arrive. | First 3 results appear at 3s; remaining load progressively. |
| Chapter SLO breach | Server-render full HTML. Skip JS-enhanced features (scroll indicator, dwell zoom). | On 2G, the chapter text is readable before any JS loads. |
| Asset size breach | Block build. Asset size gates are hard failures. | A prefix file > 15KB means the pipeline generated too much data — fix the pipeline, don't ship it. |

The philosophy: **the Bihar seeker gets a simpler experience, never a broken one.** Progressive enhancement is the degradation policy — HTML is the foundation, CSS enriches, JS enhances. At every tier, the seeker can read Yogananda's words.

### Adding SLOs for New Features

When implementing a new performance-sensitive feature:

1. **Define tier targets** in the feature's FTR file using this framework's tier table format
2. **Add SLO constants** to `e2e/device-tiers.ts` (new record in `SUGGESTION_SLOS` pattern)
3. **Write per-tier Playwright test** in `e2e/{feature}-performance.spec.ts`
4. **Validate locally** with `npx playwright test --project perf --grep "{feature}"`
5. **Add asset size gates** if the feature introduces new static files

## Notes

**Provenance:** Emerged from FTR-029 autosuggestion implementation (2026-03-18). The question "how does a Bihar seeker on 2G experience suggestions?" revealed that FTR-081 and FTR-082 lacked per-population targets. The device-tier framework was built as testing infrastructure first (`e2e/device-tiers.ts`, `e2e/suggestion-performance.spec.ts`), then crystallized into this specification.

**Relationship to FTR-081:** FTR-081 specifies the test pyramid and CI pipeline. This FTR adds a dimension (device tiers) that cross-cuts the pyramid. FTR-081's Playwright tests gain a `perf` project; its CI pipeline gains asset size gates and (Phase 3) timing gates.

**Relationship to FTR-082:** FTR-082 specifies aggregate SLOs (search p95, FCP, availability). This FTR decomposes those aggregates by audience tier. FTR-082's "FCP < 1.5s" is the T3 target; the T1 target is 5s. Both are correct — they serve different populations. FTR-082's New Relic Synthetics (STG-009+) will use this framework's tier profiles for geographic testing.

**Relationship to FTR-011:** FTR-011 provides the demographic data (speakers × internet penetration × content availability) that justifies the tier definitions. This FTR operationalizes FTR-011's audience analysis into testable infrastructure.

**Initial targets are provisional.** The `approved-provisional` state reflects that timing SLOs are based on network calculations, not production measurement. After 30 days of Vercel Web Vitals data, targets will be adjusted and state changed to `approved`.
