---
date: 2026-08-03
topics: []
plan: none
pr: pending
---
# Add the In-page navigation component

## Why

- A project retrospective banked a mature "on this page" section-nav implementation, promoted into the ui-design-brain catalog this same cycle as the **In-page navigation** pattern. Its value is the behaviour — scroll-spy plus the landmark and active-link contract — which is tedious to get right and worth banking rather than rebuilding.

## What changed

- Added `components/in-page-navigation/` — a de-cliented `InPageNavigation`: a `<nav aria-label="On this page">` landmark of real anchor links whose active link carries `aria-current`, a horizontal pill bar on wide viewports that collapses below `lg` to a trigger + drawer.
- The active section is driven by a dependency-free `IntersectionObserver` scroll-spy over the section targets, with an optional controlled `activeId` override; the captured version coupled its active-section logic to the source project's heading model, which was removed in favour of an explicit `{ id, label }` items list.
- Reused the library's established patterns: the collapsed drawer is `inert` (skipped by Tab) and its reveal is a `grid-template-rows` transition on `duration-[var(--duration-base)]`, so reduced motion is handled by the token layer. Mapped the bar surface/border/focus/text and the pill + drawer radii onto library semantic tokens; the chevron is an inline `currentColor` SVG since there is no Icon component yet. The de-client record is the `declienting` array; provenance is in `component.json`.
- Kept verbatim: the landmark and its accessible name, `aria-current` on the active link, native anchor keyboarding (Tab reaches, Enter activates), and the mobile trigger's `aria-expanded`/`aria-controls` disclosure — the accessibility contract that made it worth capturing.

## Files

- components/in-page-navigation/InPageNavigation.tsx, components/in-page-navigation/InPageNavigation.stories.tsx, components/in-page-navigation/component.json

## Follow-ups

- The scroll-spy observes elements by `id`; a consumer whose sections are not `id`-addressable would need a ref-based variant.
- No client type-scale token exists here, so link text uses `text-base`; a `--text-*` token would let it be re-themed like the colours are.
