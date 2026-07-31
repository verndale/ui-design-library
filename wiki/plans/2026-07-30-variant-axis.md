---
status: implemented
executed: 2026-07-30
evidence: ["pending — maintainer commits", "issue #4"]
source_tool: claude
source: ~/.claude/plans/brief-native-variant-modular-cray.md
topics: [variant-axis]
audit_note: >
  Shipped as written. Deltas: the plan says "9 existing components" throughout;
  the tree actually has 11 (search-input and stat were added since the brief was
  scoped) — the checker reports "PASS 11" and all 11 are unchanged. §4/§Verification
  predicted "no graph artifact diff"; in fact graph.json tracks each node's byte
  count, so rewriting check-contracts.cjs changed its `bytes` field and graph.json
  was rebuilt (`pnpm graph:build`). The component subgraph is untouched (component=11,
  uses-tokens=11), but the capture's own three wiki files (journal, this plan, the
  topic) added nodes and edges — graph.json went 51->54 nodes / 81->90 edges and
  wiki/connections/wiki-wiring.md gained the four variant-axis edges. `pnpm evals:graph`
  passes after the rebuild; the pre-commit hook rebuilds automatically. The self-test
  shipped with 13 cases (the plan's 8, plus malformed-name, empty-half, lone-axis,
  duplicate-title, and a title-regex guard added after review).
---
# Native variant axis for `@verndale/ui-design-library`

## Delivery setup — do this FIRST (before any code)

1. **Branch off main:** `git checkout -b feat/variant-axis` (matches the repo's `feat/*`
   convention, e.g. `feat/wiki-docs`). Every edit in this plan lands on this branch, uncommitted.
   Branch creation is allowed; commit/push/merge/tag/PR stay the maintainer's.
2. **Create the `[Enhancement]` GitHub issue** in `verndale/ui-design-library` via the
   `github-issue-creator` skill (it drafts with the deterministic template and confirms before creating):
   - Title: `[Enhancement] Native structural variant axis — one canonical, multiple implementations`
   - Labels: **`enhancement`** + **`documentation`** (both verified present in the repo's label set —
     new capability *and* it edits README/AGENTS/CONTRIBUTING/wiki).
   - Body: the Context problem below, the scheme-B summary, and acceptance criteria (checker
     validates the axis; 9 existing components unchanged; `pnpm test` green; wiki captured;
     downstream flagged). Link this plan.

Both are non-code actions taken after plan approval (plan mode forbids running them now).

## Context

The library is keyed 1:1. `scripts/check-contracts.cjs` enforces a tri-equality —
`directory name === component.json.slug === kebab(canonical)` — and `kebab()` collapses
any run of non-alphanumerics to a single `-`, so it can **never** emit `--`. That gives
exactly one implementation per canonical. When two *structurally* distinct modules resolve
to the same catalog canonical — a plain nav bar and a mega menu, both → **Navigation** —
only one can live in the tree; the second collides on the same directory. Folding them into
one component's props is wrong (different DOM/slot/interaction contract); minting a second
canonical bloats the vocabulary. Both lose a reusable implementation.

This adds a **native structural variant axis**: one canonical can hold multiple
implementations, with deterministic `(canonical, variant) → directory` lookup, a bare
canonical still resolving to a default, and the whole axis **enforced** by the contract
checker (unlike today's free-form, unread `variants` array).

**Decisions locked (confirmed with maintainer):**
- **Scheme B — compound slugs.** Default stays the bare `components/<slug>/`; alternates are
  siblings `components/<slug>--<variant>/`. Chosen over subdirectories (A) and a manifest (C)
  because it keeps the flat one-directory-per-implementation model: the graph builder's
  single-segment regex and the downstream flat capture store need no structural change, every
  per-dir check (raw-colour, maturity, tokens, files) applies unchanged per variant, and
  determinism is *provable* — since `kebab()` can never emit `--`, `dir ⇄ (base, variant)` is a
  bijection. A breaks the graph regex + needs recursion; C breaks the "first `.tsx` is the impl"
  heuristic and hides variants from the graph.
- **Storybook titles enforced by the checker** (not convention-only), because two variants
  hardcoding `title: '<Canonical>'` collide in the sidebar and story-id namespace — exactly the
  silent drift the maturity-tag check already exists to prevent.
- **Full library-side implementation**, delivered uncommitted. No real second implementation
  exists yet, so the axis ships *defined, enforced, and tested* but unused until a capture lands.
  No fake component is shipped. Downstream `project-retrospective` is a flagged follow-up.

## The scheme

Two shapes, one of which is exactly today's:

```
components/<slug>/                    single-variant canonical (all 9 today) — UNCHANGED
├── <Component>.tsx
├── <Component>.stories.tsx
└── component.json                    no `variant`, no `default`

components/<slug>/                    ── default variant of a multi-variant canonical
│                                        component.json gains: variant, default: true
components/<slug>--<variant>/         ── each structurally-distinct alternate
                                         component.json: same canonical + slug, own variant, no default
```

`component.json` fields (additive):
- `variant` (string, `=== kebab(variant)`): the structural axis point. Present on **every** dir
  of a multi-variant canonical (default and alternates). Absent on single-variant components.
- `default` (`true`): present **only** on the bare/default dir of a multi-variant canonical.
- `slug` keeps meaning `kebab(canonical)` — so all dirs of one canonical **share** `slug`; the
  directory name (bare vs `slug--variant`) is what differs.
- The existing free-form `variants` **array** (Button's `primary`/`secondary`/… prop-value list)
  is a *different axis* and is left untouched. `variant` (singular, structural) vs `variants`
  (plural, prop values) coexist.

Resolution (what the downstream pipeline computes): bare `canonical` → bare dir (default);
`(canonical, variant)` where `variant` is the default's name → bare dir; where `variant` is an
alternate → `components/<slug>--<variant>/`. Deterministic in both directions.

## Invariants the checker enforces

Directory-name decomposition (`decompose(dirName)`), the safety core:
- split on `--`; **exactly 1 part** → bare dir; **exactly 2 parts**, both non-empty and each
  `=== kebab(half)` → compound (alternate); **3+ parts** → error. This single arity rule forbids
  `--` inside a variant name and guarantees the split is a bijection (proven safe against
  `mega-menu` vs `mega-menu--compact`: valid bases carry only single hyphens, so `--` appears
  only at the seam).

Per-dir (bare, no `--`):
- `contract.slug === base` (`=== dirName`); `kebab(contract.canonical) === base`.
- `variant` optional. If present ⇒ `kebab(variant) === variant` **and** `default === true`.

Per-dir (compound, `base--variant`):
- `contract.slug === base`; `kebab(contract.canonical) === base`.
- `contract.variant === <dir variant suffix>` (dir/field agreement — mirrors the existing
  slug↔dir and maturity-tag↔json drift guards).
- `contract.default !== true` (alternates are never the default).

Story-title (new; extracted from the stories file like the maturity tag):
- bare/default dir: `title === canonical`.
- alternate dir: `title` starts with `${canonical} /` (nests under the canonical in the sidebar)
  and is non-empty after the separator.

Cross-canonical pass (group all dirs by `base`; runs after the per-dir loop):
- if any alternate exists for a base, a bare default dir must exist **and** declare
  `variant` + `default: true`.
- exactly one `default` per canonical; variant names unique within the canonical; all dirs spell
  `canonical` identically; all story titles within the group are distinct.
- a bare dir declaring `variant`/`default` with **no** alternates is rejected (a single-variant
  canonical must not open an axis of one).

All existing per-dir checks (valid JSON, maturity enum, provenance, non-empty slots, tokens
defined, impl+stories present, maturity-tag agreement, raw-colour) run **unchanged** for every
dir — because each variant dir is a full standalone 3-file component the loop already visits.
The 9 current single-variant dirs produce byte-identical checker output.

## Implementation

Prerequisite: the branch + `[Enhancement]` issue from **Delivery setup** above are done first.

### 1. `scripts/check-contracts.cjs` (the sole enforcement point)

Add a `decompose` helper beside `kebab` (after line 45):

```js
// A component dir is a bare slug ("button") or a compound "<base>--<variant>" naming an
// alternate. kebab() collapses separator runs to one "-", so a valid slug never contains
// "--"; a single "--" therefore unambiguously splits base from variant.
function decompose(dirName) {
  const parts = dirName.split('--');
  if (parts.length === 1) return { base: dirName, variant: null, compound: false };
  if (parts.length !== 2) return { error: 'has more than one "--" separator' };
  const [base, variant] = parts;
  if (!base || !variant) return { error: 'has an empty half around "--"' };
  if (kebab(base) !== base) return { error: `base "${base}" is not kebab-case` };
  if (kebab(variant) !== variant) return { error: `variant "${variant}" is not kebab-case` };
  return { base, variant, compound: true };
}
```

In the loop (rename the loop var `slug` → `dirName`; add `const seen = [];` before it):
- decompose `dirName` first; on `parts.error`, `fail('[variant] components/${dirName} ' + parts.error)` and `continue`.
- change the two existing comparisons (current lines 78 and 83) from `slug` to `base`:
  `contract.slug === base`, and `kebab(contract.canonical) === base`.
- insert the variant block (compound → check `variant` matches suffix + not default; bare-with-variant → check kebab + `default:true`).
- extract `title` from the already-read stories source (`/title:\s*['"]([^'"]+)['"]/`) and apply the title rule for bare vs compound.
- every existing `components/${slug}/…` message literal becomes `components/${dirName}/…`.
- at the end of the body: `seen.push({ dirName, base, compound, variant: compound ? dirVariant : (contract.variant ?? null), isDefault: contract.default === true, canonical: contract.canonical, title })`.

After the loop, add the cross-canonical pass: group `seen` by `base`; emit the group-level
failures listed under *Invariants*.

Testable refactor (smallest, mirrors `build-graph.cjs`'s `require.main === module` idiom):
wrap discovery + loop + cross-canonical pass in `function check({ componentsDir = COMPONENTS, tokenCss = <read> } = {})`
returning the `failures` array (move `definedTokens` inside; `fail` pushes to a local array);
keep the CLI as a thin `if (require.main === module) { … process.exit(1) }`; add
`module.exports = { check, kebab, decompose }`. ~10 lines of restructuring, no new deps.

### 2. New failure messages (existing `[category] components/<path> …` style)

`[variant]` category (`<dir>` = directory name):
- `… has more than one "--" separator` / `… has an empty half around "--"` / `… base "<x>" is not kebab-case` / `… variant "<x>" is not kebab-case`
- `components/<dir> directory names variant "<a>" but component.json declares variant "<b>"`
- `components/<dir> is an alternate variant but sets default:true — the default lives in the bare directory components/<base>`
- `components/<dir> declares a variant but not default:true — the bare directory holds the default variant`
- `canonical "<base>" has alternate variant(s) components/<a> but no default directory components/<base>/`
- `components/<base> holds the default for a multi-variant canonical but does not declare variant + default:true`
- `canonical "<base>" declares variant "<v>" more than once`
- `canonical "<base>" is spelled inconsistently across its directories: "<A>", "<B>"`
- `components/<dir> declares variant/default but the canonical has no alternate variants`

`[stories]` (title):
- `components/<dir> story title "<t>" must equal the canonical "<canonical>"` (bare)
- `components/<dir> alternate story title "<t>" must start with "<canonical> /" so variants group under one canonical` (alternate)
- `canonical "<base>" has two stories titled "<t>" — variant titles must be distinct` (cross-canonical)

Modified existing messages keep their category; only the compared value changes (`base`).

### 3. Self-test + fixtures (new `scripts/check-contracts.selftest.cjs`)

Plain-node self-test (mirrors the `scripts/evals/*.cjs` pattern — no test framework). It builds
tiny fixture trees in a temp dir (`fs.mkdtempSync`), each a minimal `components/` with a
`component.json` + a `.tsx` + a `.stories.tsx` (carrying a `maturity:*` tag and a `title`), passes
a literal `tokenCss`, calls `check({ componentsDir, tokenCss })`, and asserts the returned array.
Cases: (1) passing multi-variant pair; (2) orphan alternate; (3) bare declares `variant` but not
`default:true`; (4) compound `variant` disagrees with suffix; (5) alternate sets `default:true`;
(6) duplicate variant name; (7) title collision / bad alternate title; (8) sanity: a lone
single-variant dir with neither field passes. Add `"contracts:selftest": "node scripts/check-contracts.selftest.cjs"`
and wire it into the `test` gate: `… && pnpm contracts && pnpm contracts:selftest && pnpm test:stories && …`.
This is the one deliberate gate addition — a validated axis needs a tested validator.

### 4. `scripts/graph/build-graph.cjs` — label de-dup (optional but included)

`extractLabel` (lines 108–116) returns the shared `canonical`, so variants would render as
duplicate nodes. Change to append the variant for alternates:
```js
const label = parsed.canonical || parsed.slug || path.basename(path.dirname(id));
return parsed.variant && parsed.default !== true ? `${label} (${parsed.variant})` : label;
```
Node ids are path-based (already unique), so this is cosmetic and deterministic. No artifact
diff today (no variant dir exists), so the graph eval stays green.

### 5. Docs (paste-ready deltas — additive, nothing implies the 9 changed)

- **README.md** — `## Layout` block: add the `components/<slug>--<variant>/` shape below the
  existing three-file block as "(optional)". Restate the keying line ("`<slug>` is always
  `kebab(canonical)`") to: single canonical → slug alone; multi → key is `(canonical, variant)`,
  default on the bare slug, alternates on `<slug>--<variant>`. Add a variant-aware import example
  under "Consuming it", and one paragraph under "How a component gets here" for how a structural
  variant lands.
- **AGENTS.md** — Contract #1 (line 15): extend "Slug equality" to cover the axis while keeping
  determinism the point (key is `(canonical, variant)`, default on bare slug, alternates as
  `components/<slug>--<variant>/`, one `default`). Add a "Structural variants" note under "Adding
  a component" distinguishing `variant` (structural) from `variants` (prop values).
- **CONTRIBUTING.md** — Contract #1 mirror; a step-7 for landing a structural variant; a
  "what not to do" bullet: don't fold a structural variant into the `variants` array.

### 6. Wiki capture (MECHANICS same-delivery protocol; slug `variant-axis`, date `2026-07-30`)

- **Journal** `wiki/journal/2026-07-30-variant-axis.md` — frontmatter `topics: [variant-axis]`,
  `plan: plans/2026-07-30-variant-axis.md`, `pr: pending`; bodies Why / What changed (record B
  chosen over A and C, and why) / Files / Follow-ups (the downstream note).
- **Archived plan** `wiki/plans/2026-07-30-variant-axis.md` — this plan copied verbatim with the
  status frontmatter (`status: implemented`, `executed: 2026-07-30`, `source_tool: claude`,
  `source: ~/.claude/plans/brief-native-variant-modular-cray.md`, `topics: [variant-axis]`,
  `audit_note: <deltas at delivery>`). Add the `wiki/plans/INDEX.md` row and bump totals `2 → 3`.
- **Topic** `wiki/topics/variant-axis.md` (new) — `aliases` (variant axis, structural variant,
  compound slug, one canonical many implementations, `slug--variant`, mega menu vs nav bar),
  `covers: [scripts/check-contracts.cjs]`; `## Current state`, `## Decisions` (the newest-first
  bullet for 2026-07-30 with plan+journal links), `## Open threads` (the downstream capture-file
  naming + no variant captured yet). Rationale for creating a topic now despite the "≥2 entries"
  guideline: this modifies contract #1 (the deepest keying invariant) and no existing topic
  covers the keying spine — the three today are all tooling.
- **INDEX.md** — one Journal line + one Topics line (`variant-axis` sorts after `storybook-tooling`).

### 7. Storybook title convention (documented alongside the enforced check)

Default: `title: '<Canonical>'`. Alternate: `title: '<Canonical> / <Variant Label>'` (Storybook
path syntax nests the alternate under the canonical). The human label after `/` is free; the
checker enforces only the structural anti-collision property (starts with `<Canonical> /`,
distinct within the group).

## Downstream follow-up — `project-retrospective` (flag only, separate repo)

Confirmed present locally at
`/Users/joe.fusco/Projects/@verndale/project-retrospective/skills/project-retrospective/scripts/capture-preflight.cjs`
(verndale/project-retrospective#12). **Not touched in this delivery** — recorded in the journal
Follow-ups and topic Open threads. Shape to hand off under B:
- capture files: default `captures/<kebab-canonical>.md` (unchanged); alternate
  `captures/<kebab-canonical>--<variant>.md` — same `--<variant>` suffix as the library dir.
- preflight rule: "one capture file per canonical" → "one capture file per `(canonical, variant)`",
  parsed by the same `--` split; a clean bijection with the component dirs.
- capture template + report-parity: carry `variant` / `default` so a captured alternate
  round-trips into `components/<slug>--<variant>/`.
- specific edits in that repo (from reading it): key `record.slug` on the composed key (fixes a
  latent `findOrphanedByRun` false-positive that would flag every alternate dir as orphaned),
  scaffold the variant-encoded story title, and inspect `components/<composedKey>/`. Beware its
  `-{2,}→-` kebab — never re-kebab a composed key.

## Files touched (this delivery)

- `scripts/check-contracts.cjs` — decompose, base-aware slug/canonical, variant block, title
  check, cross-canonical pass, `check()` export.
- `scripts/check-contracts.selftest.cjs` (new) + `package.json` (`contracts:selftest`, `test` gate).
- `scripts/graph/build-graph.cjs` — `extractLabel` variant label.
- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`.
- `wiki/journal/2026-07-30-variant-axis.md` (new), `wiki/plans/2026-07-30-variant-axis.md` (new),
  `wiki/plans/INDEX.md`, `wiki/topics/variant-axis.md` (new), `wiki/INDEX.md`.

No `components/*` files change (no real variant exists yet).

## Assumptions & blast radius

- **Assumption (load-bearing):** `kebab()` can never emit `--`. Verified in-file (line 43
  `[^a-z0-9]+` → single `-`). The entire bijection rests on this; if `kebab` ever changed, the
  split-arity guard still rejects malformed names but the safety proof would need revisiting.
- **Assumption:** the 9 current components carry neither `variant` nor `default` → decompose
  returns `{compound:false, variant:null}`, no new check fires, output unchanged. Verified.
- **Blast radius:** the checker rewrite touches the two comparisons that today read the dir name
  (lines 78, 83) — these must switch to `base` or every alternate fails spuriously. The `test`
  gate gains `contracts:selftest`. Storybook auto-discovers variant stories via its `**` glob (no
  config change) but the title check is now load-bearing against sidebar collision. Consumer
  imports for alternates contain `--` (legal everywhere; default imports are byte-identical to
  today). Graph label change is cosmetic with no current artifact diff.

## Verification

1. `pnpm contracts` — the 9 existing components still `PASS` (byte-identical output).
2. `pnpm contracts:selftest` — all fixture cases pass (each expected failure produced; the
   passing multi-variant pair returns `[]`; the single-variant sanity dir returns `[]`).
3. `pnpm test` — full gate green (`typecheck && contracts && contracts:selftest && test:stories && test:motion`).
4. Graph eval (its runner / pre-commit) stays green — no variant dir yet, so `graph.json` and
   `wiki/connections/*` are unchanged.
5. Launch a read-only review agent over the checker diff + docs/wiki to confirm the invariants
   match the prose and no existing message regressed.
6. Hand back the `feat/variant-axis` branch uncommitted, linked to the tracking issue, with a
   Conventional Commits message suggestion (`feat(contracts): add native structural variant axis`).
   Maintainer commits/pushes/opens the PR.
