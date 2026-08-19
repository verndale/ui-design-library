---
date: 2026-08-18
topics: [figma-code-connect]
plan: plans/2026-08-18-figma-supported-batch.md
pr: https://github.com/verndale/ui-design-library/pull/50
---
# Promote the remaining supported Figma and Code Connect batch

## Why

- The seven-node pilot established the governance contract, but most supported public components still had no governed Figma master or parserless mapping.
- The continuation needed to preserve the pilot's published identities while growing the registry one component at a time.
- Early batch pages exposed a presentation drift: documentation and responsive canvases were not consistently ordered, and a wide breakpoint canvas was incorrectly treated as permission to stretch the Slider specimen.

## What changed

- Promoted Avatar, Badge, Link, Image, Quote, Rich text, Stat, Search input, Slider, Breadcrumbs, Accordion, Tabs, Toast, In-page navigation, Carousel, and Search overlay.
- Registered each new component or component set by live node ID and key, with exact public story-prop partitions and parserless public-package Code Connect templates.
- Standardized each page on the Button Light documentation rail at x=0, Main content immediately to its right, and the publish source farther right.
- Applied the governed 1440, 1024, 768, and 390 viewport pattern only where responsive behavior is meaningful. Viewport context and component sizing are separate contracts: Slider stays 520px at wide breakpoints and compresses to 350px inside the 390px canvas, while fluid components such as Carousel fill their consumer-owned width.
- Kept all new Figma assets and Code Connect records unpublished. Live React Code Connect lookups for all sixteen new nodes returned empty maps, preserving the explicit maintainer release boundary.
- Extended the Figma registry and contract self-tests so the repository validates twenty-three promoted nodes without weakening the immutable pilot identities.

## Files

- `figma/library.json`
- `figma/components/*.figma.ts`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-contracts.selftest.cjs`
- `wiki/topics/figma-code-connect.md`

## Follow-ups

- Maintainer review is required before publishing the sixteen new Figma library assets.
- Figma library publication and Code Connect publication remain separate release actions.
- After publication, verify all twenty-three registered nodes from a separate consumer Figma file and record Dev Mode evidence.
