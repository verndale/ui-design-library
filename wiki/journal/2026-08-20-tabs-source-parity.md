---
date: 2026-08-20
topics: [component-architecture, figma-code-connect, story-testing, variant-axis]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: pending
---
# Restore Tabs visual and responsive source parity

## Why

- Private decisions `sp-tabs-002` and `sp-tabs-004` accepted two reusable differences: a horizontal presentation choice and a narrow native-select structure.
- The default pill API, vertical pills, panel ownership, roving focus, orientation-aware keys, and controlled/uncontrolled selection had to remain stable.
- The responsive alternate needed one state engine and one panel tree; duplicating either by breakpoint would create focus and ownership drift.
- CMS placeholders, content filtering, editor warnings, label services, and project wiring remained rejected application orchestration.

## What changed

- Added horizontal `presentation: 'pills' | 'stroke'`, keeping pills as the default and restricting vertical Tabs to pills.
- Added the exact `tabs--native-select` structural sibling and `TabsNativeSelect` export. A CSS `lg` switch exposes either the pill tablist or labelled native select while one shared controller owns selection, IDs, keyboard handling, and panels.
- Added focus transfer for the active responsive control, active-panel `aria-controls` on the select, plain-text option labels, invalid-ID fallback, empty/single-item handling, and DOM-free SSR coverage.
- Added Storybook evidence for presentation, controlled state, hidden-copy exclusion, breakpoint focus transfer, shared selection, group/select labelling, and 1440/1024/768/390 review widths.
- Preserved Figma master `181:70` and key `61cc421f55d05f5b430d5b1f69d9aee38e948eca`; added the Presentation axis without moving identity. Added unpublished structural master `334:120`, key `08ff6adc380811cdad9602d6689b84672f269b0a`, and specimens `335:49`, `335:57`, `335:65`, and `335:73` on page `181:2`.
- Registered both exact implementation keys for AI resolution and emptied the temporary source-parity baseline. The immutable initial-key record and validators remain because they explicitly require the mechanism.

## Reviews

- Source-parity review passed after both pinned source hashes matched the immutable audit, the accepted decisions reached code, Storybook, Figma, and AI metadata, and the rejected orchestration stayed absent.
- Adversarial review corrected deterministic `argTypes` discovery, aligned the stroke width to the existing governed token, and passed breakpoint focus/state, hidden-copy, IDREF, controlled-state, boundary-input, SSR, and exact structural-resolution checks.
- Design review fixed the mobile Figma select's fill constraint, documentation wrapping, and publish-section whitespace. The final page screenshot showed contained 390px content, readable properties, stable masters, and direct responsive instances.

## Files

- `components/tabs/`
- `components/tabs--native-select/`
- `tests/ssr/components.ssr.test.tsx`
- `figma/library.json`
- `figma/source-parity-baseline.json`
- `ACCESSIBILITY.md`
- `wiki/`

## Follow-ups

- Append private completion events and closure metadata only after this branch lands. Figma publication remains an explicit maintainer action.
