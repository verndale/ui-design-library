---
date: 2026-07-31
topics: []
plan: none
pr: pending
---
# Add the Toast component

## Why

- A transient, bottom-anchored confirmation with severity variants was promoted into the ui-design-brain catalog as **Toast**. A mature, client-neutral implementation existed, worth banking rather than rebuilding.
- Its value is the live-region contract per severity — and staying deliberately distinct from Alert (page-level, persistent), a split the source cross-referenced on purpose.

## What changed

- Added `components/toast/` — a de-cliented capture: `Toast` takes composed `children`, a `neutral` / `critical` variant, consumer-controlled `open`, and auto-dismiss. It portals to the document body so it stacks above page content.
- Ported an imperative toast utility to a declarative component; the raw-HTML message sink became a `children` slot, which removes the XSS surface. Reuses the `color-tone-critical` token added with Alert; surface `color-surface-raised`, text `color-text-primary`, elevation `shadow-overlay`.
- Drove the entrance animation through `--animate-fade-in` / `--duration-base`, so the reduced-motion media query is the single switch that collapses it.
- Kept verbatim: the `role` / `aria-live` pairing per variant (neutral → status/polite, critical → alert/assertive) and the auto-dismiss timing. Kept deliberately distinct from Alert. Provenance and the de-client record live in `component.json`.

## Files

- components/toast/Toast.tsx, components/toast/Toast.stories.tsx, components/toast/component.json

## Follow-ups

- Toast renders a single message; a stacking viewport/provider — multiple concurrent toasts, queueing — can follow if a consumer needs it.
