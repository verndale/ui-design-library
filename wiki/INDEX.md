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

- [Knowledge graph & wiki automation](topics/graph-wiki-subsystem.md) — the deterministic graph + Sigma.js viewer and the wiki-sync / wiki-issue-sync bots, ported from ui-design-brain.
- [Story testing](topics/story-testing.md) — the story-as-test layer: the runner, what belongs in a `play` function, the a11y gate, and the reduced-motion project.
- [Storybook tooling](topics/storybook-tooling.md) — the browsing and review surface: autodocs, pseudo-states, the direction toggle, maturity badges, viewport and backgrounds.
- [Variant axis](topics/variant-axis.md) — one catalog canonical, more than one structurally-distinct implementation, keyed `(canonical, variant)` → `components/<slug>--<variant>/`.

## Journal

<!-- Reverse-chronological, one line per entry: YYYY-MM-DD — [Title](journal/<file>.md) — hook. -->

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
