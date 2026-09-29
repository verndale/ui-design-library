---
date: 2026-09-29
topics: [package-distribution]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/125
issue: https://github.com/verndale/ui-design-library/issues/124
issues: ["https://github.com/verndale/ui-design-library/issues/124"]
---
# Gate release on fully verified main history

## Why

Review of the earlier Quality concurrency change found two remaining release gaps. A third main push could replace a pending run, and a later wiki-only run could trigger Release without verifying an earlier unreleased substantive merge.

## What changed

Each main push now has a unique Quality concurrency identity; pull-request runs still cancel obsolete attempts. Push Quality compares the tested commit with the latest reachable release tag, falling back to full verification when no tag is available. A wiki-only push stays lightweight only when no unreleased substantive paths exist.

## Files

- `.github/workflows/quality.yml`, `scripts/evals/wiki-parity-check.cjs`
- `wiki/INDEX.md`, `wiki/topics/package-distribution.md`, both release-handoff journals
