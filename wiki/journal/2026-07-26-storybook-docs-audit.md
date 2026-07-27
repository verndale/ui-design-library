---
date: 2026-07-26
topics: [storybook-tooling]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/2
---
# Storybook Docs audit

## Why

- Reported as "the Docs are empty in each component". A Docs page that renders nothing would break the second contract — the story file is the API contract, and the Docs page is how a human reads it.
- Worth recording despite shipping nothing: the conclusion was that autodocs was healthy, and re-investigating a non-defect is the expensive outcome.

## What changed

Nothing, from this investigation. It did not reproduce.

- `tags: ['autodocs']` in `.storybook/preview.ts` was already correct, and `@storybook/addon-docs` was generating a page per component. Confirmed by reading the rendered DOM rather than trusting the config: Badge's Docs page carried its description, a live preview, all eight prop rows with types and descriptions, and every story with its own doc comment.
- All nine components had a `--docs` entry in `index.json`. There was no missing-page case.
- Ruled out as causes before that: a missing `autodocs` tag, `argTypes` not reaching the prop table, and react-docgen failing to read the TypeScript types. None applied.

The real Docs defect surfaced later and was different in kind: Modal portals into `document.body` with fixed positioning, so its always-open stories painted over the whole Docs page rather than rendering inside it. That is recorded in [Story tests and the a11y gate](2026-07-27-story-tests-and-a11y-gate.md), which fixed it with `docs: { story: { inline: false } }`.

## Files

None changed.

## Follow-ups

- If "Docs are empty" is reported again, check whether the component portals. A fixed-position portal covering the page looks identical to an empty page.
