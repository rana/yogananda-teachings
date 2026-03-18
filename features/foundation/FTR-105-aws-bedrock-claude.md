---
ftr: 105
title: AWS Bedrock for Claude API Access
summary: "Claude via AWS Bedrock for index-time enrichment only, never in search hot path, never generating content"
state: implemented
domain: foundation
governed-by: [PRI-01, PRI-10]
depends-on: [FTR-001, FTR-113]
---

# FTR-105: AWS Bedrock for Claude API Access

## Rationale

### Context

The portal uses Claude (Anthropic) for several AI-assisted tasks. The question: access Claude via Anthropic's direct API, or via AWS Bedrock?

### Decision

Access Claude exclusively through **AWS Bedrock**. No direct Anthropic API keys.

### Usage Scope

Claude is used **only** for index-time enrichment and offline evaluation — **never in the search hot path** (FTR-027), **never to generate content** (FTR-001).

| Use Case | Model | When | In Search Path? |
|----------|-------|------|-----------------|
| Search quality evaluation | Claude (via Bedrock) | Offline, CI | No |
| Theme tag suggestion | Claude (via Bedrock) | Ingestion time | No |
| Entity extraction | Claude (via Bedrock) | Ingestion time | No |
| Query expansion (HyDE) | Claude (via Bedrock) | Conditional, Milestone 2b+ | Optional (if evaluation warrants) |
| Intent classification | Claude (via Bedrock) | Conditional, Milestone 2b+ | Optional (if evaluation warrants) |
| Contextual label generation | Claude Haiku (via Bedrock) | Ingestion time | No |

### Rationale

- **SRF already has an AWS relationship.** Bedrock uses the existing AWS account, IAM roles, and billing. No new vendor relationship for AI.
- **No separate API key.** Bedrock uses IAM authentication (OIDC from Vercel per FTR-113, IAM role from Lambda). One fewer secret to manage.
- **Data residency.** Bedrock runs in `us-west-2` — same region as Neon and Lambda. No cross-region data transfer. AWS's data handling terms apply (no training on customer data).
- **Model flexibility.** Bedrock provides access to Claude, Amazon Titan, Cohere, and other models. If the portal ever needs a different model for a specific task, it's a configuration change.
- **Cost transparency.** Bedrock usage appears on the same AWS bill. No separate Anthropic invoice.

### Model Selection

The portal uses the smallest Claude model that meets quality requirements for each task:

- **Evaluation and enrichment:** Claude Sonnet (best balance of quality and cost for analytical tasks)
- **Contextual labels:** Claude Haiku (cost-efficient for high-volume labeling)
- **Query expansion (if activated):** Claude Haiku (latency-sensitive, simpler task)

Model IDs are named constants in `/lib/config.ts` (FTR-012) — changing models requires only a config update.

### 1M Context Window Availability (March 2026)

Claude Opus 4.6 (`anthropic.claude-opus-4-6-v1`) and Sonnet 4.6 (`anthropic.claude-sonnet-4-6`) are available on Bedrock with a native 1M-token context window at standard pricing — no beta header, no premium multiplier. Previous models (Sonnet 4.5 and earlier) remain at 200k unless the `context-1m-2025-08-07` beta header is used, with 2x input pricing above 200k tokens.

This does not change the portal's current enrichment architecture. Chunk-level enrichment (FTR-026) remains the correct default — most tasks process individual passages, not books. However, 1M context expands what's feasible for whole-book analysis tasks:

- **E4 (Ingestion QA):** Entire book in a single pass (~100k tokens for AoY) instead of batched chunks — holistic QA across chapter boundaries
- **E6 (Cross-Book Threading):** Two full books in one context for richer relation classification
- **FTR-128 (Structural Enrichment):** Whole-context AI understanding at chapter/book/author scale — the capability this FTR proposed is now GA on Bedrock

**Thinking budget tradeoff:** Extended thinking tokens count against the 1M window. A 100k-token book leaves 900k, but deep Opus reasoning may consume 200k–400k for thinking. Effective usable input context with heavy thinking is ~600k. This is sufficient for any single book in the corpus but relevant for FTR-128's book-perspective enrichment.

**Model migration:** Sonnet 4.6 at $3/MTok with 1M context is the same per-token price as Sonnet 4.5 but with 5x the window — a free capability upgrade. Update `/lib/config.ts` model IDs when migrating enrichment tasks to 4.6. No urgency — current Haiku 4.5 remains appropriate for HyDE and labeling tasks where 1M context is unnecessary.

### Consequences

- `@aws-sdk/client-bedrock-runtime` as project dependency
- All Claude calls go through `/lib/services/ai.ts` — a single service module that abstracts the Bedrock client
- No `ANTHROPIC_API_KEY` anywhere in the system
- Bedrock's `InvokeModel` API is synchronous (request-response); `InvokeModelWithResponseStream` available for streaming if needed
- **Critical constraint:** Claude NEVER generates content that is presented to seekers as Yogananda's words. It finds, ranks, and classifies — it does not create. This is enforced architecturally: Claude's output is passage IDs and metadata, never displayable text.
- **Extends FTR-001** (verbatim fidelity), **FTR-004** (10-year horizon — AWS is Tier 1 infrastructure)
