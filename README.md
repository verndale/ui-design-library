# ui-design-library

Public npm component library for Verndale's frontend platform. Components are keyed by [`ui-design-brain`](https://github.com/verndale/ui-design-brain) canonical slugs, so a resolved design label maps straight to an implementation.

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
components/<slug>/                    a canonical's default implementation
├── <Component>.tsx                   the implementation
├── <Component>.stories.tsx           the API contract — see below
└── component.json                    canonical, API slots, reuse fingerprint, variants,
                                      tokens, provenance

components/<slug>--<variant>/         a structurally-distinct implementation of the same
                                      canonical (optional) — same three files

src/tokens/                           the semantic token layer (the styling contract)
src/lib/                              shared, dependency-free primitives (focus, scroll)
```

A canonical resolves to a directory. In the common case that is one implementation — `components/<slug>/`, `<slug> == kebab(canonical)`, matching the catalog. When a canonical needs more than one *structurally* distinct implementation (a plain nav bar and a mega menu, both **Navigation**), the default stays the bare `components/<slug>/` and each alternate is a sibling `components/<slug>--<variant>/`. Both carry `slug == kebab(canonical)`; `variant` (singular — the structural axis, not the prop-value `variants` array) distinguishes them, and one is the `default`. The key is `(canonical, variant)`. Single-variant components need neither field. `pnpm contracts` enforces all of it.

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

Install one exact version. The exact dependency is the orchestration pipeline's package-reuse opt-in; ranges, tags, aliases, workspace links, and `file:` dependencies are deliberately not accepted.

```bash
pnpm add --save-exact @verndale/ui-design-library@1.0.0
```

Import Tailwind, the library's semantic layer, and one explicit source path in the application's global stylesheet. `@source` paths are relative to the stylesheet containing the directive, so adjust the example's `../` segments for the consuming project.

```css
@import 'tailwindcss';
@import '@verndale/ui-design-library/styles.css';
@source '../../../node_modules/@verndale/ui-design-library/dist';
```

```tsx
import { Modal } from '@verndale/ui-design-library/components/modal';
```

A structural variant lives in its own directory; both satisfy the same catalog canonical — import the structure the design resolved to:

```tsx
import { Navigation } from '@verndale/ui-design-library/components/navigation';
import { MegaMenu } from '@verndale/ui-design-library/components/navigation--mega-menu';
```

There is no root barrel and no short alias such as `@verndale/ui-design-library/modal`. The directory-shaped subpath is the public identity. Override semantic tokens in the consuming project's own layer; never edit the installed package.

The package includes each implementation's source, story, and `component.json` for deterministic orchestration inspection. `reuseFingerprint` is separate from API-level `slots`: it uses the pipeline's governed structural `slots` + `affordance` + `role` triad. `variant` remains the singular structural implementation axis, while `variants` remains the list of prop/style values.

## Releases

Every merge to `main` runs the full test/build/pack gate and semantic-release. A breaking change publishes a major, `feat` publishes a minor, and every other permitted conventional-commit type publishes a patch. Tags and GitHub releases use `v<version>`; the source `package.json` stays `0.0.0-development`.

The initial `1.0.0` publish uses the repository's `NPM_TOKEN`. After that bootstrap, configure npm trusted publishing for `.github/workflows/release.yml` and remove the long-lived token; subsequent merges publish through GitHub OIDC without a manual command.

---

## How a component gets here

1. A [`project-retrospective`](https://github.com/verndale/project-retrospective) run produces a **capture** — a mature implementation, its evidence, and an exhaustive list of the client coupling that has to come out.
2. A human executes the capture: rewrites the component against the library's tokens and primitives, writes the stories, fills in `component.json`.
3. It lands as `maturity: "candidate"`. Promotion to `supported` is a separate, deliberate decision.

Captures usually come from labels that **already resolve** — a mature Card or Modal — not novel ones. Novel labels are typically the least settled code in a project.

Step 2 is a rewrite, not a copy. `component.json`'s `declienting` array records exactly what was stripped, so the cost is visible rather than folklore.

A capture that is a *structurally distinct* take on a canonical the library already ships — a mega menu where **Navigation** ships a plain bar — lands as a new `components/<slug>--<variant>/` directory rather than overwriting the incumbent. Its `component.json` shares the `canonical` and `slug` and sets `variant`; the incumbent gains `variant` and `default: true`. This is the one case where a second capture of the same canonical does not replace the first.

---

## Quality gates

```bash
pnpm test              # typecheck + contracts + contract self-test + story tests + reduced-motion tests
pnpm typecheck         # tsc --noEmit
pnpm build             # deterministic ESM + declaration build, then export/dist parity
pnpm exports:check     # component directories and committed package exports agree
pnpm exports:sync      # deliberately update the committed map after adding/removing a component
pnpm contracts         # slug/canonical agreement, the variant axis, declared tokens exist,
                       # no raw colours, provenance/stories/maturity, reuse fingerprint
pnpm contracts:selftest # exercises the contract checker itself against fixtures
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

Modelled on [`ui-design-brain`](https://github.com/verndale/ui-design-brain)'s wiki, including its knowledge graph (`pnpm graph:build` / `pnpm graph:view`, [`scripts/graph/README.md`](scripts/graph/README.md)) and wiki-sync bot automation, adapted to this repo's shape. What's still different is listed at the bottom of `INDEX.md`.

## Related

- [`ui-design-brain`](https://github.com/verndale/ui-design-brain) — canonical vocabulary; this library implements it
- [`project-retrospective`](https://github.com/verndale/project-retrospective) — produces the captures
- `ui-design-evidence` — retrospective runs and the cross-project graph
