---
ftr: 172
title: "AI Validation Gates"
summary: "AI agents as CI pipeline stages for principles, accessibility, security, and observability validation"
state: proposed
domain: operations
governed-by: [PRI-01, PRI-03, PRI-05, PRI-07, PRI-09, PRI-12]
depends-on: [FTR-168, FTR-171]
re-evaluate-at: M3d boundary
---

# FTR-172: AI Validation Gates

## Rationale

Traditional CI gates (tests pass, lint clean, type check) catch mechanical errors. Agent-built applications need deeper validation: Does this honor PRI-01? Does it work on 2G? Is Sentry properly integrated? Did the agent introduce a new cloud service?

AI validation gates run AI agents as CI pipeline stages. Each gate is an agent with a specific validation role, a model assignment, and pass/fail criteria.

## Specification

### Three-Valued Gate Semantics (Research-Informed)

Temperature=0 doesn't guarantee determinism — batch size variability is the root cause. Binary Pass/Fail is insufficient for AI validation gates. All AI gates use three-valued verdicts:

- **Pass** — Gate condition met with high confidence
- **Fail** — Gate condition violated (blocks promotion)
- **Inconclusive** — Insufficient confidence to determine (triggers human escalation)

**Confidence-triggered re-run:** Each AI gate runs once with structured JSON output and confidence score. If confidence ≥ 0.85, the verdict stands. If confidence < 0.85, the gate runs twice more and majority vote determines the verdict. Any Inconclusive triggers human review. This adaptive approach (inspired by the AgentAssay protocol, arXiv March 2026) reduces average validation calls from 27 to ~12-15 while preserving safety where it matters — on uncertain verdicts. Veto-authority gates (security, accessibility, content integrity, principles) default to triple-run always.

**Hierarchical veto authority:** Security and accessibility gates have absolute veto — they can block promotion regardless of other gate results. This is hierarchical, not democratic. Content fidelity (PRI-01) also has absolute veto.

### Gate Types

**Traditional CI gates:** tests_pass, type_check, lint (pnpm commands)

**AI validation gates:**

| Gate | Agent Role | Model | What It Checks | Veto Authority |
|------|-----------|-------|----------------|----------------|
| principles_alignment | Principles Validator | Opus | PRI-01–12 compliance | Absolute |
| accessibility_audit | Accessibility Auditor | Sonnet | WCAG 2.1 AA, keyboard nav, screen reader | Absolute |
| security_audit | Security Auditor | Sonnet | OWASP top 10, dependency vulnerabilities, secrets | Absolute |
| content_integrity | Content Integrity Auditor | Opus | Verbatim fidelity, attribution completeness | Absolute |
| architecture_coherence | Architecture Reviewer | Sonnet | No new cloud services, pattern consistency, scope | Standard |
| design_system_compliance | Visual Designer | Sonnet | yogananda-design tokens used, no hardcoded values | Standard |
| rural_2g_test | Low-Bandwidth Tester | Sonnet | JS < 100KB, FCP < 1.5s on 3G, progressive enhancement | Standard |
| production_readiness | Production Engineer | Sonnet | Sentry + New Relic instrumented, error boundaries, alerts | Standard |
| database_review | DBA Agent | Sonnet | Schema design, query plans, indexes, monitoring | Standard |

### Security Scanning Every Commit

AI-generated code is measurably worse: 45% OWASP vulnerabilities (Veracode), 1.7x more issues (CodeRabbit), 30% more static analysis warnings (Cursor study), 8x increase in duplicated code (GitClear). The "fix-fix spiral" (agent makes error worse on each iteration) needs hard caps.

**Two tiers of security scanning:**

| Tier | When | What Runs | Cost |
|------|------|-----------|------|
| **Per-commit (lightweight)** | Every agent commit during Build | Traditional tooling: `npm audit`, ESLint security rules, secret detection (gitleaks/trufflehog), SAST (Semgrep). No LLM calls. | Near-zero (CLI tools) |
| **Full AI gate (triple-run)** | Once, during Validate stage | AI Security Auditor (Sonnet × 3 runs): OWASP top 10 review, application-level vulnerability analysis, dependency chain audit | ~3 LLM calls |

The per-commit tier catches mechanical errors immediately (exposed secrets, known vulnerability patterns, banned functions). The AI gate catches semantic vulnerabilities that static tools miss (business logic flaws, authorization gaps, injection via indirect paths). The per-commit tier is free; the AI gate is budgeted within the Validate stage.

- Hard iteration caps: 3-5 fix cycles max before human escalation
- Cascading hallucination is formally documented (OWASP ASI08): errors persist in agent memory and contaminate future reasoning

### Sealed Immutable Content Blocks (PRI-01 Enforcement)

Spiritual passages are architecturally sealed — builder agents place them but cannot modify them. The CMS-locked-content pattern: passages stored as immutable data blocks with cryptographic hashes. Builder agents reference passage IDs; the rendering layer fetches verbatim text at display time. No agent in the pipeline can alter passage content.

**Fixed canonical corpus advantage:** Unlike corporate content that changes constantly, Yogananda's published works are complete and hashable. This makes fidelity verification tractable — every passage has a known-good hash, and any deviation is detectable.

### Unicode Normalization for Indic Scripts

Visually identical Hindi/Tamil/Telugu/Kannada text can have multiple valid byte representations (NFC vs NFD, conjunct ligatures, nukta placement). This breaks hash-based fidelity verification. All content pipelines must normalize to NFC before hashing. Verification must compare normalized forms, not raw bytes. This is a concrete engineering problem that would surface late and painfully without explicit design.

### Observability by Design (Sentry + New Relic)

Every agent-built application receives instrumentation during the build stage:

**Sentry:** Error boundaries on every page, performance monitoring, source maps, release tracking. No session replay (DELTA compliance). Custom context: language, pageType — never userId. **DELTA-specific config:** `send_default_pii=False`, disable browser-side Sentry agents entirely for seeker-facing sites, server-side APM only, strip URL patterns from transaction names.

**New Relic:** Browser agent with SPA monitoring, custom attributes (language, deviceTier, pageType), alert policies (error rate, response time, Apdex), deployment markers. No session trace (DELTA compliance). **DELTA-specific config:** Disable session trace, disable session replay, disable breadcrumb URL capture, self-host all assets (Google Fonts GDPR ruling applies).

The Production Engineer validation gate verifies: `@sentry/nextjs` installed, error boundaries present, `SENTRY_DSN` in env vars, source maps uploaded, New Relic browser agent installed, alert policies configured, distributed tracing enabled, **DELTA compliance verified** (no session replay, no user identity, no behavioral profiling).

### Regression Detection

After each build cycle, a Regression Detector agent compares before/after: test counts, bundle size, Lighthouse scores, accessibility violations, security findings. Blocks promotion if regression detected.

### Adversarial Framing (Merged into Validation)

The validation stage runs with adversarial framing by default — agents actively try to break the output, not just check it. This replaces a separate adversarial phase that would re-run substantially the same agents on the same code.

**How adversarial framing works:** Each validation agent's system prompt includes adversarial instructions alongside its standard checklist. The Security Auditor doesn't just check OWASP — it attempts XSS and injection. The Accessibility Auditor doesn't just run axe-core — it navigates the entire site keyboard-only. The Low-Bandwidth Tester doesn't just measure bundle size — it simulates 2G load. The Content Integrity Auditor doesn't just verify hashes — it searches for paraphrase and omission.

**Adversarial dimensions covered by existing gates:**

| Dimension | Covered By | Adversarial Addition |
|-----------|-----------|---------------------|
| Infrastructure chaos | Production Engineer | "What if Neon/Vercel/DNS fails? Is there graceful degradation?" |
| Content integrity | Content Integrity Auditor | "Search for any paraphrase, omission, or misattribution" |
| Accessibility attack | Accessibility Auditor | "Navigate entire site keyboard-only. Screen reader full audit." |
| Performance sabotage | Low-Bandwidth Tester | "Simulate 2G load test. Find the heaviest page." |
| Security probe | Security Auditor | "Attempt XSS, injection, secret exposure, dependency exploit" |
| Scope verification | Compliance Agent | "Find any unauthorized cloud services, dependencies, or overreach" |

Results compiled into a unified gate report (structured JSON per gate, plus plain-language summary for staff review at promotion decision).

### Gate Execution Order

Veto-authority gates (security, accessibility, content integrity, principles) should run **first**. If a veto gate fails, the remaining standard gates are unnecessary — early termination saves tokens.

**Execution order:**
1. Traditional CI gates (tests, types, lint) — fast, cheap, catch mechanical errors
2. Veto-authority AI gates (security, accessibility, content integrity, principles) — if any fail, stop
3. Standard AI gates (architecture, design system, 2G, production readiness, database) — only if veto gates pass

**Cost implication of adaptive re-run:** Veto gates always triple-run (4 gates × 3 = 12 calls). Standard gates run once unless confidence < 0.85 (5 gates × 1-3 = 5-15 calls). With early termination on veto failure: worst-case 27, typical 15-18, best-case 12 (veto failure stops after veto gates). Budget the validation stage at 27 calls worst-case.

## Edge Cases

**Gate execution:**
- **Triple-run three-way split.** 3 runs produce Pass/Fail/Inconclusive (one of each). Majority vote has no majority. Resolution: any Inconclusive in a three-way split makes the overall verdict Inconclusive (human escalation). Inconclusive is the safe default when the system can't decide.
- **Gate finds issue that another gate should have found.** The Architecture Reviewer flags a security vulnerability that the Security Auditor missed. This is acceptable — overlapping coverage is a feature. But the finding should be tagged with the gate that found it AND the gate that should have found it, enabling gate effectiveness tracking.
- **Content omission vs. content modification.** Sealed immutable blocks prevent content modification, but not content omission. A builder agent could reference a passage ID that doesn't exist, or simply not include a required passage. The Content Integrity Auditor must check for completeness (are all expected passages present?) not just fidelity (are present passages unmodified).

**Build-time concerns:**
- What happens when the database is unreachable? Does the page show a useful error or a blank screen?
- What if Voyage AI embedding API is down during search? Is there a graceful fallback?
- What if a font fails to load? Does text still render in the system font?
- What if JavaScript fails to load entirely? Does the HTML provide a meaningful experience?
- What if the CDN edge cache is stale? How does cache invalidation work?

**Operations concerns:**
- What if Sentry is down? Do errors silently disappear or queue?
- What if New Relic browser agent adds 50ms to page load? Is there a performance budget check?
- What if an experiment's experimental domain gets indexed by search engines despite robots.txt?
- What if a promoted experiment degrades the dev environment's test suite?

**Unaddressed:**
- Cross-experiment interference (two experiments modifying the same shared component)
- Agent model deprecation (what if Claude Sonnet 4.6 is deprecated mid-experiment?)
- Time zone complexity in scheduled notifications and quiet hours
- Accessibility of the ops dashboard itself (staff with disabilities managing experiments)

## Error Cases

- **Gate infrastructure failure during triple-run.** The 2nd of 3 LLM calls fails (API error, timeout). Result: 1 Pass, 1 error, 0 remaining. Resolution: treat API failures as Inconclusive (not as a vote). A 1-Pass/1-Inconclusive result is Inconclusive overall. Retry the failed call once; if it fails again, the gate result is Inconclusive with human escalation.
- **Unicode normalization inconsistency across pipelines.** Content ingestion normalizes to NFC, but an agent-built site loads content via a different code path that skips normalization. Hash mismatch triggers false alarm on content fidelity. Resolution: the Content Integrity Auditor always normalizes before comparing, regardless of source. Never assume upstream normalization.
- **Sealed content block rendering silently drops passage.** The rendering layer encounters an invalid passage ID and renders nothing (no error, no placeholder). The page looks complete but is missing content. Resolution: the Content Integrity Auditor must render every page and compare the visible passage count against the expected count from the content database. Missing passages are a Fail, not just a warning.
- **Security scanning false positives blocking every build.** The security scanner flags a common pattern (e.g., `dangerouslySetInnerHTML` used safely for sanitized content) on every commit. Agents keep "fixing" it, creating the fix-fix spiral. Resolution: security scanning supports an allowlist of known-safe patterns, documented in AGENTS.md. The allowlist is itself audited by the Principles Validator.

## Notes

Full detail: `docs/plans/ftr-168-ai-agent-platform.md` sections 6, 11, 23.

Sentry and New Relic integration patterns with code examples in plan section 23.3-23.4.

Open question: Shared Sentry/NR project with experiment tags during experimentation, or dedicated project/app when promoted to dev? Recommendation: shared during experimentation, dedicated on promotion.

**Research-informed additions (2026-03-18):** Three-valued gate semantics and AgentAssay protocol (both Prompt 1 reports). Hierarchical veto authority (Gemini Prompt 1). Security scanning every commit with hard iteration caps (Veracode 45% OWASP finding, CodeRabbit 1.7x finding). Sealed immutable content blocks (Claude Prompt 2 — CMS-locked-content pattern). Unicode normalization landmine (Claude Prompt 2 — Indic scripts). DELTA-specific Sentry/NR configs (both Prompt 2 reports). Deloitte scandal as cautionary case for doctrinal hallucination (Claude Prompt 2). Automation bias across 35 studies — rubber-stamp approval is statistically predicted (Claude Prompt 2). Amazon Bedrock Automated Reasoning Checks (99% verification accuracy) as potential future tool for content fidelity.

**Revised validation approach (2026-03-18):** Triple-run replaced with confidence-triggered adaptive re-run (veto gates always triple, standard gates re-run only on low confidence). Separate adversarial exercise protocol merged into validation stage with adversarial framing in agent system prompts — one pass with teeth instead of two passes doing substantially the same work. Reduces average validation cost by ~40% while preserving safety on uncertain verdicts.
