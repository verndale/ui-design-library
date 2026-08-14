# Graph Report - ui-design-library  (2026-08-14)

## Corpus Check
- 224 files · ~79,286 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1154 nodes · 1672 edges · 122 communities (85 shown, 37 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e85bad02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Modal.types.ts
- classNames.ts
- build-graph.cjs
- Breadcrumbs.stories.tsx
- check-contracts.cjs
- scripts
- components.ssr.test.tsx
- Carousel.stories.tsx
- SearchInput.stories.tsx
- SearchOverlay.types.ts
- Image.types.ts
- InPageNavigation.types.ts
- Slider.stories.tsx
- Tabs.stories.tsx
- Toast.types.ts
- compilerOptions
- Badge.stories.tsx
- exports
- compilerOptions
- check-component-architecture.cjs
- viewer.js
- dependencies
- Button.tsx
- RichText.types.ts
- test-next.cjs
- Card.types.ts
- SectionHeader.types.ts
- stat/index.ts
- ui-design-library
- build-exports.cjs
- check-release-commit.selftest.cjs
- UI Design Library — agent guide
- devDependencies
- package.json
- peerDependencies
- build-accessibility-report.cjs
- check
- sync-graphify.cjs
- Contributing
- Server-first component architecture migration
- files
- Knowledge graph
- check-component-architecture.selftest.cjs
- component-files.cjs
- serve.cjs
- preview.ts
- vitest.shared.ts
- clean-dist.cjs
- Accessibility contract
- page.jsx
- ./components/accordion
- ./components/alert
- ./components/avatar
- ./components/badge
- ./components/breadcrumbs
- ./components/button
- ./components/card
- ./components/carousel
- ./components/image
- ./components/in-page-navigation
- ./components/link
- ./components/modal
- ./components/quote
- ./components/rich-text
- ./components/search-input
- ./components/search-overlay
- ./components/section-header
- ./components/slider
- ./components/stat
- ./components/tabs
- ./components/toast
- publishConfig
- uiDesignLibrary
- routing.js
- eslint
- husky
- commit-msg
- post-checkout
- post-merge
- pre-commit
- prepare-commit-msg
- next
- playwright
- semantic-release
- @semantic-release/commit-analyzer
- @semantic-release/github
- @semantic-release/release-notes-generator
- storybook
- @storybook/addon-a11y
- @storybook/addon-docs
- storybook-addon-pseudo-states
- storybook-addon-tag-badges
- @storybook/addon-vitest
- @storybook/react-vite
- tailwindcss
- @tailwindcss/postcss
- @tailwindcss/vite
- @types/react-dom
- typescript
- @typescript-eslint/parser
- @verndale/ai-pr
- vite
- @vitejs/plugin-react
- @vitest/browser
- @vitest/browser-playwright
- main.ts
- manager.ts
- next.config.mjs
- dialog.client.ts
- Modal.stories.tsx
- SearchOverlay.stories.tsx
- Modal.client.tsx
- backgroundInert.client.ts

## God Nodes (most connected - your core abstractions)
1. `exports` - 45 edges
2. `scripts` - 38 edges
3. `SlotClassNames` - 22 edges
4. `compilerOptions` - 15 edges
5. `ui-design-library` - 15 edges
6. `check()` - 14 edges
7. `validateRealization()` - 14 edges
8. `check()` - 13 edges
9. `build()` - 12 edges
10. `UI Design Library — agent guide` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Modal()` --calls--> `useDialog()`  [EXTRACTED]
  components/modal/Modal.client.tsx → src/lib/dialog.client.ts
- `SearchOverlay()` --calls--> `useDialog()`  [EXTRACTED]
  components/search-overlay/SearchOverlay.client.tsx → src/lib/dialog.client.ts
- `Toast()` --calls--> `usePortalRoot()`  [EXTRACTED]
  components/toast/Toast.client.tsx → src/lib/usePortalRoot.client.ts
- `Accordion()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/Accordion.tsx → src/lib/classNames.ts
- `AccordionItem()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/parts/AccordionItem.client.tsx → src/lib/classNames.ts

## Import Cycles
- None detected.

## Communities (122 total, 37 thin omitted)

### Community 0 - "Modal.types.ts"
Cohesion: 0.18
Nodes (10): ModalClassNames, ModalHeadingLevel, ModalProps, ModalBody(), ModalFooter(), ModalHeader(), ModalHeaderProps, ModalPanelProps (+2 more)

### Community 1 - "classNames.ts"
Cohesion: 0.08
Nodes (36): Accordion(), Default, faq, FocusGating, ReducedMotion, ShowMore, Standalone, Story (+28 more)

### Community 2 - "build-graph.cjs"
Cohesion: 0.08
Nodes (46): { build, render, renderConnections, OUT_FILE, REPO_ROOT, CONNECTIONS_DIR_ID }, fs, { loadPolicy, policyProblems }, path, run(), areaOf(), build(), EDGE_KEY_SEP (+38 more)

### Community 3 - "Breadcrumbs.stories.tsx"
Cohesion: 0.07
Nodes (37): Breadcrumbs(), BackLinkPresentation, BackLinkWithoutAncestor, CollapsedBackLink, CustomLandmarkLabel, DeepTrail, Default, NoAncestors (+29 more)

### Community 4 - "check-contracts.cjs"
Cohesion: 0.08
Nodes (38): check(), COMPONENTS, decompose(), fs, { implementationFiles, listComponentDirs, storyFiles }, kebab(), MATURITIES, path (+30 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (38): scripts, accessibility, accessibility:report, architecture, architecture:selftest, build, build-storybook, commit (+30 more)

### Community 6 - "components.ssr.test.tsx"
Cohesion: 0.09
Nodes (19): Avatar(), CropsWideMedia, Default, Sizes, Story, WithDescribedPortrait, AvatarClassNames, AvatarProps (+11 more)

### Community 7 - "Carousel.stories.tsx"
Cohesion: 0.11
Nodes (17): Carousel(), Default, Empty, KeyboardTraversal, Looping, SingleSlide, Story, CarouselClassNames (+9 more)

### Community 8 - "SearchInput.stories.tsx"
Cohesion: 0.10
Nodes (19): control, SearchControls(), SearchField(), SearchFieldProps, SearchForm(), SearchFormProps, ClearGlyph(), SearchGlyph() (+11 more)

### Community 9 - "SearchOverlay.types.ts"
Cohesion: 0.23
Nodes (10): SearchOverlayContent(), SearchOverlayContentProps, SearchOverlayHeader(), SearchOverlayHeaderProps, SearchOverlayPanel(), SearchOverlayPanelProps, SearchOverlay(), SearchOverlayClassNames (+2 more)

### Community 10 - "Image.types.ts"
Cohesion: 0.14
Nodes (17): Image(), buildSrcSet(), CustomLoader, Decorative, Default, Responsive, Rounded, Story (+9 more)

### Community 11 - "InPageNavigation.types.ts"
Cohesion: 0.15
Nodes (16): InPageNavigation(), ActiveSection, Default, MobileDrawer, ReducedMotion, sections, Story, InPageNavigationClassNames (+8 more)

### Community 12 - "Slider.stories.tsx"
Cohesion: 0.14
Nodes (17): SliderScale(), SliderSelectedValue(), SliderTrack(), SliderTrackProps, optionIndex(), Slider(), Default, LongLabels (+9 more)

### Community 13 - "Tabs.stories.tsx"
Cohesion: 0.11
Nodes (19): base, TabButton, TabButtonProps, TabPanels(), TabPanelsProps, TabsList(), TabsListProps, Tabs() (+11 more)

### Community 14 - "Toast.types.ts"
Cohesion: 0.14
Nodes (16): ToastIcon(), ToastMessage(), tone, useToastDismiss(), positions, Toast(), AutoDismiss, Critical (+8 more)

### Community 15 - "compilerOptions"
Cohesion: 0.08
Nodes (24): components/**/*.ts, components/**/*.tsx, node_modules, **/*.spec.*, src/lib/**/*.ts, src/lib/**/*.tsx, **/*.stories.tsx, **/*.test.* (+16 more)

### Community 16 - "Badge.stories.tsx"
Cohesion: 0.14
Nodes (17): Badge(), BadgeStoryArgs, CustomRemoveLabel, Default, Disabled, disabledRemove, Dismissible, Group (+9 more)

### Community 17 - "exports"
Cohesion: 0.08
Nodes (24): exports, ./components/accordion/component.json, ./components/alert/component.json, ./components/avatar/component.json, ./components/badge/component.json, ./components/breadcrumbs/component.json, ./components/button/component.json, ./components/card/component.json (+16 more)

### Community 18 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, ./src/*, compilerOptions, allowSyntheticDefaultImports, baseUrl, esModuleInterop (+15 more)

### Community 19 - "check-component-architecture.cjs"
Cohesion: 0.11
Nodes (19): analyzeModuleGraph(), BROWSER_GLOBALS, checkPrimaryRendering(), checkPrimaryVariantOwnership(), CLIENT_HOOKS, COMPONENTS, explicitExportTargets(), explicitRuntimeExportNames() (+11 more)

### Community 20 - "viewer.js"
Cohesion: 0.19
Nodes (22): applyView(), buildIndexes(), buildLegend(), buildModel(), buildRenderer(), clearFocus(), EDGE_COLORS, edgeReducer() (+14 more)

### Community 21 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, embla-carousel-react, next, react, react-dom, tailwindcss, @tailwindcss/postcss, @verndale/ui-design-library (+14 more)

### Community 22 - "Button.tsx"
Cohesion: 0.15
Nodes (16): Button(), SIZES, Default, Disabled, OnDarkSurface, Sizes, Story, Variants (+8 more)

### Community 23 - "RichText.types.ts"
Cohesion: 0.18
Nodes (12): RichTextContent(), RichText(), Checkmark, Default, FullFlow, Story, base, lists (+4 more)

### Community 24 - "test-next.cjs"
Cohesion: 0.22
Nodes (16): assert, assertCompiledCss(), assertNativeImports(), assertNestedUtilityIsNested(), componentCandidates(), configureConsumer(), filesBelow(), fixtureRoot (+8 more)

### Community 25 - "Card.types.ts"
Cohesion: 0.19
Nodes (10): Card(), Default, Story, UnsetBackground, WithMedia, CardBaseProps, CardClassNames, CardMediaProps (+2 more)

### Community 26 - "SectionHeader.types.ts"
Cohesion: 0.20
Nodes (11): SectionHeaderContent(), SectionHeader(), Centered, Default, HeadingOnly, Story, WithInlineLink, SectionHeaderAlignment (+3 more)

### Community 27 - "stat/index.ts"
Cohesion: 0.20
Nodes (11): StatGroup(), Stat(), Default, GroupColumn, GroupRow, Story, WithDescription, StatClassNames (+3 more)

### Community 28 - "ui-design-library"
Cohesion: 0.12
Nodes (16): Accessibility is enforced, Consuming it, Context wiki, Environment, How a component gets here, Layout, Quality gates, Related (+8 more)

### Community 29 - "build-exports.cjs"
Cohesion: 0.18
Nodes (13): checkDist, componentRecords(), componentsDir, expected, expectedExports(), fail(), fs, { implementationFiles, listComponentDirs } (+5 more)

### Community 30 - "check-release-commit.selftest.cjs"
Cohesion: 0.20
Nodes (12): git(), readReleaseCommits(), assert, { execFileSync }, fs, os, path, {
  readReleaseCommits,
  validateReleaseCommit,
  validateReleaseCommits,
} (+4 more)

### Community 31 - "UI Design Library — agent guide"
Cohesion: 0.15
Nodes (13): Accessibility is the point, Adding a component, Commits & release, Component architecture, Context wiki, Environment, graphify, Graphify repository workflow (+5 more)

### Community 32 - "devDependencies"
Cohesion: 0.15
Nodes (13): @commitlint/cli, eslint-plugin-react-hooks, devDependencies, @commitlint/cli, eslint-plugin-react-hooks, @semantic-release/npm, @types/react, @verndale/ai-commit (+5 more)

### Community 33 - "package.json"
Cohesion: 0.15
Nodes (12): author, description, engines, node, license, name, packageManager, repository (+4 more)

### Community 34 - "peerDependencies"
Cohesion: 0.20
Nodes (10): embla-carousel-react, react, react-dom, embla-carousel-react, react, react-dom, peerDependencies, embla-carousel-react (+2 more)

### Community 35 - "build-accessibility-report.cjs"
Cohesion: 0.22
Nodes (9): COMPONENTS, fs, { listComponentDirs }, OUTPUT, path, renderReport(), RESPONSIBILITY_COPY, ROOT (+1 more)

### Community 36 - "check"
Cohesion: 0.44
Nodes (10): check(), checkSharedClientModules(), checkWorkspaceModuleGraph(), hasUseClient(), isClientPath(), parse(), physicalLines(), useClientIsFirst() (+2 more)

### Community 37 - "sync-graphify.cjs"
Cohesion: 0.20
Nodes (8): candidates, env, fs, graphPath, path, root, shouldStage, { spawnSync }

### Community 38 - "Contributing"
Cohesion: 0.22
Nodes (8): Adding a component, Commit messages, Contributing, Quick start, The component architecture, The three contracts, Verify the behaviour, not the markup, What not to do

### Community 39 - "Server-first component architecture migration"
Cohesion: 0.22
Nodes (9): Alert, Badge, Button, Carousel, Executable ESM and reuse contract v2, Next.js status, Server and client use, Server-first component architecture migration (+1 more)

### Community 40 - "files"
Cohesion: 0.22
Nodes (9): files, components, dist, LICENSE, MIGRATION.md, README.md, src/lib, src/tokens (+1 more)

### Community 41 - "Knowledge graph"
Cohesion: 0.22
Nodes (9): Adding a source, Contents, Differences from ui-design-brain, Edge types, How it works, Internal agent navigation, Knowledge graph, Node types (+1 more)

### Community 42 - "check-component-architecture.selftest.cjs"
Cohesion: 0.29
Nodes (7): cases, {
  check,
  checkSharedClientModules,
  physicalLines,
}, fs, os, path, valid(), write()

### Community 43 - "component-files.cjs"
Cohesion: 0.38
Nodes (6): checkIndex(), fs, path, relativeFiles(), storyFiles(), walkFiles()

### Community 44 - "serve.cjs"
Cohesion: 0.29
Nodes (5): fs, http, path, server, TYPES

### Community 45 - "preview.ts"
Cohesion: 0.47
Nodes (3): preview, withA11yModes(), withDirection()

### Community 47 - "clean-dist.cjs"
Cohesion: 0.40
Nodes (4): dist, fs, path, root

### Community 48 - "Accessibility contract"
Cohesion: 0.50
Nodes (3): Accessibility contract, Component-owned guarantees, Consumer responsibilities

### Community 51 - "./components/accordion"
Cohesion: 0.67
Nodes (3): import, types, ./components/accordion

### Community 52 - "./components/alert"
Cohesion: 0.67
Nodes (3): import, types, ./components/alert

### Community 53 - "./components/avatar"
Cohesion: 0.67
Nodes (3): import, types, ./components/avatar

### Community 54 - "./components/badge"
Cohesion: 0.67
Nodes (3): import, types, ./components/badge

### Community 55 - "./components/breadcrumbs"
Cohesion: 0.67
Nodes (3): import, types, ./components/breadcrumbs

### Community 56 - "./components/button"
Cohesion: 0.67
Nodes (3): import, types, ./components/button

### Community 57 - "./components/card"
Cohesion: 0.67
Nodes (3): import, types, ./components/card

### Community 58 - "./components/carousel"
Cohesion: 0.67
Nodes (3): import, types, ./components/carousel

### Community 59 - "./components/image"
Cohesion: 0.67
Nodes (3): import, types, ./components/image

### Community 60 - "./components/in-page-navigation"
Cohesion: 0.67
Nodes (3): import, types, ./components/in-page-navigation

### Community 61 - "./components/link"
Cohesion: 0.67
Nodes (3): import, types, ./components/link

### Community 62 - "./components/modal"
Cohesion: 0.67
Nodes (3): import, types, ./components/modal

### Community 63 - "./components/quote"
Cohesion: 0.67
Nodes (3): import, types, ./components/quote

### Community 64 - "./components/rich-text"
Cohesion: 0.67
Nodes (3): import, types, ./components/rich-text

### Community 65 - "./components/search-input"
Cohesion: 0.67
Nodes (3): import, types, ./components/search-input

### Community 66 - "./components/search-overlay"
Cohesion: 0.67
Nodes (3): import, types, ./components/search-overlay

### Community 67 - "./components/section-header"
Cohesion: 0.67
Nodes (3): import, types, ./components/section-header

### Community 68 - "./components/slider"
Cohesion: 0.67
Nodes (3): import, types, ./components/slider

### Community 69 - "./components/stat"
Cohesion: 0.67
Nodes (3): import, types, ./components/stat

### Community 70 - "./components/tabs"
Cohesion: 0.67
Nodes (3): import, types, ./components/tabs

### Community 71 - "./components/toast"
Cohesion: 0.67
Nodes (3): import, types, ./components/toast

### Community 72 - "publishConfig"
Cohesion: 0.67
Nodes (3): publishConfig, access, provenance

### Community 73 - "uiDesignLibrary"
Cohesion: 0.67
Nodes (3): uiDesignLibrary, realizationContractVersion, reuseContractVersion

### Community 117 - "dialog.client.ts"
Cohesion: 0.26
Nodes (12): useDialog(), UseDialogOptions, acquireScrollLock(), emit(), getTopOverlay(), listeners, overlays, register() (+4 more)

### Community 118 - "Modal.stories.tsx"
Cohesion: 0.18
Nodes (10): ClosesFromButton, ClosesOnBackdrop, Default, Medium, ReturnsFocusToRef, ScrollingBody, StackedOverlays, Story (+2 more)

### Community 119 - "SearchOverlay.stories.tsx"
Cohesion: 0.20
Nodes (7): ActiveShowsResults, ClosesOnBackdrop, Default, IdleShowsQuickLinks, RespectsReducedMotion, Story, TrapsFocus

### Community 120 - "Modal.client.tsx"
Cohesion: 0.43
Nodes (5): Modal(), ModalPanel(), FOCUSABLE, getFocusableElements(), useFocusTrap()

### Community 121 - "backgroundInert.client.ts"
Cohesion: 0.60
Nodes (4): previous, restoreBackground(), syncBackground(), useBackgroundInert()

## Knowledge Gaps
- **538 isolated node(s):** `config`, `tagBadges`, `preview`, `faq`, `Story` (+533 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SlotClassNames` connect `classNames.ts` to `Modal.types.ts`, `Breadcrumbs.stories.tsx`, `components.ssr.test.tsx`, `Carousel.stories.tsx`, `SearchInput.stories.tsx`, `SearchOverlay.types.ts`, `Image.types.ts`, `InPageNavigation.types.ts`, `Slider.stories.tsx`, `Tabs.stories.tsx`, `Toast.types.ts`, `Badge.stories.tsx`, `Button.tsx`, `RichText.types.ts`, `Card.types.ts`, `SectionHeader.types.ts`, `stat/index.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `exports` connect `exports` to `package.json`, `./components/accordion`, `./components/alert`, `./components/avatar`, `./components/badge`, `./components/breadcrumbs`, `./components/button`, `./components/card`, `./components/carousel`, `./components/image`, `./components/in-page-navigation`, `./components/link`, `./components/modal`, `./components/quote`, `./components/rich-text`, `./components/search-input`, `./components/search-overlay`, `./components/section-header`, `./components/slider`, `./components/stat`, `./components/tabs`, `./components/toast`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`, `peerDependencies`, `eslint`, `husky`, `next`, `playwright`, `semantic-release`, `@semantic-release/commit-analyzer`, `@semantic-release/github`, `@semantic-release/release-notes-generator`, `storybook`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `storybook-addon-pseudo-states`, `storybook-addon-tag-badges`, `@storybook/addon-vitest`, `@storybook/react-vite`, `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/vite`, `@types/react-dom`, `typescript`, `@typescript-eslint/parser`, `@verndale/ai-pr`, `vite`, `@vitejs/plugin-react`, `@vitest/browser`, `@vitest/browser-playwright`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `config`, `tagBadges`, `preview` to the rest of the system?**
  _538 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `classNames.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07686274509803921 - nodes in this community are weakly interconnected._
- **Should `build-graph.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07591836734693877 - nodes in this community are weakly interconnected._
- **Should `Breadcrumbs.stories.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0653061224489796 - nodes in this community are weakly interconnected._