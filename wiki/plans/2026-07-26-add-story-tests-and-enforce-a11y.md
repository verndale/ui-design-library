---
status: implemented
executed: 2026-07-27
date: 2026-07-26
evidence: ["pending — maintainer commits"]
source_tool: file
source: "proposed and approved in-session (Claude Code, 2026-07-26); no plan-mode artifact on disk"
topics: [story-testing, storybook-tooling]
audit_note: "Implemented as written, in the sequenced order. Step 1's timebox found the documented blocker misdiagnosed and was resolved in one line. Step 4 additionally flipped a11y to 'error', which the plan listed as conditional on step 1 passing. Three component defects were found during step 2/3 and fixed in scope; those were not anticipated by the plan."
---
# Add story tests and enforce accessibility

## Problem

Zero test coverage came over from the captures. CN has ~1,600 lines of Jest + Testing Library tests covering 8 of the 9 captured components, and none of it was carried into the library. The capture process (`declienting` arrays in `component.json`) records what was *removed* from the implementations, but tests were never in scope — no `component.json` mentions them, `check-contracts.cjs` doesn't require them, and `pnpm test` is only `typecheck + contracts`. So "test" in this repo currently means "it compiles and the slug matches."

Root cause is a gap in the capture contract, not a bug: the three contracts are slug equality, stories, and semantic tokens. Tests aren't one of them, so they were silently dropped.

What exists in CN, per library component:

| Library component | CN source tests | Lines |
|---|---|---|
| `avatar` | `Avatar.test` + `Avatar.a11y.test` | 31 |
| `badge` | `tag/Tag.test` + `Tag.a11y.test` (badge was captured from `tag`) | 52 |
| `breadcrumbs` | `Breadcrumbs.test` + `.a11y` + `fixtures.ts` | 349 |
| `button` | `Button.test` + `.a11y` + `ButtonLink.test` | 207 |
| `card` | `Card.test` + `Card.a11y.test` | 51 |
| `carousel` | `Carousel.test` + `.a11y` + 3 helper/hook suites | 636 |
| `link` | `text-link/TextLink.test` + `.a11y` + `textLinkTouchTarget` | 249 |
| `quote` | `Quote.test` + `Quote.a11y.test` | 21 |
| `modal` | **none** — only Playwright e2e at the rendering level | 0 |

Two caveats on portability: the carousel's 549 lines of helper/hook tests target `carouselA11y.helpers`, `useCarouselArrowKeyboardFocus`, and `useCarouselArrowTabOrder` — modules the de-clienting collapsed into a single component, so those assertions have to be re-expressed through the component rather than copied. And `ButtonLink.test` is largely Sitecore `LinkField` resolution, which was deliberately removed.

## The addon question

Two layers, and they're independent:

**Storybook 10 already renders tests in the UI with no addon.** Verified `storybook/test` is a core export, `storybook/dist/instrumenter` ships in core, and the manager runtime registers an "Interactions" panel. A `play` function on a story gets a step-by-step, replayable panel today — zero new dependencies.

**`@storybook/addon-vitest`** is the popular/official one — sidebar Testing widget, run-all, watch, coverage, and it's what would let `preview.ts` move a11y from `test: 'todo'` to `'error'`. But `README.md:56` already documents an attempt that was abandoned: Vitest 4 browser mode failing to resolve CJS `aria-query`, every story erroring with `does not provide an export named 'elementRoles'`. The leftovers are still in the pnpm store but not in `package.json`.

Probed that blocker: `aria-query@5.3.2` is plain CJS, and esbuild bundles `import { elementRoles }` from it cleanly. That points at a Vite `optimizeDeps`/externalization misconfiguration rather than a hard upstream conflict — **medium confidence**; the actual browser-mode failure has not been reproduced, only shown that the bundler layer is capable.

## Files

- `components/*/[Name].stories.tsx` — nine files, gaining `play` functions
- `components/modal/Modal.stories.tsx` — plus tests written from scratch
- `src/lib/underline.ts`, `src/lib/focus.ts` — pure logic, want plain unit files
- `package.json` — `test` script, devDeps if addon-vitest goes in
- `vite.config.ts` / new `vitest.config.ts` — browser-mode config
- `.storybook/main.ts`, `.storybook/preview.ts` — addon registration, a11y `test` level
- `scripts/check-contracts.cjs` — only if tests become a 4th contract
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `components/*/component.json` — the docs currently state there is no test layer

## Assumptions

1. **Load-bearing:** the aria-query failure is config, not upstream. If wrong, the sidebar Testing widget and a11y enforcement are off the table and you get the Interactions panel only.
2. Porting means rewriting, same as the components — CN's tests assert on client tokens, Sitecore fields, and Next imports.
3. `play` functions are the right home for interaction/a11y assertions, since that's what makes them visible in Storybook. Pure-logic assertions stay in plain test files and won't appear in the UI.
4. Tests are **not** promoted to a fourth contract in this pass — that's a separate decision, since it would fail the build for every component until all nine are covered.

## What could break

- `play` functions run on every story render, including in Docs pages — a slow or flaky one degrades browsing, not just CI.
- addon-vitest pulls Playwright and a browser binary download; CI time goes up materially.
- The three `.github` workflows would need a new job or they'll keep passing while tests fail.
- Flipping a11y to `'error'` will likely fail some existing stories immediately — that's the point, but it's a real gate change.
- `pnpm test` changing meaning affects `CONTRIBUTING.md:10` and the AGENTS.md hand-back instruction.

## Smallest fix

Sequenced, so the risky part is isolated:

1. **Timebox the blocker first** (~30 min) — install addon-vitest, try `optimizeDeps.include: ['aria-query']` in the browser-mode config. Binary outcome, decides everything downstream.
2. **Port assertions into `play` functions** on the nine existing stories. No new deps, visible in the Interactions panel regardless of how step 1 goes.
3. **Write Modal tests from scratch** — focus trap on open, restore on close, Escape, scrim click, `aria-labelledby`/`describedby` resolution.
4. **If step 1 passes:** add `pnpm test:stories`, wire the sidebar widget, move a11y to `'error'`, update the three docs files and the CI workflow.
