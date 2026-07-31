---
date: 2026-07-31
topics: []
plan: none
pr: pending
---
# Add the Alert component

## Why

- A page-level notification — an icon, a message, a dismiss, with severity variants — was promoted into the ui-design-brain catalog as **Alert** (the context alias for a page-level "Banner"). A mature client implementation existed, worth banking rather than rebuilding.
- Its value is the live-region contract: the severity is announced, not merely coloured.

## What changed

- Added `components/alert/` — a de-cliented capture: `Alert` takes composed `children`, a `positive` / `critical` variant, an optional dismiss (`onDismiss`), and optional auto-dismiss.
- Ported an imperative banner utility to a declarative component; the raw-HTML message sink became a `children` slot, which removes the XSS surface, and the caller owns visibility through `open`.
- Dropped a commerce-specific styling override hook (its only use was a mini-cart confirmation, out of scope) and the imperative fixed-position insertion — placement is the caller's, because page-level positioning is a client-page concern.
- Added a **tone layer** to `src/tokens/semantic.css`: `color-tone-positive` and `color-tone-critical`, the library's first status tokens, since the neutral palette had no home for outcome. Both clear WCAG AA contrast on `color-surface-raised` as text and as a non-text accent. Surface maps to `color-surface-raised`, text to `color-text-primary`.
- Kept verbatim: the icon + message + dismiss layout, the `role` / `aria-live` pairing per variant (positive → status/polite, critical → alert/assertive), and the auto-dismiss timing. Kept deliberately distinct from Toast. Provenance and the de-client record live in `component.json`.

## Files

- components/alert/Alert.tsx, components/alert/Alert.stories.tsx, components/alert/component.json, src/tokens/semantic.css

## Follow-ups

- The tone tokens are a single accent per severity; a fuller tone set — tinted surface and border per tone — can follow if a consumer needs filled-tone alerts.
