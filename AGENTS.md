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

Every manifest identifies exactly one primary AI candidate with `exportName` and `rendering` (`server`, `hybrid`, or `client`). `pnpm architecture` derives that rendering value from the primary export graph and rejects drift, including relative side-effect imports and statically named dynamic imports. `reuseFingerprint` and `variants[]` describe only that primary export; secondary facade exports remain developer APIs, not additional AI candidates. The fingerprint is the AI pipeline's governed structural slots, primary affordance, and content role, not the existing API-level `slots` list. Governed `other` values are valid metadata but never automatically compatible. `pnpm contracts` rejects missing, malformed, ungoverned, or duplicate values.

## Component architecture

Every component has one stable public facade and a tree/branch/leaf implementation:

```text
components/<slug>/
├── index.ts                     public package facade
├── <Component>.types.ts         public types
├── <Component>.tsx |            server-compatible tree, or
│   <Component>.client.tsx       client-only tree when wholly interactive
├── parts/                        private branches, leaves, and client islands
├── <Component>.stories.tsx
└── component.json
```

`pnpm architecture` enforces the shape. Each directory has exactly one root `index.ts`, exactly one root `*.types.ts`, and at least two meaningful non-story TSX modules. Stories import component code only from `./index`; consumers use only the directory-shaped package subpath.

Server-compatible is the default. Put `'use client'` at the narrowest boundary that owns browser state, an effect, a portal, focus management, or DOM observation. Every directive-bearing implementation is named `*.client.ts(x)` and is no more than 120 physical lines. A client-only facade declares `'use client'`; a server or mixed facade does not. Do not access browser globals at module evaluation or render time, and do not import `next/*` into component core. Next exists here only as a development consumer test.

Published implementation code is native Node ESM. Every relative import and re-export in emitted source uses an explicit `.js` specifier, including type-only imports; TypeScript resolves those specifiers back to source under the NodeNext build. Stories remain source-only and continue importing `./index` as required by the story contract.

## Adding a component

Components arrive as **captures** from a `project-retrospective` run, and executing a capture is a rewrite, not a copy. What comes out:

- Imports reaching into a project's own tree (helpers, path aliases, CMS types).
- Client token names — map them onto semantic tokens.
- Client copy, asset URLs, and brand colours.
- Dependencies the library does not want. Prefer CSS and a small `src/lib/` primitive over pulling in a library; the Modal's focus trap and motion were both de-dependencied this way.

Record every removal in `component.json`'s `declienting` array. That list is the honest cost of the rewrite, and the next person reads it to estimate the one after.

New components land as `maturity: "candidate"`. Promoting to `supported` is a deliberate human decision, not a side effect of editing. After adding or removing a component, run `pnpm exports:sync`; normal test/build/prepack paths only check the committed export map and never rewrite it.

Before implementing the tree, decide whether the public component is server-compatible, hybrid, or wholly client-only. Keep data mapping and static markup in neutral tree/branch/leaf files. Isolate event state and browser effects in named client leaves, and prefer serializable `ReactNode` slots over render-function props that cannot cross a React Server Component boundary.

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

Node 24+ and pnpm 10+ via Corepack; `pnpm install`, then `pnpm exec playwright install chromium webkit` once for the story tests. `pnpm test` runs typecheck, lint, architecture and contract self-tests, SSR rendering, export checks, Chromium/WebKit accessibility and mode coverage, and reduced-motion tests. `pnpm build` emits native Node ESM and declarations and verifies every public export. `pnpm verify` packs and installs the artifact, dynamically imports every component and verifies its declared `exportName`, then runs the development-only Next/Tailwind consumer fixture. `pnpm storybook` browses the source stories.

## Context wiki

`wiki/` records why the repo is the way it is — executed plans, decisions, and the reasoning behind them. Start at [`wiki/INDEX.md`](wiki/INDEX.md), which routes to the one page your question needs; never load the whole wiki.

Capturing history is part of a substantive change, in the same delivery: a journal entry, the executed plan archived, and the affected topic page's Decisions updated. The protocol is [`wiki/MECHANICS.md`](wiki/MECHANICS.md).

Two things worth knowing before you read it. A pre-commit hook rebuilds the knowledge graph and warns (never blocks) when a substantive commit adds no journal entry; on merge, a bot fills in `pr:` links, drafts a stub for a substantive PR that added none, and updates the affected topic — see [`wiki/topics/graph-wiki-subsystem.md`](wiki/topics/graph-wiki-subsystem.md). It still needs `secrets.PR_BOT_TOKEN` configured in the repo to actually run. And the capture trigger includes **investigations that found nothing**, because "we already checked that" is exactly the knowledge `git log` cannot hold.

## Commits & release — the maintainer's job, not the agent's

**Permission boundary:** edit under `components/` and `src/` freely. Everything below is the maintainer's.

**Do not commit, push, merge, tag, or publish.** Make the changes, run `pnpm test` and `pnpm build`, then stop and hand back. The maintainer commits with `pnpm commit` and pushes; a merge to `main` is the only release trigger. Before a release-producing merge, the maintainer must confirm npm trusted publishing names this repository and `.github/workflows/release.yml`; the workflow intentionally has no `NPM_TOKEN` fallback.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Graphify repository workflow

The `## graphify` section above is the upstream block managed by `graphify codex install`; keep it verbatim so a Graphify upgrade can replace it cleanly. These repository-specific rules extend it:

- Use Graphify before broad source discovery for architecture, dependency, impact, or cross-file questions. After Graphify identifies the relevant subgraph, inspect the cited source files for exact implementation details and edits.
- Treat confidence tags as evidence boundaries: `EXTRACTED` edges come from deterministic parsing; verify `INFERRED` and `AMBIGUOUS` relationships in cited source before relying on them for a change.
- If a query is truncated or too broad, narrow it with a more specific question, `graphify path`, `graphify explain`, `--context <relation>`, or `--dfs` before raising `--budget` or reading the full report.
- If explicit delegation is requested for code exploration, include this query-first rule in the delegated task. Do not assume another agent inherited the repository's Graphify context.
- This repository commits the shareable `graphify-out/` map. Local cache, cost, and dated safety-backup artifacts stay ignored; a dirty tracked graph remains usable for orientation.
- Git events, not agent compliance, are the freshness authority: pre-commit refreshes and stages the graph, post-merge covers pulls/merges, and branch-switch post-checkout covers incoming history changes. `GRAPHIFY_SKIP_HOOK=1` is the explicit emergency bypass.
- For code changes in this repository, use `pnpm graphify:sync` instead of the raw upstream update command. It wraps `graphify update .` with deterministic clustering and a single AST worker, and is also the recovery command after hook failures or Git operations that do not fire these hooks.
- When non-code sources such as documentation, PDFs, or images are intentionally part of the semantic graph, use the installed Graphify skill's `--update` flow; the Git sync path is AST-only and does not perform model-backed semantic extraction.
