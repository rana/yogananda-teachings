# FTR-009: DELTA-Relaxed Authenticated Experience

**State:** Approved
**Domain:** foundation
**Arc:** 7a+
**Governed by:** PRI-08, PRI-09

## Rationale

- **Date:** 2026-02-23

### Context

DELTA (Dignity, Embodiment, Love, Transcendence, Agency) governs the portal's relationship with seekers (FTR-082). The default experience is anonymous: no user identification, no session tracking, no behavioral profiling. This is correct and foundational.

However, certain features genuinely require persistent user state: synced bookmarks across devices, reading progress that persists across sessions, personal passage collections, and persistent language preferences. Local storage provides some of this, but it is device-bound and fragile.

FTR-022 (Lessons Integration Readiness) already contemplates authenticated users for future Lessons content. FTR-046 (Lotus Bookmark) uses local storage for bookmarks. The question is: when a user *chooses* to create an account, what changes in the portal's behavior, and what doesn't?

### Decision

The portal offers two experience tiers:

**Anonymous (default, full DELTA compliance):**
- Core search, read, and browse: full access, no account required
- Bookmarks and reading position: local storage only (device-bound)
- Language preference: browser setting or session selection
- No user identification, no session tracking, no behavioral profiling
- All content freely available — no "sign up to access" gates

**Authenticated (opted-in, expanded features):**
- Everything anonymous users have, plus:
- **Bookmarks sync:** Saved passages accessible from any device
- **Reading progress:** Persistent position across sessions and devices
- **Personal collections:** Curated passage groups with private notes
- **Language preference:** Persistent across devices
- **Practice background** (optional): Tradition background and practice level, user-provided, used only for `/guide` pathway recommendations
- Auth provider: Auth0 (consistent with SRF's established stack)

**DELTA commitments that do NOT change for authenticated users:**

| Principle | Authenticated Behavior |
|-----------|----------------------|
| **Dignity** | No behavioral profiling. Account data is what the user explicitly provides — never inferred. |
| **Embodiment** | No engagement metrics. No "you've read 47 passages this week" dashboards. No retention nudges. |
| **Love** | Same compassionate, calm interface. No upsells, no "premium" tiers. |
| **Transcendence** | No gamification. No streaks, badges, or reading leaderboards. |
| **Agency** | Account deletion always available. All data exportable. User controls what's stored. |

**What authenticated users do NOT get:**
- No profile embedding or soft personalization (no algorithmic content recommendation based on reading patterns)
- No "suggested for you" based on behavioral analysis
- No reading history analytics visible to staff (aggregate, anonymized usage signals per FTR-031 apply equally to all users)
- No authenticated-only content (until Milestone 7a+ Lessons integration per FTR-022)

### Rationale

- **Persistent state genuinely serves seekers.** A practitioner studying Yogananda's works across months wants their bookmarks and reading position to follow them. This is a legitimate need, not an engagement tactic.
- **DELTA governs the relationship, not the mechanism.** An account is a container for the user's own data. DELTA prohibits using that data against the user's spiritual interests. The same principles apply — the implementation changes, the ethics don't.
- **Opt-in is the critical distinction.** The anonymous experience is complete. Nothing is withheld. The account adds convenience features, not content access. A user who never creates an account misses nothing of the teaching.
- **Aligns with SRF's established auth infrastructure.** Auth0 is already in SRF's technology stack. No new vendor required.

### Consequences

- New `user_profiles` table in FTR-021: `id`, `auth0_id`, `preferred_language`, `tradition_background` (optional), `practice_level` (optional), `created_at`
- No `profile_embedding` column — soft personalization explicitly rejected
- New `user_bookmarks`, `user_collections`, `user_reading_progress` tables
- Auth0 integration added to DESIGN.md security section (FTR-016)
- CONTEXT.md DELTA framework section updated with authenticated-tier documentation
- FTR-046 (Lotus Bookmark) extended: local storage for anonymous users, server-synced for authenticated users
- Milestone 7a+ Lessons integration (FTR-022) builds on this authentication layer
