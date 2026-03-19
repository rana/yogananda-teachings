---
ftr: 55
title: Practice Bridge
summary: "Guided pathways from reading to SRF meditation practice, Lessons, and local centers"
state: approved
domain: experience
governed-by: [PRI-01, PRI-04]
---

# FTR-055: Practice Bridge

## Rationale


### Context

The portal is designed as a "signpost, not destination" (FTR-049) — it points seekers toward deeper SRF practice without tracking conversions or acting as a sales funnel. The About page's "Go Deeper" section is described as "the most important part of this page" (DESIGN.md § About Section), but currently offers only a single link: `→ SRF Lessons (home-study meditation program)`.

Meanwhile, Yogananda's most consistent teaching across all his published books is that reading is insufficient — practice is everything. *Autobiography of a Yogi* devotes an entire chapter (Ch. 26, "The Science of Kriya Yoga") to publicly explaining what Kriya Yoga is, its ancient lineage, and its purpose. Passages throughout the corpus explicitly invite the reader to move from intellectual understanding to direct experience through meditation.

SRF's own website (yogananda.org) maintains extensive, publicly approved content about Kriya Yoga and the Lessons:
- `/kriya-yoga-path-of-meditation` — public description of the Kriya Yoga path
- `/lessons` — "A 9-month in-depth course on meditation and spiritual living"
- `/lessons-programs` — three-tier progression: Basic Lessons → Supplement Series → Kriya Yoga Initiation
- `/a-beginners-meditation` — free public meditation instruction
- `/meditate` — meditation hub page

The portal's Key Terminology entry for Kriya Yoga states "NOT to be discussed or documented in this portal." This is stricter than SRF itself. The constraint conflates two fundamentally different things:

1. **Teaching the Kriya technique** — secret, requires initiation, permanently out of scope
2. **Describing what Kriya Yoga is** using Yogananda's own published words — public, already in the corpus

A portal that faithfully presents Yogananda's books but offers no coherent bridge from reading to practice paradoxically underserves the seeker it has already moved — and is less faithful to the author's stated intent than one that includes such a bridge.

### Decision

Establish a **Practice Bridge** — a set of editorial surfaces that coherently guide seekers from reading Yogananda's published teachings toward understanding the path of formal practice, using four mechanisms:

**1. Enriched "Go Deeper" section on the About page.**

Replace the single Lessons link with a substantive section: 2–3 paragraphs of SRF-approved description of the Lessons program, the three-tier path (Lessons → Supplements → Kriya Initiation), a representative verbatim Yogananda passage about the importance of practice (with citation), and links to both the free Beginner's Meditation (`yogananda.org/a-beginners-meditation`) and the Lessons enrollment page (`yogananda.org/lessons`).

**2. Practice Bridge editorial tag.**

A new editorial annotation — `practice_bridge: true` — on passages where Yogananda explicitly invites the reader to practice (not every mention of meditation, only passages where the author's intent is clearly "do this, don't just read about it"). **AI-proposed, human-approved:** the unified enrichment pipeline (FTR-026) detects instructional verbs and practice-oriented language ("meditate," "visualize," "concentrate," "practice this," "close your eyes") and proposes `practice_bridge` candidates at ingestion time. Proposals enter the human review queue (same three-state pipeline as theme tags, FTR-121). This is a textual phase shift detection — identifying moments where Yogananda transitions from metaphysical exposition to direct instructional injunction (deep-research-gemini-sacred-reading.md § 7). On tagged passages, a quiet contextual note appears below the citation:

```
Yogananda taught specific meditation techniques through
Self-Realization Fellowship.
Begin with a free meditation → yogananda.org/meditate
Learn about the SRF Lessons → yogananda.org/lessons
```

Styled in `--portal-text-muted`, Merriweather 300 — the same visual weight as the "Find this book" bookstore link. Not a modal, not a card, not a CTA. Just a signpost.

**3. `/guide` pathway: "If You Feel Drawn to Practice."**

A new pathway in FTR-056, using the same template as all existing pathways. Progression: Begin now (SRF's free Beginner's Meditation) → The Quiet Corner (portal's own micro-practice) → Autobiography Ch. 26 (Yogananda's public description of Kriya) → Kriya Yoga theme page → SRF Lessons. The free path is foregrounded equally with the paid path — the beginner's meditation and the Quiet Corner appear before the Lessons link.

**4. Quiet Corner practice note.**

After the timer completes and the parting passage appears (FTR-040), a single-line practice link below the parting passage: `If you'd like to deepen your meditation practice → yogananda.org/meditate`. This is the moment of maximum receptivity — the seeker has just experienced stillness and may be most open to understanding that deeper practice exists.

**Additionally:**

- **"The Path of Practice" editorial reading thread** (FTR-063): A curated passage sequence tracing Yogananda's published teachings on the arc from reading to practice — why meditate → what meditation is → what Kriya Yoga is → the lineage → the invitation. All verbatim, all cited. The final entry signposts SRF Lessons. Milestone 3c+.
- **Kriya Yoga theme page scope note** (`yoga_path` category): An editorial note at the top of the Kriya Yoga theme page: "Yogananda's published descriptions of Kriya Yoga and its place in the yoga tradition. Formal instruction in Kriya Yoga is available through the SRF Lessons." Links to `yogananda.org/lessons`. Milestone 3c+.
- **Search intent pattern: `practice_inquiry`**: Added to E1 intent classification (FTR-005). Queries like "how to practice Kriya Yoga," "learn Kriya," "Kriya Yoga technique" are routed to the curated Kriya overview (theme page or `/guide` practice pathway) rather than raw search results, with the practice bridge note. Analogous to crisis query detection — a pattern where intent requires curated response, not just retrieval.

### What This Is Not

- **Not a sales funnel.** No conversion tracking, no enrollment metrics, no A/B testing of CTA copy, no urgency language. The Practice Bridge is editorial content reviewed by SRF, presented once, at rest. It does not follow the seeker around the site.
- **Not technique instruction.** The portal never teaches Kriya Yoga, the Hong-Sau technique, AUM meditation, or the Energization Exercises. It shows what Yogananda *wrote publicly about* these practices. The technique boundary (FTR-022) is unchanged.
- **Not a replacement for SRF's own content.** SRF's website provides institutional descriptions and enrollment flows. The portal provides corpus-grounded content — Yogananda's own published words. The portal links *to* SRF for the action step. Complementary, not duplicative.
- **Not behavior-derived.** The Practice Bridge appears based on content (editorial tags on passages, fixed `/guide` pathway, fixed Quiet Corner note) — never based on user behavior, visit frequency, or engagement patterns. DELTA-compliant.

### Ethical Frame

Three distinctions separate the Practice Bridge from a sales funnel:

1. **The portal provides information; it never optimizes for action.** There is no "Enroll Now" button. The practice bridge note has the same visual weight as the bookstore link — a quiet signpost, not a call to action.
2. **Yogananda himself made this invitation publicly.** Chapter 26 exists. The portal is surfacing the author's own stated purpose for his books. Omitting the practice bridge would be less faithful to the source material than including it.
3. **The free path is foregrounded.** The Beginner's Meditation (free, on yogananda.org) and the Quiet Corner (free, built into the portal) appear before the Lessons (paid). A seeker can practice today without enrolling or spending money.

### Consequences

- CONTEXT.md Key Terminology updated: Kriya Yoga entry revised from "NOT to be discussed" to "Technique instructions never included; Yogananda's published descriptions surfaced normally"
- DESIGN.md § About Section: "Go Deeper" enriched with SRF-approved Lessons description
- DESIGN.md § FTR-056: New `/guide` pathway added
- DESIGN.md § FTR-040: Quiet Corner practice note added after parting passage
- DESIGN.md § FTR-063: "The Path of Practice" thread documented as a planned thread
- DESIGN.md § Theme Taxonomy: Scope note added to Kriya Yoga theme
- FTR-005 E1 intent table: `practice_inquiry` intent added
- New stakeholder questions added to CONTEXT.md: SRF approval of enriched Lessons description, canonical enrollment URL confirmation
- The "Conversion to SRF Lessons" anti-metric (CONTEXT.md § Measuring Success) remains unchanged — the portal never tracks how many seekers enroll. Information availability is not the same as conversion optimization.
- FTR-022 (Lessons Integration Readiness) is unaffected — it governs future *content-level* access control for actual Lesson materials. FTR-055 governs *public descriptions of* the Lessons path, using only published information.


## Notes

Migrated from FTR-055 per FTR-084.
