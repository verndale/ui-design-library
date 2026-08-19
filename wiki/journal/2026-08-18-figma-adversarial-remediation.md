---
date: 2026-08-18
topics: [figma-code-connect]
plan: plans/2026-08-18-figma-adversarial-remediation.md
pr: pending
---
# Remediate the Figma adversarial and design review

## Why

- The supported-component batch had drifted from the established Button documentation standard: several documentation surfaces were restyled, later pages were structurally different, and content was not consistently kept on the left.
- Slider specimens were initially stretched to viewport width even though the component is intrinsically capped, showing that breakpoint canvases and component sizing needed separate enforcement.
- The live file exposed deeper gaps that local snapshots could not prove: variable scope/syntax drift, missing shared text styles, raw component spacing, and properties present in the mapping but disconnected from visible layers.
- Some disconnected values were legitimate ARIA, HTML, or runtime metadata; treating every missing visual reference alike would create an unsafe waiver rather than a durable rule.

## What changed

- Restored Stat through Toast plus Carousel and Search overlay documentation to the exact Button-standard 528px rail at x=0. Main and every responsive/publish surface remain to its right; the 1440/1024/768/390 breakpoint pattern is preserved without stretching Slider beyond 520px (350px on mobile).
- Corrected the governed variable scope/syntax values, created the five shared Code/Tailwind text styles, applied them to all semantic component text, and bound Carousel/Search overlay spacing to existing semantic variables.
- Simplified Search overlay to visible Title, Supporting copy, Query, Input placeholder, and State properties; fixed `open` in the template and kept `closeLabel` code-only. Added a visible Loop treatment to Carousel without replacing its master, and clarified Avatar's freeform media SLOT.
- Added `scripts/check-figma-live.cjs`, a read-only file-nodes audit for live identity, property definitions/references, text styles, color aliases, and spacing aliases. Fixture tests prove each failure mode. CI now separates the read-only REST token from the Code Connect dry-run token.
- Marked the small set of ARIA, HTML, and runtime-only mappings as `visualBinding: "nonvisual"` with mandatory reasons. Visible properties have no waiver path.
- Corrected Carousel's Storybook `statusSeparator` documentation from the stale `" of "` default to the implementation's `"/"` default.

## Files

- `figma/library.json`
- `figma/components/search-overlay.figma.ts`
- `scripts/check-figma-live.cjs`
- `scripts/check-figma-live.selftest.cjs`
- `scripts/check-figma-contracts.cjs`
- `.github/workflows/figma-code-connect.yml`
- `figma/README.md`
- `figma/PROMOTION-CHECKLIST.md`

## Reviewed identities

The adversarial and design review covered these stable registered masters. This list makes the journal usable as machine-checkable review evidence without turning publication into an automated action.

- `button-light` — `22:2`
- `button-dark` — `53:3`
- `section-header` — `64:99`
- `alert` — `66:112`
- `card` — `71:104`
- `card-media` — `69:90`
- `modal` — `75:129`
- `avatar` — `164:45`
- `badge` — `167:80`
- `link` — `169:62`
- `image` — `171:46`
- `quote` — `172:39`
- `rich-text` — `173:62`
- `stat` — `176:12`
- `search-input` — `177:30`
- `slider` — `178:76`
- `breadcrumbs` — `179:52`
- `accordion` — `180:82`
- `tabs` — `181:70`
- `toast` — `184:40`
- `in-page-navigation` — `204:58`
- `carousel` — `211:4`
- `search-overlay` — `217:52`

## Follow-ups

- Configure `FIGMA_REST_TOKEN` with read-only `file_content:read` and retain the separate `FIGMA_CODE_CONNECT_TOKEN` secret before CI is expected to pass.
- Publication and the separate consumer-file Dev Mode smoke test remain explicit maintainer actions.

## Supersession

Later on 2026-08-18, the maintainer removed Code Connect from the system entirely. The template files and second credential described above no longer exist or apply; canonical npm imports are now the only code-consumption path. The node-specific adversarial and design-review findings remain the evidence for the registered masters listed here.
