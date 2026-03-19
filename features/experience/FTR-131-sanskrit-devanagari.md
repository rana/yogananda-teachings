---
ftr: 131
title: "Sanskrit Display, Search Normalization, and Devanāgarī Typography"
summary: "Four-part policy for Sanskrit display fidelity, search normalization, Aum/Om distinction, and Hindi fonts"
state: implemented
domain: experience
governed-by: [PRI-01, PRI-05, PRI-06]
depends-on: [FTR-025, FTR-028]
---

# FTR-131: Sanskrit Display

## Rationale

### Context

Yogananda's published works contain Sanskrit in four distinct modes: (1) transliterated terms embedded in English prose ("samadhi"), (2) scholarly transliteration with IAST diacritics ("prāṇāyāma"), (3) Devanāgarī script quotations (original Bhagavad Gita verses in *God Talks with Arjuna*), and (4) phonetic/chanted forms ("Om Tat Sat"). SRF publications use house romanizations that sometimes diverge from academic IAST — "Babaji" rather than "Bābājī," "Kriya Yoga" rather than "Kriyā Yoga," "pranayama" in some books and "prāṇāyāma" in others.

This creates three technical challenges: (a) seekers searching for a term in any variant spelling must find matching passages regardless of which form the published text uses, (b) display must faithfully preserve whatever form appears in the SRF publication, and (c) certain terms — most notably Aum vs. Om — carry theological distinctions that search normalization must not collapse.

Sanskrit is not a STG-021 problem. It is embedded in the initial English corpus. *God Talks with Arjuna* contains Devanāgarī verses. The *Autobiography* and *Holy Science* contain heavy IAST transliteration. The ingestion pipeline, search index, font stack, and glossary must handle Sanskrit from the initial stage.

### Decision

Establish a four-part policy governing Sanskrit text throughout the portal:

**1. Display fidelity: SRF published text is canonical.**

The portal displays exactly what appears in SRF's published edition. If the book prints "pranayama" without diacritics, the portal displays "pranayama." If *God Talks with Arjuna* uses "prāṇāyāma" with full IAST, the portal displays that. The ingestion pipeline must not "correct" SRF spellings to academic IAST, nor strip diacritics from texts that include them.

**2. Search normalization: collapse orthographic variants, preserve semantic distinctions.**

The search index collapses purely orthographic variants so that all of the following resolve to the same search results:
- `pranayama`, `prāṇāyāma`, `PRANAYAMA`, `Pranayama`, `prana-yama`

Implementation:
- **Unicode NFC normalization** is a mandatory preprocessing step in the ingestion pipeline, applied before any text comparison, deduplication, embedding, or indexing. OCR output is unpredictable about precomposed vs. decomposed Unicode forms for IAST combining characters (ā, ṇ, ś, ṣ). NFC ensures consistent representation.
- **ICU normalization in pg_search BM25** handles diacritical variant collapsing natively via the ICU tokenizer (FTR-025). The `unaccent` extension remains available for pg_trgm fuzzy matching but is not needed for the primary full-text search index.
- **Display text is never modified.** The `content` column stores the original text with diacritics preserved. Only the search index and embedding input are normalized.

**Exception — Aum/Om:** Yogananda used "Aum" (three-syllable cosmic vibration) deliberately, distinguishing it from the single-syllable "Om." This distinction is theological, not orthographic. Search normalization must not collapse "Aum" to "Om." Instead, the Vocabulary Bridge (FTR-028) maps "Om" → ["Aum", "cosmic vibration", "Holy Ghost", "Amen"] for query expansion, preserving the distinction while ensuring seekers who search "Om" find Aum passages.

**General principle:** Where Yogananda's usage intentionally diverges from common usage and the divergence itself constitutes a teaching, the search system preserves the distinction via the terminology bridge (query expansion) rather than collapsing it in the index. Other examples: "meditation" (Yogananda's technique-specific meaning), "Christ" (Christ Consciousness / Kutastha Chaitanya), "Self-realization" (capitalized, specific metaphysical attainment).

**3. Devanāgarī handling in the English corpus.**

*God Talks with Arjuna* contains original Bhagavad Gita verses in Devanāgarī alongside romanized transliteration and English commentary. *The Holy Science* by Sri Yukteswar contains Sanskrit verses in Devanāgarī. The *Autobiography* contains heavy IAST transliteration. Each *Gita* chapter typically includes: (a) Devanāgarī verse, (b) romanized transliteration, (c) word-by-word translation, (d) Yogananda's full commentary.

- **Display:** Devanāgarī verses are preserved in `chunk_content` and rendered using Noto Sans Devanagari in the font stack. The Devanāgarī font loads from the initial stage (not STG-021) because the English-language Gita and Holy Science contain Devanāgarī — and because Hindi content is ingested early (FTR-011).
- **Search indexing:** Devanāgarī script passages *in the English corpus* are excluded from the embedding input via a script-detection preprocessing step. The English commentary and romanized transliteration are embedded. Rationale: embedding raw Devanāgarī verses alongside English commentary would dilute retrieval quality for the English-language search context — seekers search the commentary, not the original verses. **Exception:** Hindi corpus chunks are entirely Devanāgarī and are embedded normally — the exclusion applies only to Devanāgarī verse blocks within English-language chunks.
- **Chunking (extends FTR-023):** For verse-aware chunking in the English corpus, the Devanāgarī verse text is preserved as metadata on the verse-commentary chunk but excluded from the token count that determines chunk splitting. The romanized transliteration is included in both the chunk content and the embedding input. Hindi corpus chunks use standard chunking — the entire text is Devanāgarī and is treated as primary content.

**5. Devanāgarī as primary reading script (Hindi locale).**

With Hindi *Autobiography of a Yogi* (FTR-011), Devanāgarī transitions from supplemental verse blocks to a full-text reading experience. This requires typography treatment fundamentally different from occasional verse rendering:

- **Reading font:** Noto **Serif** Devanagari for sustained body text reading (not Noto Sans, which is used for UI chrome and verse display). Hindi readers expect serif-like letterforms with modulated stroke weight for long-form reading, analogous to Merriweather for English.
- **Font size scaling:** Devanāgarī glyphs are optically smaller than Latin at the same point size due to the shirorekha (headline) and complex conjunct forms. Hindi body text uses `--text-base-hi: 1.25rem` (20px) — approximately 11% larger than the Latin `--text-base` of 18px. This is a design token, not a hack.
- **Line height:** `--leading-relaxed-hi: 1.9` (vs. 1.8 for Latin). Devanāgarī requires slightly more vertical space due to the shirorekha connecting characters at the top and matras (vowel signs) extending below the baseline.
- **Optimal line length:** 40–50 aksharas (syllabic units) per line, vs. 65–75 characters for Latin. Hindi words tend to be longer due to conjunct clusters. `max-width` for the Hindi reader adjusted accordingly.
- **Drop capitals:** Omitted for Devanāgarī — this is a Western book convention with no equivalent in Hindi typographic tradition.
- **Text alignment:** `text-align: left` exclusively — never `text-align: justify`. Digital rendering engines execute poor letter-spacing between complex Sanskrit conjuncts (क्ष, त्र, ज्ञ, श्र) when justifying, destroying the sacred geometry and readability of the script. The Gita Press tradition prioritizes clarity of vertical bounds over raw character density (deep-research-gemini-sacred-reading.md § 4). This rule applies to all Devanāgarī text: Hindi body text, Gita verses in the English corpus, and Holy Science verses.
- **Font loading strategy:** On `/hi/` locale pages, Noto Serif Devanagari and Noto Sans Devanagari load **eagerly** (preload in `<head>`), not conditionally. Conditional loading remains for Devanāgarī content appearing on English-locale pages (Gita verses, Holy Science verses).
- **Conjunct rendering QA:** Hindi has hundreds of conjunct characters (jodakshar): क्ष, त्र, ज्ञ, श्र, and many more. Matras (vowel signs like ि, ी, ु, ू, े, ै, ो, ौ) must not collide with consonants at any font size. Halant/virama (्) must render correctly for consonant clusters. Verify at `--text-sm` (15px equivalent) where rendering issues are most likely.
- **Nukta characters:** Hindi borrows sounds from Persian/Arabic (फ़, ज़, ख़, ग़). Verify that the YSS Hindi *Autobiography* edition's usage is preserved faithfully.
- **Quote image generation:** `@vercel/og` (Satori) requires explicit font files — it does not fall back to system fonts. Hindi passage images use Noto Serif Devanagari. The OG image route selects font based on the passage's `language` column. This is initial stage scope, not STG-021.
- **PDF export:** Hindi passages use Noto Serif Devanagari at 12pt (scaled from Latin 11pt). PDF generation pipeline must bundle the Devanāgarī font.
- **Print stylesheet:** `@media print` font-family for `/hi/` locale uses `'Noto Serif Devanagari'` at 12pt. Initial stage scope.

**4. Terminology bridge extensions for Sanskrit and cross-tradition terms.**

The Vocabulary Bridge (FTR-028) includes two extraction categories particularly relevant to Sanskrit handling:

- **Sanskrit-to-English inline definitions:** Yogananda frequently defines Sanskrit terms inline — "Samadhi, the superconscious state of union with God." The ingestion QA step (FTR-005 E4) flags these as glossary source candidates. Claude identifies passages where Yogananda provides his own definition of a Sanskrit term, creating a machine-assisted but human-verified bridge built from Yogananda's own words.
- **Cross-tradition terms:** The bridge accepts Pali, Bengali, and Hindi variant spellings as keys mapping to Yogananda's vocabulary (e.g., "nibbāna" → ["final liberation", "God-union"], "dhyāna" → ["meditation"]). The vocabulary extraction step (FTR-028 per-book lifecycle) explicitly seeks non-Sanskrit Indic terms Yogananda uses or that seekers from other traditions might search.

### Glossary enrichment (extends FTR-062)

The `glossary_terms` schema gains three optional columns:

```sql
ALTER TABLE glossary_terms ADD COLUMN phonetic_guide TEXT; -- "PRAH-nah-YAH-mah"
ALTER TABLE glossary_terms ADD COLUMN pronunciation_url TEXT; -- Future: URL to audio (STG-021+)
ALTER TABLE glossary_terms ADD COLUMN has_teaching_distinction BOOLEAN NOT NULL DEFAULT false;
 -- True when Yogananda's usage intentionally differs from common usage
 -- and the difference itself is part of the teaching (e.g., Aum vs. Om,
 -- meditation, Self-realization). The glossary entry for these terms
 -- should explicitly address the distinction.
```

### Rationale

- **SRF published text as canonical** follows the direct-quotes-only principle (FTR-001). The portal is a faithful librarian, not an editor.
- **Unicode NFC normalization** is standard practice for text processing pipelines that handle combining characters. Without it, identical-looking strings can fail equality checks, deduplication, and search matching.
- **ICU tokenization in pg_search BM25** (FTR-025) handles diacritics normalization natively, collapsing orthographic variants in the search index without altering stored data. The `unaccent` extension remains for pg_trgm fuzzy matching.
- **The Aum/Om exception** reflects a general principle: search normalization handles orthography; the terminology bridge handles semantics. Collapsing semantically distinct terms in the index would lose information that cannot be recovered.
- **Devanāgarī fonts from the initial stage** because the content is present from the start — both as Gita/Holy Science verses in the English corpus and as the entire Hindi *Autobiography* (FTR-011). Deferring font support to STG-021 would break rendering for Hindi readers. Noto Serif Devanagari for reading and Noto Sans Devanagari for UI/verses — the same serif/sans distinction as the Latin stack (Merriweather/Open Sans).
- **Pronunciation in the glossary** serves seekers who encounter Sanskrit for the first time. Phonetic guides are a minimal editorial effort with high impact for newcomers. Audio pronunciation is deferred until SRF can provide approved recordings.
- **`has_teaching_distinction`** enables the glossary UI to highlight terms where the gap between common and Yogananda-specific usage is pedagogically important — inviting seekers into the teaching through the vocabulary itself.

### Consequences

- **Ingestion pipeline:** Unicode NFC normalization added as a mandatory preprocessing step (Step 2.5 in DESIGN.md § Content Ingestion Pipeline)
- **Search index:** pg_search BM25 index with ICU tokenizer handles diacritics normalization natively (FTR-025). The `unaccent` extension remains for pg_trgm fuzzy matching.
- **Font stack:** Noto Serif Devanagari (reading) and Noto Sans Devanagari (UI/verses) added from the initial stage. Hindi locale loads eagerly; English pages with Devanāgarī content load conditionally
- **Glossary schema:** Three new nullable columns (`phonetic_guide`, `pronunciation_url`, `has_teaching_distinction`) on `glossary_terms`
- **Vocabulary Bridge:** Two extraction categories (inline Sanskrit definitions, cross-tradition terms) documented in FTR-028 § Per-Book Evolution Lifecycle
- **FTR-023:** Verse-aware chunking for *God Talks with Arjuna* extended with Devanāgarī script handling
- **Extends:** FTR-028, FTR-005 E4, FTR-062, FTR-023
- **New stakeholder questions:** SRF editorial policy on contested transliterations; pronunciation recording availability; *God Talks with Arjuna* Devanāgarī display confirmation
- **New technical questions:** IAST diacritics rendering verification in Merriweather/Lora at small sizes

- **Quote images and PDF:** Devanāgarī font bundled for `@vercel/og` and PDF generation from the initial stage (Hindi passages must render correctly in shared images and printed output)
- **Devanāgarī typography QA:** Conjunct rendering, matra placement, halant/virama, and nukta characters verified at all font sizes as a STG-002 success criterion


## Notes

Migrated from FTR-131 per FTR-084.
