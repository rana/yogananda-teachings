# FTR-161: Practice Signals — Anonymous Practice Engagement Without Surveillance

- **State:** Proposed
- **Domain:** experience
- **Arc:** 3b+
- **Governed by:** PRI-04 (Signpost, not destination), PRI-08 (Calm Technology), PRI-09 (DELTA), FTR-031 (Passage Resonance), FTR-055 (Practice Bridge)

## Rationale

### Context

FTR-031 (Passage Resonance) measures content-level signals: which passages are shared, dwelled upon, or traversed. These are *consumption* signals — they tell editorial which teachings are being read. But the portal's deepest purpose (PRI-04) is not reading but *practice*. The portal is a signpost; the destination is spiritual practice.

No existing signal measures whether the signpost is working. When a seeker reads about meditation and then meditates, the portal has succeeded — but has no way to know. When a seeker reads about forgiveness and then forgives, the teaching has landed — but the signal is lost.

Practice Signals close this gap: a quiet, optional, anonymous mechanism for seekers to indicate "I applied this teaching." Not gamification. Not a streak. Not a score. A single quiet acknowledgment that the words became action.

### Decision

Add an optional "I practiced this" signal to passages that link to practice (FTR-055 Practice Bridge content). The signal is:

1. **A single tap/click** — no form, no journal, no reflection prompt. One action.
2. **Anonymous** — monotonic counter increment per FTR-031 pattern. No user ID, no session, no timestamp beyond the hour bucket for rate limiting.
3. **Rate-limited** — one increment per signal type per client IP per hour (same as FTR-031).
4. **Never celebrated** — no animation, no congratulation, no "you practiced 5 times this week." The acknowledgment is the act itself. The UI response is a subtle state change (e.g., icon fills from outline to solid) that persists for the session only.
5. **Never displayed as a count** — seekers never see how many others practiced. Only editorial sees aggregate patterns.
6. **Only on practice-adjacent content** — passages tagged with practice_bridge intent (FTR-055) or technique-related teaching topics (FTR-121). Not on every passage.

### Schema Extension

Extends FTR-031 pattern with one new column:

```sql
ALTER TABLE book_chunks ADD COLUMN practice_signal_count INTEGER NOT NULL DEFAULT 0;
```

### Editorial Value

Practice signals tell editorial:
- Which teachings are being *applied*, not just read
- Whether the Practice Bridge (FTR-055) is functioning — are seekers moving from reading to practice?
- Which books/chapters have the highest practice-to-read ratio — a proxy for transformative impact

### Constraints

- **No gamification** (PRI-08) — no streaks, badges, leaderboards, celebrations, or any mechanism that rewards frequency.
- **No behavioral profiling** (PRI-09) — the signal is a counter on a passage, not a record on a person.
- **No encouragement to signal** — the option is present but never promoted. No "Don't forget to mark your practice!" No push notifications. The portal waits.
- **Opt-in visibility** — the practice signal affordance is hidden by default and revealed only when a seeker discovers it through the Practice Bridge context or through the reader preferences panel.

### Re-evaluate At

Arc 3b boundary — after Practice Bridge (FTR-055) is operational and generating practice-adjacent content tags.

### Decision Required From

Theological review: Is it appropriate for the portal to acknowledge practice in any form? Could even a quiet signal create subtle pressure to perform? Consult with SRF editorial.

### Source Exploration

`what-is-resonating-at-the-lowest-octaves-of-expression.md`

## Notes

- **Origin:** Extracted from archived proposal during FTR novelty audit (2026-03-05)
- Architecturally extends FTR-031 (same counter pattern, same rate limiting, same editorial-only visibility)
- The key distinction from FTR-031: resonance measures consumption; practice signals measure application
