---
ftr: 77
title: "The Librarian — AI Search Brand Identity"
summary: "External brand identity positioning the AI as a librarian that finds verbatim words, never generates"
state: approved
domain: editorial
governed-by: [PRI-01, PRI-03]
---

# FTR-077: The Librarian

## Rationale

### Context

FTR-001 establishes "the AI is a librarian, not an oracle" as a fundamental constraint. This is primarily treated as a technical guardrail — the system must never generate, paraphrase, or synthesize Yogananda's words. But in a world where every AI product generates plausible content, the portal's refusal to generate is not just a constraint — it is a radical differentiator.

When a seeker uses ChatGPT, Perplexity, or Google's AI Overview to ask about Yogananda's teachings, they get synthesized summaries that may misrepresent his words. The portal is the only place where the AI system says: "I will show you his actual words, and nothing else."

### Decision

Adopt **"The Librarian"** as the external brand identity for the portal's AI search capability.

**Implementation:**
- The About page (STG-004) explains: "This is not an AI that speaks for the masters. It is a librarian that finds their words for you. Every passage you see is exactly as it was published."
- The `llms.txt` file (STG-004) includes: "This portal uses AI as a librarian, not a content generator. All results are verbatim passages from SRF-published works."
- Stakeholder communications use "The Librarian" language when describing the AI search.
- The search results page may include a subtle footer: "Every passage shown is exactly as published by SRF."

### Rationale

- **Trust-building with the SRF community.** Many SRF devotees are legitimately suspicious of AI involvement with sacred texts. "The Librarian" framing immediately communicates that the AI serves the text, not the other way around.
- **Differentiation.** No competitor offers this guarantee. Google synthesizes. ChatGPT paraphrases. This portal finds. The constraint becomes the value proposition.
- **Theological alignment.** In the guru-disciple tradition, a librarian who faithfully preserves and retrieves the guru's words is a service role. It doesn't claim authority; it facilitates access.

### Consequences

- About page copy includes "The Librarian" explanation (STG-004)
- `llms.txt` includes librarian framing (STG-004)
- No architectural changes — this is branding over an existing technical constraint
- Marketing materials and stakeholder presentations use this language
