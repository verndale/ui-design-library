---
status: implemented
executed: 2026-07-27
date: 2026-07-27
evidence: ["pending — maintainer commits"]
source_tool: file
source: "proposed and approved in-session (Claude Code, 2026-07-27); no plan-mode artifact on disk"
topics: [storybook-tooling, story-testing]
audit_note: "All four recommended items implemented, plus the reduced-motion project. Two deviations from the plan as written: tagBadges turned out to be manager config rather than a preview parameter, and the reduced-motion project had to be a second Vitest config rather than a second project in one config, because two projects sharing a configDir race on the storybookTest cache. A sixth contract check was added to guard the maturity duplication the badge introduced; the plan did not anticipate it. Chromatic and addon-designs were presented and deliberately not adopted."
---
# Storybook review addons and reduced-motion coverage

Verified against the installed versions before recommending. Three of these target gaps hit head-on while writing the story tests.

## What I'd actually add

**1. `storybook-addon-pseudo-states` — the best fit by a distance.** Peers `storybook@^10.5.4`, exactly the installed version.

This library is *mostly* hover/focus behaviour: Link's animated underline, Card's zoom, Button's focus ring, Badge's dismiss hover, the breadcrumb underline. Right now none of it is inspectable without physically holding the mouse still — and `:focus-visible` cannot be inspected at all, since it won't match a click. The addon toggles `:hover`, `:focus-visible`, `:active`, `:disabled` as static states from the toolbar. It would also make the a11y panel useful on focus states, which is where focus-ring contrast failures actually live.

**2. RTL toggle — build it, don't install it.** `storybook-addon-rtl@3.0.2` exists and supports SB10, but this is ~10 lines of `globalTypes` plus a decorator, and the repo's stated preference is a small local primitive over a dependency. Given the Quote RTL bug just found and that every component uses logical properties (`ps`/`pe`, `ms`/`me`, `border-s`), a `dir` switch on the toolbar turns "did the logical properties actually work" from a code review question into a glance. That bug survived capture *and* review because nobody could see it.

**3. `storybook-addon-tag-badges@3.1.0`.** `maturity: candidate | supported | deprecated` is a real contract in every `component.json`, and right now it's invisible unless you open the JSON. This renders a badge next to each component in the sidebar. All nine are `candidate`; promoting to `supported` is supposed to be a deliberate decision, and a badge is what makes "everything is still candidate" impossible to ignore.

## Already in the box — config, not installs

`viewport` and `backgrounds` are **core exports** in Storybook 10 (`storybook/viewport`, `storybook/backgrounds`) — no package to add, they just need parameters:

- **Viewport** — Breadcrumbs collapses to a back link below `xl`, and that switch is currently only checkable by dragging the window. Configuring it also allows a proper per-viewport test for the collapse.
- **Backgrounds** — `surface: light | dark` exists on Badge, Button, and Breadcrumbs, and today the dark stories each hand-roll a `bg-surface-inverse` wrapper div in `render`. A background global replaces that boilerplate and makes every story checkable on both surfaces.

## The one to add outside Storybook

A **reduced-motion test project**. `@vitest/browser-playwright` accepts `contextOptions`, which includes Playwright's `reducedMotion` — so a second Vitest project can run every story with `prefers-reduced-motion: reduce` and assert durations actually collapse to `0ms`. AGENTS.md calls the reduced-motion path a thing you must preserve, and it currently has **zero** coverage — the Card zoom test would have silently passed against a broken reduced-motion path. This is the cheapest real coverage left on the table.

## Worth a conversation, not a default

**`@chromatic-com/storybook@5.2.1`** — visual regression would have caught *both* CSS bugs found while writing the tests (the zoom that compiled to nothing, the rule on the wrong side) without anyone writing an assertion. But it's a hosted SaaS, and this is a private library whose whole point is that client-derived code stays internal. Snapshots leaving the building is a decision above an agent's pay grade.

**`@storybook/addon-designs@11.1.4`** — embeds the Figma frame in a Docs tab. Strong fit with Verndale's Figma-MCP workflow, but these components are captures from CN rather than direct Figma builds, so provenance already points at source files, not frames. Valuable for components captured *from* design going forward; low value retrofitting the current nine.

## Skipping

`@storybook/addon-themes` (light/dark is a per-component `surface` prop, not a global theme — it'd misrepresent the API), `addon-links` (nothing to link), `msw-storybook-addon` (no data fetching anywhere in this library).

## Scope

Top three plus the viewport/backgrounds config: two small deps, one local decorator, and no change to any component. The reduced-motion project is a slightly bigger piece — do it as a separate pass so the diff stays readable.
