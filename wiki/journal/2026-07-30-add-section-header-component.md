---
date: 2026-07-30
topics: []
plan: none
pr: pending
---
# Add the Section header component

## Why

- A section-intro block — an optional eyebrow above an `<h2>`, with optional supporting copy — was promoted into the ui-design-brain catalog as **Section header**, and a mature client implementation with a full Storybook story already existed, worth banking rather than rebuilding.
- Its core is an accessibility contract, not styling: the heading is an `<h2>` (a section header repeats down a page and never owns the single `<h1>`), the eyebrow is a `<p>` that adds no outline level, and each optional part collapses when omitted. That is the part worth keeping.

## What changed

- Added `components/section-header/` — a de-cliented capture: `SectionHeader` with `eyebrow?` / `heading` / `description?` slots and a `left` / `center` alignment applied to the group as a unit.
- Ported from a Handlebars template + BEM classes to a React component on Tailwind utilities; the alignment modifier became an `alignment` prop. Mapped onto library semantic tokens: heading `color-text-primary`, eyebrow and description `color-text-secondary`, inline description links `color-link`, the eyebrow→heading gap `spacing-m`, the heading→description gap `spacing-l`.
- Dropped as client/CMS concerns: the raw-HTML description container (now composed `ReactNode`) and the sample copy. Kept verbatim: the `<h2>`-heading / `<p>`-eyebrow semantics, group alignment, and collapse-when-empty — the reason it was worth capturing.
- Captured from a project retrospective; provenance and the full de-client record live in `component.json`.

## Files

- components/section-header/SectionHeader.tsx, components/section-header/SectionHeader.stories.tsx, components/section-header/component.json

## Follow-ups

- The heading and eyebrow type sizes use Tailwind's default scale — no display type-scale token exists in `src/tokens/semantic.css`; a `--text-*` token would let them re-theme like colours and spacing.
- The description takes composed content and styles only inline links; a caller rendering long-form authored HTML there can compose the **Rich text** component instead.
