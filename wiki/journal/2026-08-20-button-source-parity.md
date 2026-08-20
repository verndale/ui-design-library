---
date: 2026-08-20
topics: [figma-code-connect]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: pending
---
# Restore Button icon-only source parity

## Why

- Private decision `sp-button-002` accepted the reusable square icon-only Button presentation, but the normalized library exposed only label buttons and decorative leading/trailing slots.
- The remediation needed to preserve the existing label default and the published Light `22:2` and Dark `53:3` Figma identities.
- Icon-only controls need a deterministic accessible-name obligation, exact token-backed target sizes, and an unambiguous Figma presentation.

## What changed

- Added `presentation: 'label' | 'icon-only'` with a `label` default and a discriminated TypeScript branch that requires native `aria-label` for icon-only use.
- Kept Primary, Secondary, Ghost, Light/Dark surface, disabled, focus, and reduced-motion behavior on the same canonical Button. Source tertiary maps to Ghost; 48/40/36 dimensions and `radius/medium` come from existing semantic tokens.
- Added Storybook icon-only interaction evidence and a complete Light/Dark matrix. The AI realization contract now records the presentation axis and conditional accessible-name constraint.
- Preserved the published Figma masters and added unpublished Light `307:2` and Dark `308:2` icon-only sets beside their matching bases. The sets contain 12 and 18 variants respectively and remain unpublished.
- Narrowed presentation-family validation so a fixed-prop presentation shares the page of its one-difference matching base. Structural families still share the designated family page, and exact-once source-parity decision ownership remains enforced.
- Removed Button from the temporary legacy baseline.

## Reviews

- Source-parity review passed: the semantic presentation, appearances, sizes, disabled state, and accessible-name obligation are represented on every declared surface without importing client identity or orchestration.
- Adversarial review found inherited 80px minimum widths, a disappearing Dark Primary glyph, and a missing target-size protection declaration. The widths now bind only to 48/40/36 touch tokens, glyph fills inherit the corresponding visible label token, and `classNames.root` protects target size.
- Design review found that cloned Figma sets lacked exported row and column context. Token-styled Icon only, size, hierarchy, and disabled-state annotations now make both matrices self-explanatory.
- The published masters were not changed or republished, and no Code Connect surface was introduced.

## Files

- `components/button/`
- `figma/library.json`
- `figma/source-parity-baseline.json`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-contracts.selftest.cjs`
- `wiki/topics/figma-code-connect.md`
