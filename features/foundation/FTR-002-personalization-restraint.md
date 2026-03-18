---
ftr: 2
title: "Personalization with Restraint — DELTA-Aligned Feature Boundaries"
summary: "Three-tier classification of personalization features: build, build-with-caution, and never-build"
state: approved-foundational
domain: foundation
governed-by: [PRI-08, PRI-09]
---

# FTR-002: Personalization with Restraint

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
- The portal's anonymous experience (Milestones 1a–5c) must be excellent without any personalization — personalization enhances but never gates the core experience

### DELTA as Advantage (Discovery Research, March 2026)

Research on content-only recommendation systems (deep-research-report-discovery-without-surveillance-2026.md) provides empirical support for the DELTA framework's design philosophy:

**The permanent cold start is a feature, not a bug.** Behavioral recommendation systems require an average of 11.3 sessions to stabilize a user's latent taste vector — during high-intent moments of need (grief, crisis, spiritual yearning), the system fails because it hasn't accumulated enough data. The portal's permanent cold start forces investment in corpus intelligence — enrichment metadata, knowledge graph, structural analysis — producing a system that responds to the seeker's *current* state of being rather than a mathematically averaged shadow of past behaviors.

**Content-only systems eliminate popularity bias and filter bubbles.** Collaborative filtering creates rich-get-richer dynamics and echo chambers. Pure content-based discovery (powered by the portal's 14 enrichment fields, rasa classification, depth signatures, and cross-work concordance) surfaces passages based on intrinsic resonance rather than social proof.

**The constraint produces superior discovery for sacred text.** A discovery experience that feels "chosen by someone who cares" serves seekers more deeply than one that feels "computed from your reading history." The portal's editorial curation, gift framing, and corpus-as-curator approach — all enabled by the DELTA constraint — create a phenomenology of care that behavioral systems cannot replicate.
