---
date: 2026-09-17
topics: [story-testing]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/100
issue: https://github.com/verndale/ui-design-library/issues/98
issues: ["https://github.com/verndale/ui-design-library/issues/98","https://github.com/verndale/ui-design-library/issues/99","https://github.com/verndale/ui-design-library/issues/101"]
---
# Restore Vitest browser compatibility

## Why

- The grouped dependency update advanced Vitest to 5.0.0 without advancing its 4.1.10 browser adapters.
- Every browser-backed suite then failed during server creation before Storybook accessibility, mode, or motion tests could start.
- Current Library changes could no longer satisfy the required full verification gate on `main`.

## What changed

- Pinned Vitest, the browser package, and the Playwright adapter to exact 4.1.10 so all peers share one known-good release instead of drifting independently within a range.
- Regenerated the lockfile from the pinned manifest instead of suppressing or bypassing browser verification.

## Files

- `package.json`
- `pnpm-lock.yaml`

## Follow-ups

- Upgrade the complete Vitest browser package family together when Storybook supports the same release line.
