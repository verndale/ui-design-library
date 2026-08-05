---
date: 2026-07-30
topics: []
plan: none
pr: https://github.com/verndale/ui-design-library/pull/21
---
# Add the Stat component

## Why

- Two project retrospectives independently built the "prominent value + describing label" pattern, and it was promoted into the ui-design-brain catalog as **Stat**. A mature client implementation (a `StatCard` / `DetailStats` pair) existed, worth banking rather than rebuilding.
- The pattern's core is an accessibility contract, not a card: a group of stats needs an accessible name. That is the part worth keeping.

## What changed

- Added `components/stat/` — a de-cliented capture with two exports: `Stat` (a surface-less value + label + optional description, value-then-label in reading order) and `StatGroup` (a visually-hidden `<h2>` + `<ul aria-labelledby>` naming a native list, one `<li>` per Stat, with a `row` / `column` orientation).
- Deliberately surface-less: the Stat pattern points at **Card** for the container, so `Stat` is the figure and the box is caller composition. Dropped as page/brand concerns: the card surface, `uppercase` on the value, the fixed `min-h`, and the source's carousel/grid section wrapper. Kept verbatim: the sr-only-heading + `aria-labelledby` group naming — the reason the implementation was worth capturing.
- Typography: the source's `text-stats-m` display composite became `text-6xl font-extrabold`, because this repo has no display type-scale token — the value size uses Tailwind's default scale.
- Captured from the `project-retrospective` run at `runs/mc/2026-07-30/` (provenance in `component.json`); the de-client record is the `declienting` array.

## Files

- components/stat/Stat.tsx, components/stat/Stat.stories.tsx, components/stat/component.json

## Follow-ups

- No display / stat-value typography token exists in `src/tokens/semantic.css`; the value size is a Tailwind default rather than a re-themable token. A `--text-*` display token would let the value be re-themed like colours and spacing are.
- Row equal-height is approximated with `items-stretch`; the source's `.stat-grid` subgrid alignment can follow if a consumer needs exact cross-card row alignment.
