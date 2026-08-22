---
date: 2026-08-21
topics: [figma-code-connect]
plan: plans/2026-08-21-governed-figma-interaction-states-and-retrospective-capture.md
pr: pending
---
# Govern Figma interaction-state specimens

## Why

- Canonical masters and responsive specimens did not show the hover, focus, disabled, filled, expanded, or selected states developers encounter in code.
- Adding a master `State` property would have changed published design APIs and duplicated code behavior that already belongs in Storybook.
- Temporal behavior such as keyboard navigation, focus containment/restoration, motion timing, and announcements needed to remain executable evidence rather than static illustration.

## What changed

- Button, Link, Search input, Accordion, Tabs, and Tabs native-select now export targeted `InteractionStates` stories with pseudo-state forcing and behavior/style assertions.
- The additive registry contract classifies source-backed states as `rendered`, `already-represented`, or `runtime-only`; visual entries carry deterministic frame, instance, and component IDs, while runtime-only entries carry reasons and no visual nodes.
- Each pilot family received a reviewed `Interaction states` documentation matrix using connected canonical instances, outside labels, semantic variables, and documented focus rings. Existing master IDs, component keys, property mappings, publication states, and React APIs remain unchanged.
- Live-audit fixtures now reject detached state instances and containment drift. Contract fixtures reject missing pilot coverage, malformed not-applicable results, visual states without all IDs, runtime-only states with nodes, and ungoverned story exports.
- Page screenshots were reviewed after each family for state differentiation, focus visibility, disabled treatment, spacing, labels, clipping, containment, and token use.
- The authenticated live REST audit passed all 28 registered nodes after local and browser verification.
- Post-review Search input remediation replaced clear/search font glyphs with the exact 16×16 and 18×18 source SVGs, bound their strokes to the code-backed semantic collection, aligned result typography to the existing `Code/Tailwind/text-base` style, and corrected focus-ring radius/offset geometry. A numeric audit confirmed zero icon center delta across all seven connected state instances before the authenticated 28-node live audit passed again.
- The approved remaining-library rollout classified all nineteen non-pilot registrations before writes: seven static registrations are explicitly `not-applicable`, while twelve registrations with code-backed interaction behavior were delivered in validation-sized batches on the same issue branch.
- Compact interactions now cover Alert, Badge, Breadcrumbs, and CardMedia; range and transient feedback cover Slider and Toast; overlay coverage now includes Modal and Search overlay. Every matrix uses connected canonical instances, and runtime-only focus, keyboard, portal, announcement, timer, form, and motion behavior carries executable evidence instead of illustrative frames.
- Overlay review preserved Modal master `75:129` and Search overlay master `217:52`. Modal uses exact 40×40 source close controls over connected medium/large variants; Search overlay suppresses legacy stand-ins without collapsing layout and overlays the code's 860×48 pill field plus exact 18×18 search, 16×16 clear, and 16×16 close SVG geometry.
- Search overlay parity review corrected the evidence copy to the actual `InteractionStates` story and rebound every input value/placeholder to local `Code/Tailwind/text-base` style `S:7b7e62849cbadd52bd1f8728718e44ea287d1dda,`. All SVG center deltas are zero, semantic fills/strokes/radii are variable-bound, and registered master IDs, keys, property contracts, and publication state remain unchanged.
- After the overlay batch, the full pre-Figma suite passed 160 Chromium, 160 WebKit, 160 responsive-mode, and 18 reduced-motion tests; registry coverage/contracts and the authenticated 28-node live REST audit also passed.
- The In-page navigation family now shares one governed state section while retaining both registered masters: inline-disclosure `204:58` and modal-drawer `318:45`. The inline matrix covers desktop active/hover/focus and source-measured mobile collapsed/expanded/trigger-focus states; the modal-drawer matrix adds the real mobile trigger, open dialog, dialog-link focus, and exact-source close-control hover/focus appearances.
- Mobile navigation overlays were reconstructed from measured Storybook geometry rather than stretching canonical masters: the inline shell is 360×50 or 360×242 with a 358×48 control, while the modal trigger is 360×54 with a 358×52 control and the dialog remains 360×520. The direct chevron and close SVG paths have zero center delta, text uses `Code/Tailwind/text-base`, and all focus/hover surfaces are semantic-variable bound.
- Batch E passed 162 Chromium, 162 WebKit, 162 responsive-mode, and 20 reduced-motion tests. Registry coverage/contracts and the authenticated 28-node live REST audit also passed, with every state instance still connected to the expected canonical variant and no registered master identity, key, geometry, or property drift.
- The Carousel family closes the interactive rollout in one shared state section. Default Carousel covers start controls, next focus, one-snap advanced status, loop-enabled controls, and the honest one-slide/both-disabled state; Multi-card peek covers start, next focus, and advanced status while keeping one-snap navigation, full-containment inertness, responsive slide measurement, announcements, endpoint wrapping, and motion runtime-only.
- Carousel's default font-glyph arrows were a parity defect exposed by the exact-source rule. Code and both registered masters now use the original 20×20 source paths (`M12.5 15.5…` and `M7.5 4.5…`), with zero SVG-canvas center delta and semantic `text-primary` fills. Master IDs `211:4` and `277:71`, keys, 760×256 geometry, Label/Loop/Status-separator properties, and publication state were preserved.
- Final remaining-library verification passed 163 Chromium, 163 WebKit, 163 responsive-mode, and 21 reduced-motion tests, plus the package build, 47 Figma contract self-tests, registry coverage/contracts, and the authenticated live audit of all 28 registered nodes. All 28 registrations now carry governed interaction-state coverage or an explicit not-applicable decision.

## Files

- `components/button/Button.stories.tsx`
- `components/link/Link.stories.tsx`
- `components/search-input/SearchInput.stories.tsx`
- `components/accordion/Accordion.stories.tsx`
- `components/tabs/Tabs.stories.tsx`
- `components/tabs--native-select/TabsNativeSelect.stories.tsx`
- `components/alert/Alert.stories.tsx`
- `components/badge/Badge.stories.tsx`
- `components/breadcrumbs/Breadcrumbs.stories.tsx`
- `components/card/Card.stories.tsx`
- `components/slider/Slider.stories.tsx`
- `components/toast/Toast.stories.tsx`
- `components/modal/Modal.stories.tsx`
- `components/search-overlay/SearchOverlay.stories.tsx`
- `components/in-page-navigation/InPageNavigation.stories.tsx`
- `components/in-page-navigation--modal-drawer/InPageNavigationModalDrawer.stories.tsx`
- `components/carousel/Carousel.stories.tsx`
- `components/carousel/parts/CarouselControls.client.tsx`
- `components/carousel/parts/CarouselChevronIcons.tsx`
- `figma/library.json`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-live.cjs`
