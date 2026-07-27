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

Accessibility findings are configured as **errors**, not notes. A11y is most of why a captured component is worth keeping.

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
pnpm test        # typecheck + contracts
pnpm typecheck   # tsc --noEmit
pnpm contracts   # slug/canonical agreement, declared tokens exist, no raw colours,
                 # provenance present, stories present
```

---

## Environment

- **Node 24+**, **pnpm 10+** via Corepack. `pnpm install`.
- React 19, Tailwind v4, Storybook 10, Vite 7.

---

## Related

- [`ui-design-brain`](https://github.com/verndale/ui-design-brain) — canonical vocabulary; this library implements it
- [`project-retrospective`](https://github.com/verndale/project-retrospective) — produces the captures
- `ui-design-evidence` — retrospective runs and the cross-project graph
