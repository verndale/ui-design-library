---
status: implemented
executed: 2026-08-18
evidence:
  - "live Figma adversarial and visual audit passed"
  - "live-audit fixture self-tests"
  - "pnpm figma:validate"
source_tool: codex
source: approved fixes in the active Codex session
topics: [figma-code-connect]
audit_note: The live Figma file was repaired without publishing. The authenticated REST guard is implemented and mandatory in CI; its local network call remains conditional until a maintainer supplies FIGMA_REST_TOKEN.
---
# Figma adversarial and design-review remediation

## Objective

Repair the standards drift found by adversarial and design review, preserve every registered master identity, and convert the findings into repeatable repository checks.

## Phases

1. Reinspect the Button, Section header, and Alert standards plus live variables, text styles, masters, documentation, responsive specimens, and Code Connect mappings.
2. Restore documentation to the exact Button-standard left rail and keep Main, responsive specimens, and publish sources to its right.
3. Correct foundations and component visuals: variable scopes/syntax, the five Code/Tailwind text styles, semantic text-style coverage, color aliases, and spacing aliases.
4. Repair component semantics: Search overlay's visible versus code-only surface, Carousel's Loop visualization, Avatar's SLOT description, and Slider's intrinsic responsive widths.
5. Add a read-only live-node checker, adversarial fixtures, intentional nonvisual-mapping metadata, CI credential separation, and promotion-checklist rules.
6. Run Figma validation, repository contracts, tests, build, Graphify sync, and a final live visual/adversarial review.

## Boundaries

- Do not replace a registered component master or change its stable identity.
- Do not publish the Figma library or Code Connect mappings.
- Keep the existing public React APIs intact; only correct drift between the code, stories, registry, and Figma representation.
