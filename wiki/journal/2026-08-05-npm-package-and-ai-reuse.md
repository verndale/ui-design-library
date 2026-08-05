---
date: 2026-08-05
topics: [package-distribution]
plan: plans/2026-08-05-npm-package-and-ai-reuse.md
pr: https://github.com/verndale/ui-design-library/pull/19
---
# Publish the UI library as a deterministic npm package

## Why

- Source/submodule consumption gave the orchestration pipeline no versioned, installable component contract.
- The library's existing API `slots` could not be compared with the pipeline's governed reuse fingerprint vocabulary without false matches.
- A release after every merge needed to be automatic and serialized; no maintainer should calculate versions or run `npm publish`.

## What changed

- Added deterministic ESM/declaration output and directory-shaped component exports, including explicit metadata and stylesheet exports but no root barrel.
- Added a governed `reuseFingerprint` to all 20 manifests while preserving the separate API slots, structural variant, and style variants contracts.
- Added read-only export/build parity gates; only the deliberate `pnpm exports:sync` command rewrites the committed map.
- Added the semantic token package stylesheet and documented the consumer-owned Tailwind import and package `@source`.
- Added a queued semantic-release workflow: breaking changes are major, features minor, and every other permitted commit type patch.
- Standardized package metadata on the repository's existing MIT license.
- Added `storybook/viewport` to the explicit Vitest prebundle set after a clean dependency cache exposed a mid-run Vite reload; the clean-cache rerun passes.

## Files

- `package.json`, `tsconfig.build.json`, `styles.css`, `release.config.cjs`
- `scripts/build-exports.cjs`, `scripts/check-contracts.cjs`
- `.github/workflows/release.yml`
- `components/*/component.json`

## Follow-ups

- The maintainer must merge the branch with the one-time npm token configured, verify `1.0.0`, configure trusted publishing, and revoke the token.
- AI-orchestration package reuse and isolated Mimecast probes are tracked in the cross-repo plan and issue #489.
