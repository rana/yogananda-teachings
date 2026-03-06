---
ftr: 51
title: Crisis Support
state: approved-provisional
domain: experience
arc: "2"
---

# FTR-051: Crisis Support

## Rationale

### FTR-051: Crisis Resource Presence — Gentle Safety Net on Grief and Death Content


### Context

The portal's grief and death content strategy targets seekers searching for "what happens after death," "spiritual comfort after loss," and "soul immortality." These are among the portal's highest-impact empathic entry points — they serve people in genuine pain. The SEO strategy deliberately positions the portal to rank for grief-related Yogananda queries.

This strategy will reach people who are actively suicidal. A person searching at 2 AM for "what happens after death" may not be grieving a loss — they may be considering ending their own life. Yogananda's passages about the immortality of the soul, the freedom of death, and the continuation of consciousness are truthful and beautiful. But presented without context to a person in crisis, they could be read as endorsement of self-harm — a reading that fundamentally contradicts Yogananda's teaching that human life is a sacred opportunity for spiritual growth.

The portal's "direct quotes only" principle (FTR-001) means it cannot add interpretive framing around passages. The Calm Technology principle means it cannot use aggressive modals or interstitials. The DELTA framework means it cannot identify or track vulnerable users. The question is: within these constraints, what is the portal's moral responsibility?

### Decision

1. **Display a non-intrusive crisis resource line on grief-adjacent content.** On the grief theme page (`/themes/grief`), on search results pages when the query matches grief/death intent patterns, and on the Quiet Corner page, display a single quiet line below the content area:

 > *If you or someone you know is in crisis, help is available.* [Crisis helpline link]

 Styled in `portal-text-muted`, smaller than body text, visually consistent with footer links — present but not competing with the teachings. No modal, no pop-up, no interstitial.

2. **Locale-appropriate crisis resources.** Each supported locale provides the appropriate helpline:
 - `en`: 988 Suicide and Crisis Lifeline (US), Samaritans 116 123 (UK/EU)
 - `es`: Teléfono de la Esperanza (Spain), local equivalents (Latin America)
 - `hi`/`bn`: iCall, Vandrevala Foundation, AASRA
 - `ja`: Inochi no Denwa
 - `th`: Samaritans of Thailand (1323)
 - Other locales: IASP directory link as fallback

 Resource data stored in locale files (`messages/{locale}.json`) alongside other UI strings. Editorial review required for all crisis resource text (consistent with FTR-135).

3. **Intent detection is simple, not invasive.** The system does not analyze individual user behavior. Grief-adjacent content is identified by *content type* (grief theme page, death-related teaching topic), not by *user signals*. If a page is about death, it carries the resource line — regardless of who is reading or why.

4. **The Quiet Corner always carries the resource line.** The Quiet Corner is designed for the "2 AM unable to sleep" persona (DESIGN.md § The Quiet Corner). This is the portal's highest-vulnerability context. The crisis resource line is a permanent, subtle feature of the Quiet Corner page.

### Alternatives Considered

1. **No crisis resources at all.** Considered: The portal is a library, not a mental health service. Adding crisis resources could feel patronizing or out of place. However: the portal's SEO strategy *deliberately* targets people searching for comfort around death. Deliberately attracting vulnerable seekers while providing no safety net is a moral failure, not a design choice.

2. **Prominent crisis modal or banner.** Rejected: Violates Calm Technology. A modal on grief content would be alarming, would interrupt the contemplative experience, and would treat every seeker reading about death as a potential suicide risk — which is both inaccurate and disrespectful.

3. **AI-powered crisis detection.** Rejected: Violates DELTA (no behavioral profiling). Would require analyzing user intent beyond content classification. Architecturally incompatible with the portal's privacy commitments.

4. **Link only from the About page or FAQ.** Considered: Less intrusive but defeats the purpose. The person in crisis is not navigating to the About page. The resource must be where the vulnerability is — on the grief content itself.

### Rationale

- **Moral responsibility follows from intentional positioning.** The portal is not passively available — it actively seeks to rank for grief queries. This creates a duty of care that goes beyond what a generic library would bear.
- **The DELTA Dignity principle demands it.** "Users are seekers, not data points." Dignity includes acknowledging that some seekers are in danger and providing a path to help without surveillance or judgment.
- **Calm implementation is possible.** A single muted line below content is not an aggressive intervention. It is the digital equivalent of a crisis helpline card placed on the library counter — available to those who need it, invisible to those who don't.
- **Yogananda's teaching supports it.** Yogananda taught that human life is a precious opportunity for spiritual realization. Self-harm contradicts this teaching. Providing a crisis resource is consistent with the tradition's view of the sacredness of life.
- **Industry precedent exists.** Google displays crisis resources on suicide-related queries. YouTube shows them on self-harm content. The portal should meet this standard without adopting the surveillance mechanisms that accompany it on those platforms.

### Cultural Adaptation of Crisis Resources

The crisis model above was designed from a Western clinical perspective — individual suicidality, helpline-based intervention. This framing is culturally narrow:

- **Collective cultures (India, Latin America, Africa):** Crisis often manifests as family crisis, economic despair, or social shame rather than individual suicidality. The person in distress may not identify as individually suicidal.
- **Helpline trust and availability:** In the West, helplines are trusted and accessible. In much of the Global South, mental health helplines are sparse, stigmatized, or culturally inappropriate. Rural Indian seekers are more likely to contact a pandit, family elder, or local temple than call iCall or the Vandrevala Foundation.
- **Spiritual community as resource:** SRF/YSS centers, local meditation groups, and satsang communities are themselves crisis resources — particularly for seekers already engaged with the tradition.

**Adaptation:** Per-locale crisis resource data in `messages/{locale}.json` should support multiple resource types:

| Resource Type | Example | When Appropriate |
|---------------|---------|-----------------|
| **Helpline** | 988 (US), 116 123 (EU), iCall (India) | All locales — always included where available |
| **Community contact** | "Speak with a trusted elder or spiritual counselor" | Locales where helplines are sparse or stigmatized |
| **SRF/YSS center** | "Find a nearby SRF/YSS center: [link]" | All locales — the organization itself as pastoral resource |
| **Quiet Corner** | "The Quiet Corner offers a space for stillness" | All locales — the portal itself as immediate resource |

The per-locale resource configuration determines which types appear and in what order. The single muted line UI remains — but its content adapts to what the seeker's culture recognizes as help.

**Stakeholder question:** Does SRF/YSS have pastoral care resources (center contacts, counselors) that could complement helpline numbers? See CONTEXT.md § Open Questions (Stakeholder).

### Consequences

- New UI element: crisis resource line on grief theme page, grief-adjacent search results, and Quiet Corner
- Locale files extended with per-locale crisis resource data — supporting multiple resource types (helplines, community contacts, SRF/YSS centers), not only helplines
- CONTEXT.md § Spiritual Design Principles references this ADR
- CONTEXT.md § Open Questions (Stakeholder) includes crisis resource policy question for SRF input, and pastoral care resource question
- No schema changes, no API changes, no privacy implications
- Editorial review required for all crisis resource text before publication
- Annual review recommended: verify helpline numbers and URLs remain current
- Per-locale crisis resource configuration reviewed during Milestone 5b localization for cultural appropriateness


### FTR-051: Crisis Query Detection — Safety Interstitial for Acute-Distress Searches


### Context

When a seeker searches "I want to die," "how to end the pain," or similar acute-distress queries, the AI librarian faithfully returns passages about death and the soul's immortality — which, without context, could be read as affirming self-harm. FTR-051 handles crisis resources on grief *content pages*, but the search query surface is higher-risk because the seeker's distress is expressed in the query itself, and the results are algorithmically selected without editorial context.

This concern was identified as an open question in CONTEXT.md. It becomes relevant the moment the search index is live and a seeker can query it. The intent classification system (Deliverable M1c-4) provides the natural integration point.

### Decision

Add a `crisis` intent category to the search intent classification layer (FTR-005 E1). When a query is classified as crisis-intent:

1. **Display a crisis resource interstitial** above search results — not instead of results. The interstitial includes locale-appropriate crisis helpline information (e.g., 988 Suicide and Crisis Lifeline in the US, local equivalents internationally). The interstitial is calm, non-alarmist, and consistent with the portal's warm design language.

2. **Do not suppress search results.** The seeker may be searching for Yogananda's teachings on death for legitimate spiritual study. The interstitial is additive — it provides a safety resource without assuming the seeker is in crisis.

3. **Crisis classification uses a conservative threshold.** False positives (showing the interstitial for a non-crisis query about death) are acceptable and harmless. False negatives (missing a genuine crisis query) are the failure mode to minimize.

4. **Crisis resource list requires SRF review.** The specific helplines, language, and presentation must be approved by SRF before going live. This is not an engineering decision — it's a pastoral care decision.

5. **Sentry event logging.** Crisis-classified queries are logged as `search.crisis_intent` events (anonymized, no query text) for monitoring volume and ensuring the system is functioning.

### Rationale

- **Duty of care.** A spiritual teachings portal that returns passages about death to a distressed seeker without any acknowledgment of the distress fails a basic duty of care. The portal is a *signpost* — and sometimes the right signpost is a crisis helpline.
- **Additive, not restrictive.** The interstitial adds a resource; it doesn't block access to teachings. This respects seeker agency (DELTA: Agency) while acknowledging that spiritual content about death is complex territory for someone in acute distress.
- **Integration with existing architecture.** Crisis detection is a new intent category in the existing intent classification layer — not a separate system. It ships as part of Deliverable M1c-4 (search intent classification) with minimal additional complexity.
- **FTR-051 extension.** FTR-051 established the principle of crisis resource presence on grief content. This ADR extends that principle to the search surface, which is higher-risk because it responds to the seeker's own words.

### Consequences

- New intent category `crisis` added to the intent classification taxonomy (Deliverable M1c-11)
- Deliverable M1c-11 added to ROADMAP.md: crisis query detection and interstitial
- CONTEXT.md open question on crisis query detection resolved
- Crisis resource list (helplines, locale mapping, presentation) requires SRF stakeholder input — added to CONTEXT.md stakeholder questions if not already present
- Sentry event `search.crisis_intent` added to the observability allowlist (FTR-082)

---

## Notes

Merged from FTR-051 and FTR-051 (related ADRs) per FTR-084.
