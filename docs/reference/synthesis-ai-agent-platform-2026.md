# Synthesis: AI Agent Platform Deep Research — Architectural Implications

**Date:** 2026-03-18
**Sources:** 4 deep research reports (Claude + Gemini, 2 prompts each)
**FTRs informed:** FTR-168 through FTR-176

## Reports Synthesized

| Report | Prompt | Key Focus |
|--------|--------|-----------|
| claude-deep-research-agent-orchestration-2026.md | Prompt 1 | 150+ production systems, 8 topics, 6 synthesis decisions |
| gemini-deep-research-agent-orchestration-2026.md | Prompt 1 | 61 citations, 8 topics, emphasis on failure modes and infrastructure governance |
| claude-deep-research-sacred-digital-empowerment-2026.md | Prompt 2 | No precedent for the full vision; Sefaria + Tithe.ly as closest halves |
| gemini-deep-research-sacred-digital-empowerment-2026.md | Prompt 2 | 70 citations, MCP longevity concerns, AI-burnout paradox as blind spot |

---

## Strong Convergences (act on these)

### 1. Restructure 30+ flat roles into hierarchical teams

Both Prompt 1 reports cite the same evidence: DeepMind (Dec 2025) shows unstructured multi-agent networks amplify errors up to 17x. Practitioner consensus: 3-7 agents per team, above 7 coordination complexity destroys value. The "17x error trap" analysis proposes 10 fundamental archetypes organized into Plan-Do-Verify control planes, not 30+ flat roles.

**Architectural change:** 3 team hierarchies (Design, Build, Validate) of 3-5 agents each under team leads, plus an independent validation plane. FTR-171 needs rewriting.

### 2. Non-determinism kills binary CI gates

Temperature=0 doesn't solve it (batch size variability is root cause). Both recommend: triple-run voting, structured JSON output with confidence scores, three-valued verdict (Pass/Fail/Inconclusive). AgentAssay protocol (arXiv, March 2026) formalizes this. Inconclusive triggers human escalation.

**Architectural change:** FTR-172 validation semantics from binary to three-valued. Security and accessibility gates get absolute veto authority (hierarchical, not democratic).

### 3. AI-generated code is measurably worse

45% OWASP vulnerabilities (Veracode). 1.7x more issues (CodeRabbit). 30% more static analysis warnings (Cursor study). 8x increase in duplicated code (GitClear). The "fix-fix spiral" (agent makes error worse on each iteration) needs hard caps.

**Architectural change:** Security scanning on every agent commit (not just validation stage). Hard iteration caps (3-5 cycles max). AGENTS.md convention for machine-readable coding standards.

### 4. AWS Bedrock native cost tracking is insufficient

Aggregated by model and region only. No per-experiment/stage/agent attribution without custom work. Enterprise AI deployments average 340% cost overruns.

**Architectural change:** Gateway layer (LiteLLM/Portkey) between orchestrator and all LLM APIs. Model routing/cascading (40-85% savings). Per-experiment budget circuit breakers. FTR-174 needs this as non-optional infrastructure.

### 5. Context rot is real; JIT skill loading is mandatory

Every model gets worse as input length increases (Chroma Research). Doubling task duration quadruples failure rate (Cognition/Devin). 43 skills pre-loaded = 13K-22K tokens consumed every turn.

**Architectural change:** JIT skill loading (max 3-5 per stage). Progressive disclosure mandatory. Separate sessions per stage validated. FTR-171 skill ecosystem redesign.

### 6. Observability is the weakest link

Automated failure attribution: 53.5% accuracy (ICML 2025). Agents don't throw 500s — they produce confident wrong answers with 200 OK. Fewer than 1 in 3 teams satisfied with agent observability.

**Architectural change:** Output quality evaluation, not just execution success. OpenTelemetry GenAI semantic conventions as foundation. Separate platform monitoring from application monitoring.

### 7. No precedent for the full vision

Both Prompt 2 reports confirm: no religious organization has deployed multi-agent AI for autonomous software delivery. The four-way combination (multi-agent + autonomous building + verbatim fidelity + delivery pipeline) is genuinely unprecedented.

Closest halves: Sefaria (sacred text AI with fidelity constraints) + Tithe.ly (autonomous church app building). Neither combines both.

### 8. Verbatim fidelity is validated as essential

YouVersion CEO: AI misquotes the Bible 15-60% of the time. The organization with the largest religious digital platform (1B+ installs) has refused to deploy AI generation. SRF/YSS's "librarian, not oracle" is not overcautious — it addresses a measured and severe failure rate.

### 9. MCP has strong trajectory but needs fallbacks

Claude Prompt 2: MCP donated to Linux Foundation (Dec 2025), 97M monthly SDK downloads, estimated 85% 10-year survival. Gemini Prompt 2: MCP ignores 40 years of RPC best practices, lacks IDL, has security gaps. Both agree: don't treat MCP as the sole data surface. Maintain REST/GraphQL fallbacks.

### 10. Sentry/New Relic leak user behavior by default

Both Prompt 2 reports provide specific DELTA-compliance configurations. Key: disable browser-side agents entirely for seeker-facing sites. Server-side APM only. Strip URL patterns from transaction names. Disable session replay, session trace, breadcrumb URL capture. Self-host all assets (Google Fonts GDPR ruling).

---

## Key Divergences

### Temporal vs. custom orchestrator

Claude Prompt 1 strongly recommends Temporal (Retool, Snap at scale). Gemini Prompt 1 doesn't name Temporal specifically but recommends "persistent orchestration engine" and discusses LangGraph state machines. Both agree: custom DAG executor is risky.

**Assessment:** Temporal is the stronger choice. It solves mid-stage resume, rate limiting, retry, and circuit breakers. Claude Code SDK sessions run INSIDE Temporal Activities — they're complementary layers, not competing.

### The most dangerous assumption

Claude Prompt 1: AI validation gates behaving deterministically enough for CI.
Gemini Prompt 1: Non-technical staff providing a prompt sufficient for a complete application without intervening oversight.

**Assessment:** Both are valid. Gemini's is more fundamental — if staff can't specify what they want, the entire pipeline burns compute building the wrong thing. This means: mandatory human checkpoint after Design, before Build.

### MCP longevity

Claude Prompt 2: 85% 10-year survival, strong trajectory.
Gemini Prompt 2: Fragile, ignores RPC best practices, may fade.

**Assessment:** The truth is between. MCP will survive as a standard but will evolve significantly. Design for MCP as primary but REST as fallback. Never couple business logic to MCP-specific APIs.

---

## New Findings Not in Our Architecture

### From Prompt 1 reports:

1. **Durable execution engine needed** — Temporal beneath Claude Agent SDK for crash recovery, mid-stage resume, rate limiting
2. **Gateway layer for cost/routing** — LiteLLM/Portkey between orchestrator and all LLM APIs
3. **Lore protocol for enriched git commits** — Structured trailers (intent, constraints, rejected alternatives) in every commit
4. **Infrastructure lifecycle governance** — Automated garbage collection for abandoned experiments' cloud resources
5. **Per-experiment resource isolation** — Bedrock Application Inference Profiles, Neon branches, deployment queue management
6. **AGENTS.md convention** — Machine-readable coding standards per repo (60K+ open-source projects)
7. **Independent technical audit layer** — Sampled quality review by technical humans, not just staff approval
8. **Cascading hallucination is formally documented** — OWASP ASI08: errors persist in agent memory and contaminate future reasoning

### From Prompt 2 reports:

9. **Unicode normalization landmine for Indic scripts** — Visually identical Hindi/Tamil/Telugu text can have multiple valid byte representations, breaking hash-based fidelity verification
10. **Constraint drift detection for values (not accuracy)** — No standard monitoring tools exist for spiritual fidelity drift. Need "constitutional compliance scoring"
11. **AI-burnout paradox** — Supervising AI output may be MORE cognitively exhausting than building manually. Platform could overwhelm contemplative users
12. **Cognitive offloading risk** — Frequent AI tool usage correlates with decreased critical thinking abilities (Gerlich 2025, n=666)
13. **Automation bias documented across 35 peer-reviewed studies** — Rubber-stamp approval is not hypothetical; it is statistically predicted
14. **Architecture-level content separation** — Spiritual passages as sealed, immutable data blocks that builder agents place but cannot modify (CMS-locked-content pattern)
15. **Trust Graduation Framework** — Intern/Junior/Senior/Principal levels for agent autonomy. Content-facing agents permanently locked to "Junior" (human approves all)
16. **The Deloitte scandal as cautionary case** — AI-fabricated references in government reports. Direct parallel to doctrinal hallucination risk
17. **Policy-as-code for constraint durability** — Encode governance rules (verbatim fidelity, calm tech, DELTA) in platform infrastructure, not policy documents, so they survive leadership transitions
18. **Fixed canonical corpus as architectural advantage** — Unlike corporate content that changes constantly, Yogananda's published works are complete and hashable. This makes fidelity verification tractable.

---

## FTR Impact Summary

| FTR | Changes Required |
|-----|-----------------|
| **FTR-168** (Vision) | Add mandatory human checkpoint after Design. Add sampled independent technical audit. Add Trust Graduation Framework. |
| **FTR-169** (Lifecycle) | Adopt Lore protocol for commits. Add infrastructure garbage collection. Add per-experiment resource isolation. |
| **FTR-170** (Workflow) | Add Temporal as durable execution layer. Mandatory design-approval gate before Build. |
| **FTR-171** (Roles) | Restructure 30+ flat → 3 hierarchical teams of 3-5. JIT skill loading (3-5 per stage). AGENTS.md convention. |
| **FTR-172** (Gates) | Three-valued Pass/Fail/Inconclusive. Triple-run voting. Hierarchical veto (security/accessibility absolute). Security scanning every commit. Content fidelity as sealed immutable blocks. |
| **FTR-173** (Comparative) | Model routing/cascading (cheapest effective model). Integrate with gateway layer metrics. |
| **FTR-174** (Glass Box) | Gateway layer (LiteLLM/Portkey) non-optional. Constitutional compliance scoring for values drift. Constraint drift monitoring. |
| **FTR-175** (Research) | No changes — existing design validated. |
| **FTR-176** (Empowerment) | AI-burnout paradox awareness. Promptframes and visual diffs for contemplative review. Cognitive offloading risk mitigation. Template libraries (3.2x more consistent outputs). |

---

## The Temporal Question

**Temporal and Claude Code SDK are complementary, not competing.**

Temporal is a durable workflow execution engine. It orchestrates: "run stage 1, then stage 2, handle retries, resume on crash." Claude Code SDK is the execution substrate: "within stage 2, run this AI agent with these tools." Each DAG stage becomes a Temporal Activity containing a Claude Code SDK session.

This is exactly the pattern Anthropic's own Temporal integration demonstrates. The orchestrator doesn't replace the substrate — it wraps it in crash recovery, state persistence, rate limiting, and circuit breakers that we'd otherwise build from scratch.

However: Temporal is significant infrastructure. Evaluate whether a lighter alternative (Inngest, Hatchet) provides sufficient durability for our scale (10-100 experiments/month, not 10,000).

---

## Open Questions for Future Investigation

1. How to build "constitutional compliance scoring" — drift detection for values, not accuracy?
2. Unicode normalization strategy for Indic script fidelity verification
3. Optimal team size and hierarchy for our specific workflow (prototype needed, not more research)
4. Temporal vs. Inngest vs. Hatchet for durable execution at our scale
5. The AI-burnout paradox: what review interface prevents contemplative users from being overwhelmed?
6. How does the Deloitte scandal pattern map to our specific doctrinal hallucination risk vectors?
