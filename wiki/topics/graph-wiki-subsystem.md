---
aliases: [knowledge graph, graph viewer, sigma.js viewer, wiki automation, wiki-sync bot, wiki-issue-sync bot, pre-commit journal reminder, graph freshness]
covers: [scripts/graph/build-graph.cjs, scripts/graph/routing.cjs, scripts/graph/routing-policy.json, scripts/graph/serve.cjs, scripts/evals/graph-check.cjs, scripts/wiki/on-merge-sync.cjs, scripts/wiki/refresh-issue-state.cjs, scripts/wiki/pre-commit-journal.cjs, scripts/wiki/ci-journal-warn.cjs, .husky/pre-commit, .github/workflows/wiki-sync.yml, .github/workflows/wiki-issue-sync.yml]
---
# Knowledge graph & wiki automation — Design History

The deterministic knowledge graph + Sigma.js viewer, and the wiki-sync / wiki-issue-sync bots that keep the context wiki current on merge. Ported from `@verndale/ui-design-brain`.

## Current state

- `pnpm graph:build` derives `scripts/graph/data/graph.json` from root docs, `src/tokens/semantic.css`, every `components/*/component.json`, and `wiki/`; `pnpm graph:view` renders it with a vendored Sigma.js stack; `pnpm evals:graph` byte-compares a fresh rebuild and gates freshness (run manually or in CI — see Open threads).
- Node types: `root-doc`, `token-layer`, `component`, `wiki-*`, and `surface` (a file a wiki topic's `covers:` names that isn't already one of the above). Edge types: `uses-tokens`, `links-to`, `topic`, `plan`, `covers`.
- `pnpm graph:navigate` (`scripts/wiki/navigate.cjs`) resolves a `why` / `wiring` / `impact` intent to a reading itinerary using `routing-policy.json` and the graph only — no LLM.
- The pre-commit hook rebuilds the graph and stages it plus `wiki/connections*` on every local commit, and separately warns (non-blocking) when a staged commit is substantive but adds no `wiki/journal/` entry (`scripts/wiki/pre-commit-journal.cjs`).
- `.github/workflows/wiki-sync.yml` runs on every merged PR: fills `pr: pending` in journal entries, drafts a deterministic stub for a substantive PR that added none, appends a topic Decisions bullet, and completes a `plans/INDEX.md` row — as a bot PR (`bot/wiki-sync/<pr>`), never a direct push. AI drafting (`scripts/wiki/lib/ai.cjs`) is dormant unless `WIKI_AI=true` is set.
- `.github/workflows/wiki-issue-sync.yml` runs nightly, marking a closed GitHub issue cited under a topic's `## Open threads` with ` — closed`.
- `scripts/wiki/lib/substantive.cjs` classifies changed paths as substantive (components, the token layer, the story-test/Storybook/graph/wiki tooling) and best-effort guesses which topic they touch.

## Decisions

- 2026-07-31 — feat(ui-design-library): Enhance documentation on structural variants ([PR #5](https://github.com/verndale/ui-design-library/pull/5))
- 2026-07-27 — feat(ci): Implement automated wiki issue synchronization ([PR #2](https://github.com/verndale/ui-design-library/pull/2))
- 2026-07-27 — Fixed a real bug found while verifying the ported viewer actually renders: Sigma was constructed synchronously before the flex-derived `#graph` width was guaranteed to exist, throwing `Container has no width` on some fresh loads — silently, since `init()`'s trailing call had no `.catch()`. Reproduced on repeated clean reloads. Fixed with a two-`requestAnimationFrame` wait before construction, plus a try/catch in `init()` so any future failure surfaces on the page instead of an indefinite "loading…" ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Ported the wiki-sync and wiki-issue-sync bot workflows verbatim (both are already generic — no repo-specific literals) and adapted `on-merge-sync.cjs`'s and `refresh-issue-state.cjs`'s hardcoded `ui-design-brain` GitHub URLs to this repo. Dropped `pre-commit-journal.cjs`'s unarchived-plan half: it scans `~/.claude/plans` for a plan mentioning `ui-design-brain` and suggests `archive-plan.cjs`, and this repo has neither that CLI nor the live-plan-store convention — `wiki/MECHANICS.md` documents archiving by hand instead ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Did not port `catalogs`/`see-also`/`references` edges from ui-design-brain's graph. This repo has no catalog manifest (each `component.json` is independent) and no backtick cross-reference convention between components. `uses-tokens` replaces them as the structural edge, mirroring the third contract in `AGENTS.md` ("semantic tokens only") ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Added a `surface` node type, not present upstream. This repo's `covers:` mostly names code/config files (Vitest configs, `.storybook/*`, `check-contracts.cjs`) rather than other markdown pages; promoting them to nodes is what lets the covers edge resolve and still catch a stale path as a dangling edge ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).
- 2026-07-27 — Removed `.github/workflows/graph.yml` (the CI freshness gate) after initially adding it — see Open threads. The build/view/eval scripts and the pre-commit rebuild stay; only the CI backstop was dropped ([journal](../journal/2026-07-27-graph-and-wiki-automation.md)).

## Open threads

- No CI job runs `pnpm evals:graph`. Without it, a commit made with `--no-verify`, or a hand-edit to `wiki/connections*`, can drift from the source graph with nothing to catch it — the pre-commit hook is the only freshness check, and it's skippable. If that's not the intended tradeoff, `.github/workflows/graph.yml` (removed this pass) is a straight re-add.
- `wiki-sync.yml` / `wiki-issue-sync.yml` need `secrets.PR_BOT_TOKEN` configured in the repo (and optionally `vars.WIKI_AI` + friends for AI-drafted stubs) to actually run — that's GitHub repo configuration, not something committed code can set up. Until it's configured, both workflows exist but will fail at checkout/PR-creation.
