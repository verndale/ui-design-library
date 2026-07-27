# ui-design-library

Private component library for Verndale's frontend platform. Components are keyed by [`ui-design-brain`](https://github.com/verndale/ui-design-brain) canonical slugs, so a resolved design label maps straight to an implementation.

The catalog says what a **Modal** is. This repo is the Modal.

---

## Why it exists

Every project rebuilds the same dialog. Not because anyone wants to, but because the previous project's version is buried in a client repo, wired to that client's CMS and tokens, and nobody can tell from outside whether it was any good.

This library is where a component goes once it has earned reuse. Its contract is the catalog's vocabulary:

```
ui-design-brain     resolves "dialog" → canonical Modal (slug: modal)
ui-design-library   components/modal/ → the implementation
```

That is the whole mechanism. Because both sides key on the same slug, a build pipeline that has resolved a label can look up an implementation deterministically instead of generating one from scratch.

---

## Layout

```
components/<slug>/
├── <Component>.tsx          the implementation
├── <Component>.stories.tsx  the API contract — see below
└── component.json           canonical, slots, variants, tokens, provenance

src/tokens/                  the semantic token layer (the styling contract)
src/lib/                     shared, dependency-free primitives (focus, scroll)
```

`<slug>` is always `kebab(canonical)`, matching the catalog. `pnpm contracts` enforces it.

---

## The story file is the API contract

Not documentation — the contract. `argTypes` declares every prop with its control and description, so both a developer browsing Storybook and an agent reading the file get the same surface. A component without stories fails `pnpm contracts`, because an implementation nobody can inspect is not reusable.

```bash
pnpm storybook          # browse at http://localhost:6006
pnpm build-storybook    # static build
```

The addons that carry real weight:

- **[`@storybook/addon-docs`](https://storybook.js.org/addons/@storybook/addon-docs)** — `tags: ['autodocs']` in `.storybook/preview.ts` generates a Docs page per component: the description, a live preview, and a prop table built from the TypeScript types and `argTypes`. Without that tag the addon is installed and produces nothing, so leave it on.
- **[`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y)** — runs axe against every rendered story and reports violations, passes, and inconclusive results in the Accessibility panel. Accessibility is most of why a captured component is worth keeping.
- **[`@storybook/addon-vitest`](https://storybook.js.org/addons/@storybook/addon-vitest)** — runs every story as a test in a real Chromium and reports in the sidebar Testing widget. It is also what makes the a11y check a gate rather than a suggestion.
- **[`storybook-addon-pseudo-states`](https://storybook.js.org/addons/storybook-addon-pseudo-states)** — forces `:hover`, `:focus-visible`, `:active` and friends as static states from the toolbar. Most of this library's behaviour lives in those states, and `:focus-visible` cannot be inspected by hand at all: it deliberately does not match a click. It also makes the a11y panel usable on focus states, which is where focus-ring contrast problems actually are.
- **[`storybook-addon-tag-badges`](https://storybook.js.org/addons/storybook-addon-tag-badges)** — renders each component's `maturity` in the sidebar. Configured in `.storybook/manager.ts`, not `preview.ts` — the addon reads `addons.getConfig()`, so a preview parameter is silently ignored.

Two toolbar controls are configured rather than installed, since Storybook 10 ships both in core:

- **Viewport** — includes the two library breakpoints (`lg`, `xl`) alongside the device presets. Breadcrumbs collapses below `xl` and Modal goes full-screen below `lg`; both are otherwise only checkable by dragging the window.
- **Backgrounds** — named for the semantic tokens (`surface-base`, `surface-inverse`, …) rather than colours, so a project overriding a token sees the override here too.

## The direction toggle

Every component uses logical properties (`ps`/`pe`, `ms`/`me`, `border-s`) so it works in both writing directions. That only holds if somebody can see the other direction — an incomplete conversion reads as perfectly correct in LTR. The **Direction** toolbar control flips the preview.

It is a local decorator (`.storybook/withDirection.tsx`), not a dependency, and it sets `dir` on `documentElement` rather than on a wrapper: Modal renders through a portal into `document.body`, so a wrapper would leave the component with the most to get wrong in RTL still rendering LTR.

This is not theoretical. Quote shipped with logical padding and a *physical* `border-l`, so in RTL the accent rule and the text sat on opposite sides.

## Accessibility is enforced

`preview.ts` sets `a11y: { test: 'error' }`, so an axe violation **fails the story test**. That is backed by a real runner: `pnpm test:stories` renders every story in Chromium, runs its `play` function, and runs axe over the result.

Not every axe finding is a real defect. Where a rule is wrong for a specific story — a disabled control tripping `color-contrast`, which WCAG 1.4.3 explicitly exempts — scope the rule off **on that story** with a comment saying why, rather than loosening the global setting:

```ts
parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } }
```

### The pnpm/aria-query workaround

Wiring this up was previously abandoned as blocked: Vitest browser mode served the CJS `aria-query` raw and every story failed with `does not provide an export named 'elementRoles'`. The cause is pnpm's isolated `node_modules` — neither `aria-query` nor `@testing-library/dom` resolves from the project root, so naming either in `optimizeDeps.include` silently does nothing. Pre-bundling the resolvable ancestor works:

```ts
optimizeDeps: { include: ['storybook/test'] }
```

`vitest.config.ts` also re-declares the Tailwind plugin. It replaces `vite.config.ts` for the test run rather than extending it, and without Tailwind every story renders unstyled — which quietly invalidates any computed-style or contrast assertion while still reporting green.

---

## Tokens are the portability contract

Components reference **only** semantic tokens — `bg-surface-raised`, `text-text-primary`, `px-page-margin`. Never a hex value, never a client's brand name. `pnpm contracts` fails on a raw colour in a component.

A consuming project re-themes the library by overriding the custom properties in [`src/tokens/semantic.css`](src/tokens/semantic.css) with its own values. It never edits a component. That is what makes the same Modal render in one client's palette and another's without a line changing.

The defaults here are deliberately unbranded. A component shipping a client's red is that client's component, not a library one.

---

## Consuming it

As a git submodule, imported from source — the same model projects already use for `ai-orchestration`. There is no build step and no package to publish; the consuming app compiles the TSX it imports.

```bash
git submodule add git@github.com:verndale/ui-design-library.git ui-design-library
```

Then import the token layer once, and components where you need them:

```css
/* app styles, after your own Tailwind import */
@import '../ui-design-library/src/tokens/index.css';
```

```tsx
import { Modal } from '../../ui-design-library/components/modal/Modal';
```

Override any semantic token in your own layer to re-theme. Pin the submodule to a commit and bump it deliberately, the way you already do for the pipeline.

---

## How a component gets here

1. A [`project-retrospective`](https://github.com/verndale/project-retrospective) run produces a **capture** — a mature implementation, its evidence, and an exhaustive list of the client coupling that has to come out.
2. A human executes the capture: rewrites the component against the library's tokens and primitives, writes the stories, fills in `component.json`.
3. It lands as `maturity: "candidate"`. Promotion to `supported` is a separate, deliberate decision.

Captures usually come from labels that **already resolve** — a mature Card or Modal — not novel ones. Novel labels are typically the least settled code in a project.

Step 2 is a rewrite, not a copy. `component.json`'s `declienting` array records exactly what was stripped, so the cost is visible rather than folklore.

---

## Quality gates

```bash
pnpm test              # typecheck + contracts + story tests + reduced-motion tests
pnpm typecheck         # tsc --noEmit
pnpm contracts         # slug/canonical agreement, declared tokens exist, no raw colours,
                       # provenance present, stories present, maturity tag matches
pnpm test:stories      # every story rendered in Chromium: play functions + axe
pnpm test:stories:watch # the same, in watch mode
pnpm test:motion       # `motion`-tagged stories re-run under prefers-reduced-motion
```

`pnpm test:stories` needs a browser binary. Once per machine:

```bash
pnpm exec playwright install chromium
```

---

## Environment

- **Node 24+**, **pnpm 10+** via Corepack. `pnpm install`.
- React 19, Tailwind v4, Storybook 10, Vite 7.

---

## Context wiki

[`wiki/`](wiki/) records why the repo is the way it is: executed plans, the decisions behind them, and what was ruled out. Start at [`wiki/INDEX.md`](wiki/INDEX.md) and open only the page it routes to.

```
wiki/
├── INDEX.md          # read this first — routes to everything else
├── MECHANICS.md      # the capture protocol
├── topics/           # per-subsystem design history
├── journal/          # one entry per substantive change
└── plans/            # executed plans + an audit table
```

Modelled on [`ui-design-brain`](https://github.com/verndale/ui-design-brain)'s wiki, minus its knowledge graph, generated `connections/` pages, and `scripts/wiki/` automation — this repo has none of that tooling, so capture is manual. The differences are listed at the bottom of `INDEX.md`.

## Related

- [`ui-design-brain`](https://github.com/verndale/ui-design-brain) — canonical vocabulary; this library implements it
- [`project-retrospective`](https://github.com/verndale/project-retrospective) — produces the captures
- `ui-design-evidence` — retrospective runs and the cross-project graph
