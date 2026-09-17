---
date: 2026-09-17
topics: [figma-code-connect]
plan: none
pr: pending
---
# Normalize live Figma property identities

## Why

- The live REST response no longer includes `definition.name` for component properties.
- Current property keys use lower camel case while the governed registry keeps human-readable labels.
- Exact display-label comparison rejected every registered component and blocked the required live promotion gate.

## What changed

- Component-property matching now compares a deterministic lowercase alphanumeric identity while retaining each original live key for descendant references and variant lookup.
- Duplicate detection uses the same normalized identity so formatting differences cannot collapse two live definitions silently.
- The live self-test now covers lower-camel REST keys without `definition.name` against spaced registry labels.

## Files

- `scripts/check-figma-live.cjs`
- `scripts/check-figma-live.selftest.cjs`

## Follow-ups

- Merge `verndale/ui-design-library#98` before resuming capture preflight.
