---
date: 2026-07-31
topics: []
plan: none
pr: https://github.com/verndale/ui-design-library/pull/13
---
# Add the Image component

## Why

- The catalog's **Image** canonical had no implementation here, and a disciplined responsive-image primitive existed worth banking rather than rebuilding.
- Its value is the source ordering inside `<picture>`. A browser takes the first source it can decode, so an order that reads as cosmetic actually decides which file ships: each breakpoint must contribute a WebP source *before* its raster fallback, all narrower renditions must precede the default pair, and the `<img>` must close the list. Getting that subtly wrong is silent — the page still renders, just with the wrong bytes.
- The second reason is layout stability: intrinsic `width`/`height` are always emitted, so the box is reserved before the image arrives and the component contributes no layout shift.

## What changed

- Added `components/image/` — a responsive image whose URL composition is injected rather than assumed. The de-clienting seam is a `loader({ src, width, height, format })` prop, the same shape framework image components use, so any transform host or DAM can be plugged in.
- Kept verbatim: the source ordering, the always-emitted intrinsic dimensions, and a required `alt` — a decorative image passes `""`, which is a declaration rather than an omission.
- Ruled out keeping a default transform contract. The source hardcoded a query shape and a placeholder image host; both come out entirely, and placeholder sourcing is now a Storybook concern.
- Behaviour decision worth recording: with no `loader` there is nothing to derive alternates from, so the component renders a plain `<img>` instead of emitting `type="image/webp"` sources pointing at a file that was never transcoded. Claiming a format the pipeline cannot produce would serve a broken image; the two duplicated markup branches in the source collapsed into that single honest fallback.
- Added `decoding="async"` and an explicit block / `max-width: 100%` box, which the source left to ambient page CSS that does not travel with a shared component.
- Tokens: `radius-medium` for the clipped variant. The component is otherwise layout-only and touches no colour.

## Files

- components/image/Image.tsx, components/image/Image.stories.tsx, components/image/component.json

## Follow-ups

- `sizes` is not exposed. The current API drives selection through per-breakpoint `media`, which matches the captured behaviour; a `sizes`-based API is the more modern approach and would be a deliberate second iteration, not an addition.
- Art direction (a different crop per breakpoint, rather than a different size of the same crop) is expressible through `responsive` today only by varying dimensions. A real art-direction API would take a different source per breakpoint.
