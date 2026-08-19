---
date: 2026-08-18
topics: [figma-code-connect]
plan: none
pr: https://github.com/verndale/ui-design-library/pull/50
---
# Keep Figma CI read-only and REST-only

## Why

- The AI orchestration resolves canonical component labels to exact npm package subpaths and does not depend on Figma Dev Mode snippets.
- An authenticated Code Connect dry run therefore added a second write-capable personal credential, rotation burden, and parallel handoff surface without serving the governed AI consumption path.
- The live Figma audit remains valuable because it detects node, property, style, color, and spacing drift independently of Code Connect publication.

## What changed

- Reduced CI to one `FIGMA_REST_TOKEN` with `file_content:read` and renamed the workflow around Figma library validation.
- Removed the Code Connect token, authenticated dry-run step, and package dry-run script. Repository contracts now reject any package or workflow command that invokes `figma connect publish`.
- Retained all twenty-three parserless templates, their type checking, contract validation, and local parsing as optional future metadata.
- Recorded Code Connect as an optional explicit future decision rather than a release requirement for the npm-based orchestration.

## Files

- `.github/workflows/figma-library-validation.yml`
- `package.json`
- `scripts/check-figma-contracts.cjs`
- `figma/library.json`
- `figma/README.md`
- `figma/PROMOTION-CHECKLIST.md`
- `wiki/topics/figma-code-connect.md`

## Follow-ups

- Replace the temporary personal REST token with an Organization Plan Access Token when IT provisions one.
- Keep Code Connect unpublished unless a concrete Dev Mode or Figma-native AI consumer justifies adopting it.
