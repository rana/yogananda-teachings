---
ftr: 175
title: "Deep Research Integration"
summary: "Dual-platform deep research (Claude + Gemini) as formal development phase with prompt design"
state: proposed
domain: operations
governed-by: [PRI-12]
depends-on: [FTR-168]
re-evaluate-at: M3d boundary
---

# FTR-175: Deep Research Integration

## Rationale

The portal project has empirically validated dual-platform deep research (Claude + Gemini) with 10+ reference documents. The combination produces richer findings than either platform alone — convergences confirm, divergences reveal gaps. Systematizing this as a formal development phase enables every experiment to benefit.

Claude AI designing the research prompts is essential — empirically validated in this project.

## Specification

### Dual-Platform Research Pipeline

```
Staff topic/question
  → Prompt Designer agent (Opus) crafts optimized prompts for both platforms
  → Claude Deep Research API produces report
  → Gemini Deep Research API produces report
  → Synthesis Agent (Opus) reads both, identifies convergences/divergences/gaps
  → Produces: synthesis document with confidence levels
```

### Claude Code as Research Substrate

The Research Agent runs as a Claude Code SDK session:
1. Reads experiment prompt and context
2. Uses `/explore` to survey existing project knowledge
3. Designs deep research prompts (Opus crafting prompts)
4. Calls Claude/Gemini Deep Research APIs
5. Reads both reports, uses `/compose gaps, crystallize` to synthesize
6. Iterates if gaps found — designs follow-up prompts
7. Writes artifacts to experiment repo

### Research Archival

All research outputs archived in experiment repo (`/.experiment/research/`), following the established `docs/reference/` naming convention for promoted research.

### Designed Prompts (Ready for Submission)

Two comprehensive deep research prompts designed:
- **Prompt 1:** 12 topics on autonomous AI agent orchestration for organizational software delivery
- **Prompt 2:** 8 topics on AI agent platforms for sacred/spiritual organizations

Full prompts in `docs/plans/ftr-168-ai-agent-platform.md` section 22.

## Edge Cases

- **Shared blind spots.** Both Claude and Gemini miss the same thing. The synthesis agent has no way to detect shared omissions. Resolution: the synthesis agent cross-references results against the original prompt's topic list. Any prompt topic with no coverage in either report is flagged as a gap for manual investigation or follow-up research.
- **Divergence on critical point.** Claude says "X is safe," Gemini says "X is dangerous." The synthesis must not average — it must escalate the disagreement with evidence from both sides. Critical divergences are tagged separately from convergences, with a recommended resolution path.
- **Research quantity overwhelming.** A 12-topic prompt produces 50+ pages per platform. The synthesis agent must produce a practical-length synthesis (5-10 pages) without losing critical details. Full reports preserved in experiment repo; synthesis is what downstream stages consume.
- **Research prompt quality variance.** A poorly framed topic produces shallow findings. Resolution: the synthesis agent reviews prompt-to-output quality after reports return and recommends revised prompts for follow-up rounds on thin topics.

## Error Cases

- **Asymmetric API availability.** Claude Deep Research has no API (web-only as of March 2026). Gemini Deep Research is available via the Interactions API (preview, `deep-research-pro-preview-12-2025`). Resolution: automated research uses Gemini API; Claude Deep Research is manual (web) until an API exists. The synthesis handles 1-report automated + 1-report manual, or Gemini-only mode.
- **Deep Research returns fabricated citations.** The synthesis agent spot-checks 3-5 citations per report (verify URL accessibility, check that the cited claim appears at the source). Unverifiable citations flagged as low-confidence.
- **Research cost exceeds experiment budget.** Dual-platform 12-topic research is expensive. Low-budget experiments get single-platform, 3-5 topics. The `cost_forecast` tool (FTR-174) shows research cost estimate before execution.
- **Research findings contradict project principles.** The synthesis agent notes findings but explicitly flags conflicts with PRIs. Research informs; principles decide.

## Notes

Full detail: `docs/plans/ai-agent-platform.md` sections 4, 22.

Prompts designed and submitted (2026-03-18). Full prompts: `docs/reference/deep-research-prompt-agent-orchestration-2026.md` and `docs/reference/deep-research-prompt-sacred-digital-empowerment-2026.md`. Results: 4 reports + synthesis in `docs/reference/`.

**Gemini Deep Research API (confirmed 2026-03-18):** Available via the Interactions API (`deep-research-pro-preview-12-2025`). Runs as background task, polling for results, max 60 minutes (most complete in ~20 min). Supports document upload (PDF, CSV, docs) alongside web data. Structured JSON schema output. Preview status; roadmap includes MCP support and Vertex AI. Docs: `ai.google.dev/gemini-api/docs/deep-research`.

```python
# Minimal integration pattern
from google import genai
client = genai.Client(api_key=GEMINI_API_KEY)
interaction = client.interactions.create(
    input="<research prompt>",
    agent='deep-research-pro-preview-12-2025',
    background=True
)
# Poll until completed
interaction = client.interactions.get(interaction.id)
# interaction.outputs[-1].text contains the report
```

**Anthropic Deep Research API:** No native endpoint as of March 2026. DIY approach possible (web search + fetch + extended thinking). The Research stage can automate Gemini and fall back to manual Claude submission until an API exists.

**Implication for automated research pipeline (Phase 2+):** Gemini API makes single-platform automated research feasible now. Full dual-platform automation requires Claude API. The synthesis agent handles asymmetric input (1 automated + 1 manual, or Gemini-only).
