---
date: 2026-08-03
topics: []
plan: none
pr: pending
---
# Add the Tabs component

## Why

- A project retrospective banked a mature, CMS-free pill-tablist implementation whose value is its accessibility contract, not its styling — a WAI-ARIA `tablist` that another project should start from rather than rebuild.
- The pattern resolves to the **Tabs** catalog canonical, so the library has a name to key the directory on.

## What changed

- Added `components/tabs/` — a de-cliented `Tabs`: a `tablist` of real `tab` buttons where the selected tab carries `aria-selected` and is the only one in the tab order (roving `tabIndex`), and ArrowLeft/ArrowRight move selection **and** focus with wraparound. Presentation only — the caller owns the panels.
- Given an uncontrolled mode (`defaultActiveId`) with an optional controlled override (`activeId` + `onSelect`), matching the library's existing Slider convention; the captured implementation was controlled-only.
- Mapped client Tailwind utilities onto library semantic tokens: the selected segment to `bg-surface-inverse` / `text-text-inverse`, the idle/hover text to `text-text-secondary` / `text-text-primary`, the pill to `rounded-pill`, and the paddings/gaps to the `spacing-2xs`/`spacing-m` utilities. The colour transition moved onto `duration-[var(--duration-base)]`, so reduced motion is handled by the token layer rather than a per-component media query. The de-client record is the `declienting` array; provenance is in `component.json`.
- Kept verbatim: the roving-tabindex + Arrow-key selection/focus loop, `aria-selected`, and the two-item keyboard guard — the contract that made it worth capturing.

## Files

- components/tabs/Tabs.tsx, components/tabs/Tabs.stories.tsx, components/tabs/component.json

## Follow-ups

- The `pill` variant is the only treatment captured; an underline/boxed variant can follow on the native variant axis if a consumer needs one.
- No client type-scale token exists here, so the label size uses `text-base`; a `--text-*` token would let it be re-themed like the colours are.
