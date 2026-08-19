---
date: 2026-08-19
topics: [figma-code-connect]
plan: none
pr: pending
---
# Correct Tabs spacing and Search overlay containment

## Why

- The Tabs responsive specimens placed the tabpanel directly against the 40px tab row, making the selected content read as part of the control instead of the panel.
- Search overlay forced idle and active masters to 320px even though their token-driven content needed 328px and 396px respectively. Results and wrapped mobile quick links escaped the raised surface.
- Both corrections needed to retain stable Figma node identity and use the same semantic spacing values as the package.

## What changed

Tabs now uses `gap-m` between its tablist and tabpanel in code, with a Storybook assertion against the active `--spacing-m` value (24px by default and overrideable by a client mode). All six Figma variants bind the corresponding `spacing/m` variable, so the four responsive instances inherit the same separation.

Search overlay keeps its existing 900px maximum width and full-width compact behavior, but both Figma variants now hug their token-bound content. The responsive instances also hug vertically, producing 328px for desktop idle and 396px for active or wrapped mobile examples without changing the registered component set, properties, or breakpoint canvases.

## Files

- `components/tabs/Tabs.client.tsx`
- `components/tabs/Tabs.stories.tsx`
- Figma `Tabs` component set `181:70`
- Figma `Search overlay` component set `217:52`
