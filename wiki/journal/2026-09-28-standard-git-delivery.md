---
date: 2026-09-28
topics: [graph-wiki-subsystem, package-distribution]
plan: plans/2026-09-28-standard-git-delivery.md
pr: https://github.com/verndale/ui-design-library/pull/110
issue: https://github.com/verndale/ui-design-library/issues/109
issues: ["https://github.com/verndale/ui-design-library/issues/109"]
---
# Standard Git delivery

## Why

- The push-triggered PR helper and AI commit package conflicted with issue-linked human delivery.
- The bot workflows still referenced the former token name.
- Release ran on main before the Quality result was known and repeated the explicit full verification.

## What changed

- Standalone Commitlint and the PR body validator now check the local message, PR title, commit range, and issue link.
- The open-PR review stop applies to repository maintenance. Project-retrospective action-owned Library capture retains its bespoke publication contract, including default merge after required checks and explicit stop-early modes.
- Bot wiki workflows use BOT_TOKEN and direct GitHub PR commands.
- Quality runs on main; Release accepts only successful Quality for the current main commit and keeps trusted publishing plus release preflight.
- Wiki issue-state reconciliation now runs Mondays at 11:30 UTC, matching agent-review-workflows.

## Files

- `AGENTS.md`, `.husky/`, `.github/workflows/`, `package.json`, `scripts/evals/wiki-parity-check.cjs`

## Follow-ups

- Verify hosted checks and the npm trusted publisher configuration before a release-producing merge.
