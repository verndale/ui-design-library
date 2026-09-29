---
date: 2026-09-29
topics: [package-distribution]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/122
issue: https://github.com/verndale/ui-design-library/issues/121
issues: ["https://github.com/verndale/ui-design-library/issues/121"]
---
# Preserve tested main release handoff

## Why

A wiki-only main push could cancel the full Quality run for an earlier substantive merge. Release requires a successful Quality result on the current main commit.

## What changed

Quality stopped canceling an in-progress main push run while continuing to cancel superseded pull-request runs. [Issue #124](https://github.com/verndale/ui-design-library/issues/124) addresses pending-run replacement and verification of unreleased history.

## Files

- `.github/workflows/quality.yml`, `scripts/evals/wiki-parity-check.cjs`
- `wiki/INDEX.md`, `wiki/topics/package-distribution.md`, this journal
