# UI Design Library — agent guide

Guidance for any AI coding agent (Claude Code, Codex, Cursor, Copilot, …) working in this repository.

## What this repo is

`@verndale/ui-design-library` is the public npm component library for the frontend platform. Components are keyed by [`ui-design-brain`](https://github.com/verndale/ui-design-brain) canonical slugs so a resolved design label maps deterministically to an implementation. Consumers install one exact version and import compiled `@verndale/ui-design-library/components/<directory>` subpaths.

See [README.md](README.md) for the layout and the consumption model.

## The three contracts

Everything here exists to keep these true. `pnpm contracts` enforces them.

1. **Slug equality.** A canonical resolves to a directory by its slug: `components/<slug>/` where `slug == kebab(canonical)`, matching the catalog. When one canonical holds structurally-distinct implementations, the default keeps the bare slug and each alternate is `components/<slug>--<variant>/` — same `canonical`, same `slug`, a distinct `variant`, exactly one marked `default`. The key is `(canonical, variant)`, deterministic either way. This is the whole lookup mechanism — break it and the library stops being deterministically usable.
2. **The story file is the API contract.** Every prop declared in `argTypes` with a control and a description. A component without stories is not reusable, because nobody can see its surface.
3. **Semantic tokens only.** Components reference `bg-surface-raised`, never a hex value and never a client's brand token. A raw colour in a component fails the check. Values live in `src/tokens/semantic.css`; consuming projects override them.

Every manifest also carries `reuseFingerprint`: the AI pipeline's governed structural slots, primary affordance, and content role. It is not the existing API-level `slots` list. `pnpm contracts` rejects missing, malformed, ungoverned, or duplicate fingerprint values.

## Adding a component

Components arrive as **captures** from a `project-retrospective` run, and executing a capture is a rewrite, not a copy. What comes out:

- Imports reaching into a project's own tree (helpers, path aliases, CMS types).
- Client token names — map them onto semantic tokens.
- Client copy, asset URLs, and brand colours.
- Dependencies the library does not want. Prefer CSS and a small `src/lib/` primitive over pulling in a library; the Modal's focus trap and motion were both de-dependencied this way.

Record every removal in `component.json`'s `declienting` array. That list is the honest cost of the rewrite, and the next person reads it to estimate the one after.

New components land as `maturity: "candidate"`. Promoting to `supported` is a deliberate human decision, not a side effect of editing. After adding or removing a component, run `pnpm exports:sync`; normal test/build/prepack paths only check the committed export map and never rewrite it.

### Structural variants

Most captures are a fresh canonical or a better take on one that overwrites the candidate in place. A capture that is a *structurally different* implementation of a canonical the library already has — a mega menu alongside the plain Navigation bar — lands as a new sibling directory `components/<slug>--<variant>/`, not a rewrite of the incumbent. Its `component.json` shares the `canonical` and `slug`, adds `variant` (the structural axis, singular — distinct from the existing `variants` array of prop-value options), and omits `default`; the incumbent gains `variant` and `default: true`. `pnpm contracts` validates the axis: one `default` per canonical, unique `variant` values, the `<slug>--<variant>` directory name agreeing with the fields, and variant story titles that nest under the canonical (`<Canonical> / <label>`) so the Storybook sidebar does not collide.

## Accessibility is the point

Most of why a captured component is worth keeping is the accessibility work already in it. axe runs against every story and a violation **fails `pnpm test`** (see README, "Accessibility is enforced"). When a rule is genuinely wrong for one story, scope it off on that story with a reason — never loosen the global setting.

axe only catches what is inspectable in the markup. Focus management, keyboard operation, and `aria-labelledby`/`aria-describedby` actually resolving to real elements are not things it checks, so those belong in a `play` function. Assert the behaviour, not the class list: a component whose focus trap never attaches renders identically to one whose trap works, and both pass a snapshot.

## Motion

All motion runs through `--duration-fast` / `--duration-base` and `--ease-standard`. Those durations collapse to `0ms` under `prefers-reduced-motion`, so one switch turns motion off everywhere. Do not hard-code a duration in a component.

`pnpm test:motion` enforces this: Playwright emulates the real media query and re-runs the `motion`-tagged stories under it. A broken reduced-motion path renders identically to a working one under the default preference, so nothing else catches it. When you add motion to a component, tag its story `motion` and branch the assertion on `matchMedia('(prefers-reduced-motion: reduce)').matches` — the same play function then covers both preferences.

Note there are **two** mechanisms and they fail independently: the token collapse (`duration-[var(--duration-base)]`, which Card relies on) and `motion-reduce:transition-none` (which Button uses). Covering one does not cover the other.

## Environment

Node 24+ and pnpm 10+ via Corepack; `pnpm install`, then `pnpm exec playwright install chromium` once for the story tests. `pnpm test` runs the typecheck, contract/export checks, and story tests. `pnpm build` emits compiled ESM and declarations and verifies every public export. `pnpm storybook` browses the source stories.

## Context wiki

`wiki/` records why the repo is the way it is — executed plans, decisions, and the reasoning behind them. Start at [`wiki/INDEX.md`](wiki/INDEX.md), which routes to the one page your question needs; never load the whole wiki.

Capturing history is part of a substantive change, in the same delivery: a journal entry, the executed plan archived, and the affected topic page's Decisions updated. The protocol is [`wiki/MECHANICS.md`](wiki/MECHANICS.md).

Two things worth knowing before you read it. A pre-commit hook rebuilds the knowledge graph and warns (never blocks) when a substantive commit adds no journal entry; on merge, a bot fills in `pr:` links, drafts a stub for a substantive PR that added none, and updates the affected topic — see [`wiki/topics/graph-wiki-subsystem.md`](wiki/topics/graph-wiki-subsystem.md). It still needs `secrets.PR_BOT_TOKEN` configured in the repo to actually run. And the capture trigger includes **investigations that found nothing**, because "we already checked that" is exactly the knowledge `git log` cannot hold.

## Commits & release — the maintainer's job, not the agent's

**Permission boundary:** edit under `components/` and `src/` freely. Everything below is the maintainer's.

**Do not commit, push, merge, tag, or publish.** Make the changes, run `pnpm test` and `pnpm build`, then stop and hand back. The maintainer commits with `pnpm commit` and pushes; a merge to `main` is the only release trigger.
