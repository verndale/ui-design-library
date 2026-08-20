---
date: 2026-08-20
topics: [variant-axis, figma-code-connect, story-testing]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: https://github.com/verndale/ui-design-library/pull/74
---
# Restore In-page navigation modal-drawer source parity

## Why

- Private decision `sp-in-page-navigation-002` accepted a portal-backed modal drawer as reusable behavior, while the normalized component kept only an inline mobile disclosure.
- The inline disclosure needed to remain the default and Figma master `204:58` needed to retain its identity.
- A modal drawer is structurally different from inline disclosure, so the existing variant-axis contract—not a presentation prop or a new canonical—owns the alternate.

## What changed

- Added `components/in-page-navigation--modal-drawer/` with the `InPageNavigationModalDrawer` export while marking the bare implementation as the `inline-disclosure` default.
- Composed the shared Modal for the SSR-safe body portal, focus containment/restoration, Escape and backdrop dismissal, background inerting, scroll lock, and overlay stack. No second overlay engine or client portal anchor was added.
- Restored strict vertical swipe boundaries: exactly 48px does nothing; more than 48px upward opens from the mobile trigger and more than 48px downward closes from a dedicated handle. The scrollable navigation list owns its own gestures.
- Kept explicit items, landmark label, active section, and icon slots. Heading scanning, sticky header offsets, CMS wiring, content portal anchors, and scroll-close orchestration remain application-owned rejections.
- Added interaction evidence for opening/dismissal, focus containment/restoration, Escape/backdrop, both 48px boundaries, scroll isolation, hidden responsive copies, reduced motion, and landmark/dialog semantics.
- Preserved Figma default `204:58` and key `97563cffd099de4915afabbcffed0ff08d75336e`. Added unpublished alternate master `318:45` with key `3e278a05ce7cbb433b08de5e0e98133c0e637af2` and direct-master specimens `321:88`, `321:116`, `321:144`, and `321:174` at 1440, 1024, 768, and 390.
- Removed In-page navigation from the temporary source-parity baseline after all four declared surfaces agreed.

## Reviews

- Source-parity review passed after confirming every accepted behavior and every explicit rejection against the pinned source decision.
- Adversarial review found a closed-state `aria-controls` reference before portal hydration and separated it from the closed tree; it also confirmed topmost overlay ownership, focus return, breakpoint cleanup, non-nested landmarks, and scroll/swipe isolation.
- Design review removed an extra active-item fill that was absent from React and shortened an overflowing specimen badge. The final master and specimens are contained, reachable on the family page, and unpublished.
- The authenticated live audit exposed a REST identity distinction that local contracts had not modeled: instances of a component-set variant report the child component ID, not the parent set ID. The validator now resolves a registered component-set master to its direct variants and still rejects unrelated instances.

## Files

- `components/in-page-navigation/`
- `components/in-page-navigation--modal-drawer/`
- `figma/library.json`
- `figma/source-parity-baseline.json`
- `scripts/check-figma-live.cjs`
- `wiki/`

## Follow-ups

- Publication and consumer-file validation remain explicit maintainer actions.
