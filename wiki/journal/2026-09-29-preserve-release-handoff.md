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

A wiki-only main push could cancel the full Quality run for an earlier substantive merge. Release requires that successful push-event Quality result and cannot release from the later wiki-only revision alone.

## What changed

Quality now cancels superseded pull-request runs while allowing every main push run to finish. Npm Release is temporarily paused for this test and returns to normal afterward.

## Files

- `.github/workflows/quality.yml`, `scripts/evals/wiki-parity-check.cjs`
- `wiki/INDEX.md`, `wiki/topics/package-distribution.md`, this journal
