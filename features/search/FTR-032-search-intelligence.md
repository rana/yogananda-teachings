# FTR-032: "What Is Humanity Seeking?" -- Anonymized Search Intelligence

**State:** Approved
**Domain:** search
**Arc:** 3d+
**Governed by:** PRI-09, PRI-08

## Rationale

### Context

The portal's `search_queries` table logs every search query without any user identification (FTR-082, DELTA compliance). Over time, this data represents something unprecedented: a real-time, global window into what humanity is seeking spiritual guidance about.

- "Fear" spikes during crises. "Death" rises after public tragedies. "Love" peaks seasonally.
- These patterns are aggregated and anonymous -- no individual is identified, no session is tracked.

### Decision

Produce a yearly **"What Is Humanity Seeking?"** report from aggregated, anonymized search query data. This is a research and mission contribution, not a product feature.

#### Data pipeline

1. **Aggregation (automated, nightly):** Group search queries by theme (using the existing theme taxonomy), by geography (country-level), and by time period. Store aggregates in a `search_theme_aggregates` table.
2. **Trend detection (automated):** Identify rising/falling themes, seasonal patterns, and correlations with world events.
3. **Report generation (annual, human-curated):** SRF staff or the foundation curates the data into a narrative report.

#### Schema addition

```sql
CREATE TABLE search_theme_aggregates (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 period_start DATE NOT NULL,
 period_end DATE NOT NULL,
 period_type TEXT NOT NULL CHECK (period_type IN ('week', 'month', 'quarter', 'year')),
 theme_slug TEXT, -- NULL for unclassified queries
 country_code TEXT, -- ISO 3166-1 alpha-2, NULL for global
 query_count INTEGER NOT NULL DEFAULT 0,
 unique_terms INTEGER NOT NULL DEFAULT 0,
 sample_queries TEXT[], -- 5-10 representative queries for context
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);
```

#### DELTA compliance

- **Dignity:** No individual is identified. Data is always aggregated (minimum granularity: country + week).
- **Agency:** Seekers are not aware of or affected by the aggregation.
- Minimum aggregation threshold: theme + country combinations with fewer than 10 queries in a period are suppressed.

### Rationale

- **Mission alignment.** Understanding what the world is seeking is a direct answer to the philanthropist's question.
- **Unique contribution.** No other spiritual organization has real-time data on what humanity seeks spiritual guidance about.
- **Impact reporting.** "Fear was the most searched theme globally in 2027" is more meaningful than page view counts.

### Consequences

- `search_theme_aggregates` table added (Milestone 3d)
- Nightly aggregation Lambda function
- Annual report production becomes an SRF staff responsibility

## Notes

- **Origin:** FTR-032
