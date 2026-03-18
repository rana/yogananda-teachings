---
ftr: 61
title: DELTA-Compliant Seeker Feedback Mechanism
summary: "Three anonymous feedback channels for citation errors, search misses, and general input"
state: approved-provisional
domain: editorial
governed-by: [PRI-08, PRI-09]
---

# FTR-061: DELTA-Compliant Seeker Feedback Mechanism

## Rationale

### Context

DELTA-compliant analytics intentionally avoid user identification and behavioral profiling. This is correct. But the current architecture has no mechanism for seekers to communicate *anything* back to the portal team. No feedback form, no citation error reporting, no "I couldn't find what I needed" signal.

This creates a blind spot: the editorial team has no qualitative signal about the seeker experience. Anonymized search aggregates (FTR-032) show *what* people search for, but not *whether they found it useful.* A seeker who discovers a citation error has no way to report it. A seeker whose search returns nothing relevant has no way to signal that the search failed.

### Decision

Add three DELTA-compliant feedback mechanisms. None store user identifiers. All feed into the editorial review queue (FTR-060).

**1. "Report a citation error"** — link on every passage display (search results, reader, passage share page). Clicking opens a minimal form: passage ID (auto-filled), freeform text describing the error. Stored with passage_id and content only — no user ID, no IP, no session.

**2. "I didn't find what I needed"** — option on search results pages when results are empty or sparse. Clicking stores the search query and an anonymous counter increment. No user ID, no freeform text (to avoid PII collection). Aggregated weekly for search quality review.

**3. `/feedback` page** — linked from the footer. Simple form: topic (dropdown: "Citation error," "Search suggestion," "General feedback," "Accessibility issue"), freeform text. No authentication, no user identifier stored.

**Data model:**

```sql
CREATE TABLE seeker_feedback (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'citation_error', 'search_miss', 'general', 'accessibility'
  )),
  content TEXT,                -- freeform description (nullable for search_miss)
  passage_id UUID REFERENCES book_chunks(id),  -- for citation errors
  search_query TEXT,           -- for search misses
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_feedback_type ON seeker_feedback(feedback_type, created_at DESC);
```

**API route:** `POST /api/v1/feedback` — rate-limited (5 submissions per IP per hour to prevent spam, but IP is not stored in the database).

**Editorial integration:** Feedback appears in the editorial review portal (Milestone 3b) as a "Seeker Feedback" queue, alongside theme tag review and ingestion QA.

### Rationale

- **DELTA-compliant.** No user identification stored. No session tracking. No behavioral profiling. The feedback table stores content about the *portal*, not about the *seeker*.
- **Closes a dangerous blind spot.** Without feedback, citation errors persist undetected. Bad search results go unreported. The editorial team operates without qualitative signal.
- **Low implementation cost.** One table, one API route, one review queue panel. No new infrastructure.
- **Respects seeker agency.** The seeker chooses to communicate. No prompts, no pop-ups, no "How was your experience?" interruptions. The link is quiet and available.

### Consequences

- New `seeker_feedback` table in Milestone 3b migration
- New API route `POST /api/v1/feedback`
- Feedback review queue added to editorial portal (Milestone 3b)
- Footer gains `/feedback` link (Milestone 3b)
- Every passage display gains "Report a citation error" link (Milestone 3b)
- Search results page gains "I didn't find what I needed" option when results are sparse (Milestone 3b)

## Specification

The portal has no mechanism for seekers to communicate back without violating DELTA principles. Three feedback channels, none storing user identifiers:

### Feedback Types

| Channel | Location | What It Captures |
|---------|----------|-----------------|
| **"Report a citation error"** | Link on every passage (search, reader, share page) | Passage ID + freeform description |
| **"I didn't find what I needed"** | Search results page (empty or sparse results) | Search query + anonymous counter |
| **General feedback** | `/feedback` page (linked from footer) | Topic category + freeform text |

### Data Model

```sql
CREATE TABLE seeker_feedback (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'citation_error', 'search_miss', 'general', 'accessibility'
  )),
  content TEXT,                -- freeform description (nullable for search_miss)
  passage_id UUID REFERENCES book_chunks(id),  -- for citation errors
  search_query TEXT,           -- for search misses
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_feedback_type ON seeker_feedback(feedback_type, created_at DESC);
```

### API Route

`POST /api/v1/feedback` — rate-limited at 5 submissions per IP per hour (IP is used for rate limiting but not stored in the database).

### PII Mitigation (FTR-085)

The feedback form includes the notice: *"Please do not include personal information (name, email, location) in your feedback."* Feedback entries are reviewed periodically by editorial staff; inadvertent PII is redacted. Entries older than 2 years are eligible for archival aggregation (convert to anonymized statistics, delete raw text).

### Editorial Integration

Feedback appears in the editorial review portal (Milestone 3b) as a "Seeker Feedback" queue alongside theme tag review and ingestion QA. Citation error reports are highest priority — they directly affect the portal's fidelity guarantee.
