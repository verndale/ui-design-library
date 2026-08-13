---
date: 2026-08-13
topics: [package-distribution]
plan: plans/2026-08-12-executable-esm-reuse-contract-v2.md
pr: https://github.com/verndale/ui-design-library/pull/35
---
# Stat metadata stops advertising StatGroup variants

## Why

The disposable Mimecast contract-v2 verification rejected package `Stat` on exact DOM/API realization and exposed a separate metadata error: `component.json.variants` advertised `row` and `column`, but the primary `Stat` export has no such prop. Those literals belong to the secondary developer API `StatGroup.orientation`.

## What changed

- `Stat` now declares an empty primary-export `variants` array.
- The architecture gate rejects a manifest variant when that string literal is absent from the primary `<ExportName>Props` declaration and belongs only to a secondary facade export's props.
- A self-test locks the `Stat`/`StatGroup` failure shape without hard-coding either component name.

## Evidence

- The published package remained executable and the AI inventory imported all 21 candidates.
- Mimecast's Metric Mosaic required eyebrow-before-highlight ordering, while the package primary renders value-before-label; orchestration correctly recorded `reuse-realization-incompatible` and created locally.
