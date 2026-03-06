# FTR-160: Adaptive Image Delivery — Network and Device-Aware Image Optimization

- **State:** Proposed
- **Domain:** experience
- **Arc:** 3a+
- **Governed by:** PRI-05 (Global-First), PRI-07 (Accessibility), PRI-03 (Honoring the Spirit), FTR-006, FTR-044, FTR-073

## Rationale

### Context

The portal serves seekers across extreme device and network diversity (PRI-05): a seeker in rural Bihar on a JioPhone with 2G and a seeker in Los Angeles on fiber. FTR-006 establishes Global-First as principle; FTR-044 specifies responsive layout; FTR-073 defines sacred images as first-class content. But no FTR specifies the *delivery infrastructure* that adapts image quality, format, and resolution to the requesting device's actual capabilities.

A 1200px guru portrait served to a 240px-wide feature phone on 2G wastes bandwidth the seeker cannot afford and delays the experience they came for. Conversely, serving a tiny thumbnail to a high-DPI tablet dishonors the sacred imagery (PRI-03). The system must sense context and respond appropriately — without requiring the seeker to configure anything.

### Decision

Implement an adaptive image delivery framework that selects optimal image dimensions, format, and quality based on client context signals, with special treatment for sacred imagery.

### Signal Priority (descending)

1. **Save-Data header** — When present (`Save-Data: on`), serve minimum viable quality. Respect the seeker's explicit bandwidth constraint.
2. **Client Hints** (`Sec-CH-UA`, `Sec-CH-Viewport-Width`, `Sec-CH-DPR`) — When available, use device pixel ratio and viewport to calculate optimal dimensions.
3. **Network Information API** (`navigator.connection.effectiveType`) — When available, adjust quality tier by connection speed.
4. **User-Agent heuristics** — Fallback: detect KaiOS/JioPhone, low-end Android, feature phones. Apply conservative defaults.
5. **Default** — Serve responsive `<picture>` with `srcset` and `sizes` attributes. Let the browser choose.

### Format Strategy

| Format | When | Savings vs JPEG |
|--------|------|-----------------|
| AVIF | Client supports `Accept: image/avif` | ~50% smaller |
| WebP | Client supports `Accept: image/webp` | ~30% smaller |
| JPEG | Fallback | Baseline |

### Quality Tiers

| Connection | Quality | Max Dimension | Notes |
|------------|---------|---------------|-------|
| 2G / Save-Data | 40–55 | 480px | Prioritize load time |
| 3G | 55–70 | 720px | Balanced |
| 4G+ / WiFi | 75–90 | 1200px | Full quality |
| High-DPI 4G+ | 85–95 | 2400px | Retina-class |

Quality values are parameters per FTR-012, not principles. Tune based on seeker feedback and performance data.

### Sacred Image Handling

Guru portraits and lineage images (FTR-073 `is_yogananda_subject = true` or `subject_type IN ('portrait', 'devotional')`) receive special treatment:

- **Never below quality 55** — even on 2G. A blurry guru portrait dishonors the image.
- **Screen-fitted by default** — sacred images fill the viewport width (not a thumbnail) when displayed as primary content.
- **Progressive loading** — inline SVG blur placeholder → tiny preview → full quality. The transition should feel like a photograph developing, not a broken image loading.

### Implementation Architecture

**Phase 1 (Arc 3a):** Responsive `<picture>` elements with `srcset`/`sizes` and format negotiation via Vercel Image Optimization (built-in). No custom infrastructure. Pre-generate 4 sizes (240, 480, 720, 1200px) at build/ingest time for all images.

**Phase 2 (Arc 3b+, if needed):** Lambda@Edge on-demand transformation for long-tail sizes. Only if Phase 1 performance data shows significant waste or gaps.

### Constraints

- No client-side image manipulation. All optimization happens at build time or CDN edge.
- No tracking of device capabilities beyond the HTTP request. DELTA-compliant (PRI-09).
- Progressive enhancement: HTML `<img>` with `srcset` is the foundation. JavaScript enhances with Network Information API when available.
- All guru images must pass editorial review before any automated transformation (FTR-073).

### Re-evaluate At

Arc 3a boundary — after sacred imagery pipeline (FTR-073) is operational and performance budgets are measured with real content.

### Source Exploration

`for-constrained-resource-phones-consider-offering-small.md`

## Notes

- **Origin:** Extracted from archived proposal during FTR novelty audit (2026-03-05)
- Device-specific targeting (JioPhone, KaiOS) is a parameter configuration within the framework, not hardcoded behavior
