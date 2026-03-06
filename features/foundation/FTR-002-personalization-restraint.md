# FTR-002: Personalization with Restraint — DELTA-Aligned Feature Boundaries

**State:** Approved (Foundational)
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-08, PRI-09

## Rationale

- **Date:** 2026-02-17

### Context

Modern web platforms use personalization extensively: behavioral recommendations, activity tracking, engagement metrics, push notifications. These techniques are designed to maximize time-on-site and retention — goals that directly conflict with the Calm Technology principles and DELTA framework governing this portal.

However, some personalization is genuinely helpful. A seeker who bookmarks a passage about courage should be able to find it again. A reader in Japan should see the portal in Japanese. The question is: where is the line?

### Decision

Classify personalization features into three tiers:

**Build (genuinely helpful):**

| Feature | Rationale | Milestone |
|---------|-----------|-----------|
| Language preference | Fundamental accessibility. Stored in cookie or account. | 5b |
| Font size / reading preferences | Accessibility. Local storage, no account needed. | 3b |
| Bookmarks ("My Passages") | Lets seekers curate a personal anthology of passages that moved them. | 3b (localStorage), 7a (server sync) |
| Reading position | Saves your place in a book. Basic reader functionality. | 7a |

**Build with caution:**

| Feature | The Concern | Constraint |
|---------|-------------|------------|
| Search history | Could feel like surveillance | Opt-in only. User can clear at any time. Never surfaced publicly. Deletable. |
| Theme preference for daily passage | If based on behavioral inference, this is algorithmic curation | Implement as explicit user choice ("I'd like more passages about Peace") — never inferred from behavior |

**Do not build:**

| Feature | Why Not |
|---------|---------|
| Reading streaks / activity tracking | Violates DELTA Transcendence principle. Reduces spiritual practice to metrics. |
| "You've read X books this month" | Gamification in disguise |
| "Recommended for you" (behavioral) | Netflix model. Violates DELTA Agency principle. Antithetical to Calm Technology. |
| Social features (public profiles, shared highlights) | The portal is a private sanctuary, not a social network |
| Push notifications | Antithetical to Calm Technology. The portal waits; it does not interrupt. |
| Engagement dashboards for users | Optimizes for screen time, which the DELTA Embodiment principle discourages |

### Rationale

- **DELTA Agency:** Users must retain full control. No algorithmic manipulation. Explicit choices only.
- **DELTA Embodiment:** The portal should encourage logging off and practicing — not maximizing session length.
- **DELTA Transcendence:** Spiritual depth is not quantifiable. No metrics, leaderboards, or streaks.
- **Calm Technology:** Technology should require the smallest possible amount of attention. Personalization that demands ongoing interaction (maintaining streaks, checking notifications) violates this.
- **Practical:** Every personalization feature requires user accounts, data storage, privacy policies, and GDPR compliance. Minimizing personalization reduces operational complexity.

### Consequences

- Milestone 7a (Optional User Accounts) remains the appropriate milestone for bookmark/reading-position features
- The "personalized daily passage" in Milestone 7a must use explicit theme preference, not behavioral inference
- The portal's anonymous experience (Arcs 1–5) must be excellent without any personalization — personalization enhances but never gates the core experience
