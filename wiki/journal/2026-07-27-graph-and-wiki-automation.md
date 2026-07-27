---
date: 2026-07-27
topics: [graph-wiki-subsystem]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/2
---
# Knowledge graph + wiki automation

## Why

- The wiki port ([2026-07-26](../journal/2026-07-26-storybook-docs-audit.md) onward) deliberately omitted ui-design-brain's generated `connections/` pages and `scripts/wiki/` bot automation, on the reasoning that hand-writing generated pages without the generator would be worse than leaving them out.
- That reasoning held for *generated pages with no generator*. It didn't need to extend to *not having the generator* — this entry is that correction: port the generator (the knowledge graph) and the bots, rather than the leave-it-out default.
- Requested explicitly: `graph:build` / `graph:view` in `package.json`, and the `.github` workflow shape to match ui-design-brain's.

## What changed

- Ported the knowledge graph (`scripts/graph/build-graph.cjs`, `routing.cjs`, `routing-policy.json`, `serve.cjs`, the vendored Sigma.js viewer) and the freshness eval (`scripts/evals/graph-check.cjs`), adapted to this repo's shape: no catalog manifest and no backtick see-also convention, so `catalogs`/`see-also`/`references` are replaced by one structural edge, `uses-tokens` (component → the token layer, mirroring the "semantic tokens only" contract). Added a `surface` node type so a wiki topic's `covers:` — mostly code/config files here, not other markdown — still resolves.
- Verified by running it, not just reading it: first real build produced 34 nodes / 59 edges with zero dangling; `pnpm evals:graph` passed all 13 cases (freshness, determinism, routing-policy coverage, no orphans); the viewer loads and initially failed silently (see Follow-ups).
- Ported the wiki-sync (on-merge stub drafting + Decisions/plan backfill) and wiki-issue-sync (nightly closed-issue annotation) bot workflows and their backing scripts, adapting only the two hardcoded `ui-design-brain` GitHub URLs. Dropped the unarchived-plan half of `pre-commit-journal.cjs` — it assumes a `~/.claude/plans` scanning convention and an `archive-plan.cjs` CLI this repo doesn't have; `wiki/MECHANICS.md` already documents archiving by hand.
- Added `.github/workflows/graph.yml` (the CI freshness gate) first, then **removed it** on direction — the build/view/eval scripts and the pre-commit auto-rebuild stay, but nothing in CI currently re-runs `pnpm evals:graph`. That's a real gap, not an oversight; recorded in the topic's Open threads.
- Added a new wiki topic, `graph-wiki-subsystem`, for this subsystem itself — the self-referential pattern ui-design-brain's own wiki uses for the same tooling.
- Found and fixed a real bug in the ported viewer while checking it actually renders: `buildRenderer()` constructed Sigma synchronously, right after the two fetches resolved, with no guaranteed layout pass in between. `<main id="graph">` gets its width from a flex sibling, and on a fresh load Sigma sometimes measured it before that layout committed, throwing `Sigma: Container has no width` — silently, because `init()`'s trailing call had no `.catch()`, so the failure never reached the console and the page just sat on "loading…" forever. Reproduced on repeated clean reloads (not a one-off), fixed by awaiting two `requestAnimationFrame`s before constructing Sigma, and wrapped `init()` in a try/catch that now surfaces any future failure on the page instead of hanging silently. Verified fixed across multiple clean reloads.

## Files

- `scripts/graph/`, `scripts/evals/graph-check.cjs`, `scripts/wiki/{on-merge-sync,refresh-issue-state,pre-commit-journal,ci-journal-warn,navigate}.cjs`, `scripts/wiki/lib/{substantive,wiki-io,ai,frontmatter}.cjs`
- `.github/workflows/{wiki-sync,wiki-issue-sync}.yml`, `.husky/pre-commit`, `package.json`
- `wiki/INDEX.md`, `wiki/MECHANICS.md`, `wiki/topics/graph-wiki-subsystem.md`

## Follow-ups

- `wiki-sync.yml` / `wiki-issue-sync.yml` need `secrets.PR_BOT_TOKEN` (and optionally the `WIKI_AI*` vars) configured in the GitHub repo before they can actually run.
- No CI job runs `pnpm evals:graph` (see `graph-wiki-subsystem`'s Open threads) — the pre-commit hook is the only freshness check today, and it's skippable with `--no-verify`.
