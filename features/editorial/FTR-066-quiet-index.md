---
ftr: 66
title: "The Quiet Index — Browsable Contemplative Taxonomy"
summary: "Browsable passage organization by contemplative texture: contemplative, practical, devotional, philosophical, narrative"
state: approved-provisional
domain: editorial
governed-by: [PRI-03, PRI-08]
---

# FTR-066: The Quiet Index

## Rationale

STG-007 plans E3 (Passage Accessibility Rating) and E8 (Tone Classification). The Quiet Index combines these two planned classifications into a browsable dimension: passages organized by their contemplative texture.

### Passage Textures

| Texture | Description | Example |
|---------|-------------|---------|
| **Contemplative** | Pure devotion, prayer-like, reads as meditation | Passages that slow the reader into stillness |
| **Practical** | Instruction, technique, specific guidance | "Do this exercise for 15 minutes each morning..." |
| **Devotional** | Heart-centered, God-directed, personal yearning | "O Divine Mother, teach me to open the gate..." |
| **Philosophical** | Cosmological, metaphysical, intellectual argument | Discussions of consciousness, creation, maya |
| **Narrative** | Story, autobiography, personal experience | Episodes from Yogananda's life and encounters |

These textures emerge from combining E3 (accessibility level) and E8 (tone classification) — no new AI capability required.

### Route

`/quiet/browse/contemplative`, `/quiet/browse/practical`, `/quiet/browse/devotional` — each shows passages matching that texture, drawn from across all books.

The existing Quiet Corner (`/quiet`) remains the single-affirmation sanctuary. The Quiet Index lives under `/quiet/browse/` to avoid namespace collision with the Quiet Corner route while maintaining the contemplative URL family. `/quiet` = single affirmation sanctuary; `/quiet/browse/[texture]` = browsable contemplative taxonomy.

### Who This Serves

A seeker who arrives at 2 AM seeking comfort needs a different texture than one doing comparative theology research. The intent classifier (E1) handles this at search time; the Quiet Index makes it browsable. It answers the question: "I don't know what I'm searching for, but I know what I *need* right now."
