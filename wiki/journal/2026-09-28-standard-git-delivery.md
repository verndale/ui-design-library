---
date: 2026-09-28
topics: [graph-wiki-subsystem, package-distribution]
plan: plans/2026-09-28-standard-git-delivery.md
pr: pending
---
# Standard Git delivery

## Why

- The push-triggered PR helper and AI commit package conflicted with issue-linked human delivery.
- The bot workflows still referenced the former token name.
- Release ran on main before the Quality result was known and repeated the explicit full verification.

## What changed

- Standalone Commitlint and the PR body validator now check the local message, PR title, commit range, and issue link.
- Bot wiki workflows use BOT_TOKEN and direct GitHub PR commands.
- Quality runs on main; Release accepts only successful Quality for the current main commit and keeps trusted publishing plus release preflight.

## Files

- `AGENTS.md`, `.husky/`, `.github/workflows/`, `package.json`, `scripts/evals/wiki-parity-check.cjs`

## Follow-ups

- Verify hosted checks and the npm trusted publisher configuration before a release-producing merge.
