---
ftr: 146
title: Circadian as Independent Behavior Modifier
summary: "Separate circadian warmth shifts from theme choice as an independent toggle"
state: proposed
domain: experience
governed-by: [PRI-08]
depends-on: [FTR-040, FTR-145]
---

# FTR-146: Circadian as Independent Behavior Modifier

## Rationale

**Type:** Enhancement (Experience)
**Governing Refs:** PRI-08 (Calm Technology), FTR-040 (Circadian Color Temperature), FTR-145 (Design Language System)
**Target:** Any milestone — independent of milestone scheduling
**Dependencies:** FTR-145 (design language CSS layer provides `circadian.css`)

#### Context

FTR-040 specifies circadian color temperature — subtle background warmth shifts by time of day (cooler cream in morning, warmer in evening). Currently embedded invisibly inside the "Light" theme in yogananda-teachings: when a user picks Light (or Auto resolving to light), CircadianProvider silently sets `data-time-band` on `<html>`. There is no user-visible indication this is happening, and no way to get a static light theme without circadian shifts.

This violates least-surprise. A user who picks "Light" expects a fixed, predictable surface. Circadian is a different proposition — it's calm (PRI-08) but also opinionated about subtly changing what you see.

#### What This Changes

Separate circadian from theme choice. Circadian is a **behavior modifier**, not a theme.

| Axis | What it controls | How it's set |
|------|-----------------|--------------|
| Theme | Colors, contrast, mood | `data-theme` attribute, user picks from gallery |
| Circadian | Background warmth shift by time of day | `data-time-band` attribute, independent toggle |

**Design language (yogananda-design):** Already correct. `circadian.css` is a separate file, activated by `data-time-band`, guarded to light themes only. No change needed.

**Consumer (yogananda-teachings):** Needs UI change:
- Remove automatic CircadianProvider activation from Light theme
- Add an independent circadian toggle in reader preferences, only visible when the active theme resolves to a light background
- Persist the preference alongside theme choice
- When circadian is on, CircadianProvider sets `data-time-band` based on local time
- When circadian is off, `data-time-band` is never set — static background

#### Why Not a 7th Theme?

Circadian is not a peer of dark/sepia/earth. It's a behavior layered on top of any light theme. Making it a theme card implies mutual exclusion with Light — but circadian-on-sepia and circadian-on-sandstone are equally valid. The independent toggle is more honest: circadian is FTR-040 (a behavior), not FTR-040 (a theme).

#### Scope

Small. The CSS guard already exists in the design language. The teachings consumer needs:
1. Remove auto-activation of CircadianProvider from Light theme
2. Add toggle to reader preferences panel
3. Persist preference in user settings
4. Guard CircadianProvider behind the preference

#### What This Does NOT Change

The circadian CSS itself, theme definitions, color values, or any other design language surface. This is purely about user control — when circadian activates, not what it does.

**Re-evaluate At:** User testing of reader preferences
**Decision Required From:** UX (toggle placement), Human principal (default state: on or off)
**Origin:** Design review 2026-03-03


## Notes

Migrated from FTR-146 per FTR-084.
