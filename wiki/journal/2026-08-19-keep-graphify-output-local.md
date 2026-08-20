---
date: 2026-08-19
topics: [graph-wiki-subsystem]
plan: none
pr: pending
---
# Keep Graphify output local

## Why

- `graphify-out/manifest.json` records filesystem mtimes, which Git does not preserve across checkouts.
- The checkout and merge hooks therefore dirtied synchronized branches even when indexed content and AST hashes were unchanged.
- `ui-design-evidence` already uses the correct boundary: Graphify output is local and ignored, while the separate authoritative repository graph remains committed.

## What changed

- Ignored all of `graphify-out/` and removed its generated artifacts from version control.
- Kept one local refresh command and the existing Git-event hooks, but stopped pre-commit from staging ignored Graphify output.
- Made the refresh command bootstrap a missing local map with AST-only extraction so a fresh clone does not depend on previously tracked artifacts.
- Force-refresh existing local maps so switching to a branch with fewer graph nodes cannot preserve stale symbols.
- Made hook refreshes best-effort and non-blocking, matching `ui-design-evidence`; optional local orientation tooling can warn but cannot fail a checkout, merge, or commit.
- Retained `scripts/graph/data/graph.json` and the generated wiki connections as the committed, deterministically validated repository graph.

## Files

- `.gitignore`, `.husky/pre-commit`, `AGENTS.md`
- `scripts/graph/sync-graphify.cjs`
- `wiki/topics/graph-wiki-subsystem.md`

## Follow-ups

- Land issue #66 before starting another component issue branch so history switches no longer create generated-output changes.
