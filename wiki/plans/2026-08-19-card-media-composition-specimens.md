---
status: implemented
executed: 2026-08-19
evidence:
  - "issue #55 https://github.com/verndale/ui-design-library/issues/55"
  - "local branch feat/55-library-capture"
  - "Figma composition section 261:72"
  - Figma adversarial and design review
  - repository validation gates
source_tool: codex
source: confirmed implementation plan in the active Codex task
topics: [figma-code-connect]
audit_note: Implemented the live unpublished Card composition documentation and repository review evidence. No new brain canonical, evidence lifecycle record, structural import, Figma master, or public property was needed; publication remains a maintainer action.
---
# Card media-presence composition specimens

## Goal

- Show designers and AI consumers how Card behaves with and without media.
- Keep the rendering aligned with the public `Card` and `CardMedia` code contracts.
- Preserve the published Card master identity and publication boundary.

## Tracking

- Reconcile the sanctioned `Feature` and `area: components` labels.
- Create or reuse one deterministic library issue.
- Create `feat/<issue-number>-library-capture` from clean, aligned `main` only after the write set is non-empty.
- Do not create brain or evidence issues or branches when no canonical or lifecycle write exists.

## Figma work

- Keep Card node `71:104`, its component key, variants, and Content/Surface property set unchanged.
- Add a separate Ready for Dev composition section after Main and before Published source.
- Use a direct Card instance for each specimen.
- With media: compose a connected CardMedia instance and content inside the Card Content slot.
- Without media: use the same Card master and omit CardMedia from the Content slot.
- Bind documentation styling to governed variables and shared text styles.
- Remove stale Code Connect wording from the Card and Content property descriptions.

## Review

- Verify master identity, property keys, direct-instance linkage, connected CardMedia identity, aliases, styles, spacing, naming, and containment.
- Run a visual pass for hierarchy, wrapping, clipping, intrinsic sizing, and consistency with existing Ready for Dev sections.
- Fix every actionable finding in place without deleting or recreating the master.

## Repository evidence

- Record the executed plan and journal entry.
- Point Card review evidence at the new journal entry without changing registry identity or structural fields.
- Rebuild the knowledge graph and run the full library validation gates.

## Boundaries

- Do not commit, push, open a PR, publish the Figma library, merge, release, or close the issue.
