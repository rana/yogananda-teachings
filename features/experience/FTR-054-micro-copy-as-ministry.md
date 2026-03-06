# FTR-054: Micro-Copy as Ministry

- **State:** Approved (Provisional)
- **Domain:** experience
- **Arc:** 2
- **Governed by:** FTR-054

## Rationale


### Context

The portal's visual design (warm cream, Merriweather serif, generous whitespace, SRF gold accents) creates a contemplative atmosphere the moment a seeker arrives. But visual design is only half of the portal's voice. The other half is *words* — not Yogananda's words (those are governed by sacred text fidelity), but the portal's own words: error messages, empty states, loading text, confirmation dialogs, ARIA announcements, placeholder text, and interstitial copy.

Over a 10-year horizon (FTR-004), dozens of developers will write UI strings. Without a shared understanding of the portal's verbal character, these strings will drift toward generic software copy ("No results found," "Error: please try again," "Loading..."). Each generic string is a missed opportunity — a moment where the portal could embody its mission but instead sounds like every other website.

The portal has a brand identity for its AI: "The Librarian" (FTR-077). But the portal itself — the non-AI UI text — has no equivalent verbal identity.

### Decision

1. **All UI copy is treated as reviewed content.** UI strings are not developer placeholder text. They are part of the seeker's experience and receive the same editorial attention as theme names and curated queries (FTR-135). This means: strings are externalized to locale files from Milestone 2a, reviewed by SRF-aware editors, and never shipped as first-draft developer copy in production.

2. **The portal's verbal character is: a warm, quiet librarian.** Consistent with FTR-077 but extended beyond the AI search persona to all UI text. The voice is:
 - **Warm, not clinical.** "We didn't find a matching passage" not "No results found."
 - **Honest, not apologetic.** "This page doesn't exist" not "Oops! Something went wrong."
 - **Inviting, not instructional.** "As you read, long-press any words that speak to you" not "Tap and hold to bookmark."
 - **Brief, not verbose.** One sentence where one sentence suffices. No filler, no exclamation marks, no emoji.
 - **Never cute, never corporate.** No "Oops," no "Uh oh," no "Great news!" The register is adult, respectful, and spiritually aware.

3. **Specific copy standards for high-impact moments:**

 | Moment | Standard copy | Portal copy |
 |--------|--------------|-------------|
 | No search results | "No results found" | "We didn't find a matching passage. Yogananda wrote on many topics — try different words, or explore a theme." |
 | Network error | "Network error. Retry." | A cached Yogananda passage about patience, with a quiet "Try again" link below. |
 | 404 page | "Page not found" | A Yogananda passage about seeking, with navigation home and a search bar. "This page doesn't exist, but perhaps what you're seeking is here." |
 | Empty bookmarks | "No bookmarks" | "You haven't marked any passages yet. As you read, long-press any words that speak to you." |
 | Loading state | Spinner + "Loading..." | Quiet skeleton screen. No text. If prolonged: the lotus threshold (FTR-040) as a fallback. |
 | Timer complete (Quiet Corner) | "Time's up" | No text. Just the chime. Optionally, after a moment, a new passage about carrying stillness into the world. |

4. **ARIA labels carry warmth.** Screen reader announcements are not markup-quality copy — they are the only voice the portal has for blind seekers. "You are now in the Quiet Corner, a space for stillness" rather than "Main content region, The Quiet Corner." "Five passages found about courage" rather than "Search results: 5 items." The warmth that sighted seekers receive from visual design, screen reader users receive from language.

5. **A micro-copywriting guide is maintained in the repository.** Location: `/docs/editorial/ui-copy-guide.md`. Contents: the voice principles above, a glossary of preferred terms (e.g., "seeker" not "user," "passage" not "result," "the teachings" not "our content"), and annotated examples for each page. This guide is a living document, updated as new UI surfaces are added.

### Alternatives Considered

1. **Leave copy to developer judgment.** Rejected: Over 10 years, developer turnover ensures inconsistency. The visual design system (DESIGN.md § Design Tokens) prevents visual drift; a verbal design system prevents copy drift. Same principle.

2. **Full copywriting review for every string before merge.** Considered: Ensures quality but creates a bottleneck. Decision: Milestone 2a strings are reviewed before launch. Post-launch strings are reviewed in batches during locale translation sprints (FTR-135). Developer-authored strings ship to staging, not directly to production.

3. **AI-generated UI copy.** Rejected: The portal prohibits AI-generated user-facing content (FTR-001, FTR-135). UI copy is user-facing. Consistency requires human authorship and review.

### Rationale

- **Every word is a teaching moment.** A portal dedicated to sacred text should treat its own words with care. A 404 page that quotes Yogananda on seeking transforms an error into an encounter.
- **ARIA labels are the portal's voice for blind seekers.** The warm cream background and generous whitespace do nothing for a screen reader user. The quality of the spoken language is their entire aesthetic experience.
- **10-year consistency requires a system.** Design tokens prevent visual drift. Copy standards prevent verbal drift. Both serve the same architectural longevity goal (FTR-004).
- **Micro-copy shapes first impressions.** A seeker's first error message, first empty state, or first loading experience forms a lasting impression of the portal's character.

### Consequences

- New file: `/docs/editorial/ui-copy-guide.md` (created during Milestone 2a alongside locale file externalization)
- All ARIA labels reviewed for warmth and clarity as part of Milestone 2a accessibility foundation (FTR-003)
- DESIGN.md § Frontend Design gains a "UI Copy Standards" subsection referencing this ADR
- Locale files (`messages/*.json`) include copy-guide annotations for translators
- CONTEXT.md open question added: editorial governance of UI copy (who reviews, what process)
- **Per-locale terminology adaptation:** The term "seeker" is the English-language editorial voice. Per-locale editorial review (Milestone 5b) should determine the culturally appropriate term in each language. In Hindi, *sādhak* (साधक, practitioner) or *pāṭhak* (reader) may resonate more than a literal translation of "seeker" — *sādhak* implies active practice, not searching. In Japanese, "seeker" (*tanbōsha*) implies outsider status; "practitioner" or "reader" may feel more respectful. The preferred terms per locale are documented in `/docs/editorial/ui-copy-guide.md` and applied consistently in `messages/{locale}.json`.
- No schema changes, no API changes


## Notes

Migrated from FTR-054 per FTR-084.
