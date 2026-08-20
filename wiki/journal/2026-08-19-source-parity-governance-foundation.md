---
date: 2026-08-19
topics: [figma-code-connect]
plan: plans/2026-08-19-source-parity-audit-and-remediation.md
pr: https://github.com/verndale/ui-design-library/pull/64
---
# Add source-parity governance to the library

## Why

- Existing promotion gates proved code-to-Figma agreement but did not prove that reusable source-project behavior survived normalization.
- A private, pinned audit cleared sixteen current components and found accepted, non-empty remediation for Button, Carousel, In-page navigation, Slider, and Tabs.
- Public contracts need stable decision identifiers without exposing client names, private paths, or source excerpts.

## What changed

The package, component manifests, Storybook metadata, and Figma registry now share source-parity contract version 1. The public projection preserves audited family identity, immutable decision digests, stable decision IDs, and per-decision target surfaces. The migration baseline preserves the immutable original 21-key set and contains only the five pending remediation keys; new components cannot enter it.

Storybook evidence is read from the actual exported meta object with the TypeScript parser, so comments and unused decoy objects cannot satisfy the gate. Each decision names its target implementation; unresolved structural targets may remain null only while grandfathered, and every structural sibling must inherit the same audited projection. Figma evidence is typed per decision: property-backed work names real public props and mappings, responsive work maps exact-width frames to the registered master instances they contain, and nonvisual metadata uses a nonvisual mapping without fake visual nodes. Private remediation completion is append-only and never rewrites the decision record or public digest.

The source-parity review cleared every unchanged registration. Existing adversarial and design review evidence remains valid for the five actionable components, but those registrations deliberately do not claim a source-parity pass while accepted representation work is pending. Each will require fresh source-parity, adversarial, and design review after its code, Storybook, AI metadata, and unpublished Figma representation agree.

| Registration | Current node | Audit key |
|---|---:|---|
| button-light | `22:2` | button |
| button-dark | `53:3` | button |
| section-header | `64:99` | section-header |
| alert | `66:112` | alert |
| card | `71:104` | card |
| card-media | `69:90` | card |
| modal | `75:129` | modal |
| avatar | `164:45` | avatar |
| badge | `167:80` | badge |
| link | `169:62` | link |
| image | `171:46` | image |
| quote | `172:39` | quote |
| rich-text | `173:62` | rich-text |
| stat | `176:12` | stat |
| search-input | `177:30` | search-input |
| slider | `178:76` | slider |
| breadcrumbs | `179:52` | breadcrumbs |
| accordion | `180:82` | accordion |
| tabs | `181:70` | tabs |
| toast | `184:40` | toast |
| in-page-navigation | `204:58` | in-page-navigation |
| carousel | `211:4` | carousel |
| search-overlay | `217:52` | search-overlay |

## Foundation review

- Adversarial review passed for the governance foundation. Regression cases reject Storybook comment/decoy evidence, duplicate decision mappings, unresolved structural targets outside the baseline, missing/mismatched family implementations, unrelated Figma masters, public props absent from realization/Figma mappings, responsive width drift, and empty specimen frames.
- Design review passed for the governance model. Semantic props, composition specimens, structural alternates, responsive property-backed variants, and nonvisual metadata no longer share a one-size-fits-all specimen rule; each decision is owned by its actual implementation and uses the smallest truthful Figma representation.
- A read-only Figma metadata check reconfirmed the unchanged canonical Carousel master at `211:4`. This foundation review does not clear Button, Carousel, In-page navigation, Slider, or Tabs; their post-remediation source-parity, adversarial, and design passes remain pending.

## Files

- `package.json`
- `components/*/component.json`
- `components/*/*.stories.tsx`
- `figma/library.json`
- `figma/source-parity-baseline.json`
- `scripts/lib/source-parity.cjs`
- `scripts/check-contracts.cjs`
- `scripts/check-figma-coverage.cjs`
- `scripts/check-figma-contracts.cjs`
- `scripts/check-figma-live.cjs`

## Follow-ups

- Land each accepted component remediation on its own issue branch after this foundation is safely committed or landed: Button [#59](https://github.com/verndale/ui-design-library/issues/59), Slider [#60](https://github.com/verndale/ui-design-library/issues/60), Tabs [#61](https://github.com/verndale/ui-design-library/issues/61), Carousel [#62](https://github.com/verndale/ui-design-library/issues/62), and In-page navigation [#63](https://github.com/verndale/ui-design-library/issues/63).
- Remove each key from `remainingKeys` only when its declared surfaces and fresh reviews pass; delete the baseline mechanism after the final key clears.
