# UI Design Library — agent guide

Guidance for any AI coding agent (Claude Code, Codex, Cursor, Copilot, …) working in this repository.

## What this repo is

`@verndale/ui-design-library` is the private component library for the frontend platform. Components are keyed by [`ui-design-brain`](https://github.com/verndale/ui-design-brain) canonical slugs so a resolved design label maps deterministically to an implementation. Consumed as a git submodule and imported from source — there is no build step and nothing is published.

See [README.md](README.md) for the layout and the consumption model.

## The three contracts

Everything here exists to keep these true. `pnpm contracts` enforces them.

1. **Slug equality.** `components/<slug>/` where `slug == kebab(canonical)`, matching the catalog. This is the whole lookup mechanism — break it and the library stops being deterministically usable.
2. **The story file is the API contract.** Every prop declared in `argTypes` with a control and a description. A component without stories is not reusable, because nobody can see its surface.
3. **Semantic tokens only.** Components reference `bg-surface-raised`, never a hex value and never a client's brand token. A raw colour in a component fails the check. Values live in `src/tokens/semantic.css`; consuming projects override them.

## Adding a component

Components arrive as **captures** from a `project-retrospective` run, and executing a capture is a rewrite, not a copy. What comes out:

- Imports reaching into a project's own tree (helpers, path aliases, CMS types).
- Client token names — map them onto semantic tokens.
- Client copy, asset URLs, and brand colours.
- Dependencies the library does not want. Prefer CSS and a small `src/lib/` primitive over pulling in a library; the Modal's focus trap and motion were both de-dependencied this way.

Record every removal in `component.json`'s `declienting` array. That list is the honest cost of the rewrite, and the next person reads it to estimate the one after.

New components land as `maturity: "candidate"`. Promoting to `supported` is a deliberate human decision, not a side effect of editing.

## Accessibility is the point

Most of why a captured component is worth keeping is the accessibility work already in it. axe runs against every story and a violation **fails `pnpm test`** (see README, "Accessibility is enforced"). When a rule is genuinely wrong for one story, scope it off on that story with a reason — never loosen the global setting.

axe only catches what is inspectable in the markup. Focus management, keyboard operation, and `aria-labelledby`/`aria-describedby` actually resolving to real elements are not things it checks, so those belong in a `play` function. Assert the behaviour, not the class list: a component whose focus trap never attaches renders identically to one whose trap works, and both pass a snapshot.

## Motion

All motion runs through `--duration-fast` / `--duration-base` and `--ease-standard`. Those durations collapse to `0ms` under `prefers-reduced-motion`, so one switch turns motion off everywhere. Do not hard-code a duration in a component.

`pnpm test:motion` enforces this: Playwright emulates the real media query and re-runs the `motion`-tagged stories under it. A broken reduced-motion path renders identically to a working one under the default preference, so nothing else catches it. When you add motion to a component, tag its story `motion` and branch the assertion on `matchMedia('(prefers-reduced-motion: reduce)').matches` — the same play function then covers both preferences.

Note there are **two** mechanisms and they fail independently: the token collapse (`duration-[var(--duration-base)]`, which Card relies on) and `motion-reduce:transition-none` (which Button uses). Covering one does not cover the other.

## Environment

Node 24+ and pnpm 10+ via Corepack; `pnpm install`, then `pnpm exec playwright install chromium` once for the story tests. `pnpm test` runs the typecheck, the contract checks, and the story tests — that is the gate. `pnpm storybook` to browse.

## Context wiki

`wiki/` records why the repo is the way it is — executed plans, decisions, and the reasoning behind them. Start at [`wiki/INDEX.md`](wiki/INDEX.md), which routes to the one page your question needs; never load the whole wiki.

Capturing history is part of a substantive change, in the same delivery: a journal entry, the executed plan archived, and the affected topic page's Decisions updated. The protocol is [`wiki/MECHANICS.md`](wiki/MECHANICS.md).

Two things worth knowing before you read it. A pre-commit hook rebuilds the knowledge graph and warns (never blocks) when a substantive commit adds no journal entry; on merge, a bot fills in `pr:` links, drafts a stub for a substantive PR that added none, and updates the affected topic — see [`wiki/topics/graph-wiki-subsystem.md`](wiki/topics/graph-wiki-subsystem.md). It still needs `secrets.PR_BOT_TOKEN` configured in the repo to actually run. And the capture trigger includes **investigations that found nothing**, because "we already checked that" is exactly the knowledge `git log` cannot hold.

## Commits & release — the maintainer's job, not the agent's

**Permission boundary:** edit under `components/` and `src/` freely. Everything below is the maintainer's.

**Do not commit, push, merge, or tag.** Make the changes, run `pnpm test`, then stop and hand back. The maintainer commits with `pnpm commit` and pushes.
