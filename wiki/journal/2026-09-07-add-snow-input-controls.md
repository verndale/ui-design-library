---
date: 2026-09-07
topics: [component-architecture, figma-code-connect]
plan: none
pr: pending
---
# Add four Snow input controls and harden Figma promotion

## Why

- Snow.com exposed four mature reusable controls whose project names resolve to existing canonicals: Text input, Toggle, Segmented control, and Datepicker.
- The first Figma pass copied semantic variable names from an older collection. Those aliases resolved focus, selected, and error treatments to the same orange value even though the names appeared valid.
- The initial pages also sat below the component-page divider and did not prove that their documentation structure followed an inspected library precedent.

## What changed

- Added closed component implementations with stable facades, dedicated types, meaningful client/tree/leaf modules, neutral copy, semantic tokens, realization contracts, and Storybook interaction-state evidence. Datepicker composes the new Text input instead of duplicating its field implementation.
- Completed the accessibility-mode review by giving Datepicker grids explicit row/column ownership, making its dialog reference conditional on the mounted dialog, marking month announcements atomic, and retaining a forced-colors-visible focus outline on the native Text input.
- Added unpublished component-set masters and connected state specimens on four pages inside the Components section. Text input and Datepicker follow Search input; Toggle and Segmented control follow Button Light.
- Rebound component colors, radii, spacing, and typography to the Code/Tailwind collection and local styles. Error uses the critical token, focus uses the focus token, and selected/on states use the action token; orange remains only as the established documentation-rail accent.
- Made Figma promotion fail unless a new registration records its precedent page and section IDs, declares state-specific token requirements, and binds every component variable to the allowlisted code-parity IDs. A same-name variable from another collection is rejected.
- Recorded the clean source-parity, adversarial, and design review for Text input master `455:64`, Toggle master `456:34`, Segmented control master `457:52`, and Datepicker master `458:148`; each governed registry entry now resolves to `ready-for-dev` only after those reviews and live validation pass.
- Kept native Figma Dev Mode readiness and publication as explicit maintainer actions because the active writer API cannot set the native readiness flag; preserved every created master and state-node identity during remediation.
- Made the packed Next consumer assert the exact source-derived component set instead of a stale hard-coded total, so future governed additions extend the verification automatically.

## Files

- `components/text-input/`
- `components/toggle/`
- `components/segmented-control/`
- `components/datepicker/`
- `figma/library.json`
- `figma/PROMOTION-CHECKLIST.md`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-live.cjs`
- `scripts/test-next.cjs`

## Follow-ups

- Publish the four candidate masters only after normal maintainer review and package release.
