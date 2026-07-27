# Context Wiki

Why this repo is the way it is: executed plans, decisions, and change history. Read this index first; open only the pages it routes to.

## Contents

- How to navigate
- Topics
- Journal
- Plans
- Differences from ui-design-brain's wiki

## How to navigate

1. "Why is X like this / what's the design of X" → match X in Topics below; open that one page.
2. "What changed when / history of X" → scan the Journal lines below; open only matching entries.
3. "Was plan X implemented / what plans exist" → [plans/INDEX.md](plans/INDEX.md) is the audit table; archived plan files sit next to it.
4. Full plan detail behind a change → follow the plan link inside the journal entry or topic page.
5. No index hit or no route → grep `wiki/` for the term; then fall back to `git log` / `gh`. Never load the whole wiki.

## Topics

<!-- One line per topic page: [Title](topics/<slug>.md) — hook. Keep alphabetical by slug. -->

- [Story testing](topics/story-testing.md) — the story-as-test layer: the runner, what belongs in a `play` function, the a11y gate, and the reduced-motion project.
- [Storybook tooling](topics/storybook-tooling.md) — the browsing and review surface: autodocs, pseudo-states, the direction toggle, maturity badges, viewport and backgrounds.

## Journal

<!-- Reverse-chronological, one line per entry: YYYY-MM-DD — [Title](journal/<file>.md) — hook. -->

- 2026-07-27 — [Reduced-motion coverage](journal/2026-07-27-reduced-motion-coverage.md) — a second Vitest config re-runs `motion`-tagged stories under an emulated `prefers-reduced-motion`, closing the one documented contract with no coverage.
- 2026-07-27 — [Storybook review tooling](journal/2026-07-27-storybook-review-tooling.md) — pseudo-states, a local direction toggle, maturity badges backed by a sixth contract check, and viewport/backgrounds configured from core.
- 2026-07-27 — [Story tests and the a11y gate](journal/2026-07-27-story-tests-and-a11y-gate.md) — unblocked `@storybook/addon-vitest`, ported CN's assertions into `play` functions, wrote Modal's from scratch, and made axe fail the build. Found three real defects.
- 2026-07-26 — [Storybook Docs audit](journal/2026-07-26-storybook-docs-audit.md) — "the Docs are empty" investigated and not reproduced; autodocs was healthy, and the real defect was Modal's portal painting over its own Docs page.

## Plans

- [Plan audit table](plans/INDEX.md) — every plan executed for this repo, with implementation status and evidence.

## Differences from ui-design-brain's wiki

This wiki is modelled on [`ui-design-brain`](https://github.com/verndale/ui-design-brain)'s, with three deliberate omissions. They are omissions, not oversights — do not add them back without the tooling that generates them.

- **No `connections/` pages.** Those are rendered from a deterministic knowledge graph (`scripts/graph/build-graph.cjs`) that this repo does not have. That wiki's own rule is that generated pages are never hand-edited, so hand-writing them here would be worse than leaving them out.
- **No `scripts/wiki/` automation.** No `pnpm wiki:archive-plan`, no merge-sync or issue-sync bots. Capture here is manual; [MECHANICS.md](MECHANICS.md) describes the protocol without them.
- **`pr:` fields stay `pending`.** Nothing back-fills them on merge, so a maintainer fills them in or leaves them.
