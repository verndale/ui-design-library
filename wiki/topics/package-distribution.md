---
aliases: [npm package, package exports, semantic release, exact-version consumption]
covers: [package.json, MIGRATION.md, styles.css, tsconfig.build.json, scripts/build-exports.cjs, release.config.cjs, .github/workflows/release.yml]
---
# Package distribution — Design History

How the source component library becomes a deterministic public npm contract.

## Current state

- The source version is `0.0.0-development`; semantic-release owns published versions and never commits a version bump.
- Public code imports mirror component directories: `@verndale/ui-design-library/components/<directory>`. There is no root barrel or short alias.
- Each public component subpath targets `dist/components/<directory>/index.js`; the facade keeps imports stable while private implementation files change.
- `./package.json`, each `component.json`, and `./styles.css` are explicit package exports because the orchestration driver resolves them as contract data.
- `MIGRATION.md` ships in the package so breaking API changes are available beside the installed code.
- `tsc` emits per-component ESM and declarations. Story and test files are excluded from `dist`, while source stories remain in the package for inspection.
- The committed export map is derived by `pnpm exports:sync`; test, build, and prepack only check it and fail on drift.
- `styles.css` contains semantic tokens but does not import Tailwind. Consumers own the Tailwind import and register package `dist` with one explicit `@source`.
- Every manifest separates API `slots`, structural `variant`, style `variants`, and the governed `reuseFingerprint` triad.
- Every merge to `main` is queued through one release workflow and maps the squash commit to a major, minor, or patch publication.
- The first publish uses an npm token. Later releases use npm trusted publishing through GitHub OIDC.

## Decisions

- 2026-08-12 — Retargeted every directory-shaped export to its compiled `index.ts` facade instead of a concrete implementation filename, preserving the public import while allowing private tree/branch/leaf refactors ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-05 — Chose explicit directory-shaped exports and a checked committed map over a root barrel or build-time package mutation, so one component directory has one stable public identity ([plan](../plans/2026-08-05-npm-package-and-ai-reuse.md), [journal](../journal/2026-08-05-npm-package-and-ai-reuse.md)).
- 2026-08-05 — Added a separate governed reuse fingerprint instead of reinterpreting the library's API-level slots, because the two vocabularies describe different contracts ([plan](../plans/2026-08-05-npm-package-and-ai-reuse.md), [journal](../journal/2026-08-05-npm-package-and-ai-reuse.md)).

## Open threads

- Complete the one-time npm `1.0.0` bootstrap, configure trusted publishing, and remove `NPM_TOKEN`.
