# Connections — Wiki wiring

How the context wiki connects: journal → plan, page → topic, topic → covered surface, and links that cross between root docs, components, and the wiki.

Part of the [connections map](../connections.md), generated from the knowledge graph — **do not edit by hand**. Rebuilt on every `pnpm graph:build` and verified fresh by `pnpm evals:graph`.

## Journal → plan

- [Reduced-motion coverage](../../wiki/journal/2026-07-27-reduced-motion-coverage.md) → [Storybook review addons and reduced-motion coverage](../../wiki/plans/2026-07-27-storybook-review-addons-and-reduced-motion.md)
- [Story tests and the a11y gate](../../wiki/journal/2026-07-27-story-tests-and-a11y-gate.md) → [Add story tests and enforce accessibility](../../wiki/plans/2026-07-26-add-story-tests-and-enforce-a11y.md)
- [Storybook review tooling](../../wiki/journal/2026-07-27-storybook-review-tooling.md) → [Storybook review addons and reduced-motion coverage](../../wiki/plans/2026-07-27-storybook-review-addons-and-reduced-motion.md)
- [Native variant axis](../../wiki/journal/2026-07-30-variant-axis.md) → [Native variant axis for @verndale/ui-design-library](../../wiki/plans/2026-07-30-variant-axis.md)
- [Publish the UI library as a deterministic npm package](../../wiki/journal/2026-08-05-npm-package-and-ai-reuse.md) → [Validated Plan: npm-Published UI Library + Deterministic AI Reuse](../../wiki/plans/2026-08-05-npm-package-and-ai-reuse.md)

## Page → topic

- [Storybook Docs audit](../../wiki/journal/2026-07-26-storybook-docs-audit.md) → [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md)
- [Knowledge graph + wiki automation](../../wiki/journal/2026-07-27-graph-and-wiki-automation.md) → [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md)
- [Reduced-motion coverage](../../wiki/journal/2026-07-27-reduced-motion-coverage.md) → [Story testing — Design History](../../wiki/topics/story-testing.md)
- [Story tests and the a11y gate](../../wiki/journal/2026-07-27-story-tests-and-a11y-gate.md) → [Story testing — Design History](../../wiki/topics/story-testing.md)
- [Story tests and the a11y gate](../../wiki/journal/2026-07-27-story-tests-and-a11y-gate.md) → [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md)
- [Storybook review tooling](../../wiki/journal/2026-07-27-storybook-review-tooling.md) → [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md)
- [Native variant axis](../../wiki/journal/2026-07-30-variant-axis.md) → [Variant axis — Design History](../../wiki/topics/variant-axis.md)
- [Publish the UI library as a deterministic npm package](../../wiki/journal/2026-08-05-npm-package-and-ai-reuse.md) → [Package distribution — Design History](../../wiki/topics/package-distribution.md)
- [Add story tests and enforce accessibility](../../wiki/plans/2026-07-26-add-story-tests-and-enforce-a11y.md) → [Story testing — Design History](../../wiki/topics/story-testing.md)
- [Add story tests and enforce accessibility](../../wiki/plans/2026-07-26-add-story-tests-and-enforce-a11y.md) → [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md)
- [Storybook review addons and reduced-motion coverage](../../wiki/plans/2026-07-27-storybook-review-addons-and-reduced-motion.md) → [Story testing — Design History](../../wiki/topics/story-testing.md)
- [Storybook review addons and reduced-motion coverage](../../wiki/plans/2026-07-27-storybook-review-addons-and-reduced-motion.md) → [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md)
- [Native variant axis for @verndale/ui-design-library](../../wiki/plans/2026-07-30-variant-axis.md) → [Variant axis — Design History](../../wiki/topics/variant-axis.md)
- [Validated Plan: npm-Published UI Library + Deterministic AI Reuse](../../wiki/plans/2026-08-05-npm-package-and-ai-reuse.md) → [Package distribution — Design History](../../wiki/topics/package-distribution.md)

## Topic → covered surface

- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [wiki-issue-sync.yml](../../.github/workflows/wiki-issue-sync.yml)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [wiki-sync.yml](../../.github/workflows/wiki-sync.yml)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [pre-commit](../../.husky/pre-commit)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [graph-check.cjs](../../scripts/evals/graph-check.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [build-graph.cjs](../../scripts/graph/build-graph.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [routing-policy.json](../../scripts/graph/routing-policy.json)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [routing.cjs](../../scripts/graph/routing.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [serve.cjs](../../scripts/graph/serve.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [ci-journal-warn.cjs](../../scripts/wiki/ci-journal-warn.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [on-merge-sync.cjs](../../scripts/wiki/on-merge-sync.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [pre-commit-journal.cjs](../../scripts/wiki/pre-commit-journal.cjs)
- [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md) → [refresh-issue-state.cjs](../../scripts/wiki/refresh-issue-state.cjs)
- [Package distribution — Design History](../../wiki/topics/package-distribution.md) → [release.yml](../../.github/workflows/release.yml)
- [Package distribution — Design History](../../wiki/topics/package-distribution.md) → [package.json](../../package.json)
- [Package distribution — Design History](../../wiki/topics/package-distribution.md) → [release.config.cjs](../../release.config.cjs)
- [Package distribution — Design History](../../wiki/topics/package-distribution.md) → [build-exports.cjs](../../scripts/build-exports.cjs)
- [Package distribution — Design History](../../wiki/topics/package-distribution.md) → [styles.css](../../styles.css)
- [Package distribution — Design History](../../wiki/topics/package-distribution.md) → [tsconfig.build.json](../../tsconfig.build.json)
- [Story testing — Design History](../../wiki/topics/story-testing.md) → [test.yml](../../.github/workflows/test.yml)
- [Story testing — Design History](../../wiki/topics/story-testing.md) → [preview.ts](../../.storybook/preview.ts)
- [Story testing — Design History](../../wiki/topics/story-testing.md) → [vitest.config.ts](../../vitest.config.ts)
- [Story testing — Design History](../../wiki/topics/story-testing.md) → [vitest.motion.config.ts](../../vitest.motion.config.ts)
- [Story testing — Design History](../../wiki/topics/story-testing.md) → [vitest.shared.ts](../../vitest.shared.ts)
- [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md) → [main.ts](../../.storybook/main.ts)
- [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md) → [manager.ts](../../.storybook/manager.ts)
- [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md) → [preview.ts](../../.storybook/preview.ts)
- [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md) → [withDirection.tsx](../../.storybook/withDirection.tsx)
- [Storybook tooling — Design History](../../wiki/topics/storybook-tooling.md) → [check-contracts.cjs](../../scripts/check-contracts.cjs)
- [Variant axis — Design History](../../wiki/topics/variant-axis.md) → [check-contracts.cjs](../../scripts/check-contracts.cjs)

## Cross-area links (seams)

- [UI Design Library — agent guide](../../AGENTS.md) → [Context Wiki](../../wiki/INDEX.md)
- [UI Design Library — agent guide](../../AGENTS.md) → [Wiki Mechanics](../../wiki/MECHANICS.md)
- [UI Design Library — agent guide](../../AGENTS.md) → [Knowledge graph & wiki automation — Design History](../../wiki/topics/graph-wiki-subsystem.md)
- [ui-design-library](../../README.md) → [Semantic tokens](../../src/tokens/semantic.css)
- [ui-design-library](../../README.md) → [Context Wiki](../../wiki/INDEX.md)
