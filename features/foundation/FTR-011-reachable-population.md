---
ftr: 11
title: "Reachable Population — Quantitative Prioritization Framework"
summary: "Scope prioritization metric: speakers x internet penetration x content availability determines shipping order"
state: implemented
domain: foundation
governed-by: [PRI-05]
---

# FTR-011: Reachable Population

## Rationale

- **Date:** 2026-02-28

### Context

The portal's roadmap originally ordered milestones by feature sophistication — build the experience for English users first, then expand to other languages. This optimized for depth of experience before breadth of reach. But PRI-05 (Global-First) commits to serving "all humans of Earth equally," and the portal's philanthropic mission is to make Yogananda's teachings "available freely throughout the world."

When two independent milestones compete for priority, the project lacked a quantitative framework for choosing between them. Decisions defaulted to Western software convention: polish before reach, features before languages. This resulted in non-English languages (serving ~2.6 billion reachable people) being scheduled after reader polish and study tools (serving existing English users).

A data-driven analysis of global language demographics (see [docs/reference/prioritizing-global-language-rollout.md](docs/reference/prioritizing-global-language-rollout.md) — 53 cited sources from Ethnologue, ITU, UNESCO, DataReportal, GSMA) revealed that the depth-first ordering contradicted the mission. Hindi and Spanish each individually serve reachable populations comparable to English L1 speakers.

### Decision

Adopt **reachable population** as the default prioritization metric for all scope decisions. When two milestones or features are architecturally independent, the one serving more reachable people ships first.

**Metric definition:**

```
Reachable Population = speakers × internet_penetration × content_availability
```

- **speakers:** Total speakers (L1 + L2) from Ethnologue 2025 data
- **internet_penetration:** Regional internet penetration from ITU Global Connectivity Report 2025 and DataReportal Digital 2026
- **content_availability:** Binary for now (1 = digital text exists for at least one book, 0 = no digital text). Becomes fractional when per-language book availability is cataloged.

**Language priority table:**

| Priority | Language | Speakers | Internet % | Reachable | Mission Alignment |
|----------|----------|----------|------------|-----------|-------------------|
| — | English (baseline) | 1,528M | ~95% (L1 regions) | ~390M L1 | Default. All content originates in English. |
| 1 | **Hindi** | 609M | ~70% | **~425M** | Yogananda's country. YSS homeland. Largest non-English audience. |
| 2 | **Spanish** | 558M | ~77% | **~430M** | Highest L1 ratio (86.7%). Strong SRF Latin America presence. |
| 3 | **Portuguese** | 267M | ~85% | **~225M** | Brazil digital leader. High L1 ratio (93.6%). |
| 4 | **Bengali** | 284M | ~45% | **~130M** | Yogananda's mother tongue. Deep YSS catalog. |
| 5 | **German** | 130M | ~95% | **~123M** | SRF Deutschland. Near-universal internet. |
| 6 | **Japanese** | 125M | ~95% | **~119M** | Established SRF Japan presence. |
| 7 | **French** | 312M | ~37%* | **~116M** | *Francophone Africa drags average down. France + Canada well-connected. |
| 8 | **Italian** | 68M | ~90% | **~61M** | Official translations exist. |
| 9 | **Thai** | 61M | ~80% | **~49M** | SRF/YSS Thailand. Script diversity forcing function. |

*Sources: Ethnologue 2025 (speaker counts), ITU Global Connectivity Report 2025 (internet penetration), DataReportal Digital 2026 (regional breakdowns). Full analysis with 53 citations in docs/reference/prioritizing-global-language-rollout.md.*

Hindi and Spanish together serve **~855M reachable people** — more than double English L1. This makes them Tier 1 priorities. Spanish is activated alongside English from the initial milestones. Hindi is deferred — the authorized YSS ebook is only purchasable from India/Nepal/Sri Lanka (Razorpay); the Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates in Milestone 5b when an authorized source becomes available.

### Application Protocol

When a future scope decision arises:

1. **Identify the populations affected** by each option.
2. **Calculate reachable population** for each using the metric above.
3. **The higher-reach option is the default** unless:
   - An architectural dependency prevents it (can't ship languages before i18n infrastructure)
   - A Content Identity principle (1–4) would be violated (never compromise verbatim fidelity for reach)
   - A security or accessibility requirement is at stake (these are not optional regardless of reach)
4. **If reach is comparable** (within 20%), other factors (mission alignment, implementation effort, dependencies) break the tie.

### Worked Examples

| Decision | Option A | Option B | Resolution |
|----------|----------|----------|------------|
| Reader polish vs. Hindi Autobiography | Dwell mode serves existing English readers (~390M) | Hindi Autobiography serves ~425M new people | **Hindi ships first** — higher reach, architecturally independent. *(Note: Hindi deferred due to source availability; this example illustrates the metric, not the current schedule.)* |
| PDF export vs. Portuguese activation | PDF serves engaged users across active languages | Portuguese activates ~225M new people | **Portuguese ships first** — reach delta is large |
| Dark mode vs. Italian activation | Dark mode serves all existing users across all active languages | Italian activates ~61M new people | **Depends on active user base** — if users across active languages significantly exceed 61M, dark mode has higher reach |
| Cross-book search vs. more languages | Cross-book search improves experience for ~820M (en+es users) | Next language tier adds ~780M (hi+pt+bn) | **Depends on Hindi availability** — if Hindi source acquired, languages first; otherwise cross-book search first |

### Consequences

- **Roadmap reordered:** Languages (formerly Milestone 5b) move before reader refinement (formerly Milestone 2b) and before study tools (formerly Milestone 3b+). Spanish Autobiography ingestion moves into Milestone 1b. Hindi deferred (authorized source unavailable outside India) — activates in Milestone 5b.
- **FTR-058 revised:** Language priority ordering replaces "no wave ordering." Languages ship as they clear a readiness gate (content + UI strings + human reviewer), ordered by reachable population.
- **Breadth-first, not depth-first:** The portal reaches 3 billion people with a good experience before reaching 390 million with a perfect experience.
- **Decision audit trail:** Future scope decisions reference this ADR with the specific reach calculation.
- **Data refresh:** At each milestone boundary, verify speaker counts and internet penetration against the latest ITU and DataReportal reports. Update the priority table if any language's reachable population shifts by >10%.

### Limits

This metric does **not** override:
- **Architectural dependencies.** Can't ship languages before the i18n infrastructure exists. Can't ship cross-book search before multiple books are ingested.
- **Content Identity principles.** Never machine-translate sacred text for reach. Never compromise attribution for speed.
- **Accessibility and security.** These are not negotiable regardless of population.
- **Organizational readiness.** Human reviewers for UI translations (FTR-135) must be available. The metric determines *priority*, not *readiness*.

### Audio Equity Note

UNESCO 2024 data reports 739 million adults globally lack basic literacy, with 347 million in Central and Southern Asia — the YSS heartland. For these populations, text-only content provides **no access**, not limited access. YSS currently offers Hindi, Bengali, and other Indic-language *Autobiography of a Yogi* audiobooks.

This ADR recommends that when a language is activated, existing audio content ships alongside text where available — not deferred to a separate media milestone. Audio is an **access modality**, not an enhancement. The availability of existing SRF/YSS audio recordings for each language is a stakeholder question that should be raised at language activation time. For Hindi specifically: if YSS has digital audio files of the Hindi *Autobiography*, basic audio delivery (streaming, chapter-level navigation) should activate with Hindi text — the technical cost is trivial compared to the access equity gained for 347M adults in Central/Southern Asia who lack basic literacy.

### Evaluation Candidates

FTR-058 lists Chinese, Korean, Russian, and Arabic as evaluation candidates beyond the core 10. Applying this framework:

| Language | Speakers | Internet % | Reachable | Barrier |
|----------|----------|------------|-----------|---------|
| Mandarin Chinese | 1,184M | ~78% | ~924M* | *Great Firewall: ICP license + China CDN required. Foreign services blocked/throttled. Freedom House 9/100. Translation availability unconfirmed. |
| Arabic (Standard) | 335M | ~70% (weighted) | ~235M | Zero L1 speakers (Modern Standard). Internet varies: Saudi 99%, Egypt 82%. Complex script. Translation availability unconfirmed. |
| Russian | 253M | ~92% | ~200M | Content restrictions: Freedom House 17/100. Translation availability unconfirmed. |
| Indonesian | 252M | ~75% | ~188M | Not in current evaluation list. Notable omission. Translation availability unconfirmed. |
| Korean | ~80M | ~97% | ~78M | South Korea only. Translation availability unconfirmed. |

*Internet penetration from DataReportal Digital 2025 country reports (January 2025 data). See [language-demographics-sources.md](docs/reference/language-demographics-sources.md) for per-number source traceability.*

Mandarin and Russian warrant investigation when the core 10 languages are stable. Indonesian is a notable omission from the evaluation list — 252M speakers with 75% internet penetration, higher reachable population than Bengali (Tier 2). Arabic reachable (~235M) is larger than Portuguese (Tier 2) — worth investigating if Yogananda translations exist in Arabic.

### YSS-Contributed Languages

Tamil (~85M speakers, ~60% internet, ~51M reachable), Telugu (~96M speakers, ~60% internet, ~58M reachable), and Kannada (~64M speakers, ~60% internet, ~38M reachable) may enter the platform through YSS content partnership (FTR-119), outside SRF's 10-language scope. YSS-published editions carry full lineage authority — Yogananda founded YSS in 1917. By this framework, all three are Tier 2 equivalent (~38M–58M reachable each, comparable to Thai at ~49M or Italian at ~61M). Together they serve ~147M reachable people — more than Portuguese (Tier 2, ~145M reachable).

These languages do not expand SRF's commitment. Each organization determines which languages it surfaces. The platform supports any language where either organization provides authorized content and the language readiness gate (FTR-058) is cleared. See FTR-119.

**Hindi source authorization.** The Hindi deferral (Milestone 5b) was due to ebook purchasing logistics, not content unavailability. YSS has the authorized Hindi *Autobiography*. YSS authorization of the Hindi text for the shared corpus could resolve the source barrier, potentially activating Hindi (~425M reachable) earlier than Milestone 5b. **Conversation sequencing matters:** deliver value first (English search widget for yssofindia.org), ask for content second. See FTR-119 § YSS Value Proposition.

### Consolidated Language Reference

Single sorted table for AI-assisted and human feature ordering. All languages — core, evaluation, and YSS-contributed — in one place, ranked by reachable population.

**Validation methodology:** Numbers below are drawn from two source categories. **Category A** (core 9 + English): sourced from `docs/reference/prioritizing-global-language-rollout.md` (53 citations from Ethnologue 2025, ITU 2025, DataReportal 2026, GSMA, World Bank, UNESCO). **Category B** (evaluation candidates): freshly surveyed from DataReportal Digital 2025 country reports (January 2025 data). **Before making prioritization decisions**, verify Category B numbers against the current DataReportal reports at `datareportal.com/reports/digital-2026-{country}`. Category A numbers should be refreshed at each milestone boundary per FTR-011 § Consequences.

| # | Language | Speakers (L1+L2) | Internet % | Reachable | Tier | Source Status | Activation | Access Barriers | Source |
|---|----------|-----------------|------------|-----------|------|---------------|------------|-----------------|--------|
| — | **English** | 1,528M | ~95% (L1 regions) | ~390M L1 (baseline) | Baseline | Available | M1a | — | A: Ethnologue 2025 |
| \* | **Mandarin Chinese** | 1,184M | ~78% | ~924M\* | Evaluation | Unconfirmed | Unscheduled | \*Great Firewall: ICP license + China CDN required. Foreign services blocked/throttled. Freedom House 9/100. | B: DataReportal 2025 China |
| 1 | **Spanish** | 558M | ~77% | ~430M | Tier 1 | SRF edition available | M1b | — | A |
| 2 | **Hindi** | 609M | ~70% | ~425M | Tier 1 (deferred) | YSS authorization pending | M5b (conditional: M1b) | Romanized input pipeline needed. Authorized source requires YSS conversation. | A |
| \* | **Arabic (MSA)** | 335M | ~70% (weighted) | ~235M | Evaluation | Unconfirmed | Unscheduled | Zero L1 speakers (all use dialect). Internet % varies: Saudi 99%, Egypt 82%. Complex script. | B: DataReportal 2025 Saudi Arabia, Egypt |
| 3 | **Portuguese** | 267M | ~85% | ~225M | Tier 2 | TBD | M5a | — | A |
| \* | **Russian** | 253M | ~92% | ~200M | Evaluation | Unconfirmed | Unscheduled | Content restrictions: Freedom House 17/100. Increasing censorship of foreign services. | B: DataReportal 2025 Russia |
| \* | **Indonesian** | 252M | ~75% | ~188M | Evaluation | Unconfirmed | Unscheduled | Notable omission from core list. | B: DataReportal 2025 Indonesia |
| 4 | **Bengali** | 284M | ~45% | ~130M | Tier 2 | TBD | M5a | Low internet penetration (Bangladesh ~45%, West Bengal similar). | A |
| 5 | **German** | 130M | ~95% | ~123M | Tier 2 | TBD | M5a | — | A |
| 6 | **Japanese** | 125M | ~95% | ~119M | Tier 3 | TBD | M5c | — | A |
| 7 | **French** | 312M | ~37%\*\* | ~116M | Tier 3 | TBD | M5c | \*\*Francophone Africa drags average (~25%). France + Canada >90%. | A |
| \* | **Korean** | ~80M | ~97% | ~78M | Evaluation | Unconfirmed | Unscheduled | South Korea only (North Korea isolated). | B: DataReportal 2025 South Korea |
| 8 | **Italian** | 68M | ~90% | ~61M | Tier 3 | TBD | M5c | — | A |
| † | **Telugu** | ~96M | ~60% | ~58M | Tier 2-eq | YSS (FTR-119) | YSS-contributed | — | A (estimate) |
| † | **Tamil** | ~85M | ~60% | ~51M | Tier 2-eq | YSS (FTR-119) | YSS-contributed | — | A (estimate) |
| 9 | **Thai** | 61M | ~80% | ~49M | Tier 3 | TBD | M5c | Script: no word boundaries, tone marks. | A |
| † | **Kannada** | ~64M | ~60% | ~38M | Tier 2–3-eq | YSS (FTR-119) | YSS-contributed | — | A (estimate) |

**Legend:** Numbered = Core 10 (SRF commitment). \* = Evaluation candidate (not committed). † = YSS-contributed (outside SRF scope, FTR-119). Source A = reference doc (53 citations). Source B = DataReportal 2025 (January 2025 data, freshly surveyed).

**Key observations for feature ordering:**
- Chinese has the largest reachable population but the most severe access barrier (Great Firewall). Effective reach for a Vercel-hosted service is near zero without China-specific infrastructure.
- Hindi and Spanish are near-tied (~425M vs ~430M). Hindi requires YSS authorization; Spanish source is available. Spanish ships first per FTR-011 application protocol.
- Arabic and Russian are evaluation candidates with ~200M+ reachable each — larger than any Tier 2 or 3 committed language. Worth investigating if translations exist.
- Indonesian (~188M reachable) is a notable omission from the evaluation list. Higher reachable population than Bengali (Tier 2).
- YSS-contributed languages together (~147M) exceed Thai + Italian combined (~110M).

**DataReportal verification URLs** (January 2025 data):
- China: `datareportal.com/reports/digital-2025-china` (1.11B users, 78.0%)
- Indonesia: `datareportal.com/reports/digital-2025-indonesia` (212M users, 74.6%)
- Russia: `datareportal.com/reports/digital-2025-russian-federation` (133M users, 92.2%)
- South Korea: `datareportal.com/reports/digital-2025-south-korea` (50.4M users, 97.4%)
- Saudi Arabia: `datareportal.com/reports/digital-2025-saudi-arabia` (33.9M users, 99.0%)
- Egypt: `datareportal.com/reports/digital-2025-egypt` (96.3M users, 81.9%)

**Last verified:** 2026-03-01. Refresh at milestone boundaries. Full source traceability: [docs/reference/language-demographics-sources.md](docs/reference/language-demographics-sources.md).

**Extends:** PRI-05 (Global-First), FTR-058 (Core Language Set), FTR-120 (Book Ingestion Priority)
**Governs:** ROADMAP.md milestone ordering. All future scope prioritization decisions.

*Full demographic analysis: docs/reference/prioritizing-global-language-rollout.md (53 citations: Ethnologue, ITU, UNESCO, DataReportal, GSMA, World Bank). Per-number source traceability and human validation checklist: [docs/reference/language-demographics-sources.md](docs/reference/language-demographics-sources.md).*
