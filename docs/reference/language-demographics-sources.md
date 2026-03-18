# Language Demographics — Master Source Table

**Purpose:** Trace every population number in FTR-011 to a verifiable source. Enable human validation of statistics that drive feature ordering.

**Why this matters:** FTR-011 governs roadmap prioritization — which languages ship first, which features wait. The demographic data underpinning these decisions originated from an AI-generated research document (`prioritizing-global-language-rollout.md`, Gemini 3 Pro). While the citations appear legitimate, AI can hallucinate URLs or misattribute numbers. This file provides a human-verifiable audit trail.

**Last verified:** 2026-03-01

---

## Source Registry

### Tier 1: Primary Statistical Agencies (highest trust)

| ID | Source | URL | Data Provided | Access |
|----|--------|-----|---------------|--------|
| S1 | **Ethnologue 2025** | ethnologue.com | Speaker counts (L1, L2, total) per language | Paywalled. Summary data available via secondary sources. |
| S2 | **ITU Global Connectivity Report 2025** | itu.int/itu-d/reports/statistics/2025/11/17/gcr-2025-chapter-2/ | Internet penetration by country and region, urban/rural divide | Free PDF |
| S3 | **UNESCO International Literacy Day 2025** | unesco.org/sites/default/files/medias/fichiers/2025/09/ild-2025-factsheet.pdf | Global literacy rates, regional breakdowns | Free PDF |
| S4 | **GSMA State of Mobile Internet Connectivity 2025** | gsmaintelligence.com/research/the-state-of-mobile-internet-connectivity-2025 | Mobile internet in low/middle-income countries | Free report |
| S5 | **ITU Statistics** | itu.int/en/ITU-D/Statistics/pages/stat/default.aspx | Country-level internet penetration raw data | Free database |

### Tier 2: Reputable Data Aggregators (good trust, verify against Tier 1)

| ID | Source | URL | Data Provided | Access |
|----|--------|-----|---------------|--------|
| S6 | **DataReportal Digital 2025/2026** | datareportal.com/reports/digital-2025-global-overview-report | Per-country internet users, penetration rates (January 2025 data) | Free |
| S7 | **DataReportal Country Reports** | datareportal.com/reports/digital-2025-{country} | Country-specific internet penetration | Free |
| S8 | **We Are Social Digital 2026** | wearesocial.com/me/blog/2025/10/digital-2026-global-overview-report/ | Global overview, internet users, regional breakdowns | Free |
| S9 | **Freedom House Freedom on the Net 2024** | freedomhouse.org/report/freedom-net | Internet freedom scores by country | Free |

### Tier 3: Secondary Reporting (use for triangulation, not as primary source)

| ID | Source | URL | Data Provided | Access |
|----|--------|-----|---------------|--------|
| S10 | **Visual Capitalist** | visualcapitalist.com/ranked-the-worlds-most-spoken-languages-in-2025/ | Ethnologue speaker data visualized | Free |
| S11 | **Voronoi** | voronoiapp.com/other/Worlds-Most-Spoken-Languages-7412 | Ethnologue speaker data visualized | Free |
| S12 | **Tempo** | en.tempo.co/read/2080745/list-of-most-spoken-languages-in-the-world-in-2025 | Ethnologue speaker data reported | Free |
| S13 | **Wikipedia** | en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers | Aggregated from Ethnologue and other sources | Free |

### Tier 4: Directly Verified (DataReportal 2025 country reports, January 2025 data)

These were fetched directly from DataReportal during the 2026-03-01 session and can be re-verified at the URLs below.

| Country | Internet Users | Penetration | Verification URL |
|---------|---------------|-------------|------------------|
| China | 1.11 billion | 78.0% | datareportal.com/reports/digital-2025-china |
| India | 806 million | 55.3% | datareportal.com/reports/digital-2025-india |
| Indonesia | 212 million | 74.6% | datareportal.com/reports/digital-2025-indonesia |
| Russia | 133 million | 92.2% | datareportal.com/reports/digital-2025-russian-federation |
| South Korea | 50.4 million | 97.4% | datareportal.com/reports/digital-2025-south-korea |
| Saudi Arabia | 33.9 million | 99.0% | datareportal.com/reports/digital-2025-saudi-arabia |
| Egypt | 96.3 million | 81.9% | datareportal.com/reports/digital-2025-egypt |

---

## Per-Language Source Traceability

Every number in FTR-011's consolidated language reference table traced to its source.

### English

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers (L1+L2) | 1,528M | S1 via S10, S12 | Ethnologue 2025 data reported by Visual Capitalist and Tempo. Cross-check: Wikipedia (S13) lists similar. |
| L1 speakers | ~390M (25.5%) | S1 via S10 | Ethnologue L1 percentage. The 25.5% ratio applied to 1,528M = ~390M. |
| Internet % (L1 regions) | ~95% | S2, S6 | Weighted average of US (93.1%, S7), UK (97.8%, S7), Australia (~96%), Canada (~97%). |
| Reachable | ~390M L1 | Calculated | L1 speakers in high-internet regions. Baseline language. |

### Spanish

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 558M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 86.7%. |
| Internet % | ~77% | S6, S2 | Weighted across Latin America (~70-85% varies by country) and Spain (~95%). |
| Reachable | ~430M | Calculated | 558M × 0.77 ≈ 430M. |

### Hindi

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 609M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 56.7%. |
| Internet % | ~70% | S6, S7 | India: 55.3% country-wide (S7), but Hindi speakers are concentrated in more connected northern states. ~70% is an estimate factoring in diaspora. **Needs validation against state-level data.** |
| Reachable | ~425M | Calculated | 609M × ~0.70 ≈ 425M. **Note: India country-wide is 55.3% (806M/1.46B). The 70% figure for Hindi speakers specifically needs state-level verification.** |

### Mandarin Chinese

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 1,184M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 83.6%. |
| Internet % | ~78% | S7 (Tier 4 verified) | DataReportal 2025 China: 1.11B users, 78.0% penetration. Directly verified. |
| Reachable | ~924M | Calculated | 1,184M × 0.78 ≈ 924M. **BUT: Great Firewall severely limits accessibility of foreign-hosted services. Effective reachable for Vercel-hosted portal may be near zero without ICP license + China CDN.** Freedom House 9/100 (S9). |

### Arabic (MSA)

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 335M | S1 via S10, S12 | Ethnologue 2025. **Zero L1 speakers** — MSA is a written/formal standard. All native speakers use regional dialects. |
| Internet % | ~70% (weighted) | S7 (Tier 4 verified) | Weighted across: Saudi Arabia 99.0%, Egypt 81.9% (both directly verified), plus estimates for other Arab countries. |
| Reachable | ~235M | Calculated | 335M × ~0.70 ≈ 235M. Wide variance: Gulf states near 100%, North Africa 60-80%. |

### Portuguese

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 267M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 93.6%. |
| Internet % | ~85% | S6, S2 | Brazil (~80-85%), Portugal (~90%). Brazil dominates the speaker base. |
| Reachable | ~225M | Calculated | 267M × 0.85 ≈ 225M. |

### Russian

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 253M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 57.3%. |
| Internet % | ~92% (Russia) | S7 (Tier 4 verified) | DataReportal 2025 Russia: 133M users, 92.2% penetration. Directly verified. |
| Reachable | ~200M | Calculated | Russia: 133M (verified). Plus Russian speakers in Ukraine, Belarus, Kazakhstan, etc. Conservative multi-country estimate ~200M. **Content restriction risk:** Freedom House 17/100 (S9). |

### Indonesian

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 252M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 29.8% (most speakers use as L2/lingua franca). |
| Internet % | ~75% | S7 (Tier 4 verified) | DataReportal 2025 Indonesia: 212M users, 74.6% penetration. Directly verified. |
| Reachable | ~188M | Calculated | 252M × 0.75 ≈ 188M. |

### Bengali

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 284M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 85.2%. |
| Internet % | ~45% | S6, S2 | Bangladesh (~40-45%), India/West Bengal (~50-55%). Weighted average ~45%. **Needs validation against Bangladesh-specific DataReportal report.** |
| Reachable | ~130M | Calculated | 284M × 0.45 ≈ 128M, rounded to ~130M. |

### German

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 130M | S1 via S10, S12 | Ethnologue 2025. |
| Internet % | ~95% | S6 | Germany, Austria, Switzerland all >90%. |
| Reachable | ~123M | Calculated | 130M × 0.95 ≈ 123M. |

### Japanese

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 125M | S1 via S10, S12 | Ethnologue 2025. L1 ratio ~96%. |
| Internet % | ~95% | S6 | Japan has near-universal connectivity. |
| Reachable | ~119M | Calculated | 125M × 0.95 ≈ 119M. |

### French

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 312M | S1 via S10, S12 | Ethnologue 2025. L1 ratio 23.7% — most speakers are L2 in Francophone Africa. |
| Internet % | ~37% (weighted) | S6, S2 | Heavily dragged down by Francophone Africa (~25% penetration). France + Canada >90%. The weighted average across all French speakers is ~37%. |
| Reachable | ~116M | Calculated | 312M × 0.37 ≈ 115M, rounded to ~116M. |

### Korean

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | ~80M | S1 via S10, S12 | Ethnologue 2025. L1 ratio ~96%. |
| Internet % | ~97% | S7 (Tier 4 verified) | DataReportal 2025 South Korea: 50.4M users, 97.4% penetration. Directly verified. |
| Reachable | ~78M | Calculated | ~80M × 0.97 ≈ 78M. North Korea (~26M population) is completely isolated. |

### Italian

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 68M | S1 via S10, S12 | Ethnologue 2025. |
| Internet % | ~90% | S6 | Italy has high connectivity. |
| Reachable | ~61M | Calculated | 68M × 0.90 ≈ 61M. |

### Thai

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | 61M | S1 via S10, S12 | Ethnologue 2025. |
| Internet % | ~80% | S6 | Thailand has strong mobile internet. |
| Reachable | ~49M | Calculated | 61M × 0.80 ≈ 49M. |

### Telugu (YSS-contributed)

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | ~96M | S1, S13 | Ethnologue via Wikipedia. |
| Internet % | ~60% | Estimate | Based on Andhra Pradesh/Telangana state connectivity. **Needs state-level DataReportal or ITU data.** |
| Reachable | ~58M | Calculated | ~96M × 0.60 ≈ 58M. Estimate. |

### Tamil (YSS-contributed)

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | ~85M | S1, S13 | Ethnologue via Wikipedia. |
| Internet % | ~60% | Estimate | Based on Tamil Nadu state connectivity + Sri Lanka. **Needs state-level data.** |
| Reachable | ~51M | Calculated | ~85M × 0.60 ≈ 51M. Estimate. |

### Kannada (YSS-contributed)

| Metric | Value | Source | Verification |
|--------|-------|--------|-------------|
| Total speakers | ~64M | S1, S13 | Ethnologue via Wikipedia. |
| Internet % | ~60% | Estimate | Based on Karnataka state connectivity. **Needs state-level data.** |
| Reachable | ~38M | Calculated | ~64M × 0.60 ≈ 38M. Estimate. |

---

## Validation Status

| Data Category | Status | Action Needed |
|---------------|--------|---------------|
| Speaker counts (Ethnologue 2025) | **Indirectly verified** via 3 secondary sources (S10, S11, S12) | Spot-check 3-4 languages against Ethnologue summary or Wikipedia to confirm consistency |
| Internet % — Tier 4 verified countries | **Directly verified** from DataReportal 2025 country reports | Re-verify at arc boundaries |
| Internet % — Core languages (FTR-011 original) | **Indirectly verified** from reference doc (Gemini-generated) citing ITU/DataReportal | Fetch DataReportal country reports for India, Brazil, Bangladesh, Germany, Japan, France, Italy, Thailand |
| Internet % — YSS-contributed languages | **Estimated** based on Indian state-level assumptions | Fetch Indian state-level connectivity data (TRAI reports or similar) |
| Hindi-specific internet % (~70%) | **Needs validation** | India country-wide is 55.3%. The 70% for Hindi speakers needs state-level data for UP, MP, Bihar, Rajasthan, Delhi, etc. |
| Reachable calculations | **Derived** (speakers × internet %) | Recompute after validating inputs |

## Known Risks

1. **Ethnologue is paywalled.** All speaker counts come from secondary sources reporting Ethnologue data. The secondary sources agree with each other, which suggests they're reporting the same upstream data — but we haven't verified against Ethnologue directly.

2. **Internet penetration for Hindi speakers (70%) may be optimistic.** India's country-wide penetration is 55.3% (DataReportal 2025). The 70% figure assumes Hindi speakers (concentrated in northern India) have higher-than-average connectivity. This needs TRAI (Telecom Regulatory Authority of India) state-level data.

3. **Internet penetration for Indic regional languages (60%) is an estimate.** Telugu, Tamil, Kannada numbers assume state-level connectivity in southern India. Southern Indian states (Karnataka, Tamil Nadu, Andhra Pradesh/Telangana) tend to have higher connectivity than the national average, so 60% may be conservative. But it's unverified.

4. **French internet penetration (37%) is a blended average.** France alone is >90%. Francophone Africa is ~25%. The 37% weights across all 312M speakers, most of whom are in Africa. The reachable number (~116M) is dominated by European French speakers.

5. **Chinese reachable (924M) is technically accurate but practically misleading.** The Great Firewall means a Vercel-hosted portal cannot serve these users without China-specific infrastructure (ICP license, China-based CDN). Effective reachable is near zero for the current architecture.

6. **AI-generated reference document.** The `prioritizing-global-language-rollout.md` was generated by Gemini 3 Pro. While its 53 citations appear to reference real sources with real URLs, AI can fabricate plausible-looking citations. Each citation should be spot-checked by clicking through.

## Human Validation Checklist

A human reviewer should:

- [ ] Click 5-6 citation URLs from the reference doc to verify they exist and contain the claimed data
- [ ] Cross-check English, Hindi, and Spanish speaker counts against Wikipedia (S13) as a quick sanity check
- [ ] Verify the DataReportal Tier 4 numbers by visiting the URLs above
- [ ] Source India state-level internet data from TRAI (trai.gov.in) to validate the Hindi 70% and Indic 60% estimates
- [ ] Confirm Bengali internet penetration with a Bangladesh-specific DataReportal report
- [ ] Assess whether any Yogananda translations exist for Arabic, Russian, Indonesian, or Korean (this determines `content_availability`)
