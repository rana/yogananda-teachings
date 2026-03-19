---
ftr: 7
title: "Curation as Interpretation — The Fidelity Boundary and Editorial Proximity Standard"
summary: "Four curation mitigations and unified editorial proximity standard for portal prose near sacred text"
state: approved-foundational
domain: foundation
governed-by: [PRI-01, PRI-02, PRI-03]
always-load: true
---

# FTR-007: Curation as Interpretation

## Rationale

- **Date:** 2026-02-21
- **Relates to:** FTR-001, FTR-154, FTR-121, FTR-005, FTR-063, FTR-065, FTR-143, FTR-029, FTR-051, FTR-143, FTR-056, FTR-142

### Context

FTR-001 established the foundational constraint: the portal displays only the verbatim published words of SRF-published authors and never generates, paraphrases, or synthesizes content. This applies to all three author tiers (FTR-001: guru, president, monastic). The constraint is architecturally enforced (JSON-only AI output, human review gates, content integrity hashing) and has been consistently applied across all subsequent ADRs.

However, as the portal's feature surface has grown — editorial reading threads (FTR-063), theme classification (FTR-121), daily passage selection, calendar-aware surfacing (FTR-065), search suggestions with vocabulary bridging (FTR-029), community collections (FTR-143), the `/guide` page (FTR-056), and chant metadata (FTR-142) — two gaps have emerged:

1. **Curation as interpretation.** Every act of selecting, ranking, grouping, or sequencing passages is an interpretive act, even when the passages themselves are verbatim. The design mitigates this per-feature but has never named the tension explicitly as an architectural principle. Without a named principle, each new feature re-invents its own fidelity boundary rather than inheriting a shared standard.

2. **Editorial proximity.** Multiple features place portal-authored prose (editorial notes, glossary definitions, search hints, crisis resources, social captions, magazine articles, chant instructions) within visual proximity of sacred text. Each feature's ADR specifies its own separation rules, but no unified standard governs the shared boundary between Yogananda's words and the portal's voice. This risks inconsistency as features accumulate.

### Decision

1. **Name the tension.** The portal formally recognizes that **curation is a form of interpretation** — selection, ranking, theming, and sequencing shape how seekers encounter the teachings, even when the text is unaltered. This is a permanent and productive tension, not a problem to eliminate. The discipline is to curate *honestly*: selecting without distorting, arranging without editorializing, surfacing without implying that the unsurfaced is less important.

2. **Establish curation mitigations as a named pattern.** All curatorial features must satisfy four conditions:
 - **Corpus-derived, not behavior-derived.** Curation algorithms draw from the text itself (embeddings, extracted vocabulary, editorial taxonomy), never from user engagement patterns.
 - **Human review at every gate.** No curatorial decision reaches seekers without human verification.
 - **Transparent framing.** The selection mechanism (a theme label, a date, a search query, a curator name) is visible to the seeker, not hidden behind an opaque algorithm.
 - **Context always available.** Every curated passage links to its full chapter context via "Read in context."

3. **Establish the Editorial Proximity Standard.** The Editorial Proximity Standard (this section) defines unified visual and structural rules for how portal-authored prose (not from any SRF-published author) behaves when it appears near sacred text. The standard governs: visual typography (Merriweather for SRF-published author text across all author tiers, Open Sans for editorial/functional prose), structural separation (`<article>`/`<section>` boundaries), attribution requirements including full author name (FTR-001), accessibility announcements, and a maximum editorial-to-sacred-text content ratio.

### Alternatives Considered

1. **Continue per-feature fidelity rules.** Each ADR already specifies its own boundary mechanisms. This works but creates drift risk as the feature count grows. A maintainer adding a new feature in year 5 would need to survey a dozen ADRs to understand the pattern, rather than inheriting a single standard.

2. **Prohibit all non-Yogananda prose near sacred text.** This would eliminate the proximity problem entirely but would also eliminate editorial reading threads, glossary definitions, the `/guide` page, and crisis resources — features that serve seekers by providing context without altering content.

3. **Create a runtime content-type enforcement layer.** A technical system that tags every rendered element as "sacred" or "editorial" and enforces separation rules via CSS/HTML validation. Architecturally sound but premature for the initial stage — the standard should be a design principle first and a technical enforcement later if drift is observed.

### Consequences

- New subsection "Curation as Interpretation: The Fidelity Boundary" added to CONTEXT.md § Theological and Ethical Constraints. This elevates an implicit understanding to an explicit design principle.
- New cross-cutting section "Editorial Proximity Standard" added to the relevant FTR files, governing all features that place portal prose near sacred text. Component developers implementing any governed feature (search results, reading threads, glossary, daily email, social media, magazine, `/guide`, crisis resources, study workspace, chant reader, community collections) must follow the standard.
- Three new open questions added to CONTEXT.md: edition variance policy, spiritual terminology bridge governance, and fidelity re-validation cadence.
- Future ADRs introducing features that curate or frame sacred text must reference this feature and specify which Editorial Proximity Standard rules apply.
- The CLAUDE.md maintenance table should include "editorial proximity" alongside multilingual, accessibility, and DELTA as a cross-cutting concern.

## Specification

> **Scope:** Cross-cutting — applies to all stages that place non-Yogananda prose near sacred text.

Multiple features place portal-authored prose within visual proximity of Yogananda's verbatim text: editorial reading threads (FTR-063), glossary definitions, search suggestion hints (FTR-029), crisis resource text (FTR-051), social media captions (FTR-154), magazine articles, the `/guide` page (FTR-056), and chant instructions metadata (FTR-142). Each feature has its own ADR, but no single standard governs the shared boundary. This section establishes one.

### The Principle

Yogananda's verbatim words and portal-authored prose occupy **distinct visual and structural layers**. A seeker should never need to wonder whether they are reading Yogananda or the portal. The distinction must be evident to sighted users, screen reader users, and users of any assistive technology.

### Visual Rules

| Element | Treatment |
|---------|-----------|
| **Yogananda's verbatim text** | Merriweather serif, standard body size, warm cream background. The default. |
| **Citations** (book, chapter, page) | Lora italic, smaller size, SRF Navy. Visually subordinate, never omitted. |
| **Editorial prose** (thread notes, glossary definitions, `/guide` introductions, magazine articles) | Open Sans, slightly smaller size, left border accent (SRF Gold, 2px). Clearly portal voice. |
| **Functional prose** (search hints, UI chrome, empty states, ARIA labels) | Open Sans, system-appropriate size. No border accent — it is part of the interface, not content. |
| **Crisis resources** | Open Sans, muted tone, bottom-positioned. Present but never competing with the passage. |
| **User-authored notes** (study workspace) | Distinct background tint, user's own font choice where supported, labeled "Your note." Never adjacent to sacred text without a visual separator. |

### Structural Rules

1. **Sacred text is never inline with editorial prose.** Passages and editorial notes occupy separate `<article>` or `<section>` elements. Screen readers announce them as distinct regions.
2. **Attribution is structural, not decorative.** Citations are in `<cite>` elements, linked to the source. They are not CSS flourishes that disappear on mobile.
3. **Editorial notes identify their author class.** Thread notes carry "Portal editorial" attribution. Magazine articles carry author bylines. Community collections carry "Curated by [name/anonymous]." Yogananda's text carries no attribution beyond the citation — it needs no introduction.
4. **Glossary definitions link to source passages.** Every definition of a spiritual term must cite at least one passage where Yogananda himself defines or uses the term. Definitions are *derived from* the corpus, not *imposed on* it.
5. **Social media captions never paraphrase.** Captions provide context ("From Chapter 26 of Autobiography of a Yogi") or an editorial framing question ("What does it mean to be still?") — never a restatement of what Yogananda said. The quote image contains the verbatim text; the caption exists in a separate field.
6. **Maximum editorial proximity ratio.** On any page where editorial prose appears alongside sacred text, the sacred text must be the dominant visual element. Editorial framing should not exceed approximately one-third of the visible content area when a passage is displayed.

### Accessibility Implications

- Screen readers must announce the transition between sacred text and editorial prose. Use `aria-label` or `role="note"` on editorial elements.
- The visual distinction (serif vs. sans-serif, border accent) must have a non-visual equivalent. Color alone is insufficient (WCAG 1.4.1).
- Focus order places the sacred text first in the reading sequence. Editorial framing follows, not precedes.

### Features Governed

| Feature | Sacred Text | Adjacent Prose | Boundary Mechanism |
|---------|------------|----------------|-------------------|
| Search results | Verbatim passage + highlight | None (UI chrome only) | N/A — pure sacred text |
| Editorial reading threads (FTR-063) | Verbatim passages | Transition notes between passages | Left-border accent, "Portal editorial" label |
| Glossary (FTR-005 E2) | Linked source passages | Term definitions | Definition in Open Sans; passage quotes in Merriweather |
| Daily email | Verbatim passage | Citation + "Read in context" link | Email template structure |
| Social media (FTR-154) | Quote image (verbatim) | Caption (separate field) | Image/text separation, human review |
| Magazine articles | Embedded block quotes | Monastic commentary | Block quote with citation, author byline on article |
| `/guide` page (FTR-056) | Linked passages | Editorial introductions | Section headers + visual separation |
| Crisis resources (FTR-051) | Passage about death/suffering | Helpline information | Bottom-positioned, muted treatment |
| Study workspace (FTR-143) | Collected passages | User's personal notes | Distinct background tint, "Your note" label |
| Chant reader (FTR-142) | Chant text | Practice instructions, mood classification | Instructions in metadata panel; text in main area |
| Community collections (FTR-143) | Curated passages | Curator's description | "Curated by [name]" label, Open Sans for description |
