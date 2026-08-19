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

Totals: 9 implemented, 4 partial (13 plans).

## Plans

| Date | Plan | Status | Evidence | Topics |
| --- | --- | --- | --- | --- |
| 2026-08-19 | [Figma structural family contract](2026-08-19-figma-structural-family-contract.md) | implemented | working tree, Figma coverage/contract self-tests and current registry validation | variant-axis, figma-code-connect |
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
