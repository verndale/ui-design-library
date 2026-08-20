---
aliases: [story tests, play functions, addon-vitest, vitest browser mode, a11y gate, axe enforcement, reduced motion, prefers-reduced-motion, test setup]
covers: [vitest.config.ts, vitest.motion.config.ts, vitest.shared.ts, .storybook/preview.ts, .github/workflows/test.yml]
---
# Story testing — Design History

Stories are the test suite. Every story renders in a real Chromium, runs its `play` function, and has axe run over the result.

## Current state

- `pnpm test` includes contract/architecture/SSR checks plus Chromium accessibility, WebKit accessibility, accessibility modes, and reduced motion. Every invocation is a gate, not a report.
- `pnpm accessibility` and `pnpm test:a11y:webkit` run every story through `@storybook/addon-vitest` in real browser engines. WebKit is a Safari-engine regression proxy; it is not a substitute for a human VoiceOver session.
- `pnpm test:a11y:modes` applies deterministic checks for IDREF resolution, live-region shape, inert focus reachability, target size, 320px reflow/text spacing, forced-colors control/focus visibility, and decorative SVG exclusion.
- `pnpm test:motion` re-runs only `motion`-tagged stories with Playwright emulating `prefers-reduced-motion: reduce`. Those stories branch on `matchMedia` inside one `play` function so a single story asserts the correct outcome under both preferences.
- `a11y: { test: 'error' }` in `.storybook/preview.ts` makes an axe violation fail the story test. Where a rule is genuinely wrong for one story, it is scoped off **on that story** with a reason — never loosened globally. Badge's disabled state is the worked example: WCAG 1.4.3 exempts inactive components from contrast, and axe cannot tell a disabled control from low-contrast text.
- The Interactions panel is core in Storybook 10 — `play` functions get a replayable step-by-step view with no addon involved. addon-vitest adds the runner, the sidebar Testing widget, and the a11y gate on top.
- Two Vitest configs share a factory in `vitest.shared.ts`. They must be separate invocations, not two projects in one config.
- Library CI installs Chromium and WebKit with its own cache, since browsers live outside the pnpm store. Consuming repositories do not inherit this dependency; they own their own browser and assistive-technology test plans.

## Assertion rules

These exist because each one has already produced a test that passed while the behaviour was broken.

- **Assert computed style, not class names.** `group-hover:*:scale-[1.05]` and `*:group-hover:scale-[1.05]` differ by one position, and the second compiles to no CSS at all in Tailwind v4. CN's own Card test asserted the broken string and passed while the zoom did nothing.
- **Note that Tailwind v4 compiles `scale-*` to the standalone `scale` property.** `transform` stays `none` however the zoom behaves, so asserting on it passes forever.
- **Drive real interaction.** `:focus-visible` deliberately does not match `element.focus()`, so a test that calls it tests nothing. Tab instead.
- **Assert resolution, not presence.** `aria-labelledby` pointing at an id that does not exist is indistinguishable in the DOM from one that resolves.
- **Prefer the inline axis.** Asserting `borderInlineStartWidth` rather than `borderLeftWidth` stays true in both writing directions and fails when a logical property silently reverts to a physical one.

## Decisions

- 2026-08-20 — feat(ui-design-library): Enhance carousel inert behavior for better ([PR #69](https://github.com/verndale/ui-design-library/pull/69))
- 2026-08-13 — Added keyed realization evidence for Accordion's existing reduced-motion-aware transition so the published behavior and executable story assertion remain reciprocal ([journal](../journal/2026-08-13-accessible-realization-contracts.md)).
- 2026-08-13 — feat(contracts): add accessible realizations (#37) ([PR #38](https://github.com/verndale/ui-design-library/pull/38))
- 2026-08-13 — Expanded the executable evidence surface across Chromium, WebKit, forced colors, reflow/text-spacing, IDREF/live-region integrity, focus reachability, target size, and reduced motion. Kept browser installation in library CI and whole-page/VoiceOver acceptance with consumers ([plan](../plans/2026-08-13-realization-first-reuse-wcag-22-aa.md), [journal](../journal/2026-08-13-accessible-realization-contracts.md)).
- 2026-08-06 — feat(ci): Update workflows and enhance modal component ([PR #24](https://github.com/verndale/ui-design-library/pull/24))
- 2026-08-05 — chore(ci): Update documentation and workflows for npm release ([PR #19](https://github.com/verndale/ui-design-library/pull/19))
- 2026-07-27 — Covered reduced motion with a second Vitest **config**, not a second project in one config: the `storybookTest` plugin caches generated setup under a path derived from `configDir`, so two projects sharing one race on it and every story file fails to import. Scoped by `motion` tag rather than the whole suite, since re-running axe everywhere to check durations is a poor trade ([plan](../plans/2026-07-27-storybook-review-addons-and-reduced-motion.md), [journal](../journal/2026-07-27-reduced-motion-coverage.md)).
- 2026-07-27 — Covered **both** reduced-motion mechanisms separately, because they fail independently: the `--duration-*` token collapse (Card, Modal) and `motion-reduce:transition-none` (Button). Breaking the token block leaves Button passing ([journal](../journal/2026-07-27-reduced-motion-coverage.md)).
- 2026-07-27 — Made axe a gate (`test: 'error'`) rather than advisory, now that a runner exists to enforce it. Per-story rule scoping handles genuine false positives ([journal](../journal/2026-07-27-story-tests-and-a11y-gate.md)).
- 2026-07-27 — Re-declared Tailwind in the Vitest config. It replaces `vite.config.ts` rather than extending it, and without it every story renders unstyled — which silently invalidates every computed-style and contrast assertion while still reporting green. This invalidated an earlier "all stories pass with a11y enforced" claim ([journal](../journal/2026-07-27-story-tests-and-a11y-gate.md)).
- 2026-07-27 — Unblocked `@storybook/addon-vitest` by pre-bundling `storybook/test`. The README's diagnosis (a Vitest 4 / `aria-query` conflict) was wrong: it is pnpm's isolated `node_modules`, where neither `aria-query` nor `@testing-library/dom` resolves from the project root, so naming either in `optimizeDeps.include` silently does nothing. Naming the resolvable ancestor pre-bundles the whole chain ([plan](../plans/2026-07-26-add-story-tests-and-enforce-a11y.md), [journal](../journal/2026-07-27-story-tests-and-a11y-gate.md)).
- 2026-07-27 — Put interaction and a11y assertions in `play` functions rather than standalone Vitest files, so they are visible in the Storybook UI and run against real layout in a real browser ([plan](../plans/2026-07-26-add-story-tests-and-enforce-a11y.md)).
- 2026-07-27 — Did **not** promote tests to a fourth contract in `check-contracts.cjs`. It would fail the build for every component until all nine were covered, and it is a separate decision ([plan](../plans/2026-07-26-add-story-tests-and-enforce-a11y.md)).

## Open threads

- 36 of 50 stories carry assertions. The thinnest are Quote (2/4), Badge (4/6), Link (4/6), Breadcrumbs (4/7) — mostly presentational variants with little behaviour to assert, but it is not full coverage.
- No viewport-pinned test for the Breadcrumbs `xl` collapse. The current test asserts "exactly one presentation is visible", which is viewport-agnostic; pinning needs Vitest-only APIs that would break the same `play` function in the Storybook UI.
- Chromatic would catch the CSS-level regressions that no assertion anticipates, but sends client-derived code to a hosted service. Undecided.
- `pnpm test` launches Chromium twice, sequentially. Parallelisable as two CI jobs if the motion set grows.
