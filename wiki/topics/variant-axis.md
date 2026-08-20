---
aliases: [variant axis, structural variant, native variant, compound slug, one canonical many implementations, slug--variant, mega menu vs nav bar]
covers: [scripts/check-contracts.cjs, components/in-page-navigation, components/in-page-navigation--modal-drawer, components/tabs, components/tabs--native-select, figma/library.json]
---
# Variant axis — Design History

How one catalog canonical fronts more than one structurally-distinct implementation while the lookup stays deterministic.

## Current state

- A canonical resolves to a directory. Default implementation: `components/<slug>/`, `slug == kebab(canonical)`. Structurally-distinct alternates: `components/<slug>--<variant>/`, same `canonical` and `slug`, a distinct `variant`.
- `component.json` carries `variant` (singular, the structural axis) and, on exactly one implementation per canonical, `default: true`. The existing `variants` array is unrelated — prop-value options within one implementation (Button's primary/secondary/ghost).
- The key is `(canonical, variant)` → directory. Single-implementation canonicals carry neither field and are unchanged.
- `scripts/check-contracts.cjs` validates the axis: a directory name splits on `--` into `(base, variant)` (exactly one `--`, both halves kebab; a valid slug never contains `--` because `kebab()` collapses separator runs, so the split is a bijection); `slug == base == kebab(canonical)`; one `default` per canonical living in the bare dir; unique `variant` values; consistent `canonical` spelling; and variant story titles that nest as `<Canonical> / <label>` so the Storybook sidebar and story-id namespace don't collide.
- The checker exports `check()`; `scripts/check-contracts.selftest.cjs` exercises the axis against fixtures and runs in the `pnpm test` gate as `contracts:selftest`.
- The catalog (`ui-design-brain`) still resolves a label to one canonical; the library picks the structure. Project-retrospective schema v4 now keys capture files and lifecycle by exact `(canonical, variant)`, so default and alternate imports remain distinct from analysis through landing.
- `figma/library.json` mirrors the structural identity with optional `variant`, `variantLabel`, `default`, and `familyPage`. Structural siblings share a canonical family page; the default master retains the canonical name and alternates use `Canonical / Variant label`.
- In-page navigation is the first complete end-to-end family in an issue worktree: `inline-disclosure` remains the bare default and `modal-drawer` resolves through the qualified sibling directory, export, Storybook title, Figma master, and AI registration.
- Tabs is the second complete family: `tablist` remains the bare default while `native-select` resolves through `components/tabs--native-select/` and the qualified unpublished Figma master on the same family page.

## Decisions

- 2026-08-20 — Preserved Tabs `tablist` as the bare default and added the exact `native-select` sibling while sharing one controller and panel model across the responsive structures ([plan](../plans/2026-08-19-source-parity-audit-and-remediation.md), [journal](../journal/2026-08-20-tabs-source-parity.md)).
- 2026-08-20 — Completed the first governed structural family in its issue worktree by preserving In-page navigation's inline-disclosure default and adding the modal-drawer sibling on the same Figma family page without moving the default master ([plan](../plans/2026-08-19-source-parity-audit-and-remediation.md), [journal](../journal/2026-08-20-in-page-navigation-source-parity.md)).
- 2026-08-19 — Extended the native code axis into capture and Figma contracts: exact compound capture keys feed exact public imports and separately qualified masters, while semantic role/affordance/interaction changes still mint a different canonical ([plan](../plans/2026-08-19-figma-structural-family-contract.md), [journal](../journal/2026-08-19-figma-structural-family-contract.md)).
- 2026-07-30 — Added a native structural `variant` axis with compound sibling directories `components/<slug>--<variant>/` (Option B), over nesting under `components/<slug>/<variant>/` (A) or overloading the prop-value `variants` array (C): a flat `components/*` scan still finds every implementation, the contract checker and graph builder keep one `component.json` per directory, and the two axes (structural vs prop-value) stay distinct and resolve independently. Story titles are checker-enforced to nest under the canonical to prevent sidebar collision ([plan](../plans/2026-07-30-variant-axis.md), [journal](../journal/2026-07-30-variant-axis.md)).
