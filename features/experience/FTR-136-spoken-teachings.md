---
ftr: 136
title: "Spoken Teachings — Human Narration Program"
summary: "Human narration program for audio teachings: archival voice, monastic reading, Listen mode, distribution"
state: proposed
domain: experience
governed-by: [PRI-01, PRI-03, PRI-05, PRI-07]
depends-on: [FTR-008, FTR-142]
---

# FTR-136: Spoken Teachings

## Rationale

**Type:** Feature (Content Production + Portal Delivery)
**Governing Refs:** FTR-003, FTR-053, FTR-008, FTR-142 (cross-media/audio), FTR-119 (YSS partnership)
**Dependencies:** Passage display infrastructure (Milestone 2a) for portal delivery. Recording infrastructure and organizational commitment for content production. FTR-008 (Verbatim Media Fidelity) constrains: portal-initiated audio of Yogananda's words must use human-recorded narration — synthetic TTS is not permitted for sacred text. User-controlled assistive technology (browser screen readers, OS-level TTS) always permitted and unaffected.

**Scope.** This is a content production program with a technology delivery component, not a software feature with a recording component. The program has four layers:

1. **Yogananda's own voice.** SRF possesses archival recordings of Yogananda's lectures and talks. Where these overlap with published text, surfacing the Master's own voice is the most theologically pure and highest-impact first step — requiring digitization and alignment, not new recording. Governed by FTR-142/FTR-142.
2. **Human narration of published text.** New recordings by monastics or SRF/YSS-approved readers. SRF already produces audiobooks and monastic readings — this layer extends existing capability to serve the portal. Scope ranges from daily passages to full books. Each organization determines its own recording approach, narrator selection, and production workflow.
3. **Portal Listen mode.** The technology layer: audio player, text-audio alignment, streaming, offline support, low-bandwidth delivery. Designed multilingual from the foundation (PRI-06) — adding a new language's narration should require zero code changes.
4. **Distribution beyond the portal.** The recordings are the most expensive asset. Distribution should match: podcast feeds, YouTube, SRF/YSS app integration, WhatsApp-shareable audio, smart speakers. The portal player is one channel among several.

**Why this matters.** 771 million adults lack basic literacy (UNESCO 2022). 295 million have moderate-severe vision loss. Millions more are auditory learners, commuters, children, or elderly with declining vision. Beyond accessibility, spoken teachings restore the original medium — Yogananda's teaching tradition is oral. He recorded his own voice. Monastics read aloud in services. This program extends what already happens into digital reach.

**Minimum viable proof of concept.** A daily passage recording — one monastic reads one passage each day (~2-3 minutes). Distributed as a podcast. Tests recording workflow, listener reception, and organizational fit with minimal commitment. If the daily passage works, expand to chapters, then books.

**SRF and YSS considerations.** Both organizations have existing audio production experience, but may have different capabilities, priorities, and narrator pools. SRF and YSS should each evaluate independently what recording infrastructure they have, what they would need, and what narration scope makes sense for their communities. Hindi narration by YSS monastics intersects directly with FTR-119 (YSS partnership) — the same authorization conversation that could unblock Hindi text could also enable Hindi narration.

**Narration as seva.** In many spiritual traditions, reading sacred text aloud is itself devotional practice. If SRF frames recording as seva (selfless service), it may align naturally with monastic life rather than competing with existing duties. This is a question for the organizations, not the architecture.

**Open questions for SRF:**
- What existing audiobook and recording infrastructure does SRF have? (Mother Center studio, equipment, production workflow)
- Which existing audiobook productions could serve the portal? (Commercial audiobooks, CD catalog, retreat recordings)
- Would monastics find narration recording to be a natural extension of their service, or a burden?
- What recording locations are suitable? (Mother Center, Encinitas, Hidden Valley — each has different noise environments and monastic populations)
- Would SRF consider professional narrators vetted and approved by the order?
- What is the preferred first step: daily passage podcast, key chapters, or full book?

**Open questions for YSS:**
- What audio production capability exists at YSS ashrams? (Ranchi, Dakshineswar)
- Are there YSS monastics interested in Hindi/Bengali narration?
- Does YSS have different recording needs? (Climate considerations, equipment sourcing in India, power stability)
- How does YSS's organizational structure handle content production decisions?

**Open questions for both:**
- Should narrator identity be disclosed? ("Read by Brother/Sister [Name]" or anonymous?)
- Gender-choice narration: essential from the start, or a later enhancement?
- How should narration quality be reviewed and approved?
- What is the relationship between portal narration and commercial audiobook distribution?
- Could the philanthropist's funding support recording infrastructure and/or a dedicated narrator role?

**Re-evaluate At:** Phase 2 boundary — or earlier if organizational conversations surface readiness
**Decision Required From:** SRF editorial + SRF/YSS leadership (organizational commitment) + Architecture (portal delivery)
**Related Explorations:** `book-read-to-me-mode-toggle-displayed-next-to-book-text.md` (archived)

## Notes

Migrated from FTR-136 per FTR-084.
