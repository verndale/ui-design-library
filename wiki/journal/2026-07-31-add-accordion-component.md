---
date: 2026-07-31
topics: []
plan: none
pr: pending
---
# Add the Accordion component

## Why

- A set of independently-expandable disclosure items — the FAQ / collapsible pattern — was promoted into the ui-design-brain catalog as **Accordion**. A mature client implementation existed (a full behaviour module with focus management and reduced-motion handling), worth banking rather than rebuilding.
- Its value is the accessibility contract, not the animation: `aria-expanded` / `aria-controls` on real header buttons, collapsed panels kept out of the tab order, and motion gated on `prefers-reduced-motion`.

## What changed

- Added `components/accordion/` — a de-cliented capture: `Accordion` takes an `items` array (label + panel body), an optional section `heading`, a `standalone` boxed treatment, and an `initialItemCount` show-more reveal.
- Replaced a hand-written height animation — a `transitionend` handler torn down through a WeakMap — with a CSS `grid-template-rows` 0fr→1fr transition driven by `--duration-base`, so the reduced-motion media query is the single switch that zeroes it.
- Replaced a manual focusable-selector gate on collapsed panels with the native `inert` attribute: same effect (Tab skips collapsed content), no selector list.
- Sprite icons became an inline `currentColor` SVG (the library ships no Icon component yet). Mapped onto semantic tokens: labels `color-text-primary`, panel body `color-text-secondary`, dividers `color-border-subtle`, focus ring `color-border-focus`, and the vertical rhythm `spacing-m` / `spacing-s` / `spacing-2xs`.
- Kept verbatim: `aria-expanded`, `aria-controls`, headers wrapped in `h3` for heading navigation, the collapsed-panel focus gating, and the reduced-motion short-circuit. Captured from a project retrospective; provenance and the de-client record live in `component.json`.

## Files

- components/accordion/Accordion.tsx, components/accordion/Accordion.stories.tsx, components/accordion/component.json

## Follow-ups

- Icons are inlined SVG; a shared Icon primitive in `src/lib/` would let Accordion, Alert, and Toast draw from one source instead of each inlining its own.
