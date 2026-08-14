---
date: 2026-08-14
topics: [component-architecture]
plan: plans/2026-08-14-breadcrumbs-direct-reuse-slots.md
pr: https://github.com/verndale/ui-design-library/pull/47
---
# Add governed Breadcrumbs leading item and ancestor titles

## Why

- Direct package reuse failed when a trail needed a decorative leading marker inside the owned ordered list and `title` on ancestor links.
- Those nodes sit inside the closed Breadcrumbs tree, so a consuming wrapper cannot insert them.
- One-off props such as `leadingEllipsis` were rejected; the public seams are a content slot and a typed safe attribute.

## What changed

- Optional `leadingItem` renders as a package-owned, `aria-hidden` list item before ancestor links.
- Optional `items[].title` forwards to package-owned ancestor anchors.
- `presentation="trail"` remains the way to keep the ordered trail without the back-link presentation.
- No public `parts/`, primitives, or Accordion/SearchInput API changes.

## Files

- `components/breadcrumbs/Breadcrumbs.tsx`
- `components/breadcrumbs/Breadcrumbs.types.ts`
- `components/breadcrumbs/Breadcrumbs.stories.tsx`
- `components/breadcrumbs/parts/BreadcrumbTrail.tsx`
- `components/breadcrumbs/parts/BreadcrumbBackLink.tsx`
- `components/breadcrumbs/component.json`

## Follow-ups

- Orchestration composed reuse for nodes *outside* the package tree is [ai-orchestration #579](https://github.com/verndale/ai-orchestration/issues/579).
