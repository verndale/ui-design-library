---
date: 2026-09-29
topics: [graph-wiki-subsystem]
plan: none
pr: pending
issue: https://github.com/verndale/ui-design-library/issues/118
---
# Restore wiki replay for existing bot PRs

## Why

- Replaying merged PR #95 updated its bot branch, but the action failed when `gh pr list` queried GraphQL fields that required `read:org` beyond BOT_TOKEN's repository scope.
- The issue-state workflow used the same lookup/edit path, so an existing issue-state PR could fail in the same way.

## What changed

- Both wiki workflows use the repository pull request REST endpoint to find an existing bot PR and update its title and body.
- New PR creation, branch ownership, weekly issue schedule, and the action-owned review flow remain the same.
- The wiki parity check guards these REST update paths.

## Files

- `.github/workflows/wiki-sync.yml`, `.github/workflows/wiki-issue-sync.yml`
- `scripts/evals/wiki-parity-check.cjs`
- `wiki/INDEX.md`, `wiki/MECHANICS.md`, `wiki/topics/graph-wiki-subsystem.md`, this journal

## Follow-ups

- Replay one existing wiki PR and verify its action completes through the PR update step.
