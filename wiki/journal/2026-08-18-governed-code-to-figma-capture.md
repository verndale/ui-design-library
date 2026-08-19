---
date: 2026-08-18
topics: [figma-code-connect]
plan: plans/2026-08-18-governed-code-to-figma-capture.md
pr: pending
---
# Make reviewed Figma coverage part of component capture

## Why

- Project-retrospective capture ended after React, Tailwind, and Storybook, so a reusable component could reach the npm library without reaching the governed Figma file.
- Candidate maturity is the capture-time state; waiting for supported maturity would leave the design handoff incomplete indefinitely.
- The earlier Figma batch showed that visual standards can drift even when node identity and local registry data look correct, so creation alone is not completion.
- Canonical npm subpaths already supply the AI orchestration's code contract. Keeping Code Connect would create a second unused surface.

## What changed

- Added a code-to-Figma coverage gate for every candidate and supported primary export. Candidate registrations must remain unpublished.
- Required each registration to carry a passed Button-standard adversarial/design review linked to repository journal evidence; backfilled the existing 23 nodes from the completed remediation review.
- Added a pre-Figma `contracts:code` command, then kept aggregate contracts strict: coverage, registry review, and live validation must all pass before delivery.
- Removed the Code Connect dependency, configuration, templates, scripts, registry fields, and CI path. Contracts reject their reintroduction.
- Made the promotion checklist require the exact left documentation rail, governed breakpoints, comparison with Button/Section header/Alert, in-place remediation, and a clean repeat review.

## Files

- `scripts/check-figma-coverage.cjs`
- `scripts/check-figma-contracts.cjs`
- `figma/library.json` and `figma/PROMOTION-CHECKLIST.md`
- `.github/workflows/figma-library-validation.yml`

## Follow-ups

- Local live validation still skips when `FIGMA_REST_TOKEN` is absent; GitHub Actions supplies the configured read-only secret.
- Figma library publication remains an explicit maintainer action.
