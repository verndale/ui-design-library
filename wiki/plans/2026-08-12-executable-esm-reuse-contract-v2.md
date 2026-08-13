---
status: partial
executed: 2026-08-12
evidence:
  - "issue #31"
  - "pnpm verify"
  - "21 packed native ESM imports"
  - "packed Next 16/Tailwind consumer"
  - "adversarial rendering-graph and release-range fixtures"
  - "PR #35 https://github.com/verndale/ui-design-library/pull/35 (merged 2026-08-13)"
source_tool: codex
source: approved task conversation
topics: [package-distribution, component-architecture]
audit_note: The UI implementation and local verification were delivered; maintainer-owned repository settings, merge, automatic 4.1.0 publication, coordinated AI delivery, and post-release Mimecast probes remain rollout gates.
---
# Coordinated UI Library Contract v2 and AI Reuse Hardening

## Tracking and Branches

Use the `github-issue-creator` skill. Each issue must use the exact five-section body—`Summary`, `Context`, `Details`, `Expected Outcome`, `Additional Notes`—and be shown for separate explicit confirmation before creation.

1. Draft and create in `verndale/ui-design-library`:
   - Title: `[Task] Publish executable ESM and reuse contract v2`
   - Labels: `enhancement`, `area: components`, `documentation`
   - Context records the `4.0.1` native-ESM failure and the coordinated AI dependency.
   - Expected outcome is an automatically published, provenance-bearing `4.1.0`.
2. Include the UI issue URL in the AI issue’s `Context`.
3. Draft and create in `verndale/ai-orchestration`:
   - Title: `[Task] Enforce UI library reuse contract v2 and Boundary Map v5`
   - Labels: `enhancement`, `breaking-change`, `area: driver`, `area: validator`, `area: rule`, `area: skill`, `area: eval`, `area:wiki`
   - Context links the UI issue and the current component-index/Boundary Map wiki decisions.
   - Expected outcome is deterministic validation against exact UI package `4.1.0+`.
4. After both issue numbers exist:
   - Fetch both remotes.
   - Confirm both worktrees are clean.
   - Create each branch from fresh `origin/main`:
     - UI: `codex/<ui-issue-number>-publish-reuse-contract-v2`
     - AI: `codex/<ai-issue-number>-enforce-ui-reuse-contract-v2`
   - Record the starting HEAD for each branch.
5. Agents make and verify changes but do not commit, push, merge, tag, or publish. Maintainers perform those actions.

## UI Design Library

- Preserve `@verndale/ui-design-library/components/<directory>` as the public import contract.
- Convert emitted relative imports/exports to explicit `.js` specifiers and use NodeNext-compatible build resolution. All emitted modules must load through native Node ESM.
- Add `package.json#uiDesignLibrary.reuseContractVersion: 2`.
- Add required manifest fields:
  - `exportName`: the primary named value export used by orchestration.
  - `rendering`: `server`, `hybrid`, or `client`, describing that primary export.
- Extend the architecture gate to verify `exportName` and derive `rendering` from the primary export graph:
  - `server`: no client module in the primary graph.
  - `hybrid`: server entry with client descendants.
  - `client`: primary entry is client-only.
- Make `reuseFingerprint` and `variants[]` describe only the primary export:
  - Alert → `Alert`, `server`, fingerprint without `close`.
  - Badge → `Badge`, `server`, fingerprint without `close` and no `dismissible` primary variant.
  - Accordion and InPageNavigation → `hybrid`.
  - Carousel, Modal, SearchInput, SearchOverlay, Slider, Tabs, and Toast → `client`.
  - Remaining primary exports → `server`.
- Keep secondary exports such as `DismissibleAlert`, `DismissibleBadge`, `CardMedia`, and `StatGroup` available to developers, but not as independent AI candidates.
- Enforce unique non-empty `variants[]`. Permit governed `other` fingerprint values while documenting that `other` is never auto-compatible.
- Preserve the structural-variant contract: a bare default directory carries its `variant` and `default: true`; alternates use `<slug>--<variant>`.
- Add a packed-tarball test that installs the artifact, dynamically imports every component subpath, and verifies every declared `exportName`. Retain the packed Next/Tailwind test.
- Update README, MIGRATION, AGENTS, the issue, and the package-distribution/component-architecture wiki records. Installation examples use `<exact-version>` and the canonical double-quoted CSS registration.

### Release hardening

- Merge using `feat(package): publish executable ESM reuse contract v2`, expected to publish `4.1.0`.
- Configure GitHub squash merges to use the PR title with a blank description.
- Add a release preflight that rejects aggregated `BREAKING CHANGE` commit bodies; intentional breaking releases use `!` in the PR title.
- Disable semantic-release issue/PR comments and released labels while retaining npm and GitHub releases.
- Configure npm trusted publishing for `verndale/ui-design-library` and `.github/workflows/release.yml` before merge.
- Remove `NPM_TOKEN` from the workflow, verify the OIDC release, and then delete the obsolete GitHub secret.
- Confirm npm `latest` is `4.1.0`, provenance points to the release workflow, and all 21 component imports load in native Node.

## AI Orchestration

- Require exact package version `4.1.0` or newer and reuse contract version `2`. Older or unknown contracts stop with:
  `pnpm add --save-exact @verndale/ui-design-library@4.1.0`.
- Inventory candidates with `exportName` and `rendering`, dynamically import every candidate, and verify the named export exists.
- Align structural-variant handling with the library’s bare-default-directory rule.
- Accept governed `other` metadata during inventory but exclude it from automatic compatibility.
- Wire the existing package-selection function into production Boundary Map validation.
- Introduce Boundary Map v5. Package rows add:
  - `exportName`
  - `rendering`
  - `requiredFingerprint: { slots, affordance, role }`
- Keep local row shapes unchanged. Existing gitignored v4 jobs must be aborted and restarted; do not maintain mixed active-job compatibility.
- During plan and final validation:
  - Replay canonical, fingerprint, style, and structural selection.
  - Require the row’s module, export, rendering, and variants to match the deterministic result.
  - Perform an actual module import instead of only `import.meta.resolve`.
  - Confirm a local target imports the exact module and named export.
- Keep exact DOM/API realization as the only judgment step. Use `reuse-realization-incompatible` when the primary export cannot reproduce the Normalized DOM Contract or would widen the client boundary.
- Replace residual `1.0.0` repair commands and v4 examples.
- Update README, AGENTS, rules, skills, validator docs, work-order fixtures, evals, issue, and component-index wiki history.

## Test and Rollout

1. UI:
   - `pnpm contracts`
   - `pnpm architecture`
   - `pnpm test`
   - `pnpm build`
   - packed native-ESM import test
   - packed Next/Tailwind consumer
   - `pnpm verify`
2. Merge UI only after trusted publishing and squash settings are configured; verify automatic `4.1.0`.
3. AI:
   - Cover missing, old, malformed, mismatched, and unknown-contract packages.
   - Cover server/hybrid/client metadata, secondary exports, `other`, named-export drift, transitive import failures, structural defaults, style mismatches, and Boundary Map v5 replay.
   - Run `pnpm test:unit`, `pnpm run test:all`, wiki graph checks, and eval graph checks.
4. Install exact `4.1.0` in a disposable consumer and confirm all 21 candidates inventory, import, and validate.
5. Mimecast verification in a detached disposable worktree from `origin/develop`:
   - Generate all probes before any Implement:
     - `Reuse Contract Disclosure Stack` — Accordion/hybrid.
     - `Reuse Contract Metric Mosaic` — Stat/server.
     - `Reuse Contract Inquiry Panel` — Form/local fallback.
   - Use only the supplied Confluence pages, linked Figma frames, REST extraction, and project tokens.
   - Require one hybrid package reuse, one server package reuse, and one precise local fallback; never force reuse.
   - Verify named imports, Boundary Map v5, one-time CSS registration, no duplicate local implementations, typecheck, lint, targeted Jest, driver gates, and production Next build.
   - Record evidence in both issues and wiki journals.
   - Reconfirm the original Mimecast status/diff hash and request confirmation before forced worktree teardown.

## Assumptions

- npm `latest` is currently `4.0.1`; the coordinated feature release is reserved as `4.1.0`.
- React 19, Tailwind 4, and directory-shaped public imports remain unchanged.
- Candidate and supported maturity remain eligible; deprecated remains excluded.
- No provider system, additional component index, or consumer configuration key is introduced.
