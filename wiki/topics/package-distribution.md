---
aliases: [npm package, package exports, semantic release, exact-version consumption]
covers: [package.json, styles.css, tsconfig.build.json, scripts/build-exports.cjs, scripts/test-next.cjs, scripts/check-release-commit.cjs, release.config.cjs, .github/workflows/release.yml]
---
# Package distribution — Design History

How the source component library becomes a deterministic public npm contract.

## Current state

- The source version is `0.0.0-development`; semantic-release owns published versions and never commits a version bump.
- Public code imports mirror component directories: `@verndale/ui-design-library/components/<directory>`. There is no root barrel or short alias.
- Each public component subpath targets `dist/components/<directory>/index.js`; the facade keeps imports stable while private implementation files change.
- `./package.json`, each `component.json`, and `./styles.css` are explicit package exports because the orchestration driver resolves them as contract data.
- `tsc` uses NodeNext-compatible resolution and emits per-component ESM, declarations, and explicit `.js` relative specifiers that load in native Node. Story and test files are excluded from `dist`, while source stories remain in the package for inspection.
- The committed export map is derived by `pnpm exports:sync`; test, build, and prepack only check it and fail on drift.
- `styles.css` contains semantic tokens but does not import Tailwind. Consumers own the Tailwind import and register package `dist` with one explicit `@source`.
- Package metadata declares reuse contract v2 and realization contract v1. Every manifest separates API `slots`, structural `variant`, primary-export style `variants`, and the governed primary `reuseFingerprint`, names the primary candidate through `exportName` plus derived `rendering`, and publishes a digestible exact realization.
- `ACCESSIBILITY.md` is generated from the shipped manifests and checked for byte drift. It distinguishes component-owned reference-fixture guarantees from consuming-page obligations and does not claim whole-page conformance or VoiceOver certification.
- Primary style metadata cannot borrow prop literals from a secondary facade export. The architecture gate rejects values found only on a secondary `<ExportName>Props` contract; this closed the discovered `Stat`/`StatGroup.orientation` leak.
- Packed verification dynamically imports all 21 component subpaths and checks each primary named export before building the Next/Tailwind fixture.
- Every merge to `main` is queued through one release workflow and maps the squash commit to a major, minor, or patch publication.
- npm publishing uses trusted publishing through GitHub OIDC; the workflow carries no long-lived npm token.
- Release preflight scans every commit after the latest reachable release tag and rejects body-form breaking-change notes. Intentional breaking releases use `!` in a PR title, and squash merges retain only that title as the release commit.

## Decisions

- 2026-08-22 — Kept package build and the packed Next consumer in the complete CI gate rather than pre-push, made the root Conventional Commit policy authoritative for local messages, the immutable PR title/range, and semantic-release inputs, and removed stale packaging/documentation pointers to the already-absent `MIGRATION.md` rather than publishing a nonexistent file ([issue #83](https://github.com/verndale/ui-design-library/issues/83), [plan](../plans/2026-08-22-cross-repository-lint-commitlint-and-graph-standardization.md), [journal](../journal/2026-08-22-standardize-lint-commitlint-and-graph-automation.md)).
- 2026-08-13 — Shipped accessibility metadata with the executable package instead of keeping it in prose, so orchestration can hash and replay the exact public invocation, DOM, and ownership contract. Browser engines remain library CI dependencies rather than consumer setup dependencies ([plan](../plans/2026-08-13-realization-first-reuse-wcag-22-aa.md), [journal](../journal/2026-08-13-accessible-realization-contracts.md)).
- 2026-08-12 — Introduced reuse contract v2 and packed native-import verification because the `4.0.1` export map resolved to ESM files whose extensionless internal specifiers did not execute in Node ([plan](../plans/2026-08-12-executable-esm-reuse-contract-v2.md), [journal](../journal/2026-08-12-executable-esm-reuse-contract-v2.md)).
- 2026-08-12 — Removed the npm-token fallback and semantic-release issue mutation in favor of one OIDC publisher and immutable npm/GitHub release outputs ([plan](../plans/2026-08-12-executable-esm-reuse-contract-v2.md), [journal](../journal/2026-08-12-executable-esm-reuse-contract-v2.md)).
- 2026-08-12 — Rejected body-form `BREAKING CHANGE` notes during release preflight because GitHub squash descriptions can aggregate stale commit bodies; an intentional major is expressed once with `!` in the PR title ([plan](../plans/2026-08-12-executable-esm-reuse-contract-v2.md), [journal](../journal/2026-08-12-executable-esm-reuse-contract-v2.md)).
- 2026-08-13 — Expanded release preflight from `HEAD` to the complete last-release-to-`HEAD` range, covering queued recovery runs where semantic-release still analyzes commits preceding the latest clean merge ([plan](../plans/2026-08-12-executable-esm-reuse-contract-v2.md), [journal](../journal/2026-08-12-executable-esm-reuse-contract-v2.md)).
- 2026-08-12 — Retargeted every directory-shaped export to its compiled `index.ts` facade instead of a concrete implementation filename, preserving the public import while allowing private tree/branch/leaf refactors ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-05 — Chose explicit directory-shaped exports and a checked committed map over a root barrel or build-time package mutation, so one component directory has one stable public identity ([plan](../plans/2026-08-05-npm-package-and-ai-reuse.md), [journal](../journal/2026-08-05-npm-package-and-ai-reuse.md)).
- 2026-08-05 — Added a separate governed reuse fingerprint instead of reinterpreting the library's API-level slots, because the two vocabularies describe different contracts ([plan](../plans/2026-08-05-npm-package-and-ai-reuse.md), [journal](../journal/2026-08-05-npm-package-and-ai-reuse.md)).

## Open threads

- Before merging issue #31, configure npm trusted publishing for `verndale/ui-design-library` and `.github/workflows/release.yml`, and configure GitHub squash commits to use the PR title with a blank description.
- After the merge, confirm npm `latest` is `4.1.0`, provenance names the release workflow, all 21 native imports load, and then delete the obsolete `NPM_TOKEN` repository secret.
