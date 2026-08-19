---
date: 2026-08-19
topics: [figma-code-connect]
plan: plans/2026-08-19-card-media-composition-specimens.md
pr: https://github.com/verndale/ui-design-library/pull/56
---
# Document Card media presence as composition

## Why

- Media presence was being discussed as a possible Card variant even though the public API already models it as optional nested content.
- A new Figma property or structural import would have created a design-only contract that code and AI consumers could not resolve consistently.
- The existing Card and Content property descriptions still mentioned Code Connect after the repository made canonical npm imports the sole code-consumption path.

## What changed

- Created library issue [#55](https://github.com/verndale/ui-design-library/issues/55) with `Feature` and `area: components`, then created local branch `feat/55-library-capture`.
- Added `✅ Ready for Dev / 03 • Composition specimens / Card` as Figma section `261:72`, after Main and before Published source.
- Built both specimens from direct instances of Card variant `71:89`; the with-media Content slot holds a connected CardMedia instance resolving to master `69:90`, while the without-media slot contains only the body branch.
- Preserved Card master `71:104`, key `a8a7b1892ede65a10e9f9322428e3965f69b5b16`, variants `71:89` and `71:98`, and property keys `Content#71:1` and `Surface`.
- Reworded the Card and Content property descriptions to describe nested design-system dependencies without Code Connect.
- Bound the section's documentation fills, strokes, radius, spacing, and text to the existing governed variables and shared styles.

## Adversarial review

- The first adversarial pass found unbound 40px root padding; all four sides now use `spacing/l`.
- The final adversarial pass found no identity, property, Code Connect wording, generic-name, unstyled-text, raw-fill, raw-spacing, nesting, or containment failures.

## Design review

- The final design pass found no clipping, overlap, wrapping, hierarchy, or intrinsic-sizing defects.
- No new brain canonical, structural implementation, public Card property, evidence lifecycle record, or downstream branch was warranted.

## Files

- `figma/library.json`
- `wiki/INDEX.md`
- `wiki/topics/figma-code-connect.md`
- `wiki/plans/INDEX.md`
- `wiki/plans/2026-08-19-card-media-composition-specimens.md`
- `wiki/journal/2026-08-19-card-media-composition-specimens.md`

## Follow-ups

- Publication and a separate consumer-file smoke test remain explicit maintainer actions.
