---
date: 2026-08-18
topics: [figma-code-connect]
plan: plans/2026-08-18-figma-code-connect-pilot.md
pr: pending
---
# Promote the first governed Figma and Code Connect component set

## Why

- Designers and outside design houses deliver product work in Figma, but the public React library had no stable design-node contract.
- Earlier generated frames mixed documentation styling with component styling and did not preserve a consistent Ready for Dev structure.
- Code Connect needed to point at the package facade, not private source files, while preserving nested CardMedia and Button mappings.

## What changed

- Built seven Ready for Dev nodes in the Organization-owned UI Design Library: Button Light, Button Dark, Section header, Alert, Card, CardMedia, and Modal.
- Locked Button Light as the documentation template across every component page and kept ui-design-brain canonical component names unchanged.
- Bound component visuals to the library's Tailwind semantic variables; Cumulative Foundations remains documentation presentation only.
- Registered stable Figma node IDs and component keys in `figma/library.json`, including the manual organization ownership and publish-capability gate.
- Added parserless Code Connect templates using only `@verndale/ui-design-library/components/<slug>` imports.
- Card and Modal resolve code-connected instances inside Figma slots through each nested instance's own template.
- Added Figma type, story/property, public-import, node-identity, and nested-dependency contracts plus self-tests.
- Added a least-privileged CI dry run that cannot publish because its command always includes `--dry-run`.
- Reworked the pilot presentation pages around direct canonical instances: Button uses widened component matrices; Section header, Alert, Card, and CardMedia use separated responsive specimens; Modal preserves exact full-viewport instances. Labels and documentation scaffolding no longer replace or mask the canonical handoff layer.
- Registered the 1440/1024/768/390 viewport contract, component-only handoff rule, presentation patterns, and semantic spacing/surface bindings. Added a required promotion checklist and self-tested failures for wrapper-based handoffs, breakpoint drift, missing definition-of-done requirements, and token snapshot drift so future components follow the same pattern.

## Files

- `figma.config.json`, `tsconfig.figma.json`, `figma/library.json`, `figma/PROMOTION-CHECKLIST.md`, and `figma/components/`
- `scripts/check-figma-contracts.cjs` and its self-test
- `.github/workflows/figma-code-connect.yml`
- `README.md` and `wiki/topics/figma-code-connect.md`

## Follow-ups

- A maintainer must confirm Verndale Organization ownership and library-publish permission before the first Figma publication.
- Configure `FIGMA_CODE_CONNECT_TOKEN` as a scoped Organization Plan Access Token so CI can validate registered nodes.
- Figma library publication and Code Connect publication remain separate maintainer actions; afterward, smoke-test a separate consumer file.
