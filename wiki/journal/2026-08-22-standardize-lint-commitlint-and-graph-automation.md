---
date: 2026-08-22
topics: [graph-wiki-subsystem, component-architecture, story-testing, package-distribution]
plan: plans/2026-08-22-cross-repository-lint-commitlint-and-graph-standardization.md
pr: https://github.com/verndale/ui-design-library/pull/84
---
# Standardize lint, Commitlint, and graph automation

## Why

- Local commit and push behavior differed from the other repositories: maintained source was not linted at commit time and no pre-push gate existed.
- The PR workflow omitted the committed curated-graph freshness check, leaving a skippable pre-commit hook as its only drift protection.
- Graphify used bespoke pre-commit/post-merge/post-checkout synchronization and ignored the whole map instead of following its native team workflow.
- Commitlint used the same intended policy through different engines and an internal dependency path, which made local and CI behavior harder to prove equivalent.

## What changed

- Expanded ESLint to maintained first-party JS/TS with explicit fixture, generated, vendored, agent, and Graphify exclusions; staged fixes run first and unresolved warnings/errors block commits.
- Added side-effect-free fast push verification and a complete `Quality / quality` gate covering lint, types, contracts, browser/accessibility tests, build, packed consumer, and curated graph integrity.
- Cleared Git's repository-local hook environment before pre-push verification so temporary test repositories cannot modify the contributor checkout.
- Centralized Conventional Commit rules in root `commitlint.config.cjs`; the blocking message hook and separate PR title/range workflow now invoke the same direct Commitlint engine.
- Replaced the custom Graphify synchronizer and Git-event hooks with the official project installers, native post-commit/post-checkout hooks, merge driver, focused code-only corpus, and tracked shareable outputs.
- Added an unstaged-input guard to the advisory curated-graph refresh and hardened its viewer to loopback-only serving, NUL-path rejection, and initially unsized containers.
- Kept the graph viewer browser-only in ESLint by excluding it from the Node-global surface, pinned core ESLint exactly to `10.9.0`, and removed the README/package-list residue for the already-deleted `MIGRATION.md`.
- Kept Oxlint absent. The separately versioned `@eslint/js` package is `10.0.1` because its release line is versioned independently; core ESLint is `10.9.0`.
- Used pnpm's functional no-separator argument forwarding (`pnpm run lint:commit --edit`) because pnpm 10.33 forwards a standalone `--` literally to Commitlint and can bypass invalid-message failures.
- The first Linux quality run exposed filesystem-dependent directory sizes in curated `surface` nodes. Directory surfaces now record zero bytes, file surfaces retain their content size, and the graph gate asserts that portable contract before comparing committed output.
- The first merged-PR wiki reconciliation after native hook installation exposed the official post-checkout hook on a GitHub runner where Graphify is intentionally absent. Both wiki bot workflows now set Graphify's supported `GRAPHIFY_SKIP_HOOK=1` opt-out for automated branch switches and commits; developer checkouts keep the native hook.

## Files

- `package.json`, `pnpm-lock.yaml`, `eslint.config.js`, `lint-staged.config.mjs`, `commitlint.config.cjs`
- `.husky/`, `.github/workflows/test.yml`, `.github/workflows/commitlint.yml`
- `.graphifyignore`, `.gitignore`, `.gitattributes`, `graphify-out/`, `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`, `.cursor/`
- `scripts/graph/pre-commit.cjs`, `scripts/graph/serve.cjs`, `scripts/graph/viewer/viewer.js`, `scripts/evals/graph-check.cjs`
- `wiki/MECHANICS.md`, `wiki/topics/graph-wiki-subsystem.md`, `wiki/topics/component-architecture.md`, `wiki/topics/story-testing.md`, `wiki/topics/package-distribution.md`

## Follow-ups

- After landing, require `Quality / quality` and `Commit message lint / commitlint` in branch protection and retire superseded check contexts.
- Each clone must run `graphify hook install` because the merge-driver command is local Git configuration.
