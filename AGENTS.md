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

Most captures are a fresh canonical or a better take on one that overwrites the candidate in place. A structurally different implementation with the same role, affordance, and interaction semantics lands as `components/<slug>--<variant>/`; a semantic difference requires a new ui-design-brain canonical. Its `component.json` shares `canonical`/`slug`, adds singular `variant`, and omits `default`; the incumbent gains a named `variant` and `default: true`. `pnpm contracts` validates the code axis. The Figma registry mirrors it with optional `variant`, `variantLabel`, `default`, and `familyPage`: one page per canonical family, default Ready for Dev first, alternates below, default node identity preserved, and alternate nodes named `<Canonical> / <Variant label>`. Existing published nodes are not moved as a side effect; Button Light designates the legacy Button family page.

## Accessibility is the point

Most of why a captured component is worth keeping is the accessibility work already in it. axe runs against every story and a violation **fails `pnpm test`** (see README, "Accessibility is enforced"). When a rule is genuinely wrong for one story, scope it off on that story with a reason — never loosen the global setting.

axe only catches what is inspectable in the markup. Focus management, keyboard operation, and `aria-labelledby`/`aria-describedby` actually resolving to real elements are not things it checks, so those belong in a `play` function. Assert the behaviour, not the class list: a component whose focus trap never attaches renders identically to one whose trap works, and both pass a snapshot.

## Motion

All motion runs through `--duration-fast` / `--duration-base` and `--ease-standard`. Those durations collapse to `0ms` under `prefers-reduced-motion`, so one switch turns motion off everywhere. Do not hard-code a duration in a component.

`pnpm test:motion` enforces this: Playwright emulates the real media query and re-runs the `motion`-tagged stories under it. A broken reduced-motion path renders identically to a working one under the default preference, so nothing else catches it. When you add motion to a component, tag its story `motion` and branch the assertion on `matchMedia('(prefers-reduced-motion: reduce)').matches` — the same play function then covers both preferences.

Note there are **two** mechanisms and they fail independently: the token collapse (`duration-[var(--duration-base)]`, which Card relies on) and `motion-reduce:transition-none` (which Button uses). Covering one does not cover the other.

## Environment

Node 24+ and pnpm 10+ via Corepack; `pnpm install`, then `pnpm exec playwright install chromium webkit` once for the story tests. `pnpm test` runs typecheck, lint, architecture and contract self-tests, SSR rendering, export checks, Chromium/WebKit accessibility and mode coverage, and reduced-motion tests. `pnpm build` emits native Node ESM and declarations and verifies every public export. `pnpm verify` packs and installs the artifact, dynamically imports every component and verifies its declared `exportName`, then runs the development-only Next/Tailwind consumer fixture. `pnpm storybook` browses the source stories.

## Repository wiki and graph operations

[`wiki/`](wiki/INDEX.md) is the committed history of this repo — executed plans, decisions, and notable changes.

- **Query GitHub evidence unambiguously**: use a full URL, `owner/repo PR #123`, `owner/repo issue #123`, or `owner/repo#123`. Never query a bare `#123`; PR and issue numbers collide across repositories. Evidence resolves to the existing Markdown page that cites it, not to a live GitHub node.
- **Generated wiring map**: [`wiki/connections.md`](wiki/connections.md) is a routed index for component↔token, journal↔plan, topic↔surface, and cross-area seams. Open only the section named by the itinerary. Do not hand-edit it; `pnpm graph:build` rebuilds it and `pnpm run wiki:check` verifies it.
- **Human graph exploration**: `pnpm graph:view` opens the curated Sigma viewer. Search and click a node to focus its neighborhood, or select Source and Target and choose **Show route** for the weighted shortest route. The CLI navigator is the token-efficient agent path; the viewer is not a second knowledge source.
- **Write**: capturing history is part of a substantive change in the same delivery: add a journal entry, archive the executed plan, update the affected topic Decisions, and refresh the indexes per [`wiki/MECHANICS.md`](wiki/MECHANICS.md). Investigations that found nothing still qualify.
- **Automation**: the advisory pre-commit hook skips graph rebuilding when unstaged or untracked graph inputs could contaminate the commit. The merge and issue workflows are a safety net for out-of-session reconciliation; they need `secrets.PR_BOT_TOKEN`, store repo-qualified citations in Markdown, and rebuild offline `githubRefs` metadata. Agents still author the history they create.

## Commits & release

**Permission boundary:** edit under `components/` and `src/` freely. An agent may commit and push an issue branch only when the maintainer explicitly authorizes those actions.

Without explicit maintainer authorization, make the changes, run `pnpm test` and `pnpm build`, then stop and hand back. When commit and push are authorized, use `pnpm commit` and push only the issue branch so repository automation can create the draft PR. **Do not merge, tag, release, or publish.** A merge to `main` is the only release trigger. Before a release-producing merge, the maintainer must confirm npm trusted publishing names this repository and `.github/workflows/release.yml`; the workflow intentionally has no `NPM_TOKEN` fallback.

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
- Follow the [Graphify team setup guide](https://github.com/Graphify-Labs/graphify#team-setup): commit the shareable graph, report, manifest, analysis, and label outputs under `graphify-out/`; keep cost, cache, machine-root/interpreter markers, query memory/reflections, stamps, and dated backups local. Run `graphify hook install` after clone or upgrade and set `GRAPHIFY_SKIP_HOOK=1` to skip hook-triggered rebuilds.
- After clone or Graphify upgrade, re-run all three project installers so owned files stay current: `graphify install --project` (root `CLAUDE.md` + `.claude/`), `graphify codex install --project` (`AGENTS.md`), and `graphify cursor install --project` (`.cursor/rules/graphify.mdc`).
- `.graphifyignore` excludes all Markdown, the wiki, generated graph data, agent/install mechanics, consumer fixtures, and the vendored Sigma viewer runtime so native updates preserve the code-only corpus and stay focused on maintained source and tooling. The separate curated graph under `scripts/graph/data/` remains authoritative for governed component metadata and wiki history.
- When non-code sources such as documentation, PDFs, or images are intentionally part of the semantic graph, use the installed Graphify skill's `--update` flow; the Git sync path is AST-only and does not perform model-backed semantic extraction.

<!-- wiki-skill:start -->
## Context wiki navigation

Use `wiki/` as this repository's existing context source. Never bulk-load that directory.

- For an exact current-code, file, symbol, or command question, inspect the named source or use targeted source `rg`; do not load history.
- For a direct single-topic history or rationale question, start at `wiki/INDEX.md` when it exists and open only the page it routes to.
- Only for a cross-page why, wiring, ownership, or impact question, run `node scripts/wiki/navigate.cjs --wiki-root "wiki" --intent why --query "<terms>"` before opening wiki pages. Use `wiring` for ownership/dependencies and `impact` for change scope.
- Query with exact slugs, identifiers, symbols, or repository-qualified GitHub references. Never use a bare issue or PR number such as `#123`.
- When both endpoints are known, use exact `--from` and `--to` node IDs.
- Trust the router's deterministic weighted shortest route, which accounts for relationship cost, hubs, and page bytes. Open only its itinerary; never add candidates, neighbors, or adjacent pages.
- Read itinerary pages sequentially, never speculatively in parallel, and stop as soon as the answer is grounded.
- If resolution is ambiguous, rerun with one returned exact ID; never open every candidate.
- Never use `grep`, `find`, or recursive `rg` as initial wiki discovery. After a router miss, run at most one root-scoped exact search: `rg -n --fixed-strings "<exact term>" wiki/`. If it fails, inspect one known source path or ask one focused question; never widen the search.
- Never read generated graph JSON directly.
- This installation owns navigation only. Preserve this repository's existing wiki authoring, validation, hooks, workflows, and generated-data conventions.

This managed block is shared by Codex, Cursor, and Claude (via `@AGENTS.md` in `CLAUDE.md`).
<!-- wiki-skill:end -->
