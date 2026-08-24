# Plan Audit

Every agent plan executed for this repo, with whether it actually shipped. Implemented and partial plans are archived here (linked); not-implemented, superseded, and out-of-scope plans are listed for the record.

## Contents

- Status legend
- Plans
- A note on provenance

## Status legend

- **implemented** — substantially shipped (deltas noted in the archived file's `audit_note`).
- **partial** — a subset shipped; the rest never landed.
- **superseded** — replaced by a later plan before shipping as written.
- **not-implemented** — nothing shipped; may still be actionable.
- **out-of-scope** — targets another repo/product.

Totals: 15 implemented, 5 partial (20 plans).

## Plans

| Date | Plan | Status | Evidence | Topics |
| --- | --- | --- | --- | --- |
| 2026-08-24 | [Deterministic, Route-First Wiki Guidance and PR 127 Recovery](2026-08-24-deterministic-route-first-wiki-guidance.md) | implemented | canonical headless `AGENTS.md` block installed with zero-drift dry run | graph-wiki-subsystem |
| 2026-08-23 | [Wiki parity, GitHub evidence, and CI workflow standard](2026-08-23-wiki-parity-and-github-evidence.md) | implemented | [issue #87](https://github.com/verndale/ui-design-library/issues/87), working tree, focused and full verification, PR pending, [verndale/ui-design-library PR #88](https://github.com/verndale/ui-design-library/pull/88) | graph-wiki-subsystem |
| 2026-08-22 | [Cross-repository lint, Commitlint, and graph standardization](2026-08-22-cross-repository-lint-commitlint-and-graph-standardization.md) | implemented | [issue #83](https://github.com/verndale/ui-design-library/issues/83), isolated issue worktree, lint/push/CI/graph/Graphify verification | graph-wiki-subsystem, component-architecture, story-testing, package-distribution |
| 2026-08-22 | [Rich Text authored-content coverage](2026-08-22-rich-text-authored-content-coverage.md) | implemented | [issue #80](https://github.com/verndale/ui-design-library/issues/80), Rich Text master `173:62`, authored-content section `417:26`, Storybook/code/Figma validation, [PR #81](https://github.com/verndale/ui-design-library/pull/81) | figma-code-connect, story-testing |
| 2026-08-21 | [Governed Figma Interaction States and Retrospective Capture](2026-08-21-governed-figma-interaction-states-and-retrospective-capture.md) | implemented | [issue #80](https://github.com/verndale/ui-design-library/issues/80), live state frames/screenshots, contract/browser/build verification, authenticated live audit of 28 registered nodes, [PR #81](https://github.com/verndale/ui-design-library/pull/81) | figma-code-connect, story-testing |
| 2026-08-19 | [Official source-parity audit and remediation](2026-08-19-source-parity-audit-and-remediation.md) | partial | [issue #58](https://github.com/verndale/ui-design-library/issues/58), [issue #62](https://github.com/verndale/ui-design-library/issues/62), 21-component private audit, Carousel worktree/Figma remediation including governed Card composition section `293:218`, Button issue #59 with icon-only Figma sets `307:2` and `308:2`, In-page navigation issue #63 with modal-drawer master `318:45` and responsive specimens, Slider issue #60 with nonvisual Name metadata on preserved master `178:76`, Tabs issue #61 with preserved master `181:70`, native-select master `334:120`, and responsive specimens; private completion events remain after landing, [PR #64](https://github.com/verndale/ui-design-library/pull/64), [PR #69](https://github.com/verndale/ui-design-library/pull/69), [PR #72](https://github.com/verndale/ui-design-library/pull/72), [PR #74](https://github.com/verndale/ui-design-library/pull/74), [PR #76](https://github.com/verndale/ui-design-library/pull/76), [PR #78](https://github.com/verndale/ui-design-library/pull/78) | component-architecture, figma-code-connect, story-testing, variant-axis |
| 2026-08-19 | [Card media-presence composition specimens](2026-08-19-card-media-composition-specimens.md) | implemented | [issue #55](https://github.com/verndale/ui-design-library/issues/55), Figma section `261:72`, working branch, Figma adversarial/design review, [PR #56](https://github.com/verndale/ui-design-library/pull/56) | figma-code-connect |
| 2026-08-19 | [Figma structural family contract](2026-08-19-figma-structural-family-contract.md) | implemented | working tree, Figma coverage/contract self-tests and current registry validation, [PR #52](https://github.com/verndale/ui-design-library/pull/52) | variant-axis, figma-code-connect |
| 2026-08-18 | [Governed code-to-Figma capture workflow](2026-08-18-governed-code-to-figma-capture.md) | implemented | project-retrospective issue #69, `pnpm figma:validate`, coverage/contract self-tests, [PR #50](https://github.com/verndale/ui-design-library/pull/50) | figma-code-connect |
| 2026-08-18 | [Figma adversarial and design-review remediation](2026-08-18-figma-adversarial-remediation.md) | implemented | live Figma adversarial and visual audit, live-audit fixture self-tests, `pnpm figma:validate`, [PR #50](https://github.com/verndale/ui-design-library/pull/50) | figma-code-connect |
| 2026-08-18 | [Remaining supported Figma library and Code Connect batch](2026-08-18-figma-supported-batch.md) | partial | sixteen additional Ready for Dev nodes, 23 registered nodes, `pnpm figma:validate`; publication and consumer smoke test pending maintainer, [PR #50](https://github.com/verndale/ui-design-library/pull/50) | figma-code-connect |
| 2026-08-18 | [Organization-tier Figma Library and Code Connect Pilot](2026-08-18-figma-code-connect-pilot.md) | partial | [issue #49](https://github.com/verndale/ui-design-library/issues/49), seven stable Figma nodes, `pnpm figma:validate`, `pnpm contracts`, `pnpm test`, `pnpm build`; publication and consumer smoke test pending maintainer, [PR #50](https://github.com/verndale/ui-design-library/pull/50) | figma-code-connect |
| 2026-08-14 | [Breadcrumbs direct reuse slots](2026-08-14-breadcrumbs-direct-reuse-slots.md) | implemented | [issue #46](https://github.com/verndale/ui-design-library/issues/46), `pnpm test`, `pnpm build`, [PR #47](https://github.com/verndale/ui-design-library/pull/47) | component-architecture |
| 2026-08-13 | [Realization-First Reuse with WCAG 2.2 AA Accessibility](2026-08-13-realization-first-reuse-wcag-22-aa.md) | implemented | [issue #37](https://github.com/verndale/ui-design-library/issues/37), `pnpm test`, `pnpm verify`, [PR #38](https://github.com/verndale/ui-design-library/pull/38), [PR #44](https://github.com/verndale/ui-design-library/pull/44) | component-architecture, package-distribution, story-testing |
| 2026-08-12 | [Coordinated UI Library Contract v2 and AI Reuse Hardening](2026-08-12-executable-esm-reuse-contract-v2.md) | partial | [issue #31](https://github.com/verndale/ui-design-library/issues/31), `pnpm verify`, 21 packed native ESM imports, packed Next 16/Tailwind consumer, [PR #32](https://github.com/verndale/ui-design-library/pull/32), [PR #35](https://github.com/verndale/ui-design-library/pull/35) | package-distribution, component-architecture |
| 2026-08-12 | [Server-first component architecture and full library migration](2026-08-12-server-first-component-architecture.md) | implemented | [issue #26](https://github.com/verndale/ui-design-library/issues/26), working tree, [PR #29](https://github.com/verndale/ui-design-library/pull/29) | component-architecture, package-distribution |
| 2026-08-05 | [npm-published UI library and deterministic AI reuse](2026-08-05-npm-package-and-ai-reuse.md) | partial | [issue #18](https://github.com/verndale/ui-design-library/issues/18), working tree, [PR #19](https://github.com/verndale/ui-design-library/pull/19) | package-distribution |
| 2026-07-30 | [Native variant axis](2026-07-30-variant-axis.md) | implemented | pending, [issue #4](https://github.com/verndale/ui-design-library/issues/4), [PR #5](https://github.com/verndale/ui-design-library/pull/5) | variant-axis |
| 2026-07-27 | [Storybook review addons and reduced-motion coverage](2026-07-27-storybook-review-addons-and-reduced-motion.md) | implemented | pending, [PR #2](https://github.com/verndale/ui-design-library/pull/2) | storybook-tooling, story-testing |
| 2026-07-26 | [Add story tests and enforce accessibility](2026-07-26-add-story-tests-and-enforce-a11y.md) | implemented | pending, [PR #2](https://github.com/verndale/ui-design-library/pull/2) | story-testing, storybook-tooling |

## A note on provenance

The two 2026-07-26/-27 plans carry `source_tool: file` rather than `claude`. They were structured proposals made and approved in a working session, not plan-mode artifacts, so there is no file in a Claude plan store to point at. The 2026-07-30 variant-axis plan carries `source_tool: claude` and points at its plan-mode artifact; the 2026-08-12 architecture plan carries `source_tool: codex` and points at the task where it was approved. Every body is the plan as it was put and agreed, with an `audit_note` recording where the delivered work diverged.

Commit and PR evidence stays pending until the maintainer delivers the working tree. The wiki-sync workflow can back-fill journal PR links once its repository token is configured; see [MECHANICS.md](../MECHANICS.md), "Automation".
