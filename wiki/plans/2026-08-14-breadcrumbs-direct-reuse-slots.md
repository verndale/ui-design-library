---
status: implemented
executed: 2026-08-14
evidence:
  - "issue #46"
  - "pnpm test"
  - "pnpm build"
  - "PR #47 https://github.com/verndale/ui-design-library/pull/47 (merged 2026-08-14)"
source_tool: cursor
source: hybrid reuse plan, library slice
topics: [component-architecture]
audit_note: Shipped additive leadingItem slot and items[].title safeAttribute only. Did not expose primitives or change other components.
---
# Breadcrumbs direct reuse slots

Extend Breadcrumbs with two additive, governed presentation inputs so consumers can keep the complete package-owned breadcrumb realization while supplying ancestor titles and an optional leading marker.

- Add optional `title` data to breadcrumb ancestor items and forward it only to package-owned ancestor anchors.
- Add optional `leadingItem` content to Breadcrumbs.
- Keep the conditional leading `li` and its content wrapper package-owned and non-link.
- Preserve `presentation="trail"` as the existing way to omit back-link DOM.
- Update realization-v1 props, content binding, conditional DOM nodes, and safe attributes without changing reuse contract 2 or realization contract 1.
- Do not add public parts, hooks, primitives, subpaths, or changes to Accordion or other components.
