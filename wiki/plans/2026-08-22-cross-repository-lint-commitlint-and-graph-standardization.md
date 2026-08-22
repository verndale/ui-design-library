---
status: implemented
executed: 2026-08-22
evidence: ["issue #83", "isolated issue worktree", "verify:push", "verify:ci", "graph:check", "Graphify native hook status"]
source_tool: codex
source: approved plan in the Codex task
topics: [graph-wiki-subsystem, component-architecture, story-testing, package-distribution]
audit_note: Core ESLint remains 10.8.1, but @eslint/js uses its latest published 10.0.1 because 10.8.1 does not exist. Commands omit pnpm's standalone separator because pnpm 10.33 forwards it literally to Commitlint and can let invalid input exit successfully. Library maintained its existing contract-required explicit test command steps while adding the shared fast/push/CI entrypoints.
---
# Cross-repository lint, Commitlint, and graph standardization

## Summary

Standardize developer enforcement across all six repositories:

- ESLint auto-fixes staged first-party JS/TS and blocks unresolved errors or warnings.
- Pre-push runs typechecking where applicable plus a stable fast test suite.
- `Quality / quality` provides one complete, non-fixing code-quality gate.
- `Commit message lint / commitlint` remains a separate required governance check so PR-title edits rerun cheaply.
- Commitlint uses one shared Conventional Commit policy locally and in CI.
- Graphify exists only in Research Operations, UI Design Evidence, and UI Design Library.
- Curated knowledge graphs retain their domain schemas but share lifecycle behavior.
- Oxlint remains absent; transitive Oxc build-tool dependencies remain allowed.

## ESLint and quality gates

Use ESLint 10.8.1 everywhere except Evidence, which remains on ESLint 9.39.5 until its accessibility plugin supports ESLint 10. Lint all maintained first-party code while explicitly excluding fixtures, generated artifacts, vendored code, agent assets, and Graphify output.

Expose the shared scripts:

- `lint`, `lint:fix`, and `lint:staged`
- `test:fast`, `verify:push`, and `verify:ci`
- `typecheck` only in Research, Evidence, and Library
- `graph:build`, `graph:check`, and `graph:view`

Hook order:

1. Pre-commit runs lint-staged with `eslint --fix --max-warnings=0 --no-warn-ignored`.
2. Wiki/journal handling remains advisory.
3. Curated graph rebuild/restage runs last, fail-open, with an unstaged-input guard.
4. Pre-push runs `verify:push` without fixing or regenerating files.

Repository gates:

| Repository | Pre-push | Additional CI coverage |
|---|---|---|
| Research | Typecheck, Vitest, plugin and release-preflight contracts | Wiki graph, build, Playwright |
| AI Orchestration | Unit suite | All evals and governance-graph checks |
| Retrospective | Existing 358 Node tests | Curated graph evaluation |
| UI Brain | Existing 17-case graph contract | Full first-party lint |
| UI Evidence | Typecheck, root contracts/source parity, app unit tests, graph/wiki/query checks | Full lint, build, drift evaluation, Playwright |
| UI Library | Typecheck, architecture/contracts/registry/export/SSR tests | Accessibility, browser/build, packed consumer, curated graph |

## Commitlint standard

Set every repository to:

- `@commitlint/cli:^21.2.2`
- `@verndale/ai-commit:^2.7.0`
- Root `commitlint.config.cjs` re-exporting the public `@verndale/ai-commit` preset
- `lint:commit`: direct Commitlint using that root config
- `lint:commits:last`: `pnpm run lint:commit -- --last`

Local hooks:

- `commit-msg` runs `pnpm run lint:commit -- --edit "$1"` and blocks failures.
- `prepare-commit-msg` retains `pnpm exec ai-commit prepare-commit-msg "$1" "$2"` as optional authoring assistance.
- `pnpm commit` remains available, but the blocking direct Commitlint hook is authoritative.

Shared policy:

- Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`
- Format: `type(scope): subject`
- Scope required, lowercase, and hyphen-compatible; no repository-specific scope allowlist
- Subject required, no terminal period, maximum 50 characters
- Header maximum 120 characters
- Body/footer lines maximum 72 characters
- Subject case unrestricted so the documented capitalized style remains valid
- Conventional breaking-change and revert parsing retained
- Commitlint’s default generated-message ignores retained; no custom ignore callbacks

Keep a separate `Commit message lint / commitlint` workflow:

- Trigger on PR `opened`, `synchronize`, `reopened`, and `edited`.
- Checkout the immutable PR head with full history.
- Validate the squash PR title and every commit in the explicit base-to-head range.
- Use each repository’s declared Node and pnpm versions.
- Correct documentation that currently claims unsupported push enforcement.
- Preserve Research’s release-preflight requirement for `!` on an intentional breaking squash title; release-analyzer compatibility rules are not Commitlint exceptions.

Branch protection requires both:

- `Quality / quality`
- `Commit message lint / commitlint`

## Graphify and curated graphs

Graphify is standardized only in Research, Evidence, and Library:

- Run `graphify install --project`, `graphify codex install --project`, `graphify cursor install --project`, and `graphify hook install`.
- Retain only native post-commit/post-checkout hooks, `.gitattributes`, and the local merge driver.
- Remove bespoke Graphify wrappers, synchronizers, tests, pre-commit blocks, post-merge hooks, and post-rewrite hooks.
- Structure AGENTS and CLAUDE using Research’s installer-ownership model.
- Track shareable graph/report/manifest/analysis/label output; ignore cost, cache, machine-root/interpreter markers, query memory/reflections, stamps, and dated backups.

Evidence moves canonical output to root `graphify-out/` and uses a root `.graphifyignore` allow-list for only `apps/evidence-explorer/**`. Regenerate with `graphify extract . --code-only --force` and verify no other source enters the graph.

Library regenerates its root code-only graph and replaces its custom synchronizer with native hooks. Research refreshes its existing graph, removes legacy snapshots, and narrows noisy installer/wiki/generated inputs.

AI, Retrospective, and Brain receive no Graphify hooks, output, dependencies, or instruction blocks.

Curated graphs preserve their content models while standardizing:

- Deterministic builds
- Advisory, fail-open pre-commit refresh
- Blocking, check-only CI freshness/integrity
- Unstaged-input protection
- Shared builder use by merge/issue automation
- Loopback-only safe viewers

Repair AI’s input guard, wire Retrospective’s journal warning, add Library’s missing graph CI gate, and bring Brain’s builder/checker/viewer reliability to the Retrospective baseline without changing Brain’s schema or presentation.

## Verification and rollout

- Test staged fixable files, unresolved errors, and warnings.
- Confirm pre-push failures block without changing tracked files.
- Validate representative Commitlint messages: valid scoped, breaking `!`, missing/uppercase scope, unsupported type, trailing period, and each length boundary.
- Confirm PR-title and PR-range Commitlint use the same root configuration as `commit-msg`.
- Run every `verify:push`, `verify:ci`, and `graph:check`; ensure non-fixing checks leave the worktree unchanged.
- Verify Graphify native hook markers, merge driver, tracked-output policy, and Evidence’s site-only corpus.
- Confirm no direct Oxlint dependency, binary, configuration, script, hook, workflow, or active documentation exists.
- Implement on the already-created issue-numbered branches. Use isolated worktrees where unrelated changes remain, including Library’s current `MIGRATION.md` deletion.
- Land one repository at a time, observe both stable checks, then update branch protection and retire superseded contexts.

No runtime product APIs or curated graph schemas change. The standardized interfaces are package scripts, Git-hook behavior, Commitlint policy, Graphify ownership, and the two stable PR check names.
