---
ftr: 135
title: AI-Assisted Translation Workflow
summary: "Claude-drafted UI translations with mandatory human review; sacred text translation prohibited"
state: approved-provisional
domain: experience
governed-by: [PRI-01, PRI-06]
---

# FTR-135: AI-Assisted Translation Workflow

## Rationale

### Context

The portal requires translating ~200–300 UI strings (nav labels, button text, search prompts, error messages, footer links, accessibility labels) into 9 languages. Spanish (Tier 1) is translated in Milestone 2a alongside bilingual content — a seeker reading Spanish content deserves Spanish navigation. Hindi (Tier 1, deferred) is translated when content becomes available. Remaining 7 languages are translated in Milestone 5b. The question: who translates these, and how?

Three categories of translatable content exist in the portal, each with fundamentally different fidelity requirements:

| Category | Examples | AI Translation Acceptable? |
|----------|----------|---------------------------|
| **Yogananda's published text** | Book chapters, quoted passages, passage titles | **Never.** Only official SRF/YSS human translations. |
| **Portal UI chrome** | "Search the teachings," "Go deeper," nav labels, error messages | **As draft only.** Claude generates initial translations; mandatory human review before deployment. |
| **Portal-authored content** | About page copy, theme descriptions, "What Next" bridge text | **As draft only.** Same workflow as UI chrome. |

The distinction is absolute: Yogananda's words are sacred text transmitted through a realized master. The portal's own UI copy is functional prose written by the development team. Different fidelity standards apply.

### Decision

Use **Claude API to generate draft translations** of UI chrome and portal-authored content. Every draft must pass through **mandatory human review** by a reviewer who is:
1. Fluent in the target language
2. Familiar with SRF's devotional register and spiritual terminology
3. Able to distinguish clinical/formal tone from warm, devotional tone

**Never use AI (Claude or any other model) to translate, paraphrase, or synthesize any SRF-published author's text.** This applies to all three author tiers (FTR-001: guru, president, monastic). This is an inviolable constraint, not a cost optimization to revisit later.

### Workflow

```
messages/en.json (source of truth)
 │
 ▼
 Claude API draft
 (system prompt enforces SRF tone,
 spiritual terminology glossary,
 target locale context)
 │
 ▼
 messages/{locale}.draft.json
 │
 ▼
 Human reviewer (fluent + SRF-aware)
 — Corrects tone and nuance
 — Validates spiritual terms
 — Flags ambiguous strings
 │
 ▼
 messages/{locale}.json (production)
```

### Translation Prompt Guidelines

The Claude system prompt for UI translation should include:
- SRF's spiritual terminology glossary (e.g., "Self-realization," "Kriya Yoga," "divine consciousness" — these may remain untranslated or have specific approved translations per language)
- Instruction to preserve the warm, devotional tone — avoid clinical or corporate phrasing
- Context for each string (where it appears, what it does) so the translation fits the UI context
- Instruction to flag uncertainty rather than guess (e.g., mark `[REVIEW]` when unsure)
- ICU MessageFormat awareness — interpolated strings (`{count} results found`) require correct grammar for the target language's number/gender agreement

### Translation Automation

**Why Claude over DeepL/Google.** The bottleneck for spiritual UI text isn't vocabulary accuracy — it's *devotional register*. "Search the teachings" should feel like an invitation from a friend, not a software prompt. Claude can absorb the full glossary, tone guidance, and per-string context simultaneously. No other service processes all four inputs in a single call. DeepL produces accurate words in the wrong voice; Claude produces the right voice that needs minor corrections.

**Script:** `scripts/translate-ui.ts` — runs on-demand (not CI-integrated). Reads `messages/en.json`, diffs against existing `messages/{locale}.json`, loads `messages/glossary-{locale}.json` and `messages/en.context.json`, sends new/changed keys to Claude API (via AWS Bedrock), writes `messages/{locale}.draft.json`. Logs which strings were flagged `[REVIEW]`.

**String context file:** `messages/en.context.json` — parallel to `en.json`, maps each key to a one-line description of where it appears and what it does. Version-controlled. Example:

```json
{
  "search.placeholder": "Search input placeholder on the main search page",
  "search.noResults": "Shown when search returns zero results, below the search box",
  "nav.books": "Top navigation bar link to the Books listing page",
  "quiet.timerStart": "Button label to begin the Quiet Corner meditation timer"
}
```

**Glossary bootstrap (Milestone 2a).** `glossary-hi.json` and `glossary-es.json` seeded from: (1) existing YSS Hindi publications for approved Hindi spiritual terminology, (2) existing SRF Spanish publications for approved Spanish spiritual terminology, (3) Sanskrit proper nouns that remain untranslated (Kriya Yoga, samadhi, pranayama). The glossary is the most important artifact — it's what makes Claude's output devotionally correct rather than merely linguistically correct. Built before any translation runs.

**Reviewer recruitment.** The human review dependency is the actual bottleneck — not the technology. YSS (Yogoda Satsanga Society of India) has Hindi speakers. SRF has Spanish-speaking monastics and members across Latin America. Identifying reviewers is a stakeholder question that should be resolved early in Milestone 2a.

### Rationale

- **Cost efficiency.** Professional translation of 300 strings × 8 languages = 2,400 translation units. AI drafting reduces this to a review task rather than a from-scratch task, cutting cost and time significantly.
- **Quality floor.** Claude produces competent translations in all core languages (es, de, fr, it, pt, ja, th, hi, bn). The human reviewer elevates from competent to appropriate — catching tone, register, and spiritual terminology issues.
- **Sacred text boundary is absolute.** No amount of cost savings justifies AI-translating any SRF-published author's words (FTR-001: all author tiers). The portal serves *official SRF/YSS translations* or nothing. This is a theological constraint, not a technical one.
- **Scalable.** As new languages are added beyond the core set, the same workflow applies — Claude draft → human review. No need to find full professional translation services for each new locale.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Professional translation only** | Highest quality from day one | Expensive for UI strings that change often; slow turnaround for iterative development |
| **AI translation with no review** | Cheapest, fastest | Unacceptable risk of clinical tone, wrong spiritual terms, or culturally inappropriate phrasing |
| **Community/volunteer translation** | Free, deeply motivated translators | Unpredictable quality and timeline; coordination overhead; IP/liability concerns |

### Spiritual Terminology Glossary

The glossary is a critical dependency for both the AI drafting step and the human review step. It defines how spiritual terms are handled per language — which terms remain in Sanskrit, which have approved translations, and which are transliterated.

**Storage:** A JSONB column in Neon, stored as a per-language glossary file at `/messages/glossary-{locale}.json`. This is a content-editor-centric artifact — maintained alongside the locale JSON files, version-controlled in Git, and eventually migrated to Contentful when Custom Apps are activated.

**Structure:**

```json
// messages/glossary-de.json
{
 "terms": [
 {
 "english": "Self-realization",
 "translated": "Selbstverwirklichung",
 "notes": "Standard German spiritual term. Always capitalized."
 },
 {
 "english": "Kriya Yoga",
 "translated": "Kriya Yoga",
 "notes": "Never translated. Proper noun."
 },
 {
 "english": "samadhi",
 "translated": "Samadhi",
 "notes": "Keep Sanskrit. German readers familiar with the term. Also found as 'Überbewusstsein' in some older translations."
 }
 ],
 "tone_guidance": "Warm, devotional, not academic. 'Sie' form (formal). Avoid clinical psychological vocabulary."
}
```

**Workflow:** The glossary is built incrementally during the first human review cycle for each language. The reviewer flags terms, provides translations, and adds notes. Subsequent review cycles and AI drafting both reference the glossary. The Claude system prompt for UI translation includes the glossary to improve first-draft quality.

**Migration path:** When Contentful Custom Apps are activated, glossaries can be modeled as a Contentful content type with per-locale entries, enabling content editors to manage terminology without touching JSON files.

### Consequences

- Milestone 2a (hi/es) and Milestone 5b (remaining 7 languages) use AI-assisted workflow: Claude draft → human review → production
- Spiritual terminology glossary stored as `/messages/glossary-{locale}.json` — built incrementally during first review cycle, referenced by both AI drafting and human review
- The `messages/{locale}.draft.json` → `messages/{locale}.json` promotion step should be tracked (Git diff review)
- Reviewer recruitment: SRF likely has multilingual monastics and volunteers who can review UI translations — this is a stakeholder question
- The same workflow applies to portal-authored content (About page, theme descriptions, "Seeking..." entry points, etc.)
- Glossary files migrate to Contentful content types when Contentful Custom Apps are activated


## Notes

FTR-076 (editorial domain) was a byte-for-byte duplicate of this file — absorbed here. Experience domain is the natural home: this spec governs the translation workflow from the seeker/UI perspective (locale files, UI strings, glossary artifacts). Editorial staff are users of the workflow, not its architectural owner.

Migrated from DES-017 per FTR-084.
