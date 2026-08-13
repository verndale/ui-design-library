---
aliases: [storybook config, autodocs, docs page, pseudo states, focus-visible toggle, direction toggle, RTL, maturity badge, tag badges, viewport, backgrounds, toolbar]
covers: [.storybook/main.ts, .storybook/preview.ts, .storybook/manager.ts, .storybook/withDirection.tsx, scripts/check-contracts.cjs]
---
# Storybook tooling — Design History

The browsing and review surface: what a person sees when they open a component, and the toolbar controls that expose states they cannot reach by hand.

## Current state

- **Autodocs** — `tags: ['autodocs']` in `preview.ts` generates a Docs page per component from `argTypes` and the TypeScript types. Without that tag `@storybook/addon-docs` is installed and produces nothing, so leave it on.
- **Pseudo-states** (`storybook-addon-pseudo-states`) — forces `:hover`, `:focus-visible`, `:active` and friends from the toolbar. This is the only way to inspect `:focus-visible`, which deliberately does not match a click. It also makes the a11y panel usable on focus states, where focus-ring contrast problems actually live.
- **Direction toggle** — a local decorator (`.storybook/withDirection.tsx`), not a dependency. Sets `dir` on `documentElement` rather than on a wrapper, because Modal portals into `document.body`. A story that sets its own `dir` still wins for its subtree.
- **Maturity badges** (`storybook-addon-tag-badges`) — renders each component's `maturity` in the sidebar and toolbar. Configured in `.storybook/manager.ts`, **not** `preview.ts`: the addon reads `addons.getConfig()`, so a preview parameter is silently ignored and no badges render.
- **Viewport and backgrounds** — configured, not installed; Storybook 10 ships both as core exports. Viewport lists the library breakpoints (`lg`, `xl`) beside the device presets. Backgrounds are named for semantic tokens, so a project overriding a token sees the override.
- **Modal's Docs page** uses `docs: { story: { inline: false } }`. Its always-open stories portal a fixed-position overlay into `document.body`; inline, they paint over the whole Docs page.

## The maturity duplication

`maturity` is declared in `component.json` and mirrored as a `maturity:*` tag on the story meta, because the badge addon reads tags and cannot see the JSON. Two sources for one fact drift silently, so `check-contracts.cjs` grew a sixth check: the tag must equal the declared maturity, or `pnpm contracts` fails.

All nine components are `candidate`. Promotion is a deliberate human decision, not a side effect of editing — the badge exists to keep that visible.

## Decisions

- 2026-08-13 — feat(contracts): add accessible realizations (#37) ([PR #38](https://github.com/verndale/ui-design-library/pull/38))
- 2026-08-13 — feat(package): publish executable ESM reuse contract v2 ([PR #32](https://github.com/verndale/ui-design-library/pull/32))
- 2026-08-05 — chore(ci): Update documentation and workflows for npm release ([PR #19](https://github.com/verndale/ui-design-library/pull/19))
- 2026-07-31 — feat(ui-design-library): Enhance documentation on structural variants ([PR #5](https://github.com/verndale/ui-design-library/pull/5))
- 2026-07-27 — Added a sixth contract check rather than accepting drift between `component.json` and the story tag. The duplication was introduced by the badge; guarding it was the cost of the badge ([journal](../journal/2026-07-27-storybook-review-tooling.md)).
- 2026-07-27 — Built the direction toggle locally instead of adding `storybook-addon-rtl`. Ten lines against a dependency, matching the repo's preference for a small local primitive ([plan](../plans/2026-07-27-storybook-review-addons-and-reduced-motion.md), [journal](../journal/2026-07-27-storybook-review-tooling.md)).
- 2026-07-27 — Ruled out `@storybook/addon-themes`: light/dark here is a per-component `surface` prop, not a global theme, so a theme switcher would misrepresent the API. Also ruled out `addon-links` and `msw-storybook-addon` ([plan](../plans/2026-07-27-storybook-review-addons-and-reduced-motion.md)).
- 2026-07-27 — Deferred `@storybook/addon-designs`. Strong fit with the Figma workflow, but the current nine were captured from source files rather than frames, so provenance already points somewhere better. Revisit for components captured from design ([plan](../plans/2026-07-27-storybook-review-addons-and-reduced-motion.md)).
- 2026-07-27 — Fixed the Modal Docs overlay with per-story iframes rather than making the always-open stories trigger-based. Keeping them open is what documents the component; the portal is what needed containing ([journal](../journal/2026-07-27-story-tests-and-a11y-gate.md)).
- 2026-07-26 — Confirmed autodocs was healthy when "the Docs are empty" was reported. Not reproduced; kept as a record so it is not re-investigated ([journal](../journal/2026-07-26-storybook-docs-audit.md)).

## Open threads

- The dark-surface stories still hand-roll a `bg-surface-inverse` wrapper instead of using the backgrounds global. Swapping changes what axe measures for contrast on stories that currently pass an enforced gate, so it needs its own pass with the a11y result checked per story.
- Breadcrumbs' back link uses `--size-touch-medium` (40px) where the captured source hard-coded 44px. WCAG 2.5.8 AA yes, 2.5.5 AAA no. Raising the token also moves Button and Link `medium`.
