---
date: 2026-09-17
topics: [figma-code-connect]
plan: none
pr: pending
---
# Restore the live Figma contract

## Why

- Current Figma REST responses exposed lower-camel property keys without display names, so the live validator first needed deterministic property-identity normalization.
- The normalized audit then found genuine drift: Search input used lower-case variant values and four newer control masters referenced presentation-era dimension and typography variables outside the authoritative code-parity collection.
- The code-parity collection did not yet include typed mirrors for zero spacing or the default body typography primitives those masters require.

## What changed

- Preserved the registered Search input, Text input, Toggle, Segmented control, and Datepicker master IDs and component keys.
- Changed Search input's existing variant values to the governed `Empty` and `Filled` display casing without recreating its component set.
- Added scoped Code/Tailwind variables for zero spacing, sans body family, normal style, base size, and base line height, including Web syntax metadata.
- Rebound the four newer control masters from legacy dimension and typography variables to those typed Code/Tailwind variables, the existing code spacing scale, and the existing Tailwind border width.
- Expanded the deterministic allowlist and promotion checklist so future missing code primitives are added explicitly before a master binds to them.
- Re-ran structural and visual review on every changed page; properties, variants, states, connected instances, layout, and stable identities remain intact.

## Files

- `figma/library.json`
- `figma/PROMOTION-CHECKLIST.md`

## Follow-ups

- Keep Figma library publication and native Dev Mode readiness as separate explicit maintainer actions.
