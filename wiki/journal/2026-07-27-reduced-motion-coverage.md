---
date: 2026-07-27
topics: [story-testing]
plan: plans/2026-07-27-storybook-review-addons-and-reduced-motion.md
pr: pending
---
# Reduced-motion coverage

## Why

- "Every component must degrade to 0s under `prefers-reduced-motion`" is stated in `AGENTS.md` and in the token layer, and it had no coverage of any kind.
- It is the hardest sort of contract to hold: a broken reduced-motion path renders identically to a working one under the default preference. Nothing catches it, including a careful reviewer, because there is nothing to see.
- The story tests added the day before made it reachable — Playwright can emulate the real media query, so the existing stories can simply be run again under it.

## What changed

- Added `vitest.motion.config.ts`, a second config setting `contextOptions: { reducedMotion: 'reduce' }` on the Playwright provider. `pnpm test` runs it after the main suite.
- Scoped by tag rather than run over everything: only `motion`-tagged stories re-run (3 of 50). Re-running axe over every story to check durations is a poor trade.
- The tagged stories branch on `matchMedia('(prefers-reduced-motion: reduce)').matches` inside a single `play` function, asserting the opposite outcome under each preference. This avoids duplicating stories purely to hold a second set of expectations.
- Covered **both** mechanisms, because they fail independently: the token collapse (`duration-[var(--duration-base)]`, which Card and Modal rely on) and `motion-reduce:transition-none` (which Button uses).

Two configs rather than two projects in one config. Vitest supports `test.projects`, but the `storybookTest` plugin caches its generated setup under a path derived from `configDir`, so two projects sharing one race on it and **every** story file fails to import. That race was also the cause of an unexplained slowdown from ~5s to ~25-30s; splitting the configs restored it. The shared factory lives in `vitest.shared.ts`.

Proved the coverage is not vacuous: setting `--duration-base: 300ms` inside the reduced-motion block fails Card and Modal with `expected '300ms' to be '0ms'`. Button still passed, which is the argument for covering both mechanisms.

## Files

- `vitest.shared.ts`, `vitest.config.ts`, `vitest.motion.config.ts`, `package.json`
- `components/{card,modal,button}/[Name].stories.tsx` — `motion` tags and preference-aware assertions
- `AGENTS.md`, `CONTRIBUTING.md`, `README.md`

## Follow-ups

- `pnpm test` now launches Chromium twice, sequentially. Fine at this size; trivially two parallel CI jobs if the motion-tagged set grows.
