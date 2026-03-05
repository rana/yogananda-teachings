## DES-062: Cognitive Task Classification (COG-NN)

A framework for matching AI model capability to task cognitive demand. Every AI operation in the system has a cognitive level and a latency context. Together they determine the model.

### Cognitive Levels

| Level | Name | Nature | Signal |
|-------|------|--------|--------|
| **COG-1** | Mechanical | Pattern matching, format transformation, validation | The task has a deterministic correct answer |
| **COG-2** | Interpretive | Intent understanding, structured extraction, summarization | The task requires understanding meaning but has constrained output |
| **COG-3** | Evaluative | Aesthetic judgment, quality assessment, relational reasoning | The task requires weighing competing interpretations |
| **COG-4** | Generative | Novel insight, creative composition, architectural reasoning | The task requires synthesis across domains or creation of new structure |

**The signal column is the decision heuristic.** When classifying a new task, ask: does it have a deterministic answer (COG-1), a constrained-meaning answer (COG-2), a judgment-requiring answer (COG-3), or does it require novel synthesis (COG-4)?

### Latency Contexts

| Context | Nature | Constraint | When |
|---------|--------|-----------|------|
| **Sync** | User is waiting | < 2 seconds | Search, navigation, real-time UI |
| **Batch** | Pipeline processing | Quality > speed, cost-aware | Ingestion, enrichment, classification |
| **Interactive** | Human-in-the-loop | Responsive but thoughtful | Editorial review, content assist |

### The Model Matrix

| Level | Sync | Batch | Interactive |
|-------|------|-------|-------------|
| COG-1 | Haiku | Haiku | Haiku |
| COG-2 | Haiku | Sonnet | Sonnet |
| COG-3 | Sonnet | **Opus** | Sonnet |
| COG-4 | **Opus** | **Opus** | **Opus** |

Read the matrix as: *cognitive demand determines the minimum capable model; latency context may downgrade the choice.* Sync context applies downward pressure (speed); batch context applies upward pressure (quality).

### Two Domains

The framework classifies two distinct domains of AI work:

1. **Product operations** — AI tasks the system performs at runtime or ingestion time. These are embedded in scripts and services. The model is a constant in code.

2. **Agent operations** — AI tasks performed by autonomous agents (Claude Code, Cursor, Copilot) building and maintaining the system itself. The model is selected by the agent platform or the human configuring it.

The same cognitive levels and latency contexts apply to both domains. The difference is who invokes the work and where the model choice is made.

### Product Task Registry

| Task | Script / Location | COG | Context | Model | Rationale |
|------|-------------------|-----|---------|-------|-----------|
| Rasa classification | `classify-rasa.ts` | COG-3 | Batch | Opus | Aesthetic judgment across five experiential qualities |
| Relation labeling | `generate-labels.ts` | COG-3 | Batch | Opus | Evocative labels require weighing connection quality |
| Vision extraction | `extract.ts` | COG-4 | Batch | Opus (vision) | Reading complex page layouts, preserving formatting |
| Search intent | `lib/services/search.ts` | COG-2 | Sync | Haiku | Classify query type from constrained set |
| Query expansion | `lib/services/search.ts` | COG-2 | Sync | Haiku | Generate synonyms and related terms |
| HyDE generation | `lib/config.ts` | COG-2 | Sync | Haiku | Generate hypothetical passage for embedding |
| Passage ranking | `lib/services/search.ts` | COG-2 | Sync | Haiku | Rerank results against query |
| Content QA | future | COG-3 | Interactive | Sonnet | Verify extraction accuracy, flag issues |
| Theme extraction | future | COG-3 | Batch | Opus | Identify teaching themes across chapters |
| Cross-reference | future | COG-3 | Batch | Opus | Find meaningful connections between passages |

### Agent Task Registry

| Task | Nature | COG | Context | Model | Rationale |
|------|--------|-----|---------|-------|-----------|
| File search, grep, navigation | Deterministic lookup | COG-1 | Sync | Haiku | Pattern matching with known targets |
| Code formatting, linting fixes | Format transformation | COG-1 | Sync | Haiku | Deterministic correct output |
| Bug fix (localized) | Constrained interpretation | COG-2 | Interactive | Sonnet | Understand intent, modify bounded scope |
| Code review, PR assessment | Quality judgment | COG-3 | Interactive | Sonnet | Weigh competing concerns (readability, performance, correctness) |
| Prompt engineering | Creative composition with depth | COG-4 | Batch | **Opus** | Synthesis across domains — language, psychology, task structure, evaluation criteria |
| Architecture design | Novel structural reasoning | COG-4 | Batch | **Opus** | Cross-domain synthesis — data flow, user experience, performance, maintainability |
| Large-context codebase work | Holistic system reasoning | COG-4 | Interactive | **Opus** | Maintaining coherence across hundreds of files and decisions |
| Design system authorship | Aesthetic + structural reasoning | COG-4 | Interactive | **Opus** | Synthesis of visual theory, cultural context, technical constraint, accessibility |
| Pipeline orchestration | Multi-step judgment chain | COG-3 | Batch | **Opus** | Each step's output shapes the next; errors compound |
| Document authorship (DES, ADR) | Principled articulation | COG-4 | Batch | **Opus** | Distilling architectural intent into governing language |

**Key observation:** Most agent work that matters is COG-3 or COG-4. The mechanical tasks (COG-1, COG-2) are the scaffolding between the decisions. This is why autonomous agent platforms default to the strongest available model — the cognitive floor for useful agent work is higher than for product operations.

**The prompt engineering case deserves emphasis.** A well-crafted prompt is a COG-4 artifact: it synthesizes understanding of the task domain, the model's reasoning patterns, the output format constraints, the failure modes, and the evaluation criteria. The `CLASSIFICATION_PROMPT` in `classify-rasa.ts` is as much a design artifact as any token in the design system. Under-powering the agent that *writes* prompts produces prompts that under-power the model that *executes* them — a compounding loss.

### Usage in Code

Annotate model constants with COG level and context:

```typescript
// COG-2 Sync → Haiku (search-time intent classification)
export const SEARCH_MODEL = "us.anthropic.claude-haiku-4-5-20251001-v1:0";

// COG-3 Batch → Opus (aesthetic judgment)
const CLASSIFICATION_MODEL = "claude-opus-4-6";
```

### Model Evolution

When new Claude models release:
1. Re-evaluate the matrix — a faster Opus may absorb Sonnet's sync column
2. Re-evaluate COG-2 Sync — a cheaper Sonnet may replace Haiku for search-time tasks
3. The COG levels themselves are stable; the model assignments shift with the frontier

### Governing Principle

The matrix encodes a single principle: **use the minimum model that preserves the cognitive fidelity the task requires, within the latency constraint.**

This prevents two failure modes:
- **Under-powering:** Using Haiku for aesthetic judgment produces shallow, inconsistent results
- **Over-powering:** Using Opus for format transformation wastes cost and latency with no quality gain

### Related Documents

- **DES-061** — Epistemic data boundary (where AI-derived data lives)
- **ADR-085** — Book ingestion pipeline (task assignments reference COG levels)
- **DES-039** — Infrastructure and deployment (model provisioning via Bedrock)
