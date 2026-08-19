---
status: partial
executed: 2026-08-18
evidence:
  - "sixteen additional Ready for Dev Figma nodes"
  - "twenty-three registered nodes"
  - "pnpm figma:validate"
  - "live Code Connect maps confirmed empty before release"
  - "PR #50 https://github.com/verndale/ui-design-library/pull/50 (merged 2026-08-19)"
source_tool: codex
source: approved continuation task in the Codex session
topics: [figma-code-connect]
audit_note: All sixteen remaining supported components were promoted, documented, registered, visually audited, and given parserless templates. Explicit Figma publication, Code Connect publication, and the post-publication consumer-file smoke test remain maintainer-controlled.
---
# Remaining supported Figma library and Code Connect batch

## Objective

Continue the Organization-tier Figma library and Code Connect work by promoting the remaining supported public components into the existing UI Design Library without replacing the seven published pilot nodes.

## Approved order

1. Avatar
2. Badge
3. Link
4. Image
5. Quote
6. Rich text
7. Stat
8. Search input
9. Slider
10. Breadcrumbs
11. Accordion
12. Tabs
13. Toast
14. In-page navigation
15. Carousel
16. Search overlay

## Figma execution

- Work one canonical component at a time and search the design system immediately before promotion.
- Derive properties from the public TypeScript types and Storybook `argTypes`; do not alter the runtime API.
- Use the Button Light documentation structure on the left, Main immediately to its right, and the publish source farther right.
- Use direct canonical instances as developer targets. Keep viewport labels, variant labels, and presentation surfaces outside those instances.
- Use 1440, 1024, 768, and 390px canvases when responsive behavior is meaningful. Do not stretch an intrinsic component merely because its breakpoint canvas is wide.
- Bind component visuals to governed Code/Tailwind variables and styles, and visually audit every page before moving on.

## Repository execution

- Add each live node ID, component key, property surface, story partition, publication status, and presentation pattern to `figma/library.json`.
- Add a parserless `.figma.ts` template using only the public `@verndale/ui-design-library/components/<slug>` import.
- Extend contracts as needed for growing-node completeness, immutable pilot ownership, public imports, exact property/story parity, and valid nested dependencies.
- Keep Figma and Code Connect publication disabled during implementation.

## Verification

- Validate live Figma node names, types, keys, properties, page order, and documentation/Main/source placement.
- Inspect responsive specimens and generated Code Connect snippets.
- Confirm the new live Code Connect maps remain empty before release.
- Run `pnpm figma:validate`, `pnpm graphify:sync`, `pnpm contracts`, `pnpm test`, and `pnpm build`.
- Stop for maintainer review; publishing and the separate consumer-file smoke test require explicit release authorization.
