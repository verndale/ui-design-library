---
date: 2026-08-19
topics: [variant-axis, figma-code-connect]
plan: plans/2026-08-19-figma-structural-family-contract.md
pr: https://github.com/verndale/ui-design-library/pull/52
---
# Govern structural variants as Figma families

## Why

- The native `(canonical, variant)` code axis had no equivalent Figma registry contract, so an AI consumer could resolve the canonical but not the structural import and master together.
- Existing published Button presentations made a blanket page migration unsafe.
- Figma properties could drift into implementation-only controls instead of mirroring the public package API.

## What changed

- Added optional `variant`, `variantLabel`, `default`, and `familyPage` registry validation and exact agreement with `component.json`.
- Required structural siblings to share one designated family page, preserve the default master name/identity, and use `Canonical / Variant label` for alternates.
- Designated Button Light as the legacy Button family page without moving existing nodes.
- Added exact structural coverage matching, public-contract property guidance, instance-swap validation, and deterministic AI resolution documentation.
- Preserved Code Connect rejection and the publication authority boundary.

## Files

- `figma/library.json`
- `figma/README.md`
- `figma/PROMOTION-CHECKLIST.md`
- `scripts/check-figma-coverage.cjs`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-coverage.selftest.cjs`
- `scripts/check-figma-contracts.selftest.cjs`

## Follow-ups

- Apply the family-page contract when the first real structural alternate is captured; this change does not create or rearrange live Figma nodes.
