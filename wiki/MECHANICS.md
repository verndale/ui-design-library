# Wiki Mechanics

Write-side protocol for the context wiki: when to capture, what to write, and the templates. The read-side protocol lives in [INDEX.md](INDEX.md).

## Contents

- Capture trigger
- Per capture, in the same delivery
- Automation
- Content rules
- Size and pruning
- Templates

## Capture trigger

Capture when a substantive change is delivered to the working tree:

- an executed plan (proposed, approved, then implemented), or
- a change to a component, the token layer, the contract checker, the Storybook configuration, the test setup, or the workflows.

Also capture an **investigation with a material finding, even when nothing shipped** — a reported defect that did not reproduce, a root cause that turned out to be somewhere else, or a documented blocker found to be wrong. This is a deliberate widening of ui-design-brain's trigger. A component library accumulates "we already looked at that" knowledge that is invisible in `git log` precisely because it produced no diff, and re-investigating is the expensive outcome. [The Docs audit](journal/2026-07-26-storybook-docs-audit.md) is the worked example.

Do not capture: typo fixes, formatting-only changes, dependency bumps, or version commits.

## Per capture, in the same delivery

1. Write the journal entry to `journal/YYYY-MM-DD-<slug>.md` (template below).
2. If a plan was executed, copy it verbatim into `plans/YYYY-MM-DD-<slug>.md` with the status frontmatter below, and add a row to [plans/INDEX.md](plans/INDEX.md). Update the totals line.
3. Update the affected topic page's Decisions section. Create a new topic page when at least two related entries exist; before that, journal entries carry the thread.
4. Add exactly one index line per new file to [INDEX.md](INDEX.md) (Journal and/or Topics section).

PR number and commit sha are usually unknown at delivery time — the maintainer commits, not the agent. Write `pr: pending`.

## Automation

Ported from ui-design-brain, adapted to this repo's shape — see [the graph-wiki-subsystem topic](topics/graph-wiki-subsystem.md) for the full picture:

- **Pre-commit** (`.husky/pre-commit`): after blocking staged ESLint, warns (never blocks) when a staged commit is substantive but adds no `wiki/journal/` entry. The curated graph helper rebuilds + stages `scripts/graph/data/graph.json` and `wiki/connections*` only when indexed inputs have no unstaged or untracked changes; refresh/staging failures remain advisory and the path is skipped under `$CI`.
- **Pull-request quality** (`.github/workflows/test.yml`): `Quality / quality` runs the complete non-fixing gate, including the blocking curated graph freshness/integrity check. A separate `Commit message lint / commitlint` job validates the squash title and explicit PR commit range with the root policy.
- **Wiki sync** (`.github/workflows/wiki-sync.yml`): on PR merge, fills `pr: pending` in journal entries; for a substantive PR with no entry, drafts a deterministic stub (`draft: ai` and AI-enriched only if `WIKI_AI=true` is set and the result stays grounded in the actual diff — otherwise the stub's Why is a `TODO` for a human to fill in); appends a topic Decisions bullet; and completes a `plans/INDEX.md` row when the PR references an archived plan. Lands as a `bot/wiki-sync/<pr>` PR — never a direct push to main.
- **Nightly issue sync** (`.github/workflows/wiki-issue-sync.yml`): marks an issue cited under a topic's `## Open threads` with ` — closed` once it closes.

What did **not** come over: `scripts/wiki/archive-plan.cjs` and `find-unarchived-plans.cjs` (the CLI for archiving a plan and the `~/.claude/plans` scanning backstop) — this repo's plans are archived by hand, per the template below, so nothing calls them. `pnpm wiki:archive-plan` is not a script here.

Both bot workflows need `secrets.PR_BOT_TOKEN` configured in the GitHub repo to actually run — that's account-side configuration, not something a commit can set up. Until it's configured, the workflow files exist but fail at checkout or PR-creation.

The practical consequence for now: `pr: pending` stays pending until the workflows are wired up or somebody edits it by hand.

## Content rules

- Record the why and what was ruled out — the parts `git log` cannot tell you. Link to commits/PRs instead of duplicating them.
- Record corrections. An earlier conclusion that turned out to be wrong is worth more than the conclusion that replaced it, because the wrong one is the one somebody will otherwise reach again.
- Topic frontmatter is part of navigation: `aliases` lists grounded natural-language lookup terms, and `covers` lists exact repo-relative paths the topic explains.
- Plain statements, no emphasis language. H2/H3 headers only.

## Size and pruning

- Journal entries: target 20–50 lines. Topic pages: budget ~150 lines.
- Topic pages: prune superseded Decisions bullets rather than annotating them as done; the pruned detail stays recoverable via the journal entry the bullet linked.
- INDEX.md Journal section: when it exceeds ~100 lines, roll the oldest year's lines into `journal/ARCHIVE-<year>.md` (same line format) and leave one `Older:` pointer line.
- Any wiki file over 100 lines opens with `## Contents` right after the H1 + purpose line.

## Templates

### Journal entry

```markdown
---
date: YYYY-MM-DD
topics: [<topic-slug>]              # topic slugs touched, or []
plan: plans/YYYY-MM-DD-<slug>.md    # or none
pr: pending                         # or the PR URL
---
# <Title>

## Why
<the problem/motivation — the part git can't tell you; 2–6 bullets>

## What changed
<decision-level summary, not a diff; include what was ruled out and why, if anything>

## Files
<key paths only>

## Follow-ups
<open threads; omit the section if none>
```

### Topic page

```markdown
---
aliases: [<grounded lookup phrase>, <entrypoint or subsystem name>]
covers: [<exact repo-relative path>]   # optional
---
# <Subsystem> — Design History

<one-line purpose>

## Current state
<5–15 bullets: how it works now>

## Decisions
- YYYY-MM-DD — <decided X over Y because Z> ([plan](../plans/<file>.md), [journal](../journal/<file>.md))

## Open threads
<unresolved questions; omit the section if none>
```

Decisions are newest-first, one bullet per decision.

### Archived plan frontmatter

Prepended to the verbatim plan text:

```markdown
---
status: implemented | partial | not-implemented | superseded | out-of-scope
executed: YYYY-MM-DD            # or n/a
evidence: ["PR #N", "commit <sha>", ...]
source_tool: claude | codex | file
source: <original path on disk, or the session it was proposed in>
topics: [<topic-slug>]
audit_note: <deltas between the plan as written and what shipped>
---
```

### plans/INDEX.md row

```markdown
| YYYY-MM-DD | [<title>](<file>.md) | <status> | <evidence, comma-separated> | <topic slugs> |
```
