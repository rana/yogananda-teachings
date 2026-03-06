---
ftr: 122
title: "Exploration Theme Categories — Persons, Principles, Scriptures, Practices, Yoga Paths"
state: approved
domain: search
arc: 3c+
governed-by: [PRI-03]
---

# FTR-122: Exploration Theme Categories

## Rationale

### Context

FTR-121 established a two-tier theme taxonomy (`quality` and `situation`) on the `teaching_topics` table. This serves seekers who approach Yogananda's teachings through emotional/spiritual needs or life circumstances. But seekers also approach through *intellectual and traditional frameworks*:

- **By person:** "What does Yogananda say about Christ?" or "Teachings about Krishna"
- **By yogic principle:** "Yogananda on ahimsa" or "What is tapas?"
- **By scripture:** "Yogananda's interpretation of the Yoga Sutras" or "Gita teachings"
- **By practice:** "How to meditate" or "Yogananda on pranayama"

These are natural entry points for scholars, yoga practitioners, interfaith seekers, and devotees with specific study interests. They require no new infrastructure — they use the same `teaching_topics` table, the same tagging pipeline, the same page template, and the same three-state provenance.

### Decision

Add five new categories to the `teaching_topics.category` column:

| Category | Description | Examples |
|----------|-------------|----------|
| **`person`** | Spiritual figures Yogananda discusses | Christ, Krishna, Lahiri Mahasaya, Sri Yukteswar, Patanjali, Kabir, Divine Mother |
| **`principle`** | Yogic ethical principles (Yama/Niyama) | Ahimsa, Satya, Asteya, Brahmacharya, Aparigraha, Saucha, Santosha, Tapas, Svadhyaya, Ishvara Pranidhana |
| **`scripture`** | Scriptural frameworks Yogananda interprets | Yoga Sutras, Bhagavad Gita, Bible, Rubaiyat of Omar Khayyam |
| **`practice`** | Spiritual practices | Meditation, Concentration, Pranayama, Affirmation, Devotion |
| **`yoga_path`** | Paths of yoga | Kriya Yoga, Raja Yoga, Bhakti Yoga, Karma Yoga, Jnana Yoga, Hatha Yoga, Mantra Yoga, Laya Yoga |

All categories use:
- The same `teaching_topics` table with its `category` column
- The same auto-tagging pipeline (embedding similarity + optional Claude classification + human review)
- The same three-state `tagged_by` provenance (`auto`, `reviewed`, `manual`)
- The same `/themes/[slug]` page template
- Publication is an editorial decision — no fixed minimum passage count

### Relationship to FTR-064 (Reverse Bibliography)

The `person` and `scripture` categories overlap with the Reverse Bibliography feature (FTR-064). The distinction:

- **`teaching_topics` (person/scripture):** "What does Yogananda *teach about* Christ/the Gita?" — passages where the topic is the central subject
- **`external_references`:** "Where does Yogananda *cite or quote* Christ/the Gita?" — passages with direct references, quotes, or allusions

Both are valuable; they serve different needs. A seeker browsing `/themes/christ` wants Yogananda's teachings about Christ consciousness. A seeker browsing `/references/jesus-christ` wants specific passages where Yogananda quotes or directly references Jesus.

### Navigation

The `/themes` page organizes all categories into distinct sections:

1. "Doors of Entry" (quality) — on homepage and themes page
2. "Life Circumstances" (situation)
3. "Spiritual Figures" (person)
4. "Yogic Principles" (principle)
5. "Sacred Texts" (scripture)
6. "Spiritual Practices" (practice)
7. "Paths of Yoga" (yoga_path)

Categories appear only when they contain at least one published topic. The homepage remains unchanged — six quality doors only.

### Scheduling

- `quality` and `situation` themes: Milestone 3b (existing plan)
- `practice` themes: Milestone 3b+ (practical themes like Meditation naturally emerge from the early content)
- `person`, `principle`, `scripture` themes: Milestone 3c+ (requires multi-book content for meaningful coverage; benefits from the Reverse Bibliography extraction pipeline)

### Alternatives Considered

| Approach | Why Rejected |
|----------|-------------|
| **Separate tables per category** | Unnecessary complexity; the same tagging infrastructure applies to all categories |
| **Hierarchical taxonomy** (e.g., scripture -> Gita -> Chapter 2) | Over-engineering for Milestone 3c; a flat per-category list is sufficient. Sub-categories can be added later if content depth warrants |
| **Merge with Reverse Bibliography** | Different user intent: "teach me about X" vs "show me where X is cited." Both valuable, different navigation paths |

### Consequences

- No schema migration needed — `category` column already accepts any text value
- The auto-tagging pipeline processes new categories identically to quality/situation themes
- Seed data for new categories should include rich, keyword-laden descriptions for effective auto-tagging
- The `/themes` page gains five new sections (appearing incrementally as content thresholds are met)
- The exploration categories create a rich navigational surface that invites study-oriented seekers to browse by framework, not just by emotional need
- **Extends FTR-121** with five additional categories on the existing taxonomy

## Notes

- **Origin:** FTR-122
