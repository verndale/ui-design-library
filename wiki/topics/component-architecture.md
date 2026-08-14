---
aliases: [component architecture, server-first components, use client boundaries, React Server Components, SSR safety, tree branch leaf]
covers: [components, scripts/check-component-architecture.cjs, scripts/check-contracts.cjs, tests/ssr, scripts/test-next.cjs, MIGRATION.md, tsconfig.build.json]
---
# Component architecture — Design History

How public component facades preserve stable imports while implementation trees keep hydration and framework coupling narrow.

## Current state

- Every `components/<directory>/` has a stable root `index.ts`; package exports resolve the directory-shaped public subpath to its compiled facade.
- Public props and supporting types live in exactly one root `<Component>.types.ts` module.
- Every component has at least two meaningful non-story TSX modules, split into a public tree and private branches/leaves under `parts/`.
- Server compatibility is the default. A server or mixed facade has no directive; a wholly client-only facade carries `'use client'`.
- Modules that own hooks or browser behavior use the `.client.ts(x)` suffix and stay at or below 120 physical lines.
- Browser globals are allowed only inside client effects and handlers, never during module evaluation or render. The architecture check follows relative imports and local call graphs so a neutral helper cannot hide render-time access, and it applies the same rules to shared `src/lib` modules.
- Accordion and In-page navigation are hybrid: their public landmarks/containers are server-compatible and their disclosure, observer, and state branches hydrate independently.
- Alert and Badge expose server-safe base components beside explicitly interactive dismissible exports.
- Every manifest names one primary value export and declares its `server`, `hybrid`, or `client` rendering boundary. The architecture gate follows only that export's runtime graph, including relative side-effect imports and statically named dynamic imports, so secondary facade exports do not widen a server primary while hidden client dependencies do.
- Every primary manifest also publishes realization contract v1: its public prop types/defaults, exact owned semantic tree, conditional branches, IDREF relationships, owned behavior evidence, safe style slots, and governed caller responsibilities. The contract checker rejects unresolved references, ancestry cycles, and unsafe semantic alternatives.
- All primary components expose typed `classNames` slot maps. Accessibility-owned nodes protect focus, visibility, semantics, and interaction properties instead of transferring those invariants to consumers.
- Stories import only `./index`, so tests exercise the same facade as package consumers.
- `pnpm architecture` enforces shape and boundaries; `pnpm test:ssr` checks DOM-free rendering.
- Modal and Search overlay share a document-level overlay stack. Only its top entry traps focus, handles Escape, and exposes modal semantics; scroll locking is reference-counted across the stack.
- Carousel renders nothing for an empty slide list, so it never announces an impossible position or exposes inert controls.
- The core rejects `next/*` imports. Next is a development-only compiled-package consumer fixture run by `pnpm test:next` through `pnpm verify`.

## Decisions

- 2026-08-13 — Defined an accepted package realization as the complete component-owned subtree, with page headings and landmarks composed outside it. SearchInput uses native search semantics and generic label/name seams, while Breadcrumbs exposes responsive, trail, and back-link presentations; consuming design remains governed through public props and protected style slots ([journal](../journal/2026-08-13-accessible-realization-contracts.md)).
- 2026-08-13 — Closed realization ambiguity after adversarial review: conditional and repeated nodes require machine-readable declarations, safe element alternatives require exhaustive prop-backed selection, Tabs owns its panels, and modal background inerting is shared by the two dialog components. Developer composition remains available through content props and typed `classNames`; automated reuse is limited to those governed seams ([issue #40](https://github.com/verndale/ui-design-library/issues/40), [plan](../plans/2026-08-13-realization-first-reuse-wcag-22-aa.md), [journal](../journal/2026-08-13-accessible-realization-contracts.md)).
- 2026-08-13 — Made package-owned DOM and accessibility behavior an executable manifest contract before consumer authoring. Unsafe semantic alternatives are excluded or constrained by required naming props, and component-owned invariants cannot be waived through style slots ([plan](../plans/2026-08-13-realization-first-reuse-wcag-22-aa.md), [journal](../journal/2026-08-13-accessible-realization-contracts.md)).
- 2026-08-12 — Made the primary named export and its derived rendering graph explicit reuse metadata, keeping secondary developer exports public without multiplying AI candidates ([plan](../plans/2026-08-12-executable-esm-reuse-contract-v2.md), [journal](../journal/2026-08-12-executable-esm-reuse-contract-v2.md)).
- 2026-08-13 — Closed rendering-graph omissions for relative side-effect and static dynamic imports after an adversarial server-to-client fixture passed the original classifier ([plan](../plans/2026-08-12-executable-esm-reuse-contract-v2.md), [journal](../journal/2026-08-12-executable-esm-reuse-contract-v2.md)).
- 2026-08-12 — Kept directory-shaped public imports stable through per-component `index.ts` facades, allowing internal tree/branch/leaf files to evolve without exposing their names ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-12 — Made server-compatible the default and limited `.client.ts(x)` modules to 120 physical lines, because `'use client'` marks a module-graph boundary rather than an SSR opt-out ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-12 — Split optional Alert/Badge interaction into named dismissible exports and replaced Carousel render callbacks with node slots, keeping Server-to-Client props serializable ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-12 — Kept Next outside the runtime contract and used it only as a compiled consumer test, rather than adding framework adapters to the library core ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-12 — Made architecture enforcement graph-aware and recursive through shared primitives; filename conventions alone were insufficient because a neutral helper or undirected `.client` import could hide a runtime boundary violation ([plan](../plans/2026-08-12-server-first-component-architecture.md), [journal](../journal/2026-08-12-server-first-component-architecture.md)).
- 2026-08-12 — Centralized concurrent dialog ownership in a shared overlay stack, so Escape, focus trapping, modal semantics, focus restoration, and scroll locking compose across Modal and Search overlay instead of each instance treating itself as the only overlay ([journal](../journal/2026-08-12-server-first-component-architecture.md)).
