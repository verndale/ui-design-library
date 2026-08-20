# Context Wiki

Why this repo is the way it is: executed plans, decisions, and change history. Read this index first; open only the pages it routes to.

## Contents

- How to navigate
- Topics
- Journal
- Plans
- Connections
- Differences from ui-design-brain's wiki

## How to navigate

1. "Why is X like this / what's the design of X" → match X in Topics below; open that one page.
2. "What changed when / history of X" → scan the Journal lines below; open only matching entries.
3. "Was plan X implemented / what plans exist" → [plans/INDEX.md](plans/INDEX.md) is the audit table; archived plan files sit next to it.
4. Full plan detail behind a change → follow the plan link inside the journal entry or topic page.
5. "How does X wire to the rest of the components/wiki" → [connections.md](connections.md), a small index over the generated map; open the section your question needs: [components](connections/components.md), [wiki wiring](connections/wiki-wiring.md).
6. Cross-system "why", wiring, or impact question → `pnpm graph:navigate --intent why|wiring|impact --query <term>` returns a deterministic, minimal itinerary.
7. No index hit or no route → grep `wiki/` for the term; then fall back to `git log` / `gh`. Never load the whole wiki.

## Topics

<!-- One line per topic page: [Title](topics/<slug>.md) — hook. Keep alphabetical by slug. -->

- [Component architecture](topics/component-architecture.md) — stable public facades, server-first tree/branch/leaf files, narrow client boundaries, and SSR/Next consumer verification.
- [Figma library](topics/figma-code-connect.md) — stable Figma node identity, Ready for Dev organization, recorded design review, and read-only live validation.
- [Knowledge graph & wiki automation](topics/graph-wiki-subsystem.md) — the deterministic graph + Sigma.js viewer and the wiki-sync / wiki-issue-sync bots, ported from ui-design-brain.
- [Package distribution](topics/package-distribution.md) — deterministic npm exports, compatibility metadata, Tailwind consumption, and queued semantic releases.
- [Story testing](topics/story-testing.md) — the story-as-test layer: the runner, what belongs in a `play` function, the a11y gate, and the reduced-motion project.
- [Storybook tooling](topics/storybook-tooling.md) — the browsing and review surface: autodocs, pseudo-states, the direction toggle, maturity badges, viewport and backgrounds.
- [Variant axis](topics/variant-axis.md) — one catalog canonical, more than one structurally-distinct implementation, keyed `(canonical, variant)` → `components/<slug>--<variant>/`.

## Journal

<!-- Reverse-chronological, one line per entry: YYYY-MM-DD — [Title](journal/<file>.md) — hook. -->

- 2026-08-19 — [Add source-parity governance to the library](journal/2026-08-19-source-parity-governance-foundation.md) — linked all 21 component surfaces to immutable private decisions and constrained the legacy baseline to five accepted remediations.
- 2026-08-19 — [Document Card media presence as composition](journal/2026-08-19-card-media-composition-specimens.md) — added direct Card instances with and without connected CardMedia while preserving the published master and public property contract.
- 2026-08-19 — [Govern structural variants as Figma families](journal/2026-08-19-figma-structural-family-contract.md) — registry and validators now resolve exact structural imports to qualified masters on one canonical family page.
- 2026-08-19 — [Correct Tabs spacing and Search overlay containment](journal/2026-08-19-correct-tabs-search-overlay-figma-layout.md) — bound the Tabs panel gap to `spacing/m` in code and Figma, and restored hug-content Search overlay heights so active and wrapped mobile content remains inside the raised surface.
- 2026-08-18 — [Harden governed Figma capture after adversarial review](journal/2026-08-18-adversarial-review-governed-figma-capture.md) — closed canonical, evidence, command-composition, duplicate-property, and hidden Code Connect bypasses.
- 2026-08-18 — [Make reviewed Figma coverage part of component capture](journal/2026-08-18-governed-code-to-figma-capture.md) — every candidate reaches an unpublished reviewed Figma master; Code Connect is removed and rejected.
- 2026-08-18 — [Keep Figma CI read-only and REST-only](journal/2026-08-18-figma-rest-only-validation.md) — one read-only live-audit credential, no authenticated Code Connect path, and optional templates retained for local parsing.
- 2026-08-18 — [Remediate the Figma adversarial and design review](journal/2026-08-18-figma-adversarial-remediation.md) — exact left documentation rails and responsive sizing, governed shared styles/spacing/property bindings, intentional nonvisual metadata, and an authenticated live-node CI guard.
- 2026-08-18 — [Promote the remaining supported Figma and Code Connect batch](journal/2026-08-18-figma-supported-batch.md) — sixteen additional governed masters, exact public mappings, standardized left documentation/right responsive specimens, and an explicit intrinsic-versus-viewport sizing rule.
- 2026-08-18 — [Promote the first governed Figma and Code Connect component set](journal/2026-08-18-figma-code-connect-pilot.md) — seven stable Ready for Dev nodes, public parserless mappings, dynamic nesting, and repository/CI contracts.
- 2026-08-14 — [Add governed Breadcrumbs leading item and ancestor titles](journal/2026-08-14-breadcrumbs-direct-reuse-slots.md) — additive `leadingItem` slot and `items[].title` safe attribute so truncated trails reuse the closed package tree.
- 2026-08-12 — [Publish executable ESM and reuse contract v2](journal/2026-08-12-executable-esm-reuse-contract-v2.md) — fixed native Node imports, identified one primary reuse export and derived rendering boundary per component, and hardened OIDC semantic releases.
- 2026-08-12 — [Fix wiki sync pagination](journal/2026-08-12-fix-wiki-sync-pagination.md) — slurps paginated GitHub file and commit responses before building merge context, preventing adjacent page arrays from becoming invalid `jq --argjson` input.
- 2026-08-12 — [Add Graphify code mapping](journal/2026-08-12-add-graphify-code-map.md) — added Graphify's Codex query-first instructions and a local AST map that complements the curated component/wiki graph with symbol-level component relationships.
- 2026-08-12 — [Adopt server-first component architecture](journal/2026-08-12-server-first-component-architecture.md) — stable facades and narrow client trees, backed by graph-aware SSR checks, composed overlay ownership, an empty-carousel contract, and packed Next verification.
- 2026-08-05 — [Add the Search overlay component](journal/2026-08-05-add-search-overlay-component.md) — a de-cliented full-screen search surface: a dialog shell (focus trap, Escape/backdrop dismiss, focus restoration) with an idle↔active split; reuses the library's SearchInput for the field, and shares a new `useDialog` hook and `CloseButton` primitive with Modal.
- 2026-08-05 — [Publish the UI library as a deterministic npm package](journal/2026-08-05-npm-package-and-ai-reuse.md) — compiled component subpaths, governed reuse fingerprints, explicit Tailwind consumption, and queued automatic semantic releases.
- 2026-08-03 — [Add the Tabs component](journal/2026-08-03-add-tabs-component.md) — a de-cliented pill `tablist`: roving `tabIndex`, `aria-selected`, and an ArrowLeft/ArrowRight selection-and-focus loop with wraparound; controlled or uncontrolled, presentation only.
- 2026-08-03 — [Add the In-page navigation component](journal/2026-08-03-add-in-page-navigation-component.md) — a de-cliented "on this page" section-nav: an `IntersectionObserver` scroll-spy driving `aria-current` in a `<nav>` landmark, a wide-viewport pill bar collapsing to an `inert`-gated mobile drawer.
- 2026-07-31 — [Add the Slider component](journal/2026-07-31-add-slider-component.md) — a de-cliented slider over named options rather than a numeric range; the native input carries the index while the API speaks in values, and `aria-valuetext` announces the option label instead of the raw number.
- 2026-07-31 — [Add the Image component](journal/2026-07-31-add-image-component.md) — a de-cliented responsive `<picture>` whose URL composition is an injectable `loader`; keeps the WebP-before-fallback source ordering and always-emitted intrinsic dimensions, and degrades to a plain `<img>` when no loader is supplied.
- 2026-07-31 — [Add the Accordion component](journal/2026-07-31-add-accordion-component.md) — a de-cliented capture of an independently-expandable disclosure set; `aria-expanded`/`aria-controls` header buttons, `inert` collapsed panels skipped by Tab, and a `grid-template-rows` reveal gated on reduced motion, with an optional show-more.
- 2026-07-31 — [Add the Alert component](journal/2026-07-31-add-alert-component.md) — a de-cliented page-level notification with `positive`/`critical` severity, an announced live region, and optional dismiss/auto-dismiss; introduced the library's first tone tokens.
- 2026-07-31 — [Add the Toast component](journal/2026-07-31-add-toast-component.md) — a de-cliented transient bottom-anchored confirmation that portals to the body and auto-dismisses, with `neutral`/`critical` live-region semantics, kept deliberately distinct from Alert.
- 2026-07-30 — [Add the Rich text component](journal/2026-07-30-add-rich-text-component.md) — a de-cliented prose renderer for already-authored content (headings, lists, links) with a default/checkmark list style, styled via Tailwind descendant utilities; the read-only counterpart to a Rich text editor.
- 2026-07-30 — [Add the Section header component](journal/2026-07-30-add-section-header-component.md) — a de-cliented capture of an eyebrow + h2 + description section intro, with left/center group alignment and the h2/p outline-safety contract kept verbatim.
- 2026-07-30 — [Native variant axis](journal/2026-07-30-variant-axis.md) — one canonical can now hold structurally-distinct implementations; default on the bare slug, alternates as `components/<slug>--<variant>/`, keyed `(canonical, variant)` and enforced by the contract checker.
- 2026-07-30 — [Add the Stat component](journal/2026-07-30-add-stat-component.md) — a de-cliented capture of a client's StatCard/DetailStats: `Stat` (the value + label figure) and `StatGroup` (the sr-only-heading + `aria-labelledby` accessible-name contract), with a row/column orientation.
- 2026-07-27 — [Knowledge graph + wiki automation](journal/2026-07-27-graph-and-wiki-automation.md) — ported the graph builder/viewer and the wiki-sync / wiki-issue-sync bots, reversing the earlier "no automation" omission; added and then removed the CI freshness gate on direction.
- 2026-07-27 — [Reduced-motion coverage](journal/2026-07-27-reduced-motion-coverage.md) — a second Vitest config re-runs `motion`-tagged stories under an emulated `prefers-reduced-motion`, closing the one documented contract with no coverage.
- 2026-07-27 — [Storybook review tooling](journal/2026-07-27-storybook-review-tooling.md) — pseudo-states, a local direction toggle, maturity badges backed by a sixth contract check, and viewport/backgrounds configured from core.
- 2026-07-27 — [Story tests and the a11y gate](journal/2026-07-27-story-tests-and-a11y-gate.md) — unblocked `@storybook/addon-vitest`, ported CN's assertions into `play` functions, wrote Modal's from scratch, and made axe fail the build. Found three real defects.
- 2026-07-26 — [Storybook Docs audit](journal/2026-07-26-storybook-docs-audit.md) — "the Docs are empty" investigated and not reproduced; autodocs was healthy, and the real defect was Modal's portal painting over its own Docs page.

## Plans

- [Plan audit table](plans/INDEX.md) — every plan executed for this repo, with implementation status and evidence.

## Connections

- [Component + wiki wiring](connections.md) — a small index that routes to the generated map of how components and the wiki wire together: [components](connections/components.md), [wiki wiring](connections/wiki-wiring.md). Rendered from the knowledge graph; **do not hand-edit** — rebuilt by `pnpm graph:build`.

## Differences from ui-design-brain's wiki

This wiki is modelled on [`ui-design-brain`](https://github.com/verndale/ui-design-brain)'s. The knowledge graph and the wiki-sync/wiki-issue-sync bots are now ported (see [the graph-wiki-subsystem topic](topics/graph-wiki-subsystem.md)); what's left different:

- **No catalog manifest, no see-also convention.** This repo has no single file listing every component, and components don't cross-reference each other in markdown the way ui-design-brain's patterns do. The graph's `uses-tokens` edge (component → the token layer) replaces `catalogs`/`see-also`/`references` as the structural spine.
- **No `archive-plan.cjs` / `find-unarchived-plans.cjs`.** Plans are archived by hand, per the template in [MECHANICS.md](MECHANICS.md) — there is no CLI and no `~/.claude/plans`-scanning backstop.
- **No CI freshness gate.** `pnpm evals:graph` exists and passes locally, but nothing in `.github/workflows/` currently runs it on a PR — the pre-commit hook's auto-rebuild is the only check today, and it's skippable. See the graph-wiki-subsystem topic's Open threads.
- **The bot workflows need configuration.** `wiki-sync.yml` and `wiki-issue-sync.yml` require `secrets.PR_BOT_TOKEN` (and optionally the `WIKI_AI*` vars) set in the GitHub repo before they can run.
