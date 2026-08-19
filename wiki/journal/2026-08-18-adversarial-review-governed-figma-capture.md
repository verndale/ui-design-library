---
date: 2026-08-18
topics: [figma-code-connect]
plan: none
pr: pending
---
# Harden governed Figma capture after adversarial review

## Why

- Primary coverage trusted `manifestCanonical`, so a registry entry could override a mismatched code canonical and still appear covered.
- Review proof required only an existing journal path; it did not prove that the journal named the registered node, and duplicate pass values collapsed to a passing set.
- Package and workflow checks relied on substring presence, leaving placeholder validation commands and disguised Code Connect commands or files as bypasses.
- The live audit collapsed duplicate property names, while current documentation still described removed template parsing and a code-only capture finish.

## What changed

- Made primary coverage require exact path, canonical, slug, and export identity with no primary `manifestCanonical` override.
- Made review passes exact and node-specific, added the reviewed node list to the original remediation journal, and rejected duplicate recorded/live property names.
- Required exact coverage, registry, live, aggregate-contract, and self-test command composition; CI now proves the REST secret is present and Code Connect residue in package metadata, lockfiles, workflows, registry values, or template-like files fails.
- Added a full pre-Figma code suite so SSR, Storybook behavior, both browser accessibility passes, display modes, and reduced motion must pass before a master can be created.
- Updated the component-capture overview and live-audit documentation to match the actual unpublished Figma and read-only REST boundaries.

## Files

- `scripts/check-figma-coverage.cjs`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-live.cjs`
- `figma/library.json`
- `README.md` and `figma/README.md`

## Follow-ups

- The repository-only review passed locally. The authenticated live-node audit remains a GitHub Actions check because the REST token is not present in the local environment.
