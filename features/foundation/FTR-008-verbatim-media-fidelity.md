# FTR-008: Verbatim Media Fidelity — Cross-Modal Content Integrity

**State:** Approved (Foundational)
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-01, PRI-02, PRI-03

## Rationale

**Date:** 2026-02-25
**Context:** FTR-001 (direct quotes only), FTR-005 (Claude AI usage policy), FTR-073 (sacred image guidelines), FTR-142 (audio), FTR-142 (AI audio generation), Principles 1 and 2

### Context

Principles 1 and 2 — "Direct Quotes Only" and "Full Attribution Always" — establish that Yogananda's words must be transmitted verbatim, with full citation, and never generated, paraphrased, translated, or synthesized by AI. These principles were authored when "content" implicitly meant text. As the portal evolves into cross-media territory (Arc 6: video, audio, images), the same theological reasoning must govern all modalities.

If paraphrasing Yogananda's words is prohibited because even subtle changes distort the meaning of a realized master's teachings, then:

- **AI voice synthesis** reading his words imposes synthetic prosody, emphasis, and emotional register on sacred text — a form of paraphrasing in the vocal medium.
- **AI-generated images** of the gurus are synthetic representations of realized masters — objects of devotion fabricated by a machine.
- **AI-generated video** of the gurus constitutes deepfake territory — theologically impermissible regardless of intent.
- **AI voice cloning** of Yogananda's voice is the most extreme violation: manufacturing the Master's speech from patterns rather than preserving his actual recordings.

FTR-142 correctly permits AI audio generation for UI assets (singing bowl cues, ambient soundscapes), noting that "FTR-001's prohibition applies to Yogananda's words — it does not extend to interface audio." This ADR completes the framework by drawing the line on the sacred side.

### Decision

Establish a **three-tier media integrity policy** governing AI generation across all content modalities.

#### Tier 1: Sacred Source Material — NEVER AI-Generated

Media depicting or representing Yogananda or the lineage gurus (Mahavatar Babaji, Lahiri Mahasaya, Swami Sri Yukteswar) in any modality is never AI-generated, cloned, or synthetically produced. This is absolute and permanent.

| Prohibition | Scope |
|------------|-------|
| No AI-generated voice of the gurus | No voice cloning, no synthetic speech impersonating or imitating the gurus' voices. Yogananda's actual voice recordings (FTR-142, `is_yogananda_voice` flag) are sacred artifacts — preserved, never synthesized. |
| No AI-generated images of the gurus | No synthetic portraits, no AI-animated photographs, no AI "enhancement" that alters appearance. The 16 official photographs (FTR-073) are the canonical visual record. |
| No AI-generated video of the gurus | No deepfakes, no AI-animated photographs, no synthetic video of any kind depicting the gurus. |
| No AI "enhancement" that alters content | Standard restoration (denoising, stabilization, upscaling) that preserves the original signal is permitted — that is engineering. Generation that adds content not present in the original (colorization that invents colors, audio enhancement that fills gaps with synthetic speech, video interpolation that invents frames with guru content) is prohibited. The line: preservation yes, fabrication no. |

#### Tier 2: Sacred Text Transmission — Human Voices Only

The portal entrusts the vocal transmission of Yogananda's published words to human readers. When the portal provides audio of sacred text (book narration, passage reading, chant performance), that audio must be a human recording.

| Policy | Detail |
|--------|--------|
| Human narration for sacred text | Book readings, passage narration, and chant performances use SRF-approved human readers — monastics, approved lay readers, or professional narrators vetted by SRF. |
| No synthetic TTS for sacred text | The portal does not use text-to-speech engines (cloud or local) to generate audio of Yogananda's words. Synthetic voice trivializes sacred text by imposing machine prosody on a realized master's teachings. |
| User-controlled assistive technology always permitted | Browser screen readers (VoiceOver, NVDA, JAWS), OS-level text-to-speech, and other assistive technology are the user's devices, not the portal's content. The portal's responsibility is to serve accessible semantic HTML and ARIA-compliant markup (FTR-003, FTR-053). What the user's device does with that text is the user's choice and always permitted. |
| AI-generated *descriptions* of sacred media permitted | Alt text, captions, and metadata descriptions for guru photographs and audio recordings fall under FTR-005 Category: Drafting — non-sacred text subject to mandatory human review before publication. Describing a sacred image in words is not generating a sacred image. |

#### Tier 3: Portal Assets — AI Generation Permitted

Non-sacred portal assets follow existing policies. AI generation is one tool among several, evaluated on merit, with mandatory human review.

| Asset Type | Governing ADR | Policy |
|------------|--------------|--------|
| UI sound effects (chimes, cues) | FTR-142 | AI generation permitted. Human review mandatory. |
| Ambient audio (soundscapes, nature) | FTR-142 | AI generation permitted. Human review mandatory. |
| Decorative imagery (nature, patterns, atmosphere) | FTR-073 (non-guru images) | AI generation permitted for non-sacred subjects — landscapes, abstract patterns, nature imagery. Must not depict gurus or represent sacred content. Human review mandatory. |
| UI strings, captions, alt text | FTR-005 (Category: Drafting) | AI drafting permitted. Human review mandatory. |

### Third-Party Signaling

The portal's API metadata, `llms.txt`, and machine-readable content (FTR-059) should signal the prohibition. When third parties consume the corpus via MCP or API (FTR-098), the metadata should include a `media_integrity` field or equivalent indicating that AI voice synthesis, image generation, and video generation of sacred content are prohibited by the content provider's policy. This does not prevent third-party misuse but establishes SRF's position.

### Rationale

- **Theological consistency.** The same reverence that prohibits paraphrasing Yogananda's written words prohibits fabricating his voice, image, or likeness. The principle is modality-independent: sacred transmission must be authentic.
- **Preservation over fabrication.** The portal preserves what exists (voice recordings, photographs, historical video) with the highest fidelity. It does not fill gaps with synthetic substitutes.
- **Graduated policy.** The three-tier structure avoids both over-restriction (banning all AI audio when FTR-142 correctly permits UI sounds) and under-restriction (allowing synthetic guru voices because "it's just TTS"). Each tier has a clear theological rationale.
- **Assistive technology exemption.** Screen readers are the user's tool, not the portal's content. Conflating them with portal-generated TTS would harm accessibility — the opposite of the portal's mission (FTR-003, FTR-006).

### Consequences

- Principles 1 and 2 amended to be media-inclusive (PRINCIPLES.md, CLAUDE.md)
- FTR-005 gains prohibition #8 (cross-media sacred content generation)
- FTR-073 gains explicit AI image generation prohibition for guru imagery
- FTR-142 gains boundary statement cross-referencing this ADR
- FTR-136 (Spoken Teachings — Human Narration Program) updated: human narration as primary path; synthetic TTS not permitted for sacred text
- Future audio features (book narration, Cosmic Chants performance) must use human recordings
- Standard restoration of historical media remains permitted and encouraged
- `media_integrity` metadata field added to API responses when cross-media content types ship (Arc 6+)
