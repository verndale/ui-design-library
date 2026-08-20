---
date: 2026-08-20
topics: [component-architecture, figma-code-connect, story-testing]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: https://github.com/verndale/ui-design-library/pull/76
---
# Restore Slider native-form source parity

## Why

- Private decision `sp-slider-002` accepted the source's named hidden output as reusable native-form behavior while the normalized Slider exposed only its internal range index.
- The remediation needed to preserve the existing option-value API, accessible named scale, Figma master `178:76`, and default visual behavior.
- Form submission had to define duplicate-name, controlled/uncontrolled, reset, disabled-fieldset, and empty-option behavior without restoring project DOM scanning or adding an unrelated disabled prop.

## What changed

- Added optional `name`. The range remains unnamed while one hidden input submits the selected semantic option value; no output renders without a name or selected option.
- Kept controlled selection owner-driven. Native reset restores uncontrolled state to `defaultValue` and forces controlled DOM back to the owner's value after the browser reset step.
- Relied on native disabled-fieldset semantics so disabled forms omit both controls without expanding the Slider API.
- Added real-form Storybook interactions for unique name/value submission, controlled and uncontrolled reset, disabled omission, and empty options. The AI realization contract records the hidden output and each keyed behavior.
- Preserved Figma component set `178:76` and variants `178:4`, `178:22`, `178:40`, and `178:58`. Added nonvisual text property `Name#326:0` with no visible layer or new specimen; existing 1440/1024/768/390 specimens remain governed and unchanged.
- Removed Slider from the temporary legacy source-parity baseline after all four declared surfaces agreed.

## Reviews

- Source-parity review passed after the reconstructed pinned template and behavior hashes matched the immutable audit and the hidden output submitted the selected option value without source content or orchestration.
- Adversarial review fixed an overly broad reset-effect dependency, then passed duplicate-name, controlled/uncontrolled reset, disabled-fieldset, empty-option, SSR, hydration-safe browser access, and AI structural resolution checks.
- Design review passed after an authenticated live inspection and fresh master screenshot confirmed unchanged visual geometry, stable identities, intact responsive specimens, and nonvisual-only Name metadata.

## Files

- `components/slider/`
- `tests/ssr/components.ssr.test.tsx`
- `figma/library.json`
- `figma/source-parity-baseline.json`
- `ACCESSIBILITY.md`
- `wiki/`

## Follow-ups

- Append the private Slider remediation-completion event only after this branch lands. Figma publication remains an explicit maintainer action.
