---
date: 2026-08-12
topics: [component-architecture, package-distribution]
plan: plans/2026-08-12-server-first-component-architecture.md
pr: pending
---
# Adopt server-first component architecture

## Why

- Every component was one implementation TSX file, so one interactive detail promoted the whole component into a client boundary and left nine `'use client'` files over 120 lines.
- React Server Component consumers need stable, serializable APIs and SSR-safe initial markup; the old Button polymorphism and Carousel render callbacks worked against that boundary.
- The work was tracked in [issue #26](https://github.com/verndale/ui-design-library/issues/26).

## What changed

- Gave every component a stable `index.ts` facade, a separate public types module, and meaningful tree/branch/leaf implementation files. Package exports now target the facade while the directory-shaped consumer import stays unchanged.
- Made server compatibility the default. Client modules use a `.client.ts(x)` suffix, own only the behavior that needs hydration, and are capped at 120 physical lines. Accordion and In-page navigation became server trees with narrow client leaves; wholly interactive components keep client facades.
- Split optional interaction from presentation: Alert and Badge now have server-safe base exports plus `DismissibleAlert` and `DismissibleBadge`; Button is a native server-compatible button with explicit surface; Carousel accepts serializable icon nodes instead of render callbacks.
- Added recursive architecture/framework checks, Node SSR rendering, and a compiled-package Next consumer fixture. The checks follow local import/call graphs, inspect shared `src/lib`, and reject hidden browser globals, client hooks, or undirected client imports. Next is development-test-only; the published core still rejects `next/*` imports.
- Made Modal and Search overlay participate in one shared overlay stack: only the top layer owns Escape, focus containment, and modal semantics, while a reference-counted document lock stays active until the final overlay closes.
- Defined Carousel's zero-slide state as no rendered carousel, avoiding impossible “1 of 0” status output and disabled navigation chrome.
- Added a packaged `MIGRATION.md` and consumer examples for server and client use.

## Files

- `components/`
- `scripts/check-component-architecture.cjs`
- `scripts/check-contracts.cjs`
- `src/lib/overlayStack.client.ts`
- `tests/ssr/`
- `scripts/test-next.cjs`
- `MIGRATION.md`
- `README.md`

## Follow-ups

- Publish the API changes as a breaking release and keep the Next fixture pinned as framework behavior evolves.
