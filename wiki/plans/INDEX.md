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

Totals: 3 implemented, 1 partial (4 plans).

## Plans

| Date | Plan | Status | Evidence | Topics |
| --- | --- | --- | --- | --- |
| 2026-08-05 | [npm-published UI library and deterministic AI reuse](2026-08-05-npm-package-and-ai-reuse.md) | partial | [issue #18](https://github.com/verndale/ui-design-library/issues/18), working tree, [PR #19](https://github.com/verndale/ui-design-library/pull/19) | package-distribution |
| 2026-07-30 | [Native variant axis](2026-07-30-variant-axis.md) | implemented | pending, [issue #4](https://github.com/verndale/ui-design-library/issues/4), [PR #5](https://github.com/verndale/ui-design-library/pull/5) | variant-axis |
| 2026-07-27 | [Storybook review addons and reduced-motion coverage](2026-07-27-storybook-review-addons-and-reduced-motion.md) | implemented | pending, [PR #2](https://github.com/verndale/ui-design-library/pull/2) | storybook-tooling, story-testing |
| 2026-07-26 | [Add story tests and enforce accessibility](2026-07-26-add-story-tests-and-enforce-a11y.md) | implemented | pending, [PR #2](https://github.com/verndale/ui-design-library/pull/2) | story-testing, storybook-tooling |

## A note on provenance

The two 2026-07-26/-27 plans carry `source_tool: file` rather than `claude`. They were structured proposals made and approved in a working session, not plan-mode artifacts, so there is no file in a Claude plan store to point at. The 2026-07-30 variant-axis plan is different: it carries `source_tool: claude` and a `source` pointing at the plan-mode artifact it was approved from. Every body is the plan as it was put and agreed, with an `audit_note` recording where the delivered work diverged.

Evidence is `pending` on all three because the maintainer commits, not the agent. Nothing back-fills it — see [MECHANICS.md](../MECHANICS.md), "No automation".
