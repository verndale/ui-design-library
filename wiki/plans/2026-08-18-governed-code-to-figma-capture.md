---
status: implemented
executed: 2026-08-18
evidence: ["issue verndale/project-retrospective#69", "pnpm figma:validate", "coverage and contract self-tests"]
source_tool: codex
source: approved implementation plan in the active Codex task
topics: [figma-code-connect]
audit_note: The approved plan initially retained Code Connect as optional parse-only metadata. The maintainer explicitly superseded that choice during implementation: every Code Connect surface was removed and its reintroduction now fails contracts. A code-only contract command was added because aggregate contracts correctly require the Figma registration.
---
# Governed code-to-Figma capture workflow

## Summary

Make project-retrospective capture one continuous delivery: React/Tailwind/Storybook, code verification, unpublished Figma creation, adversarial/design review, in-place fixes, live validation, and completion. Publication stays manual.

## UI Design Library

1. Require every candidate or supported primary component to have a matching Figma registration.
2. Keep candidates unpublished and record a passed Button-standard adversarial/design review with journal evidence.
3. Integrate coverage with contracts, CI, and live read-only validation.
4. Review new components against Button, Section header, and Alert; preserve the 528px left documentation rail, content to the right, governed breakpoints, semantic variables, and intrinsic sizing.
5. Fix findings in place without replacing stable masters, and repeat review until clean.
6. Keep Figma library publication as an explicit maintainer action.

## Project Retrospective

1. File a labeled tracking issue and work from a branch off main.
2. Require the target library's Figma registry, promotion checklist, code-only contract command, coverage command, and validation command during preflight.
3. After code verification, create the unpublished Figma component and documentation.
4. Register stable identity, run adversarial/design review, repair findings, and record journal evidence.
5. Stop as `code complete, Figma promotion blocked` when no write-capable Figma session exists.
6. Run the Figma gates and complete library gates before handback; do not commit, push, publish, or open a PR.

## Code-consumption decision

Use canonical-slug npm imports exclusively. Do not install, configure, generate, authenticate, or publish Code Connect.

## Verification

- Coverage fixtures for missing candidate/supported registrations, identity drift, candidate publication, duplicate presentations, secondary exports, and structural variants.
- Registry fixtures for review evidence, Code Connect prohibition, publication policy, and live property drift.
- Retrospective preflight and conformance fixtures for required Figma capability, blocked handback, review ordering, and Code Connect prohibition.
- Full tests, builds, skill validation, and graph/wiki drift gates in both repositories.
