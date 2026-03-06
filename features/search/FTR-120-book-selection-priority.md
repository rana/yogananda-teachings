# FTR-120: Book Selection and Ingestion Priority

**State:** Approved
**Domain:** search
**Arc:** 1a+
**Governed by:** PRI-03, PRI-05

## Rationale

### FTR-120: Autobiography of a Yogi as Focus Book

#### Context

The SRF corpus spans dozens of books and thousands of pages. Arc 1 needs a single book to prove the search pattern.

| Book | Pages | Why Consider | Why Not |
|------|-------|-------------|---------|
| **Autobiography of a Yogi** | ~500 | Most widely read; accessible; diverse topics; narrative style | Less scriptural commentary |
| The Second Coming of Christ | ~1,600 | Rich scriptural commentary; verse-by-verse structure tests chunking | Massive; OCR quality uncertain; 2 volumes |
| God Talks With Arjuna | ~1,200 | Dense philosophical content; tests semantic search depth | Similar concerns as above |

#### Decision

Start with **Autobiography of a Yogi**.

#### Rationale

- Most recognizable and accessible Yogananda work
- Moderate size (~500 pages, manageable for manual QA)
- Contains diverse topics (meditation, miracles, science, daily life, relationships, death) — good for testing search breadth
- Narrative prose style tests the chunking strategy differently than verse commentary
- Available in many translations (useful for future multi-language testing)

#### Consequences

- The chunking strategy optimized for narrative prose may need adjustment for verse-by-verse commentary books (Second Coming, Bhagavad Gita) later
- Arc 1 demonstrates the concept on the most popular book, which is strategically useful for stakeholder presentations

### FTR-120: Book Ingestion Priority — Life-Impact Over Scholarly Significance

#### Context

The Roadmap (Milestone 3a) originally listed post-Arc 1 books in an order roughly corresponding to scholarly depth and corpus size: The Second Coming of Christ, God Talks With Arjuna, Man's Eternal Quest, The Divine Romance, etc. However, the question of what makes the portal *essential* for seekers shifts the optimization target from scholarly completeness to life-impact — which books most directly address the reasons people seek spiritual guidance?

| Ordering Criterion | Optimizes For | Risk |
|-------------------|---------------|------|
| **Scholarly significance** | Deep students, long-term corpus completeness | Multi-volume scriptural commentaries are massive (1,200–1,600 pages each) and require complex verse-aware chunking — delaying the availability of more accessible works |
| **Life-impact potential** | Newcomers, seekers in crisis, daily visitors, SEO discoverability | Smaller, topically organized books may have less depth per passage |

#### Decision

Reorder book ingestion to prioritize **life-impact potential** — books that are topically organized, highly quotable, and directly address universal human struggles (fear, grief, health, relationships, purpose).

**Revised priority:**

| Priority | Book | Rationale |
|----------|------|-----------|
| 1 | *Autobiography of a Yogi* | Arc 1 focus (already decided, FTR-120) |
| 2 | *Where There Is Light* | Organized by life topic (hope, courage, healing, success). Directly powers thematic navigation. Maps to the "Doors of Entry" feature. |
| 3 | *Sayings of Paramahansa Yogananda* | Standalone aphorisms — naturally pre-chunked. Powers the "Today's Wisdom" daily passage feature. Lowest ingestion complexity. |
| 4 | *Scientific Healing Affirmations* | Directly addresses health, abundance, and peace. Powers "The Quiet Corner." Practical and actionable. |
| 5 | *Man's Eternal Quest* | Collected talks addressing every major life challenge. Rich, practical, accessible prose. |
| 6 | *The Divine Romance* | Collected talks on love, relationships, divine longing. Deeply poetic and practical. |
| 7 | *How You Can Talk With God* | Short, accessible, foundational. Good for newcomers. |
| 8 | *Metaphysical Meditations* | Affirmations and meditations. Supplements the Quiet Corner and daily passage features. |
| 9 | *Journey to Self-Realization* | Third volume of collected talks. |
| 10 | *Wine of the Mystic* | Rubaiyat commentary — beautiful but niche audience. |
| 11–12 | *Second Coming of Christ / God Talks With Arjuna* | Massive multi-volume scriptural commentaries. Highest value for advanced students. Require verse-aware chunking (complex). Lower urgency for making the portal essential to newcomers. |
| 13 | *The Holy Science* (Swami Sri Yukteswar) | Guru tier (FTR-001). Dense, aphoristic philosophical text. Requires author-specific chunking parameters (shorter target range). Directly relevant to FTR-125 scientific-spiritual bridge themes. |
| 14 | *Only Love* / *Finding the Joy Within You* / *Enter the Quiet Heart* (Sri Daya Mata) | President tier (FTR-001). Conversational style closer to Yogananda's collected talks. Three short volumes. |
| 15 | *The Guru and the Disciple* (Sri Mrinalini Mata) | President tier (FTR-001). Editorial/biographical work about Yogananda's posthumous publications. |
| 16 | *Rajarsi Janakananda: A Great Western Yogi* | President tier (FTR-001). Biographical, SRF-published. |

#### Rationale

- Books 2–4 are short, topically structured, and low-complexity for ingestion — they deliver outsized impact for minimal engineering effort
- *Where There Is Light* is literally a topical index of Yogananda's teachings — its structure maps directly to the teaching topics navigation feature
- *Sayings* requires almost no chunking strategy — each saying is a natural chunk
- The two large scriptural commentaries (1,200–1,600 pages each, verse-by-verse structure) require specialized chunking and represent significant ingestion effort for an audience that skews toward advanced students
- This ordering maximizes the portal's usefulness to the broadest audience soonest

#### Consequences

- Milestone 3a scope changes: the multi-volume scriptural commentaries move from "first after Arc 1" to "after the collected talks"
- The verse-aware chunking challenge (originally a Milestone 3a concern) is deferred, allowing more time to design a robust solution
- The portal reaches "critical mass" of quotable, thematically diverse content sooner
- *Where There Is Light* + *Sayings* + *Scientific Healing Affirmations* can potentially be ingested in the same sprint as Milestone 3a begins, since they are short and structurally simple

## Notes

- **Origin:** FTR-120 (Rationale) + FTR-120 (Rationale)
- **Merge:** Two related ADRs covering book selection for Arc 1 and post-Arc 1 ingestion priority
