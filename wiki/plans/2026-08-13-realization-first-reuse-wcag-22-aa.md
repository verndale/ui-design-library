---
status: implemented
executed: 2026-08-13
evidence:
  - "issue #37"
  - "pnpm contracts"
  - "pnpm architecture"
  - "pnpm accessibility"
  - "pnpm test"
  - "pnpm build"
  - "pnpm verify"
  - "PR #38 https://github.com/verndale/ui-design-library/pull/38 (merged 2026-08-13)"
  - "PR #44 https://github.com/verndale/ui-design-library/pull/44 (merged 2026-08-14)"
source_tool: codex
source: approved task conversation
topics: [component-architecture, package-distribution, story-testing]
audit_note: Navigation Search was rejected as too large for the consumer probe and replaced with focused Search Banner/SearchInput coverage. Chromium and WebKit stay library-owned; AI setup declares only an exact package dependency. The post-publication rerun remains a release follow-up because this delivery does not merge or publish.
---
# Realization-First Reuse with WCAG 2.2 AA Accessibility

## Summary

Coordinate UI Design Library, AI Orchestration, and Project Retrospective so package reuse is finalized before DOM authoring while preserving accessible semantics.

The normative component target is every applicable WCAG 2.2 Level A and AA success criterion. WAI-ARIA 1.2 supplies semantics, and WAI-ARIA Authoring Practices keyboard patterns are required where applicable. WCAG 2.2 remains the conformance authority.

The library is VoiceOver-conscious through native HTML, stable accessible names, correct roles/states/relationships, Safari/WebKit regression coverage, and predictable focus/announcement behavior. It does not claim human-tested VoiceOver compatibility or whole-page WCAG conformance.

## Accessibility and Realization Contract

Keep `reuseContractVersion: 2` and add `realizationContractVersion: 1`. Each primary `component.json` gains one authoritative `realization` object containing:

- Public prop paths, types, required/default/enum values, and safe direct attributes.
- Caller-content bindings and typed `classNames` style slots.
- Exact package-owned DOM nodes, element choices, ancestry, cardinality, conditional branches, attributes, and ARIA IDREF relationships.
- Behaviors for keyboard, focus, state, announcements, motion, and screen-reader semantics.
- Accessibility metadata: `standard: "WCAG-2.2-AA"`, APG pattern or `null`, WCAG criterion IDs, governed consumer-responsibility IDs, and protected semantic/style properties.
- Existing top-level `exportName` and `rendering` remain authoritative.

Every owned accessibility behavior has a corresponding story assertion keyed by the same evidence ID. The checker validates evidence IDs, prop/node references, resolved IDREFs, safe element alternatives, and consumer responsibilities.

Generate and ship a checked `ACCESSIBILITY.md` report describing component-owned guarantees and consumer-owned responsibilities without a full-site conformance claim.

Consumer responsibilities include meaningful labels, text alternatives, heading context, accessible dynamic content, contrast-preserving token overrides, safe `classNames` usage, and complete-page assistive-technology testing.

## Component Audit

All 21 primary components receive typed `classNames` slots and safe adaptation seams while retaining backward-compatible defaults. Accordion, Alert, Avatar, Badge, Breadcrumbs, Button, Card, Carousel, Image, InPageNavigation, Link, Modal, Quote, RichText, SearchInput, SearchOverlay, SectionHeader, Slider, Stat, Tabs, and Toast preserve their native semantics, owned keyboard/focus/live-region behavior, and governed structural relationships. Any presentation or element option that cannot retain those invariants is excluded.

## AI Orchestration

Add `.runs/<slug>/reuse-decision.json` version 1. Every local, package, or create result records a stable decision ID, canonical, required fingerprint/rendering/style variant, source, and reason. Package acceptance also records exact package/module/version/export/rendering/variant/realization/digest identity, structured props and children, content/DOM/behavior/accessibility mappings, and the ownership resolution for every Build Pack accessibility requirement.

Run the reuse-decision gate before projection and reject content/name, semantic-tree, IDREF, behavior, protected-style, rendering, version, or digest incompatibility. Generate projection v2 renders the component invocation, exact realized tree, row table, and accessibility ownership. Boundary Map v6 byte-replays the accepted decision; Implement verifies installed evidence without reconsidering compatibility.

AI setup may declare the exact UI library production dependency. It does not install Chromium or WebKit in the consumer.

## Project Retrospective

Upgrade capture-preflight schema v2 to v3. Proposed library entries include `exportName`, `rendering`, realization v1, WCAG/APG metadata, owned behaviors, and consumer responsibilities. A public API, DOM, keyboard-model, or ownership change invalidates the capture until it is revised and preflight reruns.

## Automated Accessibility Gates

- Block supported WCAG 2.x A/AA axe rules; keep best-practice findings distinguishable from normative failures.
- Run every story and play function in Chromium and WebKit in library CI.
- Assert keyboard operation, focus containment/restoration/visibility, roles/names/states/values, IDREFs, live regions, inert branches, target size, non-drag alternatives, 200% text resize, 320 CSS-pixel reflow, text spacing, forced colors, reduced motion, and decorative-tree exclusion.
- Add `pnpm accessibility`, `pnpm test:a11y:webkit`, and `pnpm test:a11y:modes` to `pnpm test`.

## Delivery and Verification

1. Add WCAG 2.2 AA acceptance criteria to UI issue #37 and create coordinated AI/Retrospective issues.
2. Work from fresh `origin/main` issue-numbered branches.
3. Implement UI contracts, component adaptations, evidence stories, report, tests, and wiki history.
4. Implement Retrospective schema v3, fixtures, workflow documentation, and wiki history.
5. Implement AI decisions, projection v2, Boundary Map v6, validators, evals, setup exact dependency support, and wiki history.
6. Run the repository verification commands in all three repositories.
7. Validate against a locally packed UI artifact with fresh Mimecast worktrees for Detail Accordion, Breadcrumbs, and focused Search Banner. Repeat against the exact published version after publication.
8. Commit and push each issue branch; let automation create draft PRs. Do not manually open PRs, merge, tag, release, or publish.

## Assumptions

- WCAG 2.2 AA is the target; AAA is not required.
- Human VoiceOver testing remains a consuming-project responsibility.
- Reference fixtures may be described as tested against applicable WCAG 2.2 AA requirements, not every consuming page as conformant or certified.
- Consumer projects retain their own Playwright browsers and tests.
- Maintainer-only release actions remain excluded.
