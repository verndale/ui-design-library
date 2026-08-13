---
date: 2026-08-12
topics: [graph-wiki-subsystem]
plan: none
pr: pending
---
# Add Graphify code mapping

## Why

- The existing repository graph intentionally maps component manifests, semantic tokens, and wiki decisions; it does not provide symbol-level import, call, and file relationships across component implementations.
- Component exploration needs both views: the curated design-history graph for governed intent and a code graph for concrete paths through facades, parts, stories, tests, and shared client primitives.
- Graphify's documented Codex integration uses `AGENTS.md` as the always-on query-first mechanism, so the integration belongs in repository instructions rather than in one agent's local habits.

## What changed

- Ran Graphify's `graphify codex install`, which added its maintained query/path/explain and post-change update rules to `AGENTS.md`.
- Built a local map with Graphify 0.9.36. The cleaned and refreshed graph contains 1,348 nodes, 1,897 edges, and 150 communities across code and repository documentation; no LLM backend or token spend was involved.
- Kept the standard `graphify-out/` artifacts for interactive browsing, architecture review, and scoped CLI queries. Local cost and cache files are ignored, matching Graphify's team setup guidance.
- Added `.graphifyignore` entries for Graphify's own output and the repository's vendored minified Sigma/Graphology runtime. The vendor files polluted the first pass with meaningless single-letter god nodes, so they are excluded from subsequent maps.
- Documented a sandbox fallback for refreshes. Graphify's default `graphify update .` hit `Operation not permitted` when it opened a process pool here; its supported `GRAPHIFY_MAX_WORKERS=1 graphify update .` override completed the same local AST refresh successfully.
- Made freshness a Git-event contract rather than an agent-only instruction. The existing pre-commit flow now refreshes Graphify and stages its shareable output, blocking the commit when the map cannot be updated. Tracked `post-merge` and branch-switch-only `post-checkout` hooks refresh after pulls and history switches, which do not run the local pre-commit hook.
- Routed every hook through `pnpm graphify:sync` / `scripts/graph/sync-graphify.cjs`. The wrapper applies Graphify's deterministic `PYTHONHASHSEED=0`, uses its supported single-worker setting for restricted environments, honors `GRAPHIFY_SKIP_HOOK=1`, finds the CLI through `graphify`, `GRAPHIFY_PYTHON`, or Python module fallbacks, and stages only non-ignored `graphify-out/` team artifacts on pre-commit.
- Reconciled `AGENTS.md` with Graphify 0.9.36's packaged Codex instructions and current official CLI/team guidance. The installer-owned `## graphify` block is now verbatim and ends at the next H2, while a separate repository section records query narrowing, confidence-tag verification, delegated-task propagation, committed-output policy, Git-event freshness, the deterministic sync wrapper, and the separate semantic update path for non-code sources. Future `graphify codex install` runs can refresh upstream wording without deleting those local rules.
- Used the graph to verify the component map already exposes shared interaction paths: Modal and SearchOverlay both call `useDialog`; Modal also calls `getFocusableElements`; Toast calls `usePortalRoot`. No import cycles were detected.
- Did not keep a draft `COMPONENT_TREE.html`: Graphify's `tree --root components` re-anchors the hierarchy but does not filter non-component nodes, so the result was not a trustworthy components-only view. The full interactive graph remains the supported map.

## Files

- `AGENTS.md`, `.graphifyignore`, `.gitignore`, `package.json`
- `.husky/pre-commit`, `.husky/post-merge`, `.husky/post-checkout`, `scripts/graph/sync-graphify.cjs`
- `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`, `graphify-out/graph.json`, `graphify-out/manifest.json`
- `wiki/INDEX.md`, `wiki/topics/graph-wiki-subsystem.md`

## Follow-ups

- Community names remain local hub-derived labels/placeholders rather than semantic model labels. Run Graphify's optional labeling pass only if richer names are worth sending the relevant summaries to a configured model backend.
