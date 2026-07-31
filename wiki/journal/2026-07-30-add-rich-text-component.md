---
date: 2026-07-30
topics: []
plan: none
pr: https://github.com/verndale/ui-design-library/pull/8
---
# Add the Rich text component

## Why

- A read-only prose-render primitive — it styles already-authored formatted content (headings, paragraphs, lists, links) as one flowing block — was promoted into the ui-design-brain catalog as **Rich text**, distinct from the editing-only Rich text editor. A mature client implementation with a full Storybook story existed, worth banking rather than rebuilding.
- Its value is the prose-semantics contract: authored headings render at their real level (never re-leveled), lists stay real `ul`/`ol`/`li`, and link text is its own accessible name.

## What changed

- Added `components/rich-text/` — a de-cliented capture: `RichText` takes composed `children` and a `listStyle` of `default` / `checkmark`.
- Replaced a global `.rtf` stylesheet (element selectors + margin rhythm) with Tailwind descendant utilities carried by the component itself, mapped onto library semantic tokens: headings and emphasis `color-text-primary`, body `color-text-secondary`, links `color-link`, and the vertical rhythm `spacing-l` / `spacing-m` / `spacing-s` / `spacing-xs` / `spacing-2xs`.
- The `checkmark` list style recolours the marker via `::marker` rather than `list-none` + a `::before` pseudo, so the unordered list keeps its list role (`list-none` drops it in WebKit).
- Dropped as client/CMS concerns: the raw-HTML string injection (now a `children` slot; ingestion and sanitisation are the caller's), the sample copy, and the temporary inline CTA/Media mocks. Kept verbatim: the no-re-leveling heading rule, real list structure, and link-text-as-accessible-name.
- Captured from a project retrospective; provenance and the de-client record live in `component.json`.

## Files

- components/rich-text/RichText.tsx, components/rich-text/RichText.stories.tsx, components/rich-text/component.json

## Follow-ups

- Content is composed `children`; a consumer rendering a sanitised CMS HTML string can wrap it in a `dangerouslySetInnerHTML` child and the descendant styling still applies.
- The prose type sizes use Tailwind's default scale; display / heading type-scale tokens in `src/tokens/semantic.css` would let them re-theme like colours and spacing.
