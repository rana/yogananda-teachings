---
ftr: 127
title: "Passage Depth Signatures — Opus-Classified Contemplative Quality"
summary: "Opus-classified depth categories (bottomless, informational, catalytic, consoling) powering passage selection"
state: proposed
domain: search
governed-by: [PRI-03, PRI-12]
depends-on: [FTR-026, FTR-105]
---

# FTR-127: Passage Depth Signatures

## Rationale

**Target:** Milestone 1c (as part of enrichment pipeline — M1c-13)
**Dependencies:** Opus batch enrichment pipeline. Full corpus extracted.

Not all passages are the same kind of thing. Some are luminous and bottomless — they reward the hundredth reading. Some are informational — they answer a question. Some are catalytic — they shift something when you're ready. Some are consoling — they meet suffering.

### Dual-Layer Classification

Depth signatures operate on two independent axes: what the text *describes* (textual register) and what it *evokes* in the reader (contemplative signature). These often diverge — a passage *describing* Yogananda's intense grief at his mother's death (textual register: Dark Night) *evokes* consolation and compassion in the reader (contemplative signature: Consoling). Single-label classification fails to capture this dynamic.

Sacred text has a **triple function** that no existing framework fully captures: it (1) **describes** spiritual states, (2) **attempts to evoke** spiritual states in the reader, and (3) may serve as a vehicle for **direct spiritual transmission** — a performative category with no computational analogue. The dual-layer model below addresses the first two. The third — text as transformative encounter — is acknowledged as beyond classification. Some passages that multiple annotators flag as irreducible to categories should carry a **"beyond classification" marker** rather than forced labels, honoring the limits of the taxonomy itself (PRI-03).

**Layer 1: Textual Register (Described State)**

What cognitive/emotional/spiritual state the text describes or inhabits:

| Register | Description |
|----------|------------|
| **Cosmic / Noetic** | Descriptions of infinite expansion, omniscience, underlying universal reality |
| **Numinous / Awe** | Encounters with overwhelming divine presence (*mysterium tremendum*) |
| **Detachment / Equanimity** | Radical non-attachment (*Gelassenheit*), observing Maya without reaction |
| **Devotional Longing** | Acute pain of separation from the Divine; desire for union |
| **Dark Night / Struggle** | Ego dissolution, spiritual aridity, karmic suffering |

**Layer 2: Contemplative Signature (Evoked Impact)**

What the passage does to the reader — the depth signature proper:

| Signature | Description | Navigation Use |
|-----------|------------|----------------|
| **Bottomless / Stillness** | Induces *shanta*, slows cognitive pace, rewards endless return | Today's Wisdom, Wanderer's Path |
| **Consoling** | Meets suffering, evokes compassion, emotional acceptance | "I am struggling" entry (FTR-138), bridge seeds |
| **Catalytic** | Shifts perspective abruptly — sudden elevation, paradigm realization | Practice-oriented seekers, bridge seeds |
| **Informational / Grounding** | Provides clarity, answers philosophical or theological inquiries | Search results, browse, factual queries |

### Hermeneutic Depth Tier

Orthogonal to the contemplative signature, each passage carries a hermeneutic depth classification grounded in dhvani theory (FTR-128) and cross-validated against the Christian Four Senses of Scripture:

| Tier | Hermeneutic Layer | Description |
|------|------------------|-------------|
| **Tier 1** | *Abhidha* / Literal | Meaning entirely on the surface — factual, historical, geographic |
| **Tier 2** | *Lakshana* / Moral-Allegorical | Narrative as vehicle for practical spiritual teaching, universal law, ethical imperative |
| **Tier 3** | *Vyanjana* / Anagogical | Language pointing toward ineffable mystical truths — rewards endless return |

Tier 3 passages automatically receive the "Bottomless" contemplative signature. The relationship is one-directional: all Tier 3 passages are Bottomless, but not all Bottomless passages are Tier 3 (a passage can induce profound stillness through its rhythm and simplicity without carrying hidden meaning).

### Classification Method

**Why a custom taxonomy is necessary.** GoEmotions (Demszky et al., ACL 2020) — the dominant NLP emotion taxonomy — has 27 categories derived from Reddit comments with religion words **explicitly filtered out**. At least 23 contemplative states central to Yogananda's prose are absent from GoEmotions and every other published NLP taxonomy: devotion/bhakti, bliss/ānanda (qualitatively distinct from "joy"), non-dual awareness, divine longing (*Sehnsucht*), peace that surpasses understanding (distinct from "relief"), numinous experience, ineffability, cosmic consciousness, mystical union, equanimity, surrender, kenosis, and others. No computational system classifies sacred text by contemplative emotional quality — not for rasa, not for dhvani, not for any tradition. The depth signature taxonomy below is purpose-built for this corpus.

**Realistic accuracy targets.** Inter-annotator agreement for contemplative text annotation: expect **κ = 0.25–0.45** (fair to moderate) — lower than the κ = 0.40–0.60 typical for interpretive literary analysis because spiritual prose carries greater ambiguity and experiential depth. Classifier performance should be evaluated against the ceiling set by human agreement, not theoretical 100%. Targets: **macro-F1 ≥ 0.45** for the full taxonomy, **F1 ≥ 0.60** for core high-frequency states (devotion, peace, awe, consolation). Some states (non-dual awareness, mystical union) may be classifiable only by human experts.

**How Opus generates them:** Each passage is classified during the enrichment pipeline (FTR-026). Opus reads the passage in full chapter context and outputs:
1. **Textual register** — single primary label from Layer 1
2. **Contemplative signature** — probability vector across Layer 2 categories (e.g., `{consoling: 0.8, bottomless: 0.4, catalytic: 0.2}`). All values above 0.3 threshold stored. This handles multi-register simultaneity — a passage can be simultaneously consoling and catalytic.
3. **Hermeneutic depth tier** — single tier (1, 2, or 3) via chain-of-thought: identify literal meaning → test for indicated meaning → test for suggested meaning

Multi-persona prompting (FTR-128 § Prompt Design Notes) applies: the "Seeker" perspective generates the contemplative signature (evoked impact); the "Structuralist" perspective generates the textual register (described state); the "Contemplative Scientist" perspective validates the hermeneutic tier.

**What depth signatures influence:**
- Today's Wisdom selection (bottomless passages preferred)
- Wanderer's Path weighting (FTR-140)
- Bridge seed passage curation — consoling passages for distress states, catalytic for practice states
- Related Teachings ordering — mix of depths, not all luminous
- Four Doors entry (FTR-138) — "I am struggling" queries `[contemplative_signature: consoling]`
- Transition navigation (FTR-162) — arcs from one register through another (Dark Night → Consoling → Bottomless)

**Origin:** External design review (Claude Web conversation, 2026-03-01). Substantially deepened by contemplative taxonomy research (docs/reference/deep-research-gemini-contemplative-emotion.md, 2026-03-17).

## Notes

- **Origin:** FTR-127
- **Research input (March 2026):** Contemplative taxonomy deep research report (57 citations) established the dual-layer model (described vs. evoked), hermeneutic depth tiers grounded in dhvani theory, and probability vector storage for multi-register classification. The described/evoked distinction resolves a fundamental design problem: sacred text often describes suffering to evoke consolation, describes struggle to evoke courage. Single-label classification misrepresents both the text and its impact.
- **Cross-tradition validation:** The hermeneutic depth tiers map to the Christian Four Senses of Scripture (literal/allegorical/moral/anagogical), computationally validated by Trepczynski 2023 via BIG-Bench. Yogananda's corpus explicitly bridges Hindu and Christian frameworks, making this cross-tradition classification natively appropriate.
- **Research input (Claude, March 2026):** Claude Deep Research contemplative emotion taxonomy report. Key absorptions: (1) triple function of sacred text (describe, evoke, transmit) — the "transmit" dimension acknowledged as beyond classification; (2) 23 contemplative states missing from all NLP taxonomies — GoEmotions explicitly excluded religion; (3) realistic κ = 0.25–0.45 and F1 targets for contemplative text; (4) "beyond classification" marker for irreducible passages. Report: `docs/reference/deep-research-claude-contemplative-emotion.md`.
