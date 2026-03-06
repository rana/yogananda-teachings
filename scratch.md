---
description: Idea backlog and exploration workspace. Processed by `/scratch` skill.
---


# Scratch Pad

---
Think deeply, slowly, carefully, and thoroughly.

Think generatively and imaginatively.

You have complete design autonomy.

Be proactive.

How would you design for a world-class amazing experience?

Resonate at the highest octaves of expression.

How holographically crystalline is the design?

---
Would you remove or thin anything from the project? Nothing is also fine.

---
Think slowly and carefully.
Be proactive — bias to action.

---
What is idiomatic enterprise world class you would prefer?
Thoroughness: very thorough
What would make it smooth and graceful for a human?

---
Think slowly, deeply, thoroughly and carefully.

/compose garden greenfield, gaps, coherence, crystallize


/compose deep-review, garden greenfield, gaps, coherence, docs-quality, crystallize
/deep-review

---
What questions would I benefit from asking to clean up the project?

---
Proceed with 5 more iterations of the original questions.
Bias towards action.
Answer your own questions.
Proceed without my confirmation.
You have complete design autonomy.
Proceed.

---
Reflect on Phase Consolidation and Thematic Organization. Read proposal file `/home/rana/prj/srf-yogananda-teachings/.elmer/proposals/explore-reduced-number-of-phases-synthesis.md`.

---
Explore reduced number of phases. Consider a theme for each phase. Unscheduled Features section is available. What is the SRF Online Teachings Portal mission?

---
Explore the SRF Yogananda Teachings project for structural cleanup opportunities. Specifically:

1. Check for orphaned cross-references — find any ADR-NNN, DES-NNN, or PRO-NNN references that point to identifiers that don't exist
2. Check for inconsistencies between the DECISIONS.md index and the actual ADR bodies in DECISIONS-core.md, DECISIONS-experience.md, DECISIONS-operations.md
3. Check if the .elmer/proposals/ directory has any non-archived explorations that haven't been curated
4. Look for any duplicate or near-duplicate content across the DESIGN files
5. Check CONTEXT.md for open questions that may actually be resolved (based on what's in DECISIONS or PROPOSALS)
6. Look for any files in the repo that aren't referenced from the main documentation structure

Report findings with specific file paths and line numbers.
---


## Format

- **Open items:** `- [ ] [P1] Item text → /suggested-skill`
- **Completed items:** `- [x] Item text → outcome note`
- **Priority:** `[P1]` high impact, `[P2]` medium, `[P3]` exploratory
- **Skill hint:** `→ /skill-name` (what `/scratch` would recommend)

## Open Items

### P1 — High Impact

- [ ] [P1] Trace through each user workflow for gaps or improvements → `/workflow-trace seeker reading journey`
- [ ] [P1] Trace through each user experience for gaps or improvements → `/workflow-trace new visitor first encounter`
- [ ] [P1] Ability to roll back entire platform release across all services. Entire surface progresses as single step which can rollback. Consider deployment scenarios. Perhaps side by side deployment → `/ops-review deployment rollback`
- [ ] [P1] Architecture patterns. Review architecture patterns in use and omitted. What patterns benefit us? Do we prefer loosely coupled, and are we applying it if relevant? → `/deep-review architecture patterns`
- [ ] [P1] Is the data model consistent and well-reasoned? Do I explain design and reasons why sufficiently? → `/api-review data model`
- [ ] [P1] Is the editorial workflow architecture consistent and well-reasoned? Do I explain design and reasons why sufficiently? → `/workflow-trace editorial pipeline`
- [ ] [P1] Is the content pipeline consistent and well-reasoned? Do I explain design and reasons why sufficiently? → `/workflow-trace content ingestion pipeline`
- [ ] [P1] Is the MCP architecture consistent and well-reasoned? Do I explain design and reasons why sufficiently? → `/api-review MCP architecture`

### P2 — Medium Impact

- [ ] [P2] Consider a site/feature/mechanism for SRF Staff to communicate available open tasks to VLD members for them to complete. Think through workflow of all involved → `/workflow-trace VLD task assignment`
- [ ] [P2] Consider that AI (you) is architect, designer and implementer. Humans are also in the loop. Is it valuable to document that? Or a distraction? → `/docs-quality AI-human collaboration documentation`
- [ ] [P2] Consider a new INFRASTRUCTURE.md or TECH-STACK.md or similarly named document next to existing markdown documents. What is the value proposition, if any? Would it help Claude? → `/docs-quality document structure`
- [ ] [P2] Is the visual design system consistent and well-reasoned? Do I explain design and reasons why sufficiently? → `/seeker-ux visual design system`

### P3 — Exploratory

- [ ] [P3] Consider WebGL, https://spline.design, and others. What would be of service, if anything? Maybe nothing? → `/explore-act`
- [ ] [P3] Explore Google Storybook (https://gemini.google.com/gem/storybook). "Create a customized picture book, for either children or adults, given a topic, an optional target audience age, and an optional art style for the images." Provide as documentation of available resource for Lay members, VLD, and SRF staff. Could there be community submission reviewed by VLD/staff and approved for sharing? → `/explore-act`

## Template

```
Deep multi-dimensional perspective.

[INSERT ITEM OF FOCUS]

What questions would I benefit from asking?

What am I not asking?

You have complete design autonomy.

If this exploration yields something worth keeping, propose where it belongs in the project documents.
```

## Completed Items

- [x] 1 — Consider services for high quality embeddings for supporting all earth languages. That is core to product offering and may justify expense.
- [x] 2 — Search bar, auto word suggestions in each language. Intelligent like Google.
- [x] 3 — Are we designing, implementing, operating on the highest octaves of expression?
- [x] 4 — Modern 2026 UX. Is there UX we can apply to uplift the experience?
- [x] 5 — What are novel learning experiences, exploration experiences, organization experiences?
- [x] 6 — Capability for anyone in SRF staff, monastics, lay members, open public people to create a section. Public curation.
- [x] 7 — Knowledge graph — ensure all medias included (book, articles, videos, audio, etc).
- [x] 8 — Portal page. High density text of categories and subcategories. Similar to https://lib.rs.
- [x] 9 — Cosmic chants book with side cross links to audio video of chant being read.
- [x] 10 — Sanskrit display and glossary. Cultural origins of India.
- [x] 11 — People Library include and support monastics. Biography, convocation, lineage.
- [x] 12 — Inhabit SRF staff perspectives, content editors. VLD empowerment. AI automation with human-in-the-loop.
- [x] 15 — Scan and clean off-center, unkind terms. Choose compassionate or neutral terms.
- [x] 17 — Usage stats of services → Google Analytics rejected (DELTA-incompatible). Added: `requested_language` + `zero_results` to Amplitude schema, Standing Operational Metrics table in FTR-082, Google Search Console evaluation + AI cost alerting + observability cost budget + dashboard cadence questions to CONTEXT.md, standing geographic monitors to Phase 7.7, content availability matrix + unmet language demand to Phase 11.14.
- [x] 18 — Autonomous research and design with branching → Built as Elmer (`/home/rana/prj/elmer/`).
- [x] 19 — Automated end user release notes when portal is released and deployed.
- [x] 22 — Comparative analysis of SRF tech stack with ADR decisions.
- [x] 23 — Create skills for common prompts → Built: 9 personal skills + 3 SRF project skills.
- [x] 26 — Global privacy compliance. GDPR, Europe, Germany, etc.
- [x] 27 — Device form factor support. Mobile, tablets, desktop.
- [x] 28 — Phase sizing and organization. Greenfield perspective.
- [x] 30 — Survey potential personas for the use of the portal.
- [x] 31 — UX needs based on spiritual path (new, studying, veteran of 20+ years).
- [x] 33 — Inter-faith/spiritual/agnostic/atheist perspectives.
- [x] 34 — What wants to emerge?
- [x] 35 — Age-centric experiences. What do we have? What would serve?
- [x] 36 — Cultural insensitivity and biases. Actionable improvements.
- [x] 37 — Verbatim directives for the master's words. High-fidelity clarity.
- [x] 41 — Public overview of Kriya Yoga teachings and SRF Lessons.
- [x] 42 — MCP adequately captures portal offerings. Knowledge Graph.
- [x] 44 — Servicing search engines, web crawlers, LLM bots.
- [x] 45 — API design surface consistent and well-reasoned.

## Archived Prompts

Historical prompts already processed through `/explore-act` in previous sessions. Kept for reference.

<details>
<summary>Reading experience exploration (early sessions)</summary>

Focus on reading experience. How to make it world-class and amazingly accessible to all humans of Earth? How can we make this a highly serviceful, delightful experience for the reader?

Some ideas: side panel of related works across whole library, top three related readings with option to explore all, graph traversal of related content, transcribe audio/video, proactive suggestions.

Search bar background text: "How can I help you?"

Include an end-to-end test of related text to ensure it is providing high-quality suggestions.

</details>

<details>
<summary>World-class reading experience + innovation</summary>

Beyond what we have already defined. What would make the reading experience world-class and amazingly accessible? What innovative concepts might we consider? What simple touches would uplift the heart? Consider SRF website imagery?

</details>

<details>
<summary>Release summaries for stakeholders</summary>

When a version of the teaching portal is released, three types of summaries may be produced: high-level, medium-level, and detailed-level for different audiences.

</details>

<details>
<summary>SRF app snapshots for ideas</summary>

Make snapshots of SRF mobile app for members and member's portal for design inspiration.

</details>

<details>
<summary>Coherence and crystallization review</summary>

Reflect through markdown documents looking for coherence and alignment. Would you simplify anything? Remove anything? Is the design crystalline? What are you not enthusiastic about? What are you enthusiastic about?

→ Now available as: `/coherence`, `/crystallize`

</details>

<details>
<summary>Multilingual design check</summary>

Do all our designs support multilingual? REST API support? Embedding cross-reference to same language only?

</details>

<details>
<summary>Sharing features exploration</summary>

Sharing via email, download, social media. Format text or PDF. SRF lotus branding. Dwell feature for web.

</details>

<details>
<summary>Serving Earth humans — equity check</summary>

People with little means. Perspectives of each Earth culture. Rural minimal infrastructure. American software engineer blind spots.

→ Now available as: `/cultural-lens`, `/seeker-ux`

</details>

<details>
<summary>Deployment, cost, mobile, Global South</summary>

1. Deploying from GitHub with Terraform. Multiple environments. GitLab migration.
2. "Related Teachings" vs "Continue the Thread" distinction.
3. Entire stack cost optimization. AWS services, Lambdas.
4. Global South considerations.
5. Mobile app design (Android, iOS).

</details>

<details>
<summary>Cross-project document comparison</summary>

How coherent and resonant are our markdown documents? Compare with `/home/rana/prj/mercury/`.

</details>

<details>
<summary>Operational, ADR renumbering, coherence, blind spots, cultural, REST endpoints</summary>

1. Operational gaps and costs → `/ops-review`
2. ADR renumbering value → Explored, decided on sequential reading order.
3. Document coherence, obsolete info, diagram validity → `/coherence`
4. Blind spots, phase traces → `/gaps`
5. Cultural perspectives (9 cultures) → `/cultural-lens`
6. REST endpoint expansion: `/v1/places/[slug]`, `/v1/people/[slug]`, `/v1/explore/[theme]` → `/api-review`

</details>

<details>
<summary>Opportunity mining + deep review + documentation practices</summary>

Multiple sessions: mine for unseen opportunities, identify architectural simplifications, underexploited capabilities, strategic gaps. Deep multi-dimensional coherence/gap/mistake/cross-reference checks. Documentation protocols and conventions.

→ Now available as: `/deep-review`, `/gaps`, `/coherence`, `/docs-quality`

</details>

<details>
<summary>Skills exploration (this session)</summary>

Explored Claude Code Skills system. Designed and built 12 skills (9 personal + 3 SRF project). Eliminated 6 duplicate commands. Evolved scratch.md format.

</details>
