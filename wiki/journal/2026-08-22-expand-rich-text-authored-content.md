---
date: 2026-08-22
topics: [figma-code-connect, story-testing]
plan: plans/2026-08-22-rich-text-authored-content-coverage.md
pr: https://github.com/verndale/ui-design-library/pull/81
---
# Expand Rich Text authored-content coverage

## Why

- The Bentley capture source styled H1–H6 plus `img`, `picture`, `video`, and `iframe`, but the library rewrite retained only H2–H4 and omitted responsive media.
- The live Rich Text master demonstrated one H2, a paragraph, and list items, so it understated what an author can supply.
- Rich-text authors also need figures, captions, and semantic tables even though tables were absent from the captured Bentley specimen.

## What changed

- Restored source-backed heading levels, 24px direct-child flow, 8px list-item rhythm, and responsive media selectors using semantic tokens and descendant utilities.
- Added neutral `figure`/`figcaption` and native table/caption/header/cell treatment. CMS allowlisting, ingestion, sanitization, media controls, and table behavior remain caller responsibilities.
- Expanded the FullFlow story and assertions to cover H1–H6, both list types, responsive media, captions, a named table, and scoped column headers.
- Corrected Rich Text master `173:62` in place: both variants now use the code-backed bold H2 style, secondary body text, and exact 24px/8px rhythm. Its key, two variants, property axis, and connected instances were preserved.
- Added Figma authored-content section `417:26` for typography/flow, a connected canonical Image instance, media/caption guidance, and a semantic table. Arbitrary children stay documentation specimens instead of becoming finite Rich Text variants.
- Created only the missing `Code/Tailwind/text-2xl + font-bold` Figma text style; all other typography and spacing/color values reuse governed styles and variables.

## Files

- `components/rich-text/RichText.styles.ts`
- `components/rich-text/RichText.stories.tsx`
- `components/rich-text/RichText.tsx`
- `components/rich-text/component.json`
- `wiki/topics/figma-code-connect.md`
- `wiki/topics/story-testing.md`

## Follow-ups

- Publication and downstream consumer verification remain maintainer-controlled with the rest of issue #80.
