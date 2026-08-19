---
aliases: [Figma library, Code Connect history, Ready for Dev, design-to-code, Figma node identity]
covers: [figma, scripts/check-figma-coverage.cjs, scripts/check-figma-contracts.cjs, scripts/check-figma-live.cjs, .github/workflows/figma-library-validation.yml]
---
# Figma library — Design History

How stable Figma component identity maps design instances to the package's governed public React API.

## Current state

- The Organization-tier [UI Design Library](https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library) is the sole governed Figma source for promoted component masters.
- Seven published pilot nodes retain their immutable node IDs and component keys: Button Light, Button Dark, Section header, Alert, Card, CardMedia, and Modal.
- Sixteen additional supported components are registered and Ready for Dev but remain unpublished: Avatar, Badge, Link, Image, Quote, Rich text, Stat, Search input, Slider, Breadcrumbs, Accordion, Tabs, Toast, In-page navigation, Carousel, and Search overlay.
- Registered master names equal the ui-design-brain canonical names. Button surface context is expressed by two stable Button component sets, not by renaming the canonical.
- Every component page starts with a green `✅ Ready for Dev` section. Its 528px documentation rail stays at x=0 and copies Button Light's structure exactly: accent, eyebrow, title, description, public import, five property rows, side-by-side Usage and Accessibility cards, then code-only props. Main, responsive specimens, and publish sources stay to its right.
- Component pages use one direct canonical instance as the developer handoff target. Viewport labels, variant labels, and presentation panels remain outside that component-only instance, so ui-design-brain naming stays visible.
- Compact matrices are used where variants matter more than viewport behavior; responsive specimens use governed 1440, 1024, 768, and 390px canvases; overlays use exact full-viewport presentation. A viewport canvas never grants permission to stretch an intrinsic component: Slider is capped at 520px and compresses to the 350px mobile content width, while intentionally fluid components fill the width their consumer supplies.
- Presentation layouts use Auto Layout, semantic layer names, and Figma variables. Specimen surfaces, padding, annotation gaps, variant gaps, viewport-row gaps, and Section insets are registered against the code library's Tailwind semantic tokens; Cumulative Foundations supplies documentation presentation only.
- Organization mode capacity is governed centrally: one `Cumulative` default plus at most 19 active client modes. The library does not depend on Enterprise extended collections or duplicated client component libraries.
- `figma/library.json` owns target-file policy, stable node identity, story/property partitions, review evidence, and nested dependency references. Replacing a node requires an explicit migration record.
- `pnpm figma:validate` checks code-to-Figma coverage and registry contracts, then runs the read-only live-node audit when `FIGMA_REST_TOKEN` is available. `pnpm figma:live` requires that token; fixture self-tests cover missing visual property references, unstyled semantic text, raw colors, raw spacing, and property-type drift.
- Visible Figma properties must reference descendant layers. HTML-, runtime-, and accessibility-only values are explicitly marked `visualBinding: "nonvisual"` with a reason so disconnected visible properties cannot hide behind an implicit exception.
- `figma/PROMOTION-CHECKLIST.md` is the required future-component workflow. The registry and self-tested contract reject wrapper-based handoff targets, breakpoint drift, missing promotion definition-of-done items, and token snapshot drift.
- `pnpm figma:coverage` requires every candidate or supported manifest to have a primary Figma registration matching its path, canonical, slug, and primary export. Candidates are created and reviewed immediately but must remain unpublished.
- `pnpm test:code` is the complete pre-Figma gate: types, lint, architecture/contracts and their fixtures, SSR, Storybook behavior, Chromium/WebKit accessibility, modes, and reduced motion without Figma-dependent coverage.
- Every registration records a passed Button-standard adversarial/design review and a repository journal evidence path that names the registered node. A missing result, duplicate/missing pass type, standard, journal file, or node identity is a contract failure.
- CI requires only `FIGMA_REST_TOKEN` for read-only live file-content validation. Contracts reject Code Connect dependencies, scripts, configuration, registry templates, and CI references because AI orchestration consumes canonical npm subpaths directly.

## Decisions

- 2026-08-18 — Required exact primary identity, node-specific review proof, exact validation command composition, duplicate-property rejection, and repository-wide Code Connect artifact rejection after adversarial testing demonstrated that looser presence checks could be bypassed ([journal](../journal/2026-08-18-adversarial-review-governed-figma-capture.md)).
- 2026-08-18 — Removed Code Connect as an option rather than retaining dormant metadata: npm canonical slugs are the sole code-consumption contract, and repository checks reject its reintroduction ([plan](../plans/2026-08-18-governed-code-to-figma-capture.md), [journal](../journal/2026-08-18-governed-code-to-figma-capture.md)).
- 2026-08-18 — Made unpublished Figma creation and a recorded adversarial/design review part of component capture completion, enforced code-to-Figma coverage for candidates and supported components, and kept publication separate ([plan](../plans/2026-08-18-governed-code-to-figma-capture.md), [journal](../journal/2026-08-18-governed-code-to-figma-capture.md)).

- 2026-08-18 — Kept Code Connect templates as optional parse-only metadata and removed the authenticated dry-run/token path because the AI orchestration already resolves canonical components from the npm package; retained the single read-only REST credential for live Figma drift detection ([journal](../journal/2026-08-18-figma-rest-only-validation.md)).
- 2026-08-18 — Closed the adversarial-review gaps by restoring the exact left documentation rail and responsive sizing pattern, governing shared variables/text styles and component spacing, binding every visible property, recording intentional nonvisual mappings, and adding an authenticated read-only live-node CI audit ([plan](../plans/2026-08-18-figma-adversarial-remediation.md), [journal](../journal/2026-08-18-figma-adversarial-remediation.md)).
- 2026-08-18 — Promoted the remaining sixteen supported components with the documentation rail on the left, Main immediately right, publish sources farther right, and a code-derived intrinsic-versus-fluid sizing rule; kept the new Figma assets and Code Connect records unpublished for maintainer review ([plan](../plans/2026-08-18-figma-supported-batch.md), [journal](../journal/2026-08-18-figma-supported-batch.md)).
- 2026-08-18 — Standardized every pilot page on direct canonical component instances, external annotations, token-bound whitespace, and audited responsive specimens; encoded the same pattern as the required future promotion contract instead of relying on visual convention ([plan](../plans/2026-08-18-figma-code-connect-pilot.md), [journal](../journal/2026-08-18-figma-code-connect-pilot.md)).
- 2026-08-18 — Established stable published node identity as a release contract, made Button Light the documentation template, kept component visuals on library Tailwind semantic tokens, and adopted parserless public-facade Code Connect mappings with dynamic nested instances ([issue #49](https://github.com/verndale/ui-design-library/issues/49), [plan](../plans/2026-08-18-figma-code-connect-pilot.md), [journal](../journal/2026-08-18-figma-code-connect-pilot.md)).

## Open threads

- Confirm target-file Organization ownership and releasing-account library publish permission before first publication.
- Configure the repository's read-only `FIGMA_REST_TOKEN` secret and replace the temporary personal token with an Organization Plan Access Token when IT provisions one.
- After explicit Figma library publication, verify all twenty-three nodes from a separate consumer file and record npm-orchestration smoke-test evidence.
