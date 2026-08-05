---
status: partial
executed: 2026-08-05
evidence:
  - "issue #18"
  - "working tree"
  - "PR #19 https://github.com/verndale/ui-design-library/pull/19 (merged 2026-08-05)"
source_tool: codex
source: current Codex task
topics: [package-distribution]
audit_note: UI-library implementation and local package proof are complete; npm publication, AI-orchestration integration, and Mimecast verification remain gated on the maintainer merge and first publish.
---
# Validated Plan: npm-Published UI Library + Deterministic AI Reuse

## Summary

- Publish the 20-component UI library as a public, compiled npm package.
- Keep API `slots`, structural `variant`, style `variants`, and AI compatibility metadata as distinct contracts.
- Export `package.json` explicitly so orchestration can resolve the installed package through Node's export boundary.
- Let Implement add package styles during verification rather than preconfiguring the proof.
- Use Mimecast's active `.agents` discovery surface and prove both a package reuse and a local fallback.
- Introduce no provider layer, resolver registry, new `build.config.json` key, or second component index.

## P0 — GitHub Tracking and Branches

Use the `github-issue-creator` skill for both issues. Each draft uses `[Feature]` and the exact five-section body: `Summary`, `Context`, `Details`, `Expected Outcome`, `Additional Notes`. Show and confirm each draft separately before creation.

1. Create the UI issue in `verndale/ui-design-library` with label `Feature`.
2. Include its URL in the AI issue's Context.
3. Create the AI issue in `verndale/ai-orchestration` with `enhancement`, `area: skill`, `area: rule`, `area: validator`, `area: eval`, and `area: driver`.
4. Create issue-numbered `codex/` branches from fresh `origin/main` in both repositories.

The agent creates no commits, pushes, tags, merges, or PRs.

## P1 — Publish `@verndale/ui-design-library`

### Package contract

- Remove `private`, set the source version to `0.0.0-development`, and standardize package and repository license metadata on MIT.
- Publish publicly with provenance.
- Expose only:
  - `@verndale/ui-design-library/components/<slug>`
  - `@verndale/ui-design-library/components/<slug>--<structural-variant>`
  - `@verndale/ui-design-library/components/<directory>/component.json`
  - `@verndale/ui-design-library/styles.css`
  - `@verndale/ui-design-library/package.json`
- Provide no root barrel or short component alias.
- Ship compiled implementation modules and declarations plus inspectable source, stories, manifests, semantic tokens, README, and LICENSE.
- Add a `reuseFingerprint` with governed `slots`, `affordance`, and `role` to every component manifest. Existing API `slots`, singular structural `variant`, and plural style `variants` retain their meanings.

### Deterministic build

- Compile implementations and `src/lib` with `tsc`; preserve `'use client'` and exclude stories, tests, fixtures, and Storybook from `dist`.
- Maintain a manifest-derived committed export map. `pnpm exports:sync` writes it deliberately; test, build, and prepack only check and fail on drift.
- Make `styles.css` import only the semantic token layer. Consumers import Tailwind and the library stylesheet and register package `dist` with one explicit `@source`.

### Automatic releases

- Configure semantic-release: breaking change → major, `feat` → minor, and every other permitted conventional type → patch.
- On every push to `main`, perform a full-history checkout, exact Node/pnpm setup, frozen install, Chromium install, tests, build, packed-artifact inspection, and semantic-release.
- Serialize releases in one non-canceling queue.
- Bootstrap `1.0.0` using a one-time `NPM_TOKEN`; then configure npm trusted publishing for the workflow, remove the token, and use OIDC.
- Update README, AGENTS, CONTRIBUTING, and wiki plan/journal/topic/graph artifacts.

### P1 acceptance

- Tests and build pass.
- Every export resolves from the packed tarball.
- A scratch consumer installs that tarball, imports a component, stylesheet, manifest, and package metadata, type-checks, and proves Tailwind emits utilities found only in package code.
- The first merge publishes `1.0.0`; later merges release automatically according to the version table.

## P2 — AI-Orchestration Package Reuse

### Exact opt-in

- When reuse is enabled and the dependency is absent, preserve local-only behavior.
- If the package name appears, require it in production dependencies as a bare exact semver equal to the installed version.
- Reject ranges, tags, aliases, `file:`, links, workspace references, dev-only declarations, missing installs, and mismatches with one exact repair command.
- `ReuseExistingComponents: false` skips both local and package discovery and validation.

### Candidate inventory and selection

- Resolve the package through its exported `package.json`; validate and sort manifests by canonical and structural variant.
- Hard-stop invalid metadata and duplicate keys. Permit `candidate` and `supported`; reject `deprecated`.
- Apply compatible local → compatible package → local create with a precise fallback reason.
- Package compatibility requires exact canonical, the existing AI fingerprint triad, exact requested style-variant support, and a unique/default structural implementation.
- Package source is immutable; the local component index remains local-only.

### Boundary Map v3

Package reuse rows carry `source: package`, the stable module specifier, exact version, canonical, structural variant, style variant, and reason. Local rows retain repo-relative paths. Package rows are never write targets, unit-test targets, component-index entries, or coverage paths. Final validation resolves the module, verifies the exact installed version and declared import, and rejects raw `node_modules` paths or drift.

### Styling and tests

- First package reuse declares and adds the stylesheet import and package `@source` exactly once.
- Cover valid, absent, disabled, malformed, mismatched, maturity, metadata, fingerprint, style, structural ambiguity, Boundary Map v3, raw-path, and import-reconciliation cases.
- Run `pnpm test:all`, wiki graph checks, and eval graph checks.

## P3 — Mimecast End-to-End Verification

Run only after the real npm release exists.

1. Record the original Mimecast status/diff hash and create a disposable detached worktree from `origin/develop`; never alter the original checkout.
2. Point the disposable worktree's active `.agents/{skills,validators,driver,hooks}` at the local AI branch. Record branch, HEAD, and uncommitted diff SHA-256.
3. Install the real package with an exact version.
4. Do not pre-add package styles.
5. Isolate artifacts and component buckets under package-probe paths while preserving the Optimizely adapter and rendering domains.
6. Load the original `.env` only into child processes with `dotenv-cli`; never copy, print, or commit it.
7. Reconfirm each net-new name/slug is absent immediately before Generate:
   - Package Probe FAQ Rail — Confluence `7181566275`
   - Package Probe Metrics Rail — Confluence `7174586481`
   - Package Probe Lead Capture — Confluence `7196770476`
8. Use only each supplied Confluence page, its linked Figma frames, and normal project token/convention infrastructure. Confluence uses the deterministic REST extractor, never Rovo or Atlassian MCP. Supply explicit Figma frames and hard-stop failed Figma context/truth.
9. Run all three Generates before any Implement and do not inspect existing Mimecast modules, packs, fingerprints, screenshots, or baselines.
10. Implement the first package-compatible probe and the first incompatible probe in fixed order; fail if either class does not exist.
11. Verify the exact package import/version, Boundary Map v3, no duplicate local implementation, automatic styles integration, precise local fallback, type-check, targeted Jest, lint, deterministic gates, and production build.
12. Record all source, package, AI identity, boundary decision, import, fallback, and command evidence in the AI issue and wiki journal.
13. Reconfirm the original Mimecast checkout is unchanged and ask before force-removing the evidence-bearing disposable worktree.

## Final Acceptance

- The public package has deterministic exports, governed compatibility metadata, compiled ESM/declarations, inspectable source/stories, and working Tailwind integration.
- Every queued merge to UI `main` releases automatically without a manual publish command.
- AI reuse is exact-dependency opt-in with local → package → create precedence and unambiguous variant semantics.
- All three net-new Mimecast probes Generate; at least one real package reuse and one local fallback are implemented and verified.
- Neither original working tree is committed, pushed, merged, tagged, or modified by the agent.
