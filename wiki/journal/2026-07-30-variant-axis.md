---
date: 2026-07-30
topics: [variant-axis]
plan: plans/2026-07-30-variant-axis.md
pr: pending
---
# Native variant axis

## Why

- One catalog canonical can front more than one structurally-distinct implementation — Navigation is both a plain bar and a mega menu — but the keying allowed exactly one directory per canonical, so the second had nowhere to land without overwriting the first.
- The existing `component.json.variants` array is prop-value options within a single implementation (Button's primary/secondary/ghost). It cannot express "a different structure entirely", and overloading it would conflate two axes that resolve differently.
- The lookup had to stay deterministic: a resolved label still maps to one canonical, and the pipeline must be able to ask for a specific structure without guessing.

## What changed

- Added a structural `variant` axis (singular) alongside the untouched prop-value `variants` array. The default implementation keeps the bare `components/<slug>/` and gains `variant` + `default: true`; each alternate is a sibling `components/<slug>--<variant>/` with the same `canonical` and `slug`, its own `variant`, and no `default`. The key is `(canonical, variant)` → directory. Single-variant canonicals — all eleven today — are unchanged and need neither field.
- Chose compound sibling directories (Option B) over nesting under `components/<slug>/<variant>/` (A) or overloading `variants` (C): a flat `components/*` scan still finds every implementation, the contract checker and graph builder keep reading one `component.json` per directory, and `<slug>--<variant>` stays greppable and importable. Since `kebab()` can never emit `--`, splitting a directory name on `--` is a provable bijection to `(base, variant)`.
- Extended `scripts/check-contracts.cjs` to validate the axis: a `decompose()` split-arity guard, base-aware `slug`/`canonical` agreement, `variant`/`default` field checks, a story-title anti-collision check (default title is the canonical, alternates nest as `<Canonical> / <label>`), and a cross-canonical pass (one default per canonical, unique variant names, consistent canonical spelling, distinct titles). Refactored the checker to export `check()` so the invariants are unit-testable.
- Added `scripts/check-contracts.selftest.cjs` (nine fixture cases, plain-node, mirrors `scripts/evals/*`) and wired `contracts:selftest` into the `pnpm test` gate — a validated axis needs a tested validator.
- `scripts/graph/build-graph.cjs` now disambiguates alternate node labels (`<canonical> (<variant>)`) so variants don't render as duplicate nodes.
- Documented the axis additively in README, AGENTS, and CONTRIBUTING without implying the eleven single-variant components changed.

## Files

- `scripts/check-contracts.cjs` — the axis validation + `check()` export
- `scripts/check-contracts.selftest.cjs` (new), `package.json` — the self-test and gate wiring
- `scripts/graph/build-graph.cjs` — variant-aware node labels
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`

## Follow-ups

- **Downstream (`project-retrospective`, verndale/project-retrospective#12).** That repo owns the capture-file contract (`captures/<kebab-canonical>.md` ↔ `components/<slug>/`, slug-equality + one capture file per canonical, `capture-preflight.cjs`). Under this scheme it must generalise to one capture file per `(canonical, variant)`: default stays `captures/<kebab-canonical>.md`, each alternate is `captures/<kebab-canonical>--<variant>.md`, and the preflight's "one file per canonical" rule becomes "one file per (canonical, variant)". The capture template and its report-parity check need the `variant`/`default` fields too. Reading its `capture-preflight.cjs`: key `record.slug` on the composed key (fixes a latent `findOrphanedByRun` false-positive that would flag every alternate dir as orphaned), scaffold the variant-encoded story title, and never re-kebab a composed key (its `-{2,}→-` collapse would destroy the `--`). Tracked there, not here.
- The axis is defined, enforced, and tested but **unused**: no structural variant is captured yet. The first real alternate capture (and the story-title convention in practice) is the second entry on this thread.
- Tracking issue: [verndale/ui-design-library#4](https://github.com/verndale/ui-design-library/issues/4).
