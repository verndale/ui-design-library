---
date: 2026-09-17
topics: [figma-code-connect]
plan: none
pr: pending
---
# Enforce the governed Figma component-page standard

## Why

- Gauge chart and Pie chart initially landed after Archive instead of under Components.
- Their pages used plausible but custom dark section chrome rather than the established live section appearance, and their interaction matrices extended left of their presentation frames.
- The existing validator checked registered section identity and a few dimensions, so prose instructions could be overlooked without a failing machine gate.

## What changed

The two chart pages moved between the `❖ Components` and `---` boundary pages without replacing their page, section, master, variant, responsive-specimen, or interaction-state identities. Their documentation, Main, Interaction states, and Publish source regions now use the same fills, strokes, named children, coordinates, insets, gaps, containment, and direct-master grid as the governed live precedent. Their state matrices were moved fully inside their frames. The new audit also exposed and corrected oversized interaction headers in Text input, Toggle, and Segmented control.

`figma/library.json` now records that page standard as `components-group-button-template-v1`, including stable live reference section IDs. The contract checker freezes the schema, and the live audit reads file page order plus registered section trees to reject pages outside Components, section-appearance drift, custom documentation chrome, displaced sections, presentation overflow, nested masters, and non-wrapped publish grids. Fixture tests exercise each bypass. Visual review remains required after this structural gate, but it cannot waive it.

## Files

- `figma/library.json`
- `figma/README.md`
- `figma/PROMOTION-CHECKLIST.md`
- `figma/REVIEW-STANDARDS.md`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-contracts.selftest.cjs`
- `scripts/check-figma-live.cjs`
- `scripts/check-figma-live.selftest.cjs`

## Follow-ups

Figma library publication remains a separate explicit maintainer action.
