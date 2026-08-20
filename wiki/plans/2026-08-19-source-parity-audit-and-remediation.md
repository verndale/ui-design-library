---
status: partial
executed: 2026-08-19
evidence:
  - "issue #58"
  - "working tree"
  - "21-component private audit"
  - "source-parity validator self-tests"
  - "PR #64 https://github.com/verndale/ui-design-library/pull/64 (merged 2026-08-20)"
  - "issue #62"
  - "Carousel alternate Figma master 277:71 and responsive specimens"
source_tool: codex
source: task 01a01b74-1a24-7151-b8aa-624603e60894
topics: [figma-code-connect]
audit_note: Public redacted execution copy. The governance foundation and complete private audit landed; Carousel remediation is complete in its uncommitted issue worktree and unpublished Figma representation, leaving four component remediations sequenced separately. Client identities, revisions, paths, and cited facts remain in ui-design-evidence.
---
# Official Source-Parity Audit and Remediation Plan

## Contents

- Summary
- Tracking and branch strategy
- Deterministic audit contract
- Audit matrix
- Future retrospective enforcement
- Evidence lifecycle
- Library contract and migration
- Audit result and remediation sequence
- Carousel direction
- Review and validation gates
- Acceptance criteria
- Fixed defaults

## Summary

Audit all 21 governed components against reusable source behavior, visual layout, and invariants rather than stopping at agreement among normalized code, Storybook, Figma, and AI metadata.

The initiative creates deterministic source-parity decisions, classifies every source difference, remediates only reusable opportunities, and makes parity mandatory for future captures. Historical run outputs remain unchanged. Private source evidence stays in the sanctioned evidence repository; the public library receives neutral decision IDs and digests only.

No commit, push, pull request, issue closure, Figma publication, merge, tag, or release is authorized by this plan.

## Tracking and branch strategy

- Use one audit/tooling issue and local issue branch in each repository receiving foundation changes.
- Use a separate library issue and branch for each component with accepted, non-empty remediation.
- Create brain tracking only for a genuinely new semantic role, affordance, interaction model, or canonical pattern.
- Reconcile sanctioned labels and deterministically reuse open issues before creating new ones.
- Begin each branch from clean, aligned `main`; do not layer the initiative over unrelated work.
- Stop each branch at an uncommitted handback. Begin a component branch only after the preceding foundation is safely committed or landed.

## Deterministic audit contract

Pinned Git objects provide source facts. Future inventories record exact commits. Historical inventories use explicitly graded reconstructed revisions; legacy untracked registrations remain marked as such. Every citation records repository-relative paths, line ranges, and a SHA-256 hash without modifying a source checkout.

The private append-only audit contains one aggregate and one component record per governed key. Every future capture has exactly one `source-parity/<component-key>.json` companion for its capture Markdown.

Schema version 1 records:

- Audit, component, canonical, and capture identity.
- Source snapshot strategy, timestamp, commit, citations, and hashes.
- Coverage of behavior, layout, invariants, code, Storybook, Figma, and AI resolution.
- Stable observation and decision IDs, exact source facts and values, and normalized-surface evidence.
- A `preserved` or `difference` comparison.
- Exactly one classification for every difference: intentional de-clienting, semantic public prop, composition specimen, structural alternate, new brain canonical, or rejection.
- Disposition, target surfaces, implementation state, and review evidence.

An audit cannot close with incomplete coverage, an unclassified difference, an accepted decision without a target, or pending accepted remediation.

## Audit matrix

Apply one matrix to Accordion, Alert, Avatar, Badge, Breadcrumbs, Button, Card, Carousel, Image, In-page navigation, Link, Modal, Quote, Rich text, Search input, Search overlay, Section header, Slider, Stat, Tabs, and Toast.

For each component:

1. Inspect pinned source entry points, tests, styles, build fingerprints, direct importers, and composed consumers.
2. Inventory interaction/state, accessibility/focus, responsive layout, cardinality/overflow/ordering/composition, and materially defining exact values.
3. Compare public TypeScript, defaults, DOM, styles, Storybook controls/tests, Figma masters/specimens, and AI identity/render metadata.
4. Record preserved behavior and classify every difference with the closed enum.
5. Reject branding, content, CMS, analytics, routing, and project orchestration unless they reveal a reusable invariant.
6. Create remediation tracking only for accepted, non-empty work.

## Future retrospective enforcement

- Add a directly linked source-parity reference defining the matrix, classifications, citations, schema, and review protocol.
- Update the workflow, proposal template, README, library-integrity checklist, tracking contract, and operator handback.
- Record exact source commits in future inventory output while accepting graded legacy provenance.
- Add zero-dependency pinned-read, hash, schema, coverage, cardinality, and completeness validation.
- Advance capture preflight and make unresolved source parity a hard block.
- Require source-parity, adversarial, and design review passes before Figma-ready promotion.
- Keep landed historical captures readable and unchanged; reopened actionable captures receive new companion artifacts.
- Update synthetic fixtures, validator tests, graph outputs, operator docs, wiki topic, journal, and archived plan.

Scripts decide structure and completeness; the model authors evidence-based prose decisions.

## Evidence lifecycle

- Add an immutable 21-component private audit pack and authored index.
- Require future companion artifacts without rewriting existing run output.
- Distinguish exact, reconstructed, and legacy-untracked provenance.
- Validate the exact current component set, capture identities, hashes, pinned revisions, coverage, stable unique decisions, classified differences, and closure state.
- Record rationale in private wiki/journal/plan records and rebuild derived outputs.

## Library contract and migration

Add `uiDesignLibrary.sourceParityContractVersion: 1`. Every component manifest carries a compact client-neutral source-parity object with version, audited family key, audit status, private digest/reference, stable decision IDs, decision-scoped implementation targets and representation surfaces, and their surface union. Structural siblings carry the same family projection. Storybook and Figma carry matching evidence.

Extend existing validators:

- Code contracts validate manifests and Storybook decision coverage.
- Figma coverage validates matching registration evidence.
- Figma contracts validate typed, decision-scoped representation status, implementation ownership, public-prop mappings, three review passes, and master/specimen mapping.
- Live Figma checks registered master types, governed widths, and that every specimen actually contains an instance of its declared master without writing or publishing.
- AI registry validation confirms canonical, import, rendering, and realization resolution.

Use a fixed migration baseline with the exact original 21 keys. New keys can never enter. Audit-cleared components leave in the foundation; actionable keys leave only with dedicated remediations. Remove the mechanism after its final key clears.

## Audit result and remediation sequence

Sixteen components are audit-cleared. Five have accepted, non-empty decisions and therefore receive dedicated work only after the foundation lands:

- Button: semantic public icon-only presentation prop with an accessible-name obligation.
- Carousel: semantic multi-card-peek layout.
- In-page navigation: structural portal-backed modal drawer alternate.
- Slider: semantic native-form name/hidden-value contract.
- Tabs: semantic horizontal visual variant plus a structural narrow native-select alternate.

No audit finding requires a new brain canonical.

## Carousel direction

Keep the canonical Carousel and default single-slide behavior. Add `layout: 'single' | 'multi-card-peek'`, defaulting to `single`, while retaining `slideClassName` as an advanced code-only escape hatch unless remediation evidence changes that decision.

Keep the current default master and add a separate registered `Carousel / Multi-card peek` master on the same family page with 1440, 1024, 768, and 390 specimens. Use exact source-derived slide widths and gaps mapped to exact semantic tokens; introduce a semantic Carousel layout token when no exact token exists. Preserve start alignment, one-slide scrolling, contained scroll, navigation/status, and off-screen focus behavior. Record composition-specific consumer widths as intentional differences.

## Review and validation gates

The source-parity review independently confirms cited facts, de-clienting decisions, one classification per difference, complete target representation, and evidence-backed rejection. Accepted changes receive fresh adversarial and design reviews after all surfaces agree; unchanged components may cite existing adversarial/design evidence.

Run each repository's complete test, build, schema, graph, wiki, and derived-output gates. The library also runs Storybook interactions, Figma coverage/contracts, authenticated read-only live validation when available, package verification, and responsive visual evidence for changed representations. Figma remains unpublished.

## Acceptance criteria

- All 21 components have immutable validated decisions and complete surface coverage; remediation completion is recorded through append-only private events rather than rewriting those decisions.
- Every difference is classified and supported by pinned hashed evidence.
- Every accepted remediation agrees across its declared public surfaces.
- Carousel has either the verified semantic multi-card-peek contract or a documented evidence-backed rejection.
- The temporary baseline is empty and removed.
- Future captures cannot pass without source-parity inventory and review.
- Historical output stays byte-for-byte unchanged.
- No empty downstream or brain work is created.
- All reviews, tests, live read-only checks, journals, wikis, and plans pass without publishing or releasing.

## Fixed defaults

- Audit identifier: `2026-08-19`.
- Hybrid tracking and categorical decisions.
- Read-only source checkouts and private client evidence.
- A visual difference alone never creates a brain canonical.
- Default library behavior stays backward compatible unless a dedicated remediation explicitly changes it.
