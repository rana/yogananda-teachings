---
ftr: 171
title: "Agent Role Registry"
summary: "Hierarchical agent teams with versioned prompts, AGENTS.md convention, and role lifecycle"
state: proposed
domain: foundation
governed-by: [PRI-01, PRI-12]
depends-on: [FTR-168, FTR-093, FTR-099]
re-evaluate-at: M3d boundary
---

# FTR-171: Agent Role Registry

## Rationale

The autonomous agent platform needs a comprehensive library of specialized agent roles organized into hierarchical teams. Each role has a system prompt, reading strategy, permitted tools, output contract, and model recommendation. Roles are versioned and auditable.

DeepMind (Dec 2025) shows unstructured multi-agent networks amplify errors up to 17x. Practitioner consensus: 3-7 agents per team, above 7 coordination complexity destroys value. Roles are organized into Plan-Do-Verify control planes, not deployed as a flat network.

## Specification

### Hierarchical Team Structure

Three teams under team leads, plus independent agents with cross-cutting authority:

| Team | Lead | Members (3-5 per stage) | Control Plane |
|------|------|------------------------|---------------|
| **Design** | Design Mediator | Product Designer, Visual Designer, Architect, Content Strategist, Accessibility Designer | Plan |
| **Build** | Lead Engineer | Frontend/Backend/Full-Stack Engineer, DevOps Engineer, Test Engineer | Do |
| **Validate** | Validation Lead | QA Agent, Accessibility Auditor, Security Auditor, Production Engineer, Compliance Agent | Verify |

**Independent agents** (not in teams): Deep Researcher, Domain Expert, Principles Validator (absolute veto authority), Executive Reviewer.

**Key constraint:** No more than 5 agents active simultaneously in any stage. Team leads coordinate their members and produce a single synthesized output for the next stage.

**Not every role activates in every experiment.** The 30+ roles are a registry — a library of capabilities. Each workflow template selects which roles participate. A "Content Site" template might activate 8 roles; a "Full Autonomous Build" activates 15-20. The registry holds the definitions; the workflow (FTR-170) controls activation.

### Role Definitions by Phase

**Research Phase:**

| Role | Focus | Model | When Activated |
|------|-------|-------|----------------|
| Deep Researcher | Survey fields, find gaps, synthesize dual-platform findings | Opus | Research-enabled workflows |
| Domain Expert | Deep knowledge in specific area (SRF history, event logistics) | Opus | Complex or domain-specific experiments |
| Competitive Analyst | Survey similar sites, identify best practices and anti-patterns | Sonnet | New standalone sites |
| Seeker Persona | Inhabit specific seeker perspectives (new visitor, devotee, rural India) | Opus | UX-focused experiments |

**Design Phase:**

| Role | Focus | Model | When Activated |
|------|-------|-------|----------------|
| Product Designer | User stories, information architecture, interaction flows | Opus | All design-enabled workflows |
| Visual Designer | Typography, color, layout, design system compliance | Opus | All design-enabled workflows |
| Architect | System design, data model, API contracts, technology selection | Opus | All design-enabled workflows |
| Content Strategist | Information hierarchy, copy tone, content modeling | Opus | Content-heavy experiments |
| Design Mediator (Lead) | Resolve conflicts between parallel design outputs, produce unified spec | Opus | All design-enabled workflows |
| Accessibility Designer | Inclusive design from first principles (not retrofit) | Opus | All design-enabled workflows |

**Build Phase:**

| Role | Focus | Model | When Activated |
|------|-------|-------|----------------|
| Frontend Engineer | React/Next.js components, CSS, client-side logic | Sonnet | Frontend work |
| Backend Engineer | API routes, database queries, server logic | Sonnet | Backend work |
| Full-Stack Engineer | End-to-end implementation (default for simpler projects) | Sonnet | Simple experiments (replaces FE+BE) |
| DevOps Engineer | CI/CD, deployment config, infrastructure as code | Sonnet | All build workflows |
| Test Engineer | Test generation, coverage analysis, edge case identification | Sonnet | All build workflows |
| Lead Engineer (Lead) | Coordinates build team, resolves technical conflicts | Sonnet | All build workflows |

**Validate Phase:**

| Role | Focus | Model | Veto Authority | When Activated |
|------|-------|-------|----------------|----------------|
| QA Agent | Functional testing, regression detection, edge cases | Sonnet | Standard | All validate workflows |
| Accessibility Auditor | WCAG 2.1 AA compliance, screen reader, keyboard nav | Sonnet | Absolute | All validate workflows |
| Security Auditor | OWASP top 10, dependency vulnerabilities, secrets | Sonnet | Absolute | All validate workflows |
| Compliance Agent | PRI alignment, tech stack limits, no new cloud services | Haiku | Standard | All validate workflows |
| Architecture Reviewer | Pattern consistency, dependency hygiene, scope creep | Sonnet | Standard | All validate workflows |
| Principles Validator | Every output checked against PRI-01-12 | Opus | Absolute | All validate workflows |
| Production Engineer | Instrumentation, telemetry, failure scenarios | Sonnet | Standard | Production-bound experiments |
| Database Administrator | Schema design, query plans, indexes, monitoring | Sonnet | Standard | Database-using experiments |
| Low-Bandwidth Tester | Performance on 2G/3G, bundle budgets, progressive enhancement | Sonnet | Standard | All public-facing experiments |
| Regression Detector | Before/after metrics comparison | Haiku | Standard | Feature additions to existing projects |
| Validation Lead (Lead) | Coordinates validators, produces unified gate report | Sonnet | — | All validate workflows |

**Adversarial Phase (pre-promotion):**

| Role | Focus | Model | When Activated |
|------|-------|-------|----------------|
| Chaos Engineer | Infrastructure failure injection, degradation simulation | Sonnet | Production-bound experiments |
| Performance Saboteur | JS bloat, unoptimized images, N+1 queries, memory leaks | Sonnet | All public-facing experiments |
| Content Integrity Auditor | Orphaned quotes, paraphrase detection, attribution completeness | Opus | Content-displaying experiments |
| Scope Creep Detector | Unauthorized dependencies, feature overreach, cloud service additions | Haiku | All experiments |

**Operations Phase (post-deployment):**

| Role | Focus | Model | When Activated |
|------|-------|-------|----------------|
| Site Reliability Agent | Uptime monitoring, alerting, auto-remediation suggestions | Sonnet | Production deployments |
| Cost Analyst | Token usage, infrastructure cost, optimization suggestions | Haiku | All experiments (post-completion) |
| Stakeholder Communicator | Non-technical summaries, decision points, progress updates | Sonnet | All experiments |
| Executive Reviewer | High-level quality, mission alignment, strategic fit | Opus | Promotion decisions |

### AGENTS.md Convention

Machine-readable coding standards per repo, adopted by 60,000+ open-source projects. Each experiment repo gets an `AGENTS.md` file encoding project conventions that agents read before starting work.

**Schema:**

```markdown
# AGENTS.md

## Project
- Framework: Next.js 15
- Language: TypeScript (strict)
- Design system: yogananda-design (SRF brand)

## Conventions
- Components: `app/components/{feature}/{ComponentName}.tsx`
- API routes: `app/api/v1/{resource}/route.ts`
- Tests: colocated `{ComponentName}.test.tsx`
- CSS: design system tokens only, no hardcoded colors/spacing
- Images: WebP, lazy-loaded, responsive srcset

## Constraints
- No new cloud services without explicit approval
- No client-side JavaScript for core content display (progressive enhancement)
- No behavioral tracking (PRI-09 DELTA compliance)
- All text content via sealed content blocks (never hardcoded strings for teachings)

## Quality Bar
- axe-core: zero violations
- Bundle: < 100KB JS
- FCP: < 1.5s on 3G
- Tests: > 80% coverage for new code
```

**Generated automatically** by the Design Mediator at the end of the Design stage, based on the unified spec. Versioned with the experiment repo. Agents in Build and Validate stages read it as their first action.

### Role Management

- Staff assign roles per workflow stage (sensible defaults pre-selected by template)
- Staff/AI create new roles — provide prompt, reading strategy, tool permissions
- **Permission validation on role creation:** New roles are checked against PRI constraints. A role cannot be created with write access to content databases or permissions that bypass DELTA compliance.
- Preserved library of all roles (active, experimental, retired)
- Cost profiles per role (estimated tokens per invocation, based on historical data)
- A/B testing: same workflow with different role assignments

### Role Versioning

Every role definition is versioned. When a role's system prompt changes:
- Running experiments continue using the version active at experiment creation time
- New experiments use the latest version
- Version history preserved for audit (which version produced which output)
- Rollback mechanism: revert a role to a previous version if quality degrades

### Team Lead Failure Mitigation

Team leads (Design Mediator, Lead Engineer, Validation Lead) are single points of failure. If a team lead produces a bad synthesis, all downstream stages are corrupted.

**Mitigations:**
- Team lead outputs are always included in the human design-approval gate (FTR-170) — the staff member reviews the Design Mediator's unified spec before Build starts
- Validation Lead's unified gate report is reviewed during promotion decision
- Lead Engineer's build output is validated by the entire Validate team (independent of the Build team)
- If a team lead's quality score (from FTR-173 comparative analysis) drops below threshold, the system flags for human review

### New MCP Tools

```
agent_role_list      — Available roles (filterable by phase, team, model)
agent_role_describe  — Role detail (prompt, tools, model, cost profile, version)
agent_role_create    — New custom role (with permission validation)
agent_role_history   — Version history for a role
agent_session_log    — Transcript of agent session
```

### Role Specification Details

Three roles warrant detailed specification as system prompt seed material:

**Production Engineer — Request Lifecycle Instrumentation**

The Production Engineer sees the full latency stack:

```
DNS resolution           →  Route 53 health
TLS handshake            →  ACM certificate validity
Edge CDN                 →  Vercel edge cache hit/miss
Server-side rendering    →  Next.js SSR timing, RSC waterfall
Database queries         →  Neon connection pool, query latency, pg_stat_statements
External API calls       →  Voyage AI embedding latency, Bedrock inference latency
Client hydration         →  JS bundle parse time, hydration duration
User interaction         →  Input latency, search responsiveness
```

Key questions the role asks: Is every component instrumented with Sentry error boundaries? Structured logs with request ID correlation at every boundary? What happens when Neon is slow, Voyage AI times out, Bedrock throttles? Can an operator diagnose a production issue from logs alone? Sentry/NR integration checklists in FTR-172 §23.3–23.4.

**Database Administrator — PostgreSQL Expertise**

Schema review: index coverage for all query patterns (EXPLAIN ANALYZE), FK constraints and cascade behavior, column type optimization (`uuid` vs `text`, `jsonb` vs `json`), partition strategy for large tables.

Runtime health: `pg_stat_user_tables` sequential scan ratios and dead tuple counts, autovacuum configuration and lag, connection pool sizing (Neon-specific serverless scaling), query plan regression via `pg_stat_statements`.

Maintenance protocol: VACUUM ANALYZE scheduling, index bloat detection and REINDEX strategy, statistics target tuning, dead tuple accumulation trending.

Monitoring integration: Neon dashboard metrics via API, `pg_stat_statements` query digest → New Relic custom events, slow query alerts (> P95 threshold), connection count alerts (approaching Neon tier limits).

**Low-Bandwidth Tester — PRI-05 as Validation Practice**

Device tiers:

| Tier | Device | Network | Target |
|------|--------|---------|--------|
| Tier 1 | iPhone 15 / Pixel 8 | 4G/WiFi | Baseline (must be excellent) |
| Tier 2 | Samsung Galaxy A14 | 3G | 70% of Hindi/Spanish audience |
| Tier 3 | Nokia 2.4 / JioPhone | 2G (50kbps) | Rural India, minimum viable |
| Tier 4 | Feature phone browser | GPRS | Aspirational (text-only fallback) |

Measures: JS bundle size (< 100KB per FTR-003), FCP per tier (< 1.5s Tier 1, < 4s Tier 3), TTI per tier, data transferred per page (< 500KB first load), functionality with JS disabled, image optimization (WebP, lazy, srcset), font loading (system fallback, font-display: swap). Testing tools: Playwright with network throttling per tier, Lighthouse CI mobile preset, bundle analysis. Device tiers align with FTR-167 (Performance SLOs).

## Edge Cases

- **Role version drift mid-experiment.** Security Auditor prompt is improved between Build and Validate stages. Mitigation: experiments lock role versions at creation. New versions apply to new experiments only.
- **Team size vs. experiment complexity.** A simple content site doesn't need 5 Design team members. Workflow templates should select 2-3 roles for simple experiments, scaling up only for complex ones. The "max 5 simultaneous" is a ceiling, not a target.
- **Cross-team communication.** The Build team needs to reference Design decisions. The Validate team needs to understand Build choices. Inter-team communication happens via artifacts in the experiment repo (not direct agent-to-agent messaging). This is intentional — artifacts are auditable, messages aren't.

## Error Cases

- **Agent role creation with unsafe permissions.** A staff member (or AI) creates a role with tool permissions that violate PRI constraints — e.g., write access to the content database, ability to disable security gates. Permission validation must reject this at creation time with an explanation of which constraint was violated.
- **Team lead unavailable.** If the LLM API is unavailable or rate-limited when the team lead needs to synthesize, the stage hangs. Durable execution (FTR-170) handles retry. After 3 retries, escalate to human.
- **Role cost explosion.** A role's token usage spikes (e.g., Opus role given a huge context). Per-role token budgets (from cost profiles) act as circuit breakers. Exceeding budget triggers escalation, not silent continuation.

## Notes

Relationship to FTR-099 (Agent Archetypes): FTR-099 defines 9 corpus-focused agent modes for the teachings portal. This FTR defines the broader platform agent roles. FTR-099 agents become consumers of this platform.

Relationship to FTR-177 (Autonomous Skill Ecosystem): FTR-177 defines the skill adaptations and new skills that agents use. This FTR defines the agents themselves. The two are complementary — roles define WHO, skills define HOW.

**Research basis (2026-03-18):** Hierarchical teams (DeepMind 17x error amplification finding), AGENTS.md convention (60K+ open-source projects). The Plan-Do-Verify control plane structure replaces the original flat 30+ role deployment model.
