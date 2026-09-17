---
date: 2026-09-17
topics: [figma-code-connect, component-architecture, story-testing]
plan: none
pr: pending
---
# Add governed Gauge chart and Pie chart components

## Why

- Two reusable data-visualization patterns needed dependency-free package implementations instead of project charting wrappers.
- The Figma library had no chart palette or review standard for ordered data colors, text equivalence, responsive legends, or reduced motion.
- Capture needed to preserve all accepted source decisions across code, Storybook, Figma, and AI registration without publishing the new masters.

## What changed

- Added server-rendered Gauge chart and Pie chart components with semantic chart tokens, visible text equivalents, ordered legends, public visual states, and reduced-motion-safe drawing.
- Added `data-visualization-standard-v1`; the contract checker now accepts only the general component standard or this registered chart standard and rejects unknown names.
- Added semantic chart variables in the Code/Tailwind collection and registered unpublished component-set masters `689:368` and `691:126`, their complete variant axes, connected responsive specimens, and connected interaction-state specimens.
- Source-parity review mapped every Figma-targeted decision exactly once. The first live audit rejected raw spacing and padding on every new variant; rebinding each value to the governed Code/Tailwind aliases cleared the 34-node audit. Adversarial review then found no duplicate variants, disconnected specimens, unbound colors, unknown aliases, or missing visual property references. Design review found no clipping or hierarchy issues across 1440, 1024, 768, and 390 specimens; absolute chart-visual frames remain intentional because SVG geometry is positioned rather than auto-laid out.
- The accessibility-mode gate now distinguishes decorative SVGs from semantic chart graphics. Meaningful SVGs must use `role="img"`, expose a non-empty accessible name, and include a title; decorative graphics remain excluded from the accessibility tree.
- Updated the separate UI Design Library Style Guide with ordered chart roles, component-governance rules, responsive/accessibility requirements, and current adoption counts. The governed masters remain unpublished because Figma publication is a separate explicit action.

## Files

- `components/gauge-chart/`
- `components/pie-chart/`
- `src/tokens/semantic.css`
- `figma/library.json`
- `figma/REVIEW-STANDARDS.md`
- `scripts/check-figma-contracts.cjs`

## Follow-ups

- Publish the Figma masters only under the existing explicit publication boundary, then verify them from a separate consumer file.
