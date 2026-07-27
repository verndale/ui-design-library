---
date: 2026-07-27
topics: [storybook-tooling]
plan: plans/2026-07-27-storybook-review-addons-and-reduced-motion.md
pr: pending
---
# Storybook review tooling

## Why

- Most of this library's behaviour lives in states a reviewer cannot hold still: the Link underline, the Card zoom, Button focus rings, the Badge dismiss hover. `:focus-visible` cannot be inspected by hand at all, because it deliberately does not match a click.
- Every component uses logical properties so it works in both writing directions, but nothing made the other direction visible. Quote had shipped with logical padding and a physical border and nobody saw it.
- `maturity` is a real contract in every `component.json`, and it was invisible unless you opened the JSON. All nine components are still `candidate`, which is exactly the sort of fact that should be hard to ignore.

## What changed

- **`storybook-addon-pseudo-states`** — forces `:hover`, `:focus-visible`, `:active` and friends from the toolbar. Verified it drives real CSS: toggling `:hover` produced `scale: 1.05` on the Card media with no pointer involved.
- **A local direction toggle** (`.storybook/withDirection.tsx`) rather than `storybook-addon-rtl`. It is about ten lines, and the repo's stated preference is a small local primitive over a dependency. It sets `dir` on `documentElement`, not a wrapper — Modal portals into `document.body`, so a wrapper would leave the component with the most to get wrong in RTL still rendering LTR.
- **`storybook-addon-tag-badges`** — renders each component's maturity in the sidebar. This introduced a second source for one fact, so `check-contracts.cjs` grew a sixth check: the story's `maturity:*` tag must equal `component.json`'s `maturity`. Verified the negative case fails.
- **Viewport and backgrounds configured, not installed** — Storybook 10 ships both in core. Viewport lists the two library breakpoints (`lg`, `xl`) alongside device presets, since Breadcrumbs collapses below `xl` and Modal goes full-screen below `lg`. Backgrounds are named for semantic tokens rather than colours.

Ruled out: `@storybook/addon-themes` (light/dark here is a per-component `surface` prop, not a global theme, so a theme switcher would misrepresent the API), `@storybook/addon-links`, `msw-storybook-addon` (no data fetching anywhere in the library).

One correction: `tagBadges` is **manager** config, read from `addons.getConfig()`. The first version put it in `preview.ts` as a parameter, where it was silently ignored and no badges rendered. It lives in `.storybook/manager.ts`.

## Files

- `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/manager.ts`, `.storybook/withDirection.tsx`
- `scripts/check-contracts.cjs`, `components/*/[Name].stories.tsx` (maturity tags), `package.json`

## Follow-ups

- The dark-surface stories still hand-roll a `bg-surface-inverse` wrapper rather than using the backgrounds global. Swapping changes what axe measures for contrast on stories that currently pass an enforced gate, so it wants its own pass.
- Chromatic would have caught both CSS defects found in the previous entry without any assertion being written, but it sends client-derived code to a hosted service. Open decision.
