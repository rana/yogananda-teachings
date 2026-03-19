---
ftr: 48
title: Passage Sharing
summary: "Native Web Share API on mobile with copy-link and email fallback for desktop"
state: implemented
domain: experience
governed-by: [PRI-02, PRI-05]
---

# FTR-048: Passage Sharing

## Rationale

### FTR-048: Native Share API as Primary Mobile Sharing

### Context

The passage sharing design (FTR-048) provides a share menu with four options: copy link, email passage, save as image, save as PDF. This serves desktop seekers well. But in the Global South — India, Brazil, Nigeria, Indonesia — WhatsApp is the primary sharing mechanism for spiritual content. A seeker in Mumbai who wants to share a Yogananda quote with a friend opens WhatsApp, not email.

The Web Share API (`navigator.share`) surfaces the device's native sharing sheet, which includes WhatsApp, Telegram, Signal, SMS, and any other installed sharing apps. It is the most natural way to share on mobile, and it removes the portal's need to know which apps the seeker uses.

### Decision

Use `navigator.share` as the **primary** share action on mobile devices that support it. The custom share menu (copy link, email, save as image, save as PDF) is the fallback for desktop and unsupported browsers.

#### Behavior

```
Mobile (navigator.share supported):
 Tap share icon → native share sheet opens immediately
 Shares: passage text (truncated) + deep link URL
 "Save as image" and "Save as PDF" remain as separate actions in a "..." overflow menu

Mobile (navigator.share NOT supported):
 Tap share icon → custom share menu (copy link, email, save as image, save as PDF)

Desktop:
 Click share icon → custom share menu (always)
```

#### Share payload

```javascript
navigator.share({
 title: 'Paramahansa Yogananda — Autobiography of a Yogi',
 text: '"The soul is ever free; it is deathless, birthless..." — Chapter 26, p. 312',
 url: 'https://teachings.yogananda.org/books/autobiography/26#p7?h=a3f2c8'
});
```

### Rationale

- **Global South alignment.** WhatsApp has 2+ billion users, concentrated in exactly the regions the portal serves. `navigator.share` reaches WhatsApp without adding a WhatsApp-specific button or SDK.
- **Privacy by design.** No third-party sharing scripts. No social media tracking pixels. The browser handles the share natively. DELTA-compliant by architecture.
- **Reduced UI complexity.** On mobile, one tap opens the native sheet. No custom menu to build, maintain, or localize.
- **Future-proof.** New sharing apps appear; old ones fade. The native share sheet automatically reflects the user's installed apps. The portal doesn't need to keep a list of sharing targets.

### Consequences

- Share icon behavior branches on `navigator.share` support (feature detection, not device detection)
- "Save as image" and "Save as PDF" are separate from the share action (they generate files, not share intents)
- Desktop always shows the custom share menu
- Mobile shows the native sheet with an overflow menu for image/PDF generation
- **Amends FTR-048** (passage sharing) with mobile-first native sharing


### FTR-048: Passage Sharing as Organic Growth Mechanism


### Context

When someone reads a passage that moves them, the most natural human response is to share it with someone they love. This is also the most organic growth mechanism for the portal — and it's perfectly aligned with SRF's mission of spreading the teachings.

| Approach | Mechanism | Alignment with Mission |
|----------|-----------|----------------------|
| **No sharing** | Portal is a closed library | Functional but misses the natural word-of-mouth vector |
| **Social media integration** | Share buttons for Twitter/Facebook/Instagram | Introduces third-party tracking; commercial platforms conflict with Calm Technology |
| **Clean link + OG card** | Generate a shareable URL with beautiful Open Graph metadata | No tracking; the shared content speaks for itself; recipient lands on the portal |
| **Image card generation** | Generate a downloadable image of the quote (Merriweather on warm cream with citation) | Shareable anywhere without platform dependency; beautiful; printable |

### Decision

Implement **clean link sharing with Open Graph cards** and **downloadable quote image generation** as a STG-004 feature. Every passage — in search results, in the reader, on theme pages, and in the Quiet Corner — has a quiet "Share" affordance.

**Share link behavior:**
- Generates a URL like `/passage/[chunk-id]` that resolves to the passage in context (reader view, scrolled to the passage)
- Open Graph tags render a beautiful preview card when the link is pasted into any platform: the quote in Merriweather, warm cream background, citation, and the portal URL
- No tracking parameters, no UTM codes, no referral tracking

**Quote image behavior:**
- "Save as image" option generates a PNG: the passage text in Merriweather on warm cream, citation below, subtle SRF lotus mark, portal URL at bottom
- Suitable for sharing via messaging apps, printing, or using as a phone wallpaper
- Generated server-side (or client-side via canvas) — no external service needed

### Rationale

- **Mission-aligned:** The philanthropist's goal is to make the teachings available worldwide. Sharing is the most natural distribution mechanism.
- **No tracking:** Unlike social share buttons (which embed third-party scripts and tracking pixels), a clean URL with OG metadata involves zero tracking.
- **Beautiful and respectful:** The shared card presents the teaching with the same reverence as the portal itself — serif typography, warm colors, proper citation.
- **Printable:** The downloadable image can be printed, framed, or placed on a meditation altar — bridging digital and physical, honoring the DELTA Embodiment principle.
- **Low effort, high impact:** OG tags are standard Next.js metadata. Image generation is a single API route or client-side canvas operation.

### Consequences

- Need a `/passage/[chunk-id]` route that renders a single passage in a shareable view
- OG meta tags must be set per-passage (dynamic `<meta>` in Next.js `generateMetadata`)
- Image generation requires either a server-side rendering solution (e.g., `@vercel/og` or Satori) or client-side canvas
- The share affordance must be visually quiet — a small icon, never a row of social media logos

---

## Notes

Merged from FTR-048 and FTR-048 (related ADRs) per FTR-084.
