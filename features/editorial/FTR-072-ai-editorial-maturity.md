---
ftr: 72
title: "AI Editorial Workflow Maturity — Trust Graduation and Feedback Loops"
summary: "Three-stage maturity model (full review, spot-check, exception-only) with governed graduation criteria"
state: approved-provisional
domain: editorial
governed-by: [PRI-01, PRI-12]
depends-on: [FTR-069]
---

# FTR-072: AI Editorial Workflow Maturity

## Rationale

### Context

FTR-069 catalogs 25+ AI-assisted editorial workflows, all governed by the principle "AI proposes, humans approve." This principle is correct as a starting posture but incomplete as a 10-year operating model. The portal's monastic content editor has a 2–3 hour daily window for editorial work. As the corpus grows from 1 book (STG-001) to 15+ books plus video, audio, images, magazine archives, and community submissions (Milestone 7b+), the total review volume grows multiplicatively — more content types × more workflows × more languages.

The current design implicitly assumes review demand will stay within human capacity. It won't. By STG-009, the editorial team will be managing theme tag reviews, tone spot-checks, daily passage curation, translation reviews, feedback triage, social media approvals, reverse bibliography verification, and editorial thread curation. Without a governed mechanism for evolving the AI-human relationship over time, one of three things happens: (a) review queues grow unbounded, (b) reviewers rubber-stamp to keep pace, or (c) the team informally skips reviews for "trusted" workflows — losing the audit trail that makes the system trustworthy.

Additionally, FTR-069 describes a stateless relationship between AI and editors. Each AI proposal starts fresh. When the theological reviewer consistently selects Option 2 over Option 1 for Christian contemplative pathways, or when a theme tag reviewer rejects "Joy" classifications for passages about sacrifice, that accumulated editorial judgment never flows back to improve the AI's proposals. Over a decade, this is a significant waste of editorial attention.

### Decision

#### 1. Three-Stage Workflow Maturity Model

Every AI-assisted workflow in FTR-069 operates at one of three maturity stages. Stage transitions are governed, auditable, and reversible.

| Stage | AI Role | Human Role | Entry Criteria |
|---|---|---|---|
| **Full Review** | Proposes | Approves every item | Default for all new workflows |
| **Spot-Check** | Proposes and applies provisionally | Reviews random sample (10–20%) + all AI-flagged exceptions | ≥ 500 items reviewed at Full Review with ≥ 95% approval rate, ≥ 3 months of operation, theological reviewer sign-off |
| **Exception-Only** | Applies autonomously | Reviews only items where AI confidence < threshold or AI explicitly abstains | ≥ 2,000 items at Spot-Check with ≥ 98% sample-approval rate, ≥ 6 months at Spot-Check, no theological errors in audit period, portal coordinator sign-off |

**Stage transitions are per-workflow, per-language.** Theme tag classification may reach Spot-Check in English while remaining at Full Review in Hindi. Tone classification may reach Exception-Only while worldview pathway generation permanently stays at Full Review.

**Certain workflows never graduate beyond Full Review:**
- Worldview guide pathway generation (theological sensitivity)
- Life-phase pathway generation (theological sensitivity)
- Community collection pre-review (final approval is inherently human)
- Crisis language detection (safety-critical)

**Regression:** Any theological error, citation error affecting a published passage, or pattern of reviewer overrides (> 15% in a 30-day window) triggers automatic regression to the previous stage. The regression is logged, the prompt is reviewed, and re-graduation requires meeting the original criteria again.

#### 2. Feedback Loop Protocol

Reviewer corrections systematically refine AI proposals over time through three mechanisms:

**a. Override tracking.** Every reviewer action (approve, reject, edit, select alternative) is logged in an `ai_review_log` table with the workflow type, AI's proposal, reviewer's decision, and reviewer's rationale (optional free text). This table is internal — never exposed to seekers, never used for analytics.

**b. Prompt refinement cadence.** Quarterly, the portal coordinator reviews override patterns per workflow:
- Workflows with > 10% override rate: prompt revision required
- Workflows with consistent override patterns (e.g., "always rejects 'Joy' for passages about sacrifice"): add the pattern as a negative example in the prompt
- The refined prompt is versioned and the previous version archived

**c. Confidence calibration.** AI confidence scores are compared against actual approval rates. If the AI is consistently confident about proposals that get rejected, the confidence threshold for Spot-Check routing is raised. If the AI is consistently uncertain about proposals that get approved, the threshold is lowered. Calibration is reviewed quarterly alongside prompt refinement.

#### 3. AI Abstention Protocol

The AI can decline to propose when it recognizes insufficient signal. Abstention routes the item directly to human review without an AI pre-classification, avoiding the anchoring bias of a low-quality proposal.

Abstention triggers:
- Passage in a script the model cannot reliably process (e.g., Devanāgarī-heavy passages for tone classification)
- Fewer than 3 corpus passages available for a pathway generation slot
- Confidence score below a per-workflow floor (set during Full Review stage based on observed accuracy)
- Content that falls outside the model's training distribution (e.g., a community collection mixing prose and chant in a way the classifier hasn't seen)

When the AI abstains, the review queue item is marked `ai_abstained = true` with a brief explanation ("Insufficient corpus coverage for Sufi poetry pathway — only 2 relevant passages found"). The reviewer sees no AI proposal, only the raw content and the abstention reason. Abstention rates are tracked per workflow as a health metric.

#### 4. Cross-Workflow Consistency Checks

AI-assisted workflows operate on shared content but independently. A passage can be tagged "joyful" by tone classification, placed in a "Grief & Loss" guide pathway, and classified as "consoling" by the daily passage curator — each correct in context but potentially contradictory.

A nightly batch job runs consistency checks across workflow outputs:
- Tone classification vs. theme tag alignment (flag passages where tone and theme are semantically opposed)
- Guide pathway passage selection vs. accessibility rating (flag deep passages in newcomer pathways)
- Daily passage tone sequence vs. calendar events (flag challenging passages on consoling calendar dates)
- Theme tag vs. editorial thread placement (flag passages tagged "Peace" placed in a "Courage" thread)

Inconsistencies are surfaced in the editorial home screen as a low-priority review category. They are not errors — context legitimately changes meaning. But persistent inconsistencies suggest a classification problem worth investigating.

**Milestone:** 3b (consistency checks). Quarterly cadence begins STG-007. Maturity model governance begins STG-007 for theme tag classification (first workflow to reach Full Review volume). Feedback loop protocol begins STG-001 (override logging from the first AI-assisted search).

#### 5. Workflow Dependency Awareness

FTR-069 workflows have implicit dependencies that affect consistency when upstream outputs change:

```
Ingestion QA ──► Theme Tag Classification ──► Worldview Pathway Generation
                                           ──► Daily Passage Pre-Curation
                 Tone Classification ──────► Daily Passage Pre-Curation
                 External Ref Extraction ──► Worldview Pathway Generation
                 Feedback Categorization ──► Content Correction (FTR-068)
```

When an upstream workflow's output changes (e.g., an OCR correction alters passage text, or a theme tag is reclassified), downstream workflows that consumed the old output are flagged for re-evaluation. This is not automatic re-execution — it's a staleness signal in the editorial queue: "This passage's theme tags changed since it was included in the Christmas pathway. Review recommended."

### Rationale

- **"AI proposes, humans approve" remains the governing principle.** The maturity model doesn't replace it — it operationalizes it for a decade of growth. Full Review is the permanent default. Graduation is earned, governed, and reversible.
- **Editorial attention is the scarcest resource.** The monastic editor's 2–3 hour daily window is finite. The maturity model preserves that attention for the workflows that need it most, rather than spreading it uniformly across workflows of vastly different sensitivity.
- **Trust without audit is not trust.** Informal "we stopped reviewing tone tags because they're always right" is a liability. Governed stage transitions with documented criteria preserve institutional confidence across staff turnovers.
- **The AI should get better at its job.** A librarian's assistant who never learns from corrections is a poor assistant. The feedback loop doesn't change the model — it refines the prompts, thresholds, and routing rules that shape how the model is used.
- **Abstention is a feature, not a failure.** An AI that says "I can't help here" is more trustworthy than one that always produces an answer. The abstention protocol makes the AI's limitations visible rather than hidden behind low-confidence proposals.

### Consequences

- `ai_review_log` table added to schema (STG-001 — logging begins with the first AI-assisted workflow)
- `ai_abstained` boolean column added to review queue items (STG-001)
- Quarterly prompt refinement cadence added to operational playbook (STG-007)
- Maturity stage tracked per workflow per language in `ai_workflow_config` table (STG-007)
- Nightly consistency check batch job (STG-008, runs alongside existing nightly jobs)
- Workflow dependency graph documented in FTR-069 and maintained as workflows are added
- New open question: editorial capacity modeling — projected review hours per milestone (added to CONTEXT.md)
- FTR-069 updated with new subsections: Feedback Loop Protocol, AI Observes pattern, AI Abstains protocol, Workflow Dependency Graph, Unified Prompt Versioning
