---
date: 2026-07-27
topics: [story-testing, storybook-tooling]
plan: plans/2026-07-26-add-story-tests-and-enforce-a11y.md
pr: pending
---
# Story tests and the a11y gate

## Why

- The library had no test layer at all. `pnpm test` was `typecheck && contracts`, so "test" meant "it compiles and the slug matches".
- The captures came from a project (CN) carrying roughly 1,600 lines of Jest + Testing Library tests across eight of the nine components. None of it came over. The capture contract records what was *removed* from an implementation in `declienting`, but tests were never in its scope, so they were dropped silently rather than deliberately.
- Modal had no unit tests in the source either — only Playwright e2e at the rendering level, which does not port to a component library.
- Accessibility was the stated reason to keep a captured component, and it was advisory: axe reported in a panel and nothing failed.

## What changed

- Added `@storybook/addon-vitest` with Vitest browser mode over Chromium. `pnpm test` is now typecheck + contracts + story tests, and `a11y: { test: 'error' }` makes an axe violation fail the build.
- Ported CN's assertions into `play` functions across all nine components and wrote Modal's from scratch. Most of the source tests did not port: they assert on client token names, Figma SVG path data, variants that no longer exist, and a mocked carousel API that the de-clienting collapsed away. The behaviours ported; the assertions were rewritten.
- Fixed the Modal Docs overlay with `docs: { story: { inline: false } }`, so each story renders in its own iframe — which is where its portal then lands.

Three real defects surfaced, all recorded in the relevant `component.json` `declienting` arrays:

- **Modal's focus trap never attached when the dialog started open.** The SSR-safe `mounted` gate meant `dialogRef` was null on first render, so `useFocusTrap` ran once against a null ref and never re-ran. Initial focus still worked because it defers through `requestAnimationFrame`, so the dialog looked correct while Tab walked straight out. Trigger-opened dialogs were unaffected, which is why manual checking never caught it.
- **Quote's accent rule did not flip in RTL.** The de-clienting made the padding logical but left the border physical (`border-l`), so the rule and the text sat on opposite sides. Both the story and the `declienting` note claimed behaviour the component did not have.
- **Modal's scrolling body was pointer-only** (axe `scrollable-region-focusable`, WCAG 2.1.1).

Two corrections worth keeping:

- An earlier claim that all stories passed with a11y at `'error'` was **wrong**. `vitest.config.ts` replaces `vite.config.ts` rather than extending it, so Tailwind was not loaded and axe was judging unstyled DOM. With Tailwind wired in, two genuine violations appeared. Any computed-style or contrast assertion is meaningless without it.
- The README documented `@storybook/addon-vitest` as blocked by a Vitest 4 / `aria-query` conflict. That diagnosis was wrong — see the plan for the root cause and the one-line fix.

The Badge disabled-state `color-contrast` violation was **not** fixed. WCAG 1.4.3 exempts inactive components and the dimming is the disabled affordance, so the rule is scoped off on that one story with the reasoning inline.

## Files

- `vitest.config.ts`, `package.json` (scripts + devDeps), `.storybook/main.ts`, `.storybook/preview.ts`
- `components/*/[Name].stories.tsx` (all nine), `components/modal/Modal.tsx`, `components/quote/Quote.tsx`
- `components/{modal,quote}/component.json`, `.github/workflows/test.yml`
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md` — all three described the old blocked state

## Follow-ups

- Breadcrumbs' back link uses `--size-touch-medium` (40px) where the captured source hard-coded 44px. Still WCAG 2.5.8 AA, no longer 2.5.5 AAA. Raising the token also moves Button and Link `medium`, so it is a deliberate call rather than a fix.
- 36 of 50 stories carry assertions. The rest are smoke renders plus axe — a floor, not coverage.
