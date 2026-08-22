---
aliases: [knowledge graph, graph viewer, graphify, code knowledge graph, sigma.js viewer, wiki automation, wiki-sync bot, wiki-issue-sync bot, pre-commit journal reminder, graph freshness]
covers: [AGENTS.md, CLAUDE.md, .gitattributes, .gitignore, .graphifyignore, eslint.config.js, commitlint.config.cjs, lint-staged.config.mjs, scripts/graph/build-graph.cjs, scripts/graph/pre-commit.cjs, scripts/graph/routing.cjs, scripts/graph/routing-policy.json, scripts/graph/serve.cjs, scripts/evals/graph-check.cjs, scripts/wiki/on-merge-sync.cjs, scripts/wiki/refresh-issue-state.cjs, scripts/wiki/pre-commit-journal.cjs, scripts/wiki/ci-journal-warn.cjs, .husky/pre-commit, .husky/pre-push, .husky/post-commit, .husky/post-checkout, .github/workflows/test.yml, .github/workflows/commitlint.yml, .github/workflows/wiki-sync.yml, .github/workflows/wiki-issue-sync.yml]
---
# Knowledge graph & wiki automation — Design History

The deterministic knowledge graph + Sigma.js viewer, and the wiki-sync / wiki-issue-sync bots that keep the context wiki current on merge. Ported from `@verndale/ui-design-brain`.

## Current state

- `pnpm graph:build` derives `scripts/graph/data/graph.json` from root docs, `src/tokens/semantic.css`, every `components/*/component.json`, and `wiki/`; `pnpm graph:view` renders it with a vendored Sigma.js stack; `pnpm graph:check` byte-compares a fresh rebuild and blocks `Quality / quality` on drift or integrity failure.
- Node types: `root-doc`, `token-layer`, `component`, `wiki-*`, and `surface` (a file a wiki topic's `covers:` names that isn't already one of the above). Edge types: `uses-tokens`, `links-to`, `topic`, `plan`, `covers`.
- `surface.bytes` records file sizes only. Covered directories use zero because directory `stat.size` is filesystem metadata and differs between macOS and Linux; the CI graph gate enforces this portable representation.
- `pnpm graph:navigate` (`scripts/wiki/navigate.cjs`) resolves a `why` / `wiring` / `impact` intent to a reading itinerary using `routing-policy.json` and the graph only — no LLM.
- `graphify-out/` is the complementary code-level map: Graphify parses implementation ASTs into symbol, import, call, and file relationships. `AGENTS.md` keeps Graphify's installer-owned `## graphify` block verbatim and places repository extensions under the next H2, so upgrades can refresh upstream query-first wording without deleting local confidence, narrowing, delegation, artifact, and hook rules. The curated repository graph remains authoritative for governed component metadata and wiki history.
- Graphify's root code-only map tracks its shareable graph, report, manifest, analysis, and label artifacts. Cost, cache, machine-root/interpreter markers, query memory/reflections, stamps, and dated backups stay ignored. `.graphifyignore` keeps wiki history, generated graph data, agent/install mechanics, fixtures, and vendored viewer code out of the corpus.
- Graphify owns only its native post-commit and branch-switch post-checkout hooks plus the `graphify-out/graph.json` merge driver. Project-scoped Claude, Codex, and Cursor installers own separate instruction/config surfaces; no bespoke synchronizer, pre-commit block, post-merge hook, or post-rewrite hook remains.
- Pre-commit first runs staged ESLint autofix as a blocking gate, then the advisory journal reminder, then the curated graph refresh. The graph helper skips when an indexed input has unstaged or untracked changes and treats rebuild/staging failures as warnings; `Quality / quality` is the non-mutating freshness backstop.
- Pre-push runs the side-effect-free TypeScript and fast architecture/contract/export/SSR suite. Full lint, browser/accessibility/build/packed-consumer checks and the curated graph gate run in `Quality / quality`; `Commit message lint / commitlint` independently checks the squash title and every PR commit.
- `.github/workflows/wiki-sync.yml` runs on every merged PR: it slurps and flattens every GitHub API page into one PR context, fills `pr: pending` in journal entries, drafts a deterministic stub for a substantive PR that added none, appends a topic Decisions bullet, and completes a `plans/INDEX.md` row — as a bot PR (`bot/wiki-sync/<pr>`), never a direct push. AI drafting (`scripts/wiki/lib/ai.cjs`) is dormant unless `WIKI_AI=true` is set.
- `.github/workflows/wiki-issue-sync.yml` runs nightly, marking a closed GitHub issue cited under a topic's `## Open threads` with ` — closed`.
- `scripts/wiki/lib/substantive.cjs` classifies changed paths as substantive (components, the token layer, the story-test/Storybook/graph/wiki tooling) and best-effort guesses which topic they touch.

## Decisions

- 2026-08-22 — Made directory-backed `surface` nodes filesystem-independent after the first Linux quality run showed macOS directory sizes in the committed graph; directories now record zero bytes and the graph check carries a regression assertion ([issue #83](https://github.com/verndale/ui-design-library/issues/83), [journal](../journal/2026-08-22-standardize-lint-commitlint-and-graph-automation.md)).
- 2026-08-22 — Standardized ESLint, Commitlint, local hooks, CI, native Graphify ownership, and the curated graph lifecycle while preserving the library's component/wiki graph schema. Kept code lint on ESLint 10, made pre-push side-effect-free, and moved Graphify from custom ignored synchronization to official hooks with shareable outputs ([issue #83](https://github.com/verndale/ui-design-library/issues/83), [plan](../plans/2026-08-22-cross-repository-lint-commitlint-and-graph-standardization.md), [journal](../journal/2026-08-22-standardize-lint-commitlint-and-graph-automation.md)).
- 2026-08-22 — feat(ui-design-library): Enhance interaction states for various componen ([PR #81](https://github.com/verndale/ui-design-library/pull/81))
- 2026-08-20 — feat(ui-design-library): Add TabsNativeSelect component for responsive t ([PR #78](https://github.com/verndale/ui-design-library/pull/78))
- 2026-08-20 — feat(ui-design-library): Enhance slider component with form integration ([PR #76](https://github.com/verndale/ui-design-library/pull/76))
- 2026-08-20 — feat(ui-design-library): Enhance component instance validation logic ([PR #74](https://github.com/verndale/ui-design-library/pull/74))
- 2026-08-20 — feat(ui-design-library): Add icon-only button presentation option ([PR #72](https://github.com/verndale/ui-design-library/pull/72))
- 2026-08-20 — feat(ui-design-library): Enhance carousel inert behavior for better ([PR #69](https://github.com/verndale/ui-design-library/pull/69))
- 2026-08-20 — chore(ui-design-library): Update Graphify hooks for better user feedback ([PR #67](https://github.com/verndale/ui-design-library/pull/67))
- 2026-08-20 — feat(ui-design-library): Enhance documentation with source parity detail ([PR #64](https://github.com/verndale/ui-design-library/pull/64))
- 2026-08-19 — feat(ui-design-library): Update Card media composition documentation ([PR #56](https://github.com/verndale/ui-design-library/pull/56))
- 2026-08-19 — chore(ui-design-library): Update documentation for structural variants ([PR #52](https://github.com/verndale/ui-design-library/pull/52))
- 2026-08-19 — ci(ci): Add Figma library validation workflow ([PR #50](https://github.com/verndale/ui-design-library/pull/50))
- 2026-08-14 — feat(ui-design-library): Add leading item support to breadcrumbs compone ([PR #47](https://github.com/verndale/ui-design-library/pull/47))
- 2026-08-14 — feat(ui-design-library): Enhance breadcrumbs component with presentation ([PR #44](https://github.com/verndale/ui-design-library/pull/44))
- 2026-08-13 — feat(accessibility): publish realization contracts ([PR #41](https://github.com/verndale/ui-design-library/pull/41))
- 2026-08-13 — feat(contracts): add accessible realizations (#37) ([PR #38](https://github.com/verndale/ui-design-library/pull/38))
- 2026-08-13 — fix(package): keep Stat variants on the primary export ([PR #35](https://github.com/verndale/ui-design-library/pull/35))
- 2026-08-13 — feat(package): publish executable ESM reuse contract v2 ([PR #32](https://github.com/verndale/ui-design-library/pull/32))
- 2026-08-13 — chore(ci): Update wiki sync workflow for API changes ([PR #29](https://github.com/verndale/ui-design-library/pull/29))
- 2026-08-12 — Made wiki-sync PR context construction pagination-safe after PR #27's 186 changed files produced two adjacent JSON arrays and failed `jq --argjson`; `gh api --slurp` now creates one outer page array and the filters flatten it for both files and commits ([journal](../journal/2026-08-12-fix-wiki-sync-pagination.md)).
- 2026-08-06 — feat(ci): Update workflows and enhance modal component ([PR #24](https://github.com/verndale/ui-design-library/pull/24))
- 2026-08-05 — chore(ci): Update documentation and workflows for npm release ([PR #19](https://github.com/verndale/ui-design-library/pull/19))
- 2026-08-03 — feat(ui-design-library): Add in-page navigation component ([PR #16](https://github.com/verndale/ui-design-library/pull/16))
- 2026-08-01 — feat(ui-design-library): Add Image and Slider components with stories ([PR #13](https://github.com/verndale/ui-design-library/pull/13))
- 2026-07-31 — feat(ui-design-library): Add Accordion, Alert, and Toast components ([PR #11](https://github.com/verndale/ui-design-library/pull/11))
- 2026-07-31 — feat(ui-design-library): Add RichText and SectionHeader components ([PR #8](https://github.com/verndale/ui-design-library/pull/8))
- 2026-07-31 — feat(ui-design-library): Enhance documentation on structural variants ([PR #5](https://github.com/verndale/ui-design-library/pull/5))
- 2026-07-27 — feat(ci): Implement automated wiki issue synchronization ([PR #2](https://github.com/verndale/ui-design-library/pull/2))
- 2026-07-27 — Fixed a real bug found while verifying the ported viewer actually renders: Sigma was constructed synchronously before the flex-derived `#graph` width was guaranteed to exist, throwing `Container has no width` on some fresh loads — silently, since `init()`'s trailing call had no `.catch()`. Reproduced on repeated clean reloads. Fixed with a two-`requestAnimationFrame` wait before construction, plus a try/catch in `init()` so any future failure surfaces on the page instead of an indefinite "loading…" ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Ported the wiki-sync and wiki-issue-sync bot workflows verbatim (both are already generic — no repo-specific literals) and adapted `on-merge-sync.cjs`'s and `refresh-issue-state.cjs`'s hardcoded `ui-design-brain` GitHub URLs to this repo. Dropped `pre-commit-journal.cjs`'s unarchived-plan half: it scans `~/.claude/plans` for a plan mentioning `ui-design-brain` and suggests `archive-plan.cjs`, and this repo has neither that CLI nor the live-plan-store convention — `wiki/MECHANICS.md` documents archiving by hand instead ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Did not port `catalogs`/`see-also`/`references` edges from ui-design-brain's graph. This repo has no catalog manifest (each `component.json` is independent) and no backtick cross-reference convention between components. `uses-tokens` replaces them as the structural edge, mirroring the third contract in `AGENTS.md` ("semantic tokens only") ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Added a `surface` node type, not present upstream. This repo's `covers:` mostly names code/config files (Vitest configs, `.storybook/*`, `check-contracts.cjs`) rather than other markdown pages; promoting them to nodes is what lets the covers edge resolve and still catch a stale path as a dangling edge ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).

## Open threads

- `wiki-sync.yml` / `wiki-issue-sync.yml` need `secrets.PR_BOT_TOKEN` configured in the repo (and optionally `vars.WIKI_AI` + friends for AI-drafted stubs) to actually run — that's GitHub repo configuration, not something committed code can set up. Until it's configured, both workflows exist but will fail at checkout/PR-creation.
