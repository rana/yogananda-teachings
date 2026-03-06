# SRF Online Teachings Portal — Future Open Questions

These are genuine open questions parked until their arc approaches. Triaged from CONTEXT.md during documentation crystallization (2026-02-23). Each question links to the ADR or design section that governs it.

When an arc enters active planning, move its questions back to CONTEXT.md § Open Questions for resolution.

---

## Milestone 3b+ (Editorial)

### Technical
- [ ] Audience suitability as enrichment dimension: should the enrichment pipeline (FTR-026) compute per-passage suitability markers (e.g., youth-appropriate, grief-context, general) to enable contextual filtering in thematic exploration (FTR-056) and guide pathways? Informed by seeker feedback patterns (FTR-061) over time. Not a Milestone 3b requirement — evaluate after thematic exploration is operational and contextual feedback provides signal. (FTR-026, FTR-056, FTR-061, FTR-072)

### Stakeholder
- [ ] Extreme-context access and institutional intermediaries: lighter-weight surfaces for hospitals, prisons, hospices, refugee camps? Institutional intermediary persona (chaplain, volunteer, hospice worker) accessing on behalf of seekers who cannot browse freely. If SRF affirms institutional access as in-scope, needs design attention by Milestone 3b. (FTR-006, FTR-051, FTR-040, FTR-047)

---

## Milestone 3d+ (Complete)

### Stakeholder
- [ ] Does the philanthropist's foundation want to publish "What Is Humanity Seeking?" as a standalone annual communications asset? Communications planning should begin before Milestone 3d dashboard ships. (FTR-154)
- [ ] Annual impact report format — PDF, web page, or both? Published by SRF or the foundation? (FTR-154)
- [ ] How does SRF frame impact for the foundation when the most meaningful outcomes are unmeasurable? Is the "What Is Humanity Seeking?" narrative sufficient, or are conventional reach metrics required? (FTR-154)
- [ ] Philanthropist's foundation operational visibility: editorial pipeline health or only impact metrics? (FTR-154, FTR-060)

---

## Milestone 5a+ (Distribution)

### Stakeholder
- [ ] Does SRF want Yogananda's teachings accessible to external AI assistants (ChatGPT, Claude, Gemini) via MCP? Distribution channel or risk to sacred text fidelity? Presentation constraints for AI consumers? Open, registered, or restricted access? (FTR-098, FTR-001, FTR-134, FTR-059)
- [ ] MCP and the SRF mobile app: should the app access portal content via MCP tools alongside HTTP API routes? (FTR-098, FTR-015)
- [ ] Sacred text in AI context: external AI may juxtapose Yogananda's words with other traditions. Interfaith enrichment or inappropriate decontextualization? (FTR-098, FTR-001)
- [ ] MCP copyright implications: "freely accessible on the portal" vs. "freely redistributable through any AI assistant worldwide." Legal and stakeholder question. (FTR-098, FTR-059, FTR-085)

---

## Arc 4 (Service)

### Technical
- [ ] GitLab migration plan: CI/CD pipeline rewrite (GitHub Actions → GitLab CI), Platform MCP adaptation, developer workflow change. Deserves an ADR before Arc 4 planning. (FTR-106, FTR-108, FTR-107)

---

## Milestone 5b+ (Languages)

### Technical
- [ ] Voyage voyage-3-large vs. voyage-multilingual-2 for CJK-heavy text: benchmark when CJK content exists. (FTR-024)
- [ ] Multilingual embedding quality evaluation: benchmark Voyage against Cohere embed-v3, BGE-M3 using actual translated passages. (FTR-024, FTR-024)
- [ ] Domain-adapted embeddings research: fine-tune multilingual base model on Yogananda's corpus. Requires multilingual corpus and per-language evaluation suites. (FTR-024)
- [ ] Transliteration support for Indic script search suggestions: Romanized input ("samadhi" not "समाधि"), CJK substring matching. (FTR-029, Milestone 5b)
- [ ] pgvector HNSW tuning at multilingual scale: ~400K chunks × 1024 dimensions. Document tuning strategy and Neon compute scaling threshold. (FTR-101, FTR-024, FTR-024)
- [ ] Mixed-script embedding quality for Gita commentary: validate excluding Devanāgarī from embedding input doesn't degrade verse-specific retrieval. (FTR-131, FTR-023, FTR-024)

### Stakeholder
- [ ] Hindi/Bengali/Thai audio-first pilot: can SRF/YSS provide existing *Autobiography* audiobook files alongside the text launch? Deferring all audio to Arc 6 creates a cultural equity gap for oral-tradition populations. UNESCO 2024: 347M low-literacy adults in Central/Southern Asia — for these populations, text-only is no access, not limited access. FTR-011 recommends existing audio ships with text at language activation time. **Stakeholder ask: provide existing Hindi and Bengali audiobook files for Tier 1 language activation.** (FTR-134, FTR-142, FTR-006, FTR-011)
- [ ] YSS photographic archives of Indian biographical sites (Gorakhpur, Serampore, Ranchi, Dakshineswar) for Sacred Places. (FTR-050, FTR-049)
- [ ] India's DPDPA cross-border transfer provisions: monitor as Milestone 5b Hindi/Bengali approaches. (FTR-085, FTR-058)
- [ ] Thailand's PDPA compliance: verify data handling for Thai locale. (FTR-085, FTR-058)
- [ ] Brazil LGPD Data Protection Officer requirement for Portuguese-language content. (FTR-085)

---

## Arc 6+ (Media)

### Technical
- [ ] Cloudflare R2 vs S3 for media assets: zero egress fees matter for free portal serving audio globally over 10 years. (FTR-142, FTR-004)
- [ ] Chant-to-recording catalog: does SRF maintain a mapping between chants and recordings? Data import vs. Arc 6 curation task. (FTR-142, FTR-142)

### Stakeholder
- [ ] Sanskrit term pronunciation recordings: approved audio for key terms (samadhi, pranayama, Kriya Yoga, Aum)? Glossary schema reserves `pronunciation_url`. (FTR-131, FTR-062)

---

## Arc 7 (Community)

### Stakeholder
- [ ] Does the teaching portal get its own mobile app, or integrate into the SRF/YSS app? (FTR-015)
- [ ] Can SRF provide center location data for "Meditation Near Me" feature? (Milestone 7b)
- [ ] Community curation governance: who reviews community collections? Theological boundaries for collection approval? Disclaimer text? (FTR-143)
- [ ] VLD portal roles: `vld` Auth0 role? Who manages assignment? Can curation count toward service hours? (FTR-143)
- [ ] Community collection attribution: curator names or anonymous by default? Ego dynamics vs. accountability. (FTR-143)
- [ ] Community curation vs. official SRF publications: complementary or competing? Visual distinction from Editorial Reading Threads? (FTR-143, FTR-063)
- [ ] VLD coordinator role: same as portal coordinator or separate? (FTR-143)
- [ ] VLD service reporting: participation reports vs. no-gamification principle. (FTR-143, FTR-082)
- [ ] VLD expansion beyond curation: translation review, theme tag review, feedback triage? (FTR-143, FTR-060)
- [ ] Existing VLD digital tooling integration. (FTR-143)
