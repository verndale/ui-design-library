---
date: 2026-08-20
topics: [figma-code-connect]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: pending
---
# Compose governed Cards inside Carousel

## Why

- Carousel already accepts arbitrary React nodes, so a governed Card is valid slide content without another public prop or canonical pattern.
- The source project used Carousel with People cards, but its 319px consumer width is composition-specific; the accepted reusable layout remains the exact 284px desktop and 299px compact contract.
- Rendering a partially clipped interactive Card exposed a mistaken focus conclusion in the first remediation review: the source-derived multi-card layout requires full containment before a slide may enter the tab order.

## What changed

- Added `Compositions/Carousel with Cards` in Storybook using the public Carousel, Card, and CardMedia facades. Its interaction test proves six real Cards, a partially clipped inert Card, one-slide navigation, and the resulting `2 / 6` status.
- Multi-card peek now applies `inert` until a slide is fully inside the viewport; the default single-slide layout retains intersecting-slide behavior. Scroll-driven geometry checks are coalesced to one animation frame.
- Added unpublished Figma section `293:218` on Carousel page `211:2`. Its 1440, 1024, 768, and 390 compositions are `297:58`, `297:1277`, `297:1324`, and `297:1371`; each contains direct Card variant `71:89` instances and Carousel master `277:71` controls.
- The responsive Card tracks reuse `layout/slide-width` and `layout/gap`: 284/12 at 1440 and 1024, 299/12 at 768, and 299/8 at 390. Each track clips exactly one partial next Card.
- Kept the Card content example as a composition specimen. No Carousel Card prop, 319px layout variant, structural alternate, brain canonical, Code Connect artifact, or new token was introduced.

## Review results

- Adversarial review corrected partial-slide focus gating and coalesced scroll work; identity checks confirmed every specimen Card resolves to `71:89` and every control instance resolves to `277:71`.
- Design review found and fixed a clipped fixed-width header badge. The final screenshot confirms readable labels, intact Card hierarchy, partial-next affordance, controls/status, and responsive containment at all four widths.
- The default master `211:4` and multi-card master `277:71` retain their identities. Figma remains unpublished.

## Files

- `components/carousel/`
- `stories/compositions/CarouselCardComposition.stories.tsx`
- `.storybook/main.ts`
- `figma/library.json`
- `wiki/`

## Follow-ups

- Publication and a separate consumer-file smoke test remain explicit maintainer actions.
