---
date: 2026-09-29
topics: [graph-wiki-subsystem]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/116
issue: https://github.com/verndale/ui-design-library/issues/115
issues: ["https://github.com/verndale/ui-design-library/issues/115"]
---
# Visible PR validation and wiki-only Quality

## Why

- The PR-body gate accepted section headings hidden in HTML comments or Markdown fences.
- Bot wiki PRs and wiki-only main pushes installed dependencies and browsers and ran the complete component suite even though Wiki integrity checked the same wiki history.

## What changed

- The PR-body validator follows the reviewed visible-heading contract, with focused regression tests included in `verify:ci`.
- Quality keeps its named result but uses wiki and graph checks when a change is limited to `wiki/` and generated graph data. Code, workflow, manual, empty, and unavailable change ranges retain the complete suite.
- The retrospective action-owned publication flow and Release policy stay in place.

## Files

- `scripts/validate_pr_body.cjs`, `scripts/tests/pr-body.test.cjs`, `package.json`
- `.github/workflows/quality.yml`
- `wiki/INDEX.md`, `wiki/MECHANICS.md`, `wiki/topics/graph-wiki-subsystem.md`, this journal

## Follow-ups

- Verify the focused path on a wiki bot PR and its main push.
