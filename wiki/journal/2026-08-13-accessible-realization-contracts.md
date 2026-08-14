---
date: 2026-08-13
topics: [component-architecture, package-distribution, story-testing]
plan: plans/2026-08-13-realization-first-reuse-wcag-22-aa.md
pr: https://github.com/verndale/ui-design-library/pull/38
follow_up_pr: pending
---
# Publish accessible realization contracts

## Why

- A fingerprint could shortlist a package component, but orchestration still had to invent the component's props, exact semantic tree, keyboard behavior, and accessibility ownership while authoring the Build Pack.
- Automated reuse needed a checked, digestible description of what the package actually owns before any consumer DOM was authored.
- Accessibility claims needed a precise boundary: applicable WCAG 2.2 A/AA behavior in reference fixtures, without claiming whole-page conformance or human VoiceOver certification.

## What changed

All 21 primary manifests now carry realization contract v1: public props, safe attributes, caller-content bindings, typed style slots, exact owned nodes and IDREF relationships, WCAG-keyed behaviors, APG metadata, protected properties, and governed consumer responsibilities. Component APIs gained constrained `classNames` seams and safe semantic options; unsafe element choices are excluded or conditionally named. Alert and Badge primary exports now expose their optional dismissal behavior without a second AI candidate.

The contract checker validates references, ancestry cycles, multi-node bindings, safe-element constraints, protected slots, relationships, and story evidence IDs. `ACCESSIBILITY.md` is generated from the manifests and checked for drift. Storybook remains the executable evidence surface: axe blocks supported WCAG 2.x A/AA rules, while deterministic play/setup assertions cover keyboard and focus behavior, IDREF resolution, live regions, inert branches, target sizing, 320px reflow, text spacing, forced colors, reduced motion, and decorative imagery.

Chromium and WebKit are installed only in this library's local/CI environment. WebKit is a Safari-engine regression proxy, not a VoiceOver certificate. Consuming applications keep their own Playwright/browser setup and remain responsible for complete-page and supported-assistive-technology testing.

## Files

- `components/*/component.json`
- `components/*/*.types.ts`
- `components/*/*.stories.tsx`
- `scripts/lib/validate-realization.cjs`
- `scripts/build-accessibility-report.cjs`
- `.storybook/a11y-modes.setup.ts`
- `ACCESSIBILITY.md`
- `.github/workflows/test.yml`

## Follow-ups

- Repeat the disposable consumer probes against the exact automatically published package version after issue #37 merges and semantic-release publishes it.
- Human VoiceOver sessions remain a consuming-project acceptance responsibility.

## Adversarial follow-up

Issue #40 tightened the same contract without adding a consuming-project artifact. Tabs now owns reciprocal tab/tabpanel relationships and panel content. Conditional, repeated, element-alternative, and accessibility-owned attribute data are explicit in manifests. Keyed Storybook evidence is AST-checked for executable assertions; modal overlays inert the background; timed Alert/Toast content carries an explicit caller responsibility; and the display-mode suite covers portals without applying overflow-remediation CSS. Normal Storybook treats the modes flag as optional, Search Overlay is supported, and the contracts gate rejects legacy Tailwind `[var(--token)]` syntax. The generated report describes the executed automated checks without treating them as WCAG or VoiceOver certification.

The post-remediation audit aligned `inert`, `disabled`, and label/control relationships with the rendered nodes and limited evidence discovery to exported story `play` functions. Search Overlay now asserts focus entry, containment, and restoration through Escape, its close button, and its backdrop; preventing the backdrop mousedown default also preserves restoration for Modal. Slider's keyboard evidence is scoped to its native bounded range and uncancelled key path, while value/announcement synchronization remains a separate assertion.

The final audit made evidence discovery control-flow aware so assertions or keyed steps after unconditional exits cannot satisfy the contract. Modal containment and restoration are separate behaviors, and the restoration evidence now closes a live dialog through Escape, the named close button, and the backdrop, verifying trigger focus after every path.

The PR CI run exposed a WebKit-only ordering race in the Modal background-inert evidence: the background became inert before the topmost focus trap finished attaching. The story now waits for initial dialog focus before challenging the inert background, then waits for focus to be redirected back into the dialog. This keeps the assertion behavioral without depending on effect scheduling.

## Package-boundary follow-up

The first Mimecast package probe treated exact consumer page DOM as a prerequisite for reuse, which incorrectly made an accessible package component lose to a local recreation when the page added a heading or landmark wrapper. Package realization now owns the complete component subtree while the consuming page may compose governed context outside that subtree. Presentation still flows through public props and typed style slots, so acceptance must satisfy the design/token/layout gates as well as the reuse gate.

SearchInput now owns a named native `search` landmark containing its form, bound label, `input type="search"`, and submit control. `ariaLabel` distinguishes multiple search landmarks, `showLabel` exposes the existing input label visually, and `name` controls the native form field name without changing the accessible-name contract. Search Overlay's composed realization replays the same search subtree. Accordion's existing reduced-motion token path is now represented by keyed realization evidence instead of remaining implicit.

Breadcrumbs exposes its existing accessible presentations through one generic `presentation` prop: responsive switching, the full ordered trail, or the nearest-ancestor back link. The default remains unchanged, and each mode keeps inactive markup out of layout and the accessibility tree.
