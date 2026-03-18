---
ftr: 17
title: Seeker & User Persona Index
summary: "Need-based persona taxonomy: 12 seeker archetypes, 6 staff personas, with inhabit-don't-label principle"
state: approved
domain: foundation
governed-by: [PRI-05, PRI-08]
always-load: true
---

# FTR-017: Seeker & User Persona Index

## Rationale

A consolidated reference to every persona type defined across the portal's design documents. This section does not duplicate persona details — it indexes them so that any developer, designer, or editorial staff member can find who the portal serves and where the design commitments for each persona live.

### Design Philosophy

The portal's personas are **need-based, not demographic**. A 16-year-old in career crisis and a 45-year-old career-changer both enter through the same life-phase pathway. A Christian contemplative in Atlanta and a Hindu practitioner in Kolkata both find Yogananda's words, but through different worldview entry points. Age, income, education, and geography are treated as *constraints to design around* (performance budgets, accessibility, cultural adaptation), never as audience segments to target.

**The portal intentionally does not design for passive consumption.** There is no algorithmic feed, no infinite scroll, no "recommended for you" engine, no engagement optimization. Every interaction is seeker-initiated. This is not a limitation — it is the Calm Technology principle (CLAUDE.md constraint #3) applied to the entire product. The portal is a library, not a feed. Seekers come with intent; the portal meets that intent and then lets go. (Relates to FTR-082 DELTA-compliant analytics, FTR-051 Quiet Corner.)

**Inhabit, don't label.** When the portal addresses seekers directly in UI copy, use their language — questions they'd ask, feelings they'd name, actions they'd describe. Reserve persona taxonomy ("The curious reader," "The meditation seeker") for internal design documents. The seeker should never read a label they wouldn't apply to themselves. A person in grief is not "A Person in Need" — they're someone for whom light exists in dark hours. A newcomer is not "The Curious Reader" — they're someone looking for a place to begin. This principle follows from PRI-03 (the technology disappears) and PRI-08 (calm technology meets you without naming you).

### Seeker Personas (External)

Persona names below are **internal design vocabulary** — used in design documents, code comments, and team discussion. UI-facing copy follows the "Inhabit, don't label" principle above: the homepage Start Here section uses "A Place to Begin," "Light for Dark Hours," and "Be Still And..." rather than surfacing these taxonomy labels. Descriptions give rather than ask — "Millions have found their way here" instead of "New to Yogananda?"

| Persona | Entry Pattern | Primary Section | Key ADRs |
|---|---|---|---|
| **The curious reader** | Homepage → themes / search / browse | FTR-056 seeker archetypes | FTR-028 |
| **The person in need** | "Seeking..." empathic entry → Quiet Corner / theme page | FTR-040, FTR-040 | FTR-051 |
| **The meditation seeker** | Homepage → `/guide` → practice pathways | FTR-056 | FTR-055 |
| **The shared-link recipient** | `/passage/[id]` via friend's message | FTR-047 (#1) | — |
| **The Google arrival** | `/books/[slug]/[chapter]` from external search | FTR-047 (#2) | — |
| **The daily visitor** | Homepage → Today's Wisdom → contemplate → leave | FTR-047 (#3) | FTR-065 |
| **The Quiet Corner seeker** | `/quiet` directly, often in crisis | FTR-047 (#4) | FTR-051 |
| **The linear reader** | Chapter 1 → 2 → ... → N | FTR-047 (#5) | FTR-052 |
| **The devoted practitioner** | Search for half-remembered passages, cross-book study | FTR-047 (#6) | FTR-055 |
| **The scholar** | Citation-driven, cross-referencing, export-oriented | FTR-047 (#7) | FTR-034, FTR-124 |
| **The study circle leader** | Find → collect → arrange → share → present | FTR-060 external personas | FTR-006 §5, FTR-143 |
| **The crisis seeker** | 2 AM, acute distress, grief, suicidal ideation | FTR-040 (Quiet Corner) | FTR-051 |
| **The Global South seeker** | Rural Bihar, 2G, JioPhone, paying per MB | FTR-006 (Global-First) | FTR-003 |

### Worldview Pathways (14 entry points)

Seekers arrive from different epistemological and tradition-based starting points. Each worldview pathway (WP-01 through WP-14) is an editorially curated reading path that meets the seeker where they are. Full catalog in FTR-056.

| ID | Worldview | Primary Corpus | Status |
|---|---|---|---|
| WP-01 | Christian Contemplative | *The Second Coming of Christ* | Approved |
| WP-02 | Hindu/Vedantic Practitioner | *God Talks With Arjuna* | Approved |
| WP-03 | Buddhist/Zen Meditator | *Autobiography* meditation chapters | Approved |
| WP-04 | Sufi/Poetry Lover | *Wine of the Mystic* | Approved |
| WP-05 | Jewish/Contemplative | *The Second Coming of Christ* (OT) | Approved |
| WP-06 | Science & Consciousness Explorer | *Autobiography* science chapters | Approved |
| WP-07 | Spiritual But Not Religious | *Autobiography*, *Where There Is Light* | Approved |
| WP-08 | Yoga Practitioner (Body to Spirit) | *Autobiography*, *God Talks With Arjuna* | Approved |
| WP-09 | Grief/Crisis Visitor | Cross-cutting | Approved |
| WP-10 | Psychology/Self-Improvement | *Man's Eternal Quest* | Approved |
| WP-11 | Comparative Religion/Academic | All books + Knowledge Graph | Approved |
| WP-12 | Parent/Family-Oriented | *Man's Eternal Quest*, *Journey to Self-Realization* | Approved |
| WP-13 | Muslim/Sufi Seeker | *Wine of the Mystic*, *Autobiography* | Requires SRF approval |
| WP-14 | Agnostic/Skeptical-but-Curious | *Autobiography* science chapters | Requires SRF approval |

### Life-Phase Pathways (9 temporal states)

Seekers are also in a season of life that shapes what they need. Each life-phase pathway (LP-01 through LP-09) uses a universal question, not an age label, as its entry point. Full catalog in FTR-056.

| ID | Life Phase | Entry Question | Tone |
|---|---|---|---|
| LP-01 | Young Seeker | "What should I do with my life?" | Practical, joyful |
| LP-02 | Building a Life | "How do I balance inner and outer?" | Practical |
| LP-03 | Raising a Family | "How do I raise children wisely?" | Practical |
| LP-04 | The Middle Passage | "Is this all there is?" | Contemplative, challenging |
| LP-05 | The Caregiver | "Where do I find strength?" | Consoling, practical |
| LP-06 | Facing Illness | "How do I heal or accept?" | Consoling, practical |
| LP-07 | The Second Half | "How do I grow old with grace?" | Contemplative, consoling |
| LP-08 | Approaching the End | "What awaits me?" | Consoling, contemplative |
| LP-09 | New to Spiritual Practice | "I want to begin, don't know how" | Practical, joyful |

### Situational Themes (8 life circumstances)

Cross-cutting life situations that any seeker may navigate, independent of age or worldview. Implemented as editorial theme groupings in FTR-121.

Work | Relationships | Parenting | Health/Wellness | Loss & Grief | Aging | Facing Illness | Purpose

### Staff & Operational Personas (Internal)

Full profiles in FTR-060. Summary index:

| Persona | Type | Active From |
|---|---|---|
| Monastic content editor | Core staff | Milestone 3b+ |
| Theological reviewer | Core staff | Milestone 3b+ |
| AE social media staff | Core staff | Milestone 3d+ |
| Translation reviewer | Core staff (or volunteer) | Milestone 5b+ |
| AE developer | Core staff | Milestone 1a+ |
| Leadership (monastic) | Core staff | Milestone 3b+ |
| Portal coordinator | Operational (unstaffed) | Milestone 3b+ |
| Book ingestion operator | Operational (unstaffed) | Milestone 2a+ |
| VLD coordinator | Operational (unstaffed) | Milestone 5a+ |

### Volunteer Personas

| Persona | Active From |
|---|---|
| VLD curation volunteer | Milestone 5a+ |
| VLD translation volunteer | Milestone 5b+ |
| VLD theme tag reviewer | Milestone 5a+ |
| VLD feedback triager | Milestone 5a+ |
| VLD content QA reviewer | Milestone 5a+ |

### External Personas

| Persona | Primary Need |
|---|---|
| Philanthropist's foundation | Pre-formatted impact reports |
| Study circle leader | Find → collect → arrange → share → present (see FTR-060 expanded profile) |
| Institutional intermediary | Chaplain, therapist, hospice worker accessing on behalf of others (see CONTEXT.md open question) |

### Non-English Seeker Journeys

Three brief empathy narratives for how non-English seekers may discover and use the portal. These are not design specifications — they are grounding artifacts that keep the team oriented toward real human experiences when making UX decisions.

**Priya, Varanasi (Hindi).** Priya is 34, a schoolteacher. Her grandmother kept a Hindi copy of *Autobiography of a Yogi* by the prayer altar — she called Yogananda "Yogananda ji" and read from it during evening prayers. Priya never read it herself. After her grandmother's death, she searches on her phone: "योगानन्द जी मृत्यु के बाद" (Yogananda ji, after death). She finds the portal through Google. She arrives at the Hindi locale, sees the YSS branding she recognizes from her grandmother's prayer room, and finds a passage about the soul's immortality in the same words her grandmother read aloud. She doesn't search again for three weeks. Then she returns for "योगानन्द जी ध्यान कैसे करें" (how to meditate). The Practice Bridge links her to YSS's free beginner meditation page. She has never heard of SRF. The portal does not need her to.

**Carlos, São Paulo (Portuguese).** Carlos is 22, a university student studying philosophy. He finds Yogananda through a yoga studio's Instagram post that links to a portal passage about willpower. He reads in Portuguese, explores the "Purpose" theme, and finds passages from *Man's Eternal Quest*. He doesn't know what SRF or YSS is. He uses the citation export to reference a passage in his philosophy paper on Eastern and Western concepts of will. Six months later, he discovers the Knowledge Graph and spends an afternoon following connections between Yogananda's references to Patanjali, the Gita, and Western science. He still has no interest in meditation. The portal does not try to make him interested.

**Amara, Lagos (English, but not from the Western spiritual tradition).** Amara is 40, a hospital nurse and devout Christian. A colleague shared a portal link to a passage about courage during suffering. Amara is suspicious — is this a Hindu thing that conflicts with her faith? She sees the passage is from a book by "Paramahansa Yogananda" and doesn't know who that is. She reads the passage and finds it moving. The WP-01 (Christian Contemplative) worldview pathway surfaces Yogananda's commentary on the Gospels. She is surprised. She reads one chapter of *The Second Coming of Christ* on her phone during a night shift break, on a hospital Wi-Fi connection that drops every few minutes. The portal's progressive loading means she never loses her place. She never clicks "Learn about meditation." She comes back to read the next chapter the following week. The portal's <100KB JS budget means her data cost is negligible on her Nigerian mobile plan.

### Locale-Specific Cultural Adaptation

The same seeker archetype requires cultural adaptation across locales — not just language translation but emotional register, platform habits, and trust signals. Summary of key design differentiators:

| Locale | Key Adaptation | Platform Priority |
|---|---|---|
| Spanish (es) | Emotional warmth, relational tone | WhatsApp |
| French (fr) | Diacritic-insensitive search, Francophone Africa vs European French | — |
| German (de) | Compound word search, privacy expectations exceed GDPR | — |
| Portuguese (pt) | Brazilian vs European variants, university/intellectual framing | WhatsApp |
| Japanese (ja) | CJK tokenization, omikuji framing, *ma* aesthetic, LINE (not WhatsApp) | LINE |
| Thai (th) | No word boundaries (search tokenization), Buddhist context, gold/lotus aesthetics | LINE |
| Hindi (hi) | YSS branding, mobile-first, text-only mode essential, *sadhak* terminology | WhatsApp |
| Bengali (bn) | YSS branding, lyrical editorial register, Tagore's aesthetic influence | WhatsApp |

### Open Persona Questions

These questions are tracked in CONTEXT.md § Open Questions (Stakeholder) and require SRF input:

1. **Young seekers** — should the editorial voice acknowledge teenagers explicitly, or is agelessness the mode of inclusion? (Line 76)
2. **WP-13 and WP-14** — Muslim/Sufi and Agnostic/Skeptical worldview pathways require SRF editorial approval. (Line 77)
3. **Institutional intermediaries** — chaplains, therapists, hospice workers accessing on behalf of others. (Line 69)
4. **Operational role assignment** — portal coordinator, book ingestion operator, VLD coordinator. (Line 85–86)
5. **"Who *shouldn't* use this portal?"** — The seeker searching for Kriya technique instructions should be redirected to SRF Lessons, not shown Autobiography excerpts that might be misinterpreted as instruction. The Practice Bridge (FTR-055) addresses this, but the persona of "the seeker who needs what we don't offer" could be more explicitly designed for.
6. **Abuse and misuse patterns** — Automated corpus extraction, quote weaponization, SEO parasitism. (CONTEXT.md technical open question)
7. **"Seeking..." and Start Here section overlap** — The homepage's "What are you seeking?" section (first-person empathic entry) and "Start Here" section (navigational cards) map to three of the same personas and route to overlapping search queries. Consider whether these earn separate screen weight or should merge into a single section that combines the Seeking section's first-person warmth with Start Here's richer card format (title + description + specific destination). Low priority — the current experience works — but worth revisiting when the homepage evolves.
