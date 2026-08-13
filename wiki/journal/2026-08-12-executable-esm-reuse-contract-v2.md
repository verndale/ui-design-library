---
date: 2026-08-12
topics: [package-distribution, component-architecture]
plan: plans/2026-08-12-executable-esm-reuse-contract-v2.md
pr: pending
---
# Publish executable ESM and reuse contract v2

## Why

- npm `4.0.1` exposed all intended component subpaths, but their emitted extensionless relative specifiers failed under native Node ESM.
- Orchestration could read fingerprints but could not deterministically identify the primary value export or its server/client boundary.
- Semantic-release was attempting historical issue comments and could infer unintended majors from breaking-change text aggregated into squash bodies.

## What changed

The build now uses NodeNext-compatible resolution and explicit `.js` relative specifiers. Packed verification installs the tarball, dynamically imports all 21 public component subpaths, asserts every manifest-declared `exportName`, and then proves the existing Next/Tailwind consumer.

Package reuse contract v2 adds `exportName` and derived `rendering` to each manifest. Fingerprints and style variants now unambiguously describe that primary export; secondary named exports remain public developer APIs. Alert and Badge metadata no longer describes their dismissible secondary exports.

The adversarial follow-up closed two non-happy paths before merge: rendering derivation now includes relative side-effect and statically named dynamic imports, and release preflight scans the complete commit range after the latest release tag instead of trusting only `HEAD`.

The release workflow now relies only on npm trusted publishing, suppresses semantic-release issue mutations, and rejects body-form breaking-change notes. Repository and npm settings remain maintainer-owned gates before the merge that should publish `4.1.0`.

## Files

- `components/*/component.json`
- `components/**/*.ts(x)` and `src/lib/**/*.ts(x)`
- `scripts/check-component-architecture.cjs`
- `scripts/check-contracts.cjs`
- `scripts/test-next.cjs`
- `scripts/check-release-commit.cjs`
- `package.json`, `tsconfig.build.json`, `release.config.cjs`
- `.github/workflows/release.yml`

## Follow-ups

- Configure the trusted npm publisher and squash-merge commit settings before merge.
- After automatic publication, verify `4.1.0`, provenance, and all native imports before the orchestration rollout and Mimecast probes.
