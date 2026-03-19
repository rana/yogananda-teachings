---
ftr: 153
title: Design Tooling
summary: "Figma and Storybook adoption deferred until human designers join the project"
state: deferred
domain: operations
governed-by: [PRI-12]
suspended: 2026-02-28
---

# FTR-153: Design Tooling

## Proposal

**Status:** Suspended (deferred)
**Type:** Enhancement
**Governing Refs:** —
**Suspended:** 2026-02-28

During AI-led development, code is the design artifact — Claude generates components directly, the browser rendering is the design. No external design tool (Figma, Storybook) serves a function when the designer and developer are the same AI. Visual design emerges through code iteration: generate CSS/components from FTR-042 design tokens, render in browser, evaluate, refine.

**Reactivation trigger:** Human designers join the project. When that happens, Figma becomes the upstream design source (Figma → tokens.json → tailwind.config.ts → components). Storybook documents the component library for the human team.

**Decision context preserved:** Figma was chosen over Penpot, Sketch, and Adobe XD for industry familiarity, design token export, and SRF team compatibility. Code-first (no tool) was the alternative considered and is the current active approach. If human designers never join, this FTR remains suspended indefinitely.

**Origin:** FTR-153 suspension 2026-02-28 — AI-led project has no design team; tools add overhead without consumers.

