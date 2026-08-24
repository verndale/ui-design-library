---
status: implemented
executed: 2026-08-23
evidence: ["issue #87 https://github.com/verndale/ui-design-library/issues/87", "working tree", "focused and full verification", "PR pending"]
source_tool: codex
source: issue #87 implementation task
topics: [graph-wiki-subsystem]
audit_note: Preserved the library's curated component/wiki graph, Sigma viewer, specialized quality gates, Graphify workflow, and contamination-safe advisory hook; added the shared standard without replacing repo-specific mechanics.
---
# Wiki parity, GitHub evidence, and CI workflow standard

## Goal

Bring the repository's context wiki, GitHub reconciliation, agent navigation, hooks, and workflow identities to the shared standard while keeping the library's existing curated graph and product-specific verification.

## Constraints

- Work from `main` on `codex/87-wiki-parity` and track [issue #87](https://github.com/verndale/ui-design-library/issues/87).
- Preserve the component/token/wiki graph schema, Sigma shortest-route viewer, specialized Quality and browser gates, native Graphify ownership, and contamination-safe advisory pre-commit behavior.
- Do not commit, push, merge, publish, or operate on any other checkout.

## Work

1. Add canonical repo-qualified GitHub PR/issue extraction to Markdown graph nodes while retaining legacy number fields.
2. Resolve full and qualified GitHub queries to citing wiki pages; return deterministic compact itineraries with byte costs; keep bare numbers ambiguous.
3. Make viewer search and inspector links GitHub-aware and safe-DOM rendered without changing node selection or shortest routing.
4. Harden merge/manual replay and daily issue reconciliation with versioned contexts, pagination, all-reference known-state handling, bot guards, explicit auth, lease-safe branches, and Graphify hook opt-out.
5. Establish the five canonical workflow/check identities and filenames, Node/Corepack runtime, `@verndale/ai-commit@2.7.0` as the sole direct provider for CI and `commit-msg`, and one `Wiki integrity` entrypoint.
6. Teach agents the cheapest lookup split and capture the result in the wiki.

## Acceptance

- `pnpm run wiki:check` proves GitHub reference parsing, cached repo-qualified issue lookups, all-reference line reconciliation with fail-soft uncertainty, routing, workflow contracts, viewer safety, hook safety, and graph freshness.
- Clean installation exposes the provider-bundled Commitlint binary through the workspace hoist and accepts/rejects representative messages.
- The complete repository verification remains green with the existing library-specific gates.
- Issue #87 is linked from the plan and journal; the future PR remains pending.
