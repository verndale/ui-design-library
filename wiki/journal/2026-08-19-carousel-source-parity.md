---
date: 2026-08-19
topics: [figma-code-connect]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: https://github.com/verndale/ui-design-library/pull/69
---
# Restore Carousel multi-card source parity

## Why

- Source-parity decision `sp-carousel-002` accepted the reusable fixed-width card-peek layout that code-to-Figma review had missed.
- The public Carousel needed a semantic layout choice without changing its existing single-slide default, canonical identity, interaction engine, or advanced `slideClassName` escape hatch.
- Client identity and cited source paths remain in the private audit; this repository records only neutral decision IDs and exact reusable values.

## What changed

`Carousel` now accepts `layout="single" | "multi-card-peek"`, defaulting to `single`. The alternate uses semantic tokens for 299px compact and 284px desktop slides plus 8px base and 12px wide gaps. Storybook exposes the control and tests exact layout values at 1440, 1024, 768, and 390, one-snap navigation, status announcement, partial-slide visibility, and off-screen `inert` behavior.

The default Figma master remains `211:4`. Unpublished master `277:71` is registered as `Carousel / Multi-card peek` on the same page, with exact-width specimen frames `279:80`, `279:85`, `279:91`, and `279:96`. Its five slides bind to `layout/slide-width`; its viewport gap binds to `layout/gap`. The responsive modes resolve to the same code values and each specimen has exactly one clipped partial-next card. No Figma publication or Code Connect surface was created.

The registry now distinguishes a fixed-prop presentation from a structural alternate. Duplicate primary presentations collectively cover each Figma-targeted decision exactly once, and an exact `fixedProps` value may satisfy the represented public prop. The original blanket per-registration rule was rejected because it forced the unchanged default master to claim an alternate-only decision.

## Review results

- Source-parity review passed: `sp-carousel-001` remains preserved, `sp-carousel-002` is represented on code, Storybook, Figma, and AI registry surfaces, and composition-specific consumer widths remain rejected under `sp-carousel-003`.
- A follow-up governed-Card composition review corrected the initial focus conclusion: the source-derived multi-card layout requires full containment, so a partially clipped Card must be inert. The component and cross-component stories now distinguish partial from fully visible slides and prove the correction; the follow-up is recorded in the 2026-08-20 journal entry. Family-level validator fixtures continue to reject missing and duplicate decision ownership.
- Contract regression testing found the first family-union rule also captured the grandfathered Button pair. Exact-once family ownership and shared-page enforcement now apply to cleared, explicitly labeled presentation families without changing pending legacy behavior.
- The 200% accessibility mode found that aliasing the exact gap to rem-based global spacing doubled 8/12px into 16/24px. The Carousel semantic gap is now explicitly pixel-valued, matching its fixed-width source contract at every zoom mode.
- Public-API review found the new layout union was not re-exported from the stable facade; `CarouselLayout` is now exported with `CarouselProps`.
- Design review found the first three-card master draft could not demonstrate the wide-card peek. The master now contains five cards; screenshots and structural checks confirm exact widths, gaps, clipping, hierarchy, and one partial-next card at every governed specimen width.
- Design review also found an obsolete Storybook sample-card margin that visually doubled the new track gap. The sample now fills its slide shell, and the default story asserts the original full-width single-slide contract.
- Full-page review found the Figma documentation rail still omitted `layout`; its redundant Controls row now documents `Single · Multi-card peek`, while the code-only list continues to cover previous/next labels.
- The same review found single-only usage wording; the rail now describes reviewing a sequence at the user's own pace and still requires stable slide order across breakpoints.
- The longer truthful Usage copy exposed an 8px documentation-section overflow. The section height now restores the governed 24px bottom inset; component and specimen dimensions were unchanged.
- React best-practices review found no component-boundary, hook, render, accessibility, or TypeScript regression after the story correction.

## Files

- `components/carousel/`
- `src/tokens/semantic.css`
- `.storybook/preview.ts`
- `figma/library.json`
- `figma/source-parity-baseline.json`
- `figma/PROMOTION-CHECKLIST.md`
- `scripts/lib/source-parity.cjs`
- `scripts/*source-parity*.selftest.cjs`

## Follow-ups

- Append the private implementation-completion lifecycle event after the library change lands; do not rewrite the immutable audit decision record.
- Keep the alternate Figma master unpublished until the maintainer separately authorizes publication.
