---
ftr: 103
title: Progressive Web App
summary: "Service worker caching, web manifest, and offline-first reading for seekers with intermittent connectivity"
state: implemented
domain: foundation
governed-by: [PRI-05, PRI-07]
---

# FTR-103: Progressive Web App

## Rationale

### Context

Many seekers (particularly in Global South markets) access the web primarily through mobile devices with intermittent connectivity. A Progressive Web App provides offline access, home screen installation, and native-like performance without requiring an app store listing.

### Decision

Build the portal as a **Progressive Web App** with service worker caching, a web manifest, and offline-first reading.

### Feature Scope

| Feature | Arc | Notes |
|---------|-----|-------|
| Web manifest + home screen install | 1 | Basic installability |
| Service worker: cache static assets | 1 | Fonts, CSS, JS cached for offline |
| Service worker: cache visited pages | 2 | Previously-read chapters available offline |
| Background sync for search | 3+ | Queue searches when offline, execute when connectivity returns |

### Rationale

- **Global-First (PRI-05).** A seeker in rural Bihar should be able to read a cached chapter without connectivity. PWA makes this possible without an app store.
- **Performance budgets.** Service worker caching means repeat visits load instantly — even on 2G. The < 100KB JS budget means the initial cache is small.
- **No app store dependency.** PWA is a web standard. No Apple/Google approval process, no 30% revenue share (not that the portal has revenue), no version fragmentation.
- **Progressive enhancement.** The PWA features enhance the experience but are not required. A browser without service worker support still gets the full portal.

### Consequences

- `manifest.json` in `/public/` with portal branding
- Service worker registration in the root layout
- Cache strategy: Network-first for search, Cache-first for static assets
- Offline fallback page: a calm message with cached content links
- PWA installability tested in Lighthouse CI
