---
status: implemented
executed: 2026-09-28
evidence:
  - "verndale/ui-design-library issue #109"
  - "verndale/ui-design-library PR pending"
  - "verndale/ui-design-library PR #110 https://github.com/verndale/ui-design-library/pull/110 (merged 2026-09-29)"
source_tool: codex
source: user-approved cross-repository Git delivery plan
topics: [graph-wiki-subsystem, package-distribution]
audit_note: Kept the existing npm trusted-publishing preflight and package lifecycle checks.
---
# Standard Git delivery

Update this repository's hooks, Actions, and AGENTS instructions to use labeled issues, branches from updated main, scoped Conventional Commits, deterministic PR titles and six-section bodies, and open PRs for review. Remove ai-pr, ai-commit, pr:create, and PR_BOT_TOKEN without compatibility paths. Keep the existing release behavior, but trigger it only after successful Quality on main. Preserve wiki reconciliation, npm trusted publishing, and the quality gates.
