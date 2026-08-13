---
date: 2026-08-12
topics: [graph-wiki-subsystem]
plan: none
pr: pending
---
# Fix wiki sync pagination

## Why

- The wiki sync for merged PR #27 failed in `Build PR context` with `jq: invalid JSON text passed to --argjson`.
- PR #27 changed 186 files, crossing the GitHub files API's 100-item page boundary for the first time in this repository.
- `gh api --paginate --jq` evaluated the filter once per page and printed adjacent JSON arrays; the shell captured both arrays as one value, which is not valid input for `jq --argjson`.

## What changed

Both PR-context API calls now use `gh api --paginate --slurp`, which wraps all response pages in one outer array before the `--jq` filter runs. The file and commit filters flatten that page array into one valid JSON array, so `ctx.json` has the same shape for one-page and multi-page PRs.

The failure was not in the wiki reconciliation script: it happened before `ctx.json` existed, so the fix stays at the workflow's pagination boundary.

## Files

- `.github/workflows/wiki-sync.yml`
- `wiki/topics/graph-wiki-subsystem.md`
