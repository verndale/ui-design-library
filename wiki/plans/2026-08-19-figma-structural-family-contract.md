---
status: implemented
executed: 2026-08-19
evidence: [working tree, Figma coverage self-tests, Figma contract self-tests, current registry validation]
source_tool: codex
source: approved cross-repository implementation plan in the active Codex task
topics: [variant-axis, figma-code-connect]
audit_note: Implemented the library registry, validation, naming, family-page, AI-resolution, and documentation contract. Live Figma node creation, rearrangement, rendering, publication, and the broader separate Figma-alignment plan were not executed.
---
# Figma structural family contract

## Goal

- Mirror the existing native structural variant axis in governed Figma metadata.
- Resolve `canonical + optional variant` deterministically through component path, public import, and stable Figma node.
- Preserve published node identity and publication authority.

## Decisions

- Use one family page for structurally distinct imports sharing role, affordance, and interaction semantics.
- Keep the default Ready for Dev section first and qualified alternate sections below.
- Keep the default master name and identity; name alternates `Canonical / Variant label`.
- Promote a new brain canonical when semantics differ.
- Expose Figma properties only when they mirror the public TypeScript/Storybook contract.
- Keep Code Connect prohibited.
- Treat Button Light as the legacy Button family page without moving published nodes.

## Work

- Add optional variant, variantLabel, default, and familyPage fields to registry validation.
- Require exact manifest/registry structural identity and exact primary coverage matching.
- Require structural siblings to share the designated family page identity.
- Add family-page, naming, property, and AI-resolution guidance.
- Add adversarial self-tests for missing/duplicate family designations and malformed structural metadata.

## Acceptance

- Existing registrations pass without node replacement or movement.
- A structural alternate cannot pass with an ambiguous page, canonical-only node name, or mismatched import identity.
- Figma coverage and contract self-tests pass.
- Live publication remains an explicit maintainer action.
