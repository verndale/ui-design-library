---
date: 2026-08-23
topics: [graph-wiki-subsystem]
plan: plans/2026-08-23-wiki-parity-and-github-evidence.md
pr: pending
issue: https://github.com/verndale/ui-design-library/issues/87
issues: ["https://github.com/verndale/ui-design-library/issues/87"]
---
# Standardize wiki navigation and GitHub evidence

## Why

- The curated wiki graph retained only unqualified PR/issue numbers, so collisions across repositories could not be resolved safely.
- Agents needed an explicit cheapest-lookup split and a compact byte-aware itinerary instead of widening into adjacent history pages.
- Merge and issue automation lacked one integrity entrypoint, versioned manual replay, and the same bot/auth/runtime protections used elsewhere.
- The daily cron is useful only for issue-state drift, which can happen without a repository event; merged PR capture remains event-driven.

## What changed

- Added canonical offline `githubRefs` metadata while retaining legacy `prs` and `issues`, with qualified query forms and bare-number rejection.
- Extended the existing Sigma viewer's search and inspector with safe clickable evidence; node focus and weighted shortest-route selection are unchanged.
- Hardened merged/manual and daily reconciliation with repo identity, multiple closing issues, one cached lookup per `repository#issue`, all-reference known-state handling per Open-thread line, pagination, explicit bot credentials, bot-branch guards, Graphify hook opt-out, and lease-safe pushes.
- Added `Wiki integrity / check`, moved `Quality / quality` to the canonical `quality.yml` filename while preserving its specialized browser/build gates, and made `@verndale/ai-commit@2.7.0` the sole direct provider in CI and `.husky/commit-msg`.
- Kept the advisory pre-commit lifecycle contamination-safe: it skips regeneration when unstaged or untracked graph inputs could enter generated output.
- Follow-up review normalized decorated evidence URLs in CLI and viewer search; rejected malformed, embedded, unsafe, traversing, non-string path, malformed commit, non-string PR text, or invalid merge-timestamp inputs while retaining explicit legacy aliases; derived legacy number arrays only from canonical evidence; parsed Oxford-comma and ampersand closing clauses; excluded evidence and graph links inside exact nested-fence boundaries; prevented issue refresh from following Markdown files, scan directories, or wiki ancestors through symlinks; and aligned Node/browser route costs and strict policy type validation with a `0.05` per-KiB read penalty.

## Files

- `AGENTS.md`
- `scripts/wiki/`
- `scripts/graph/`
- `scripts/evals/wiki-parity-check.cjs`
- `.github/workflows/`
- `.husky/commit-msg`
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- `wiki/`

## Follow-ups

- Replace `pr: pending` by merging or manually replaying the wiki-sync workflow after the delivery PR exists.
