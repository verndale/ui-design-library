# Graph Report - library  (2026-08-22)

## Corpus Check
- 236 files · ~109,775 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1359 nodes · 2070 edges · 121 communities (88 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4ee59bc4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InPageNavigationModalDrawer.stories.tsx
- scripts
- classNames.ts
- dialog.client.ts
- components.ssr.test.tsx
- build-graph.cjs
- Carousel.stories.tsx
- check-figma-contracts.cjs
- check-figma-live.cjs
- Button.stories.tsx
- Slider.stories.tsx
- SearchOverlay.stories.tsx
- SearchInput.stories.tsx
- Toast.types.ts
- Badge.stories.tsx
- exports
- devDependencies
- Image.types.ts
- check-component-architecture.cjs
- viewer.js
- source-parity.cjs
- check-contracts.cjs
- package.json
- Card.stories.tsx
- RichText.types.ts
- TabsNativeSelect.stories.tsx
- Tabs.stories.tsx
- test-next.cjs
- SectionHeader.types.ts
- stat/index.ts
- Tabs.types.ts
- Avatar.stories.tsx
- TabsNativeSelect.client.tsx
- Quote.stories.tsx
- build-exports.cjs
- check-release-commit.selftest.cjs
- validate-realization.cjs
- check-figma-coverage.cjs
- compilerOptions
- pre-commit.cjs
- peerDependencies
- build-accessibility-report.cjs
- check
- compilerOptions
- check-figma-coverage.selftest.cjs
- TabButton.client.tsx
- storybook
- Modal.types.ts
- eslint-plugin-react-hooks
- check-component-architecture.selftest.cjs
- check-contracts.selftest.cjs
- source-parity.selftest.cjs
- @semantic-release/github
- component-files.cjs
- serve.cjs
- preview.ts
- vitest.shared.ts
- clean-dist.cjs
- @storybook/react-vite
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
- ./components/in-page-navigation--modal-drawer
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
- ./components/tabs--native-select
- ./components/toast
- routing.js
- @eslint/js
- globals
- husky
- lint-staged
- Modal.stories.tsx
- semantic-release
- @semantic-release/commit-analyzer
- @semantic-release/npm
- @semantic-release/release-notes-generator
- @storybook/addon-a11y
- @storybook/addon-docs
- storybook-addon-pseudo-states
- storybook-addon-tag-badges
- @storybook/addon-vitest
- tailwindcss
- @tailwindcss/vite
- @tailwindcss/postcss
- @types/react-dom
- @verndale/ai-commit
- @verndale/ai-pr
- typescript-eslint
- @vitest/browser-playwright
- main.ts
- manager.ts
- vite
- @vitejs/plugin-react
- @vitest/browser
- Toast.stories.tsx
- Toast.client.tsx
- backgroundInert.client.ts
- eslint

## God Nodes (most connected - your core abstractions)
1. `scripts` - 56 edges
2. `exports` - 49 edges
3. `SlotClassNames` - 24 edges
4. `check()` - 18 edges
5. `check()` - 17 edges
6. `compilerOptions` - 15 edges
7. `check()` - 14 edges
8. `validateRealization()` - 14 edges
9. `auditLiveNodes()` - 12 edges
10. `build()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `SearchOverlay()` --calls--> `useDialog()`  [EXTRACTED]
  components/search-overlay/SearchOverlay.client.tsx → src/lib/dialog.client.ts
- `checkCoverage()` --indirect_call--> `registration()`  [INFERRED]
  scripts/check-figma-coverage.cjs → scripts/check-figma-coverage.selftest.cjs
- `Accordion()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/Accordion.tsx → src/lib/classNames.ts
- `AccordionItem()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/parts/AccordionItem.client.tsx → src/lib/classNames.ts
- `AccordionList()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/parts/AccordionList.client.tsx → src/lib/classNames.ts

## Import Cycles
- None detected.

## Communities (121 total, 33 thin omitted)

### Community 0 - "InPageNavigationModalDrawer.stories.tsx"
Cohesion: 0.06
Nodes (47): InPageNavigation(), ActiveSection, Default, INLINE_INTERACTION_STATES, InteractionStates, MobileDrawer, ReducedMotion, sections (+39 more)

### Community 1 - "scripts"
Cohesion: 0.04
Nodes (56): scripts, accessibility, accessibility:report, architecture, architecture:selftest, build, build-storybook, commit (+48 more)

### Community 2 - "classNames.ts"
Cohesion: 0.07
Nodes (40): Accordion(), Default, faq, FocusGating, InteractionStates, ReducedMotion, revealItems, ShowMore (+32 more)

### Community 3 - "dialog.client.ts"
Cohesion: 0.22
Nodes (15): Modal(), useDialog(), UseDialogOptions, FOCUSABLE, getFocusableElements(), useFocusTrap(), acquireScrollLock(), emit() (+7 more)

### Community 4 - "components.ssr.test.tsx"
Cohesion: 0.06
Nodes (41): Breadcrumbs(), BackLinkPresentation, BackLinkWithoutAncestor, BREADCRUMB_INTERACTION_STATES, CollapsedBackLink, CustomLandmarkLabel, DeepTrail, Default (+33 more)

### Community 5 - "build-graph.cjs"
Cohesion: 0.08
Nodes (46): { build, render, renderConnections, OUT_FILE, REPO_ROOT, CONNECTIONS_DIR_ID }, fs, { loadPolicy, policyProblems }, path, run(), areaOf(), build(), EDGE_KEY_SEP (+38 more)

### Community 6 - "Carousel.stories.tsx"
Cohesion: 0.06
Nodes (32): Carousel(), CAROUSEL_INTERACTION_STATES, Default, Empty, InteractionStates, KeyboardTraversal, Looping, MultiCardPeek (+24 more)

### Community 7 - "check-figma-contracts.cjs"
Cohesion: 0.07
Nodes (39): check(), commandSteps(), extractArgTypes(), extractCssCustomProperties(), FIGMA_PROPERTY_TYPE_BY_KIND, findCodeConnectSurfaces(), findForbiddenCodeConnectFiles(), fixedPropDifferenceCount() (+31 more)

### Community 8 - "check-figma-live.cjs"
Cohesion: 0.09
Nodes (35): auditLiveNodes(), auditVisualTree(), containsComponentInstance(), containsNode(), definitionsByName(), duplicateDefinitionNames(), fetchLiveNodes(), FIGMA_TYPE_BY_KIND (+27 more)

### Community 9 - "Button.stories.tsx"
Cohesion: 0.09
Nodes (26): Button(), ICON_ONLY_SIZES, SIZES, BUTTON_HOVER_STYLES, Default, Disabled, IconOnly, IconOnlyMatrix (+18 more)

### Community 10 - "Slider.stories.tsx"
Cohesion: 0.10
Nodes (23): SliderScale(), SliderSelectedValue(), SliderTrack(), SliderTrackProps, optionIndex(), Slider(), ControlledNativeFormSubmission, Default (+15 more)

### Community 11 - "SearchOverlay.stories.tsx"
Cohesion: 0.10
Nodes (19): SearchOverlayContent(), SearchOverlayContentProps, SearchOverlayHeader(), SearchOverlayHeaderProps, SearchOverlayPanel(), SearchOverlayPanelProps, SearchOverlay(), ActiveShowsResults (+11 more)

### Community 12 - "SearchInput.stories.tsx"
Cohesion: 0.10
Nodes (20): control, SearchControls(), SearchField(), SearchFieldProps, SearchForm(), SearchFormProps, ClearGlyph(), SearchGlyph() (+12 more)

### Community 13 - "Toast.types.ts"
Cohesion: 0.38
Nodes (6): ToastIcon(), tone, ToastClassNames, ToastPosition, ToastProps, ToastVariant

### Community 14 - "Badge.stories.tsx"
Cohesion: 0.13
Nodes (19): Badge(), BADGE_INTERACTION_STATES, BadgeStoryArgs, CustomRemoveLabel, Default, Disabled, disabledRemove, Dismissible (+11 more)

### Community 15 - "exports"
Cohesion: 0.08
Nodes (26): exports, ./components/accordion/component.json, ./components/alert/component.json, ./components/avatar/component.json, ./components/badge/component.json, ./components/breadcrumbs/component.json, ./components/button/component.json, ./components/card/component.json (+18 more)

### Community 16 - "devDependencies"
Cohesion: 0.15
Nodes (13): @commitlint/cli, next, devDependencies, @commitlint/cli, next, playwright, @types/react, typescript (+5 more)

### Community 17 - "Image.types.ts"
Cohesion: 0.14
Nodes (17): Image(), buildSrcSet(), CustomLoader, Decorative, Default, Responsive, Rounded, Story (+9 more)

### Community 18 - "check-component-architecture.cjs"
Cohesion: 0.11
Nodes (19): analyzeModuleGraph(), BROWSER_GLOBALS, checkPrimaryRendering(), checkPrimaryVariantOwnership(), CLIENT_HOOKS, COMPONENTS, explicitExportTargets(), explicitRuntimeExportNames() (+11 more)

### Community 19 - "viewer.js"
Cohesion: 0.19
Nodes (22): applyView(), buildIndexes(), buildLegend(), buildModel(), buildRenderer(), clearFocus(), EDGE_COLORS, edgeReducer() (+14 more)

### Community 20 - "source-parity.cjs"
Cohesion: 0.19
Nodes (21): compareEvidence(), FIGMA_REPRESENTATION_KINDS, fs, literalValue(), objectProperty(), parseStoryEvidence(), path, propertyName() (+13 more)

### Community 21 - "check-contracts.cjs"
Cohesion: 0.15
Nodes (20): check(), COMPONENTS, decompose(), fs, { implementationFiles, listComponentDirs, storyFiles }, kebab(), {
  loadBaseline,
  validateBaseline,
  validateImplementationTargets,
  validateManifestSourceParity,
  validateStorySourceParity,
}, MATURITIES (+12 more)

### Community 22 - "package.json"
Cohesion: 0.07
Nodes (27): author, description, engines, node, files, components, dist, license (+19 more)

### Community 23 - "Card.stories.tsx"
Cohesion: 0.16
Nodes (11): Card(), Default, InteractionStates, Story, UnsetBackground, WithMedia, CardBaseProps, CardClassNames (+3 more)

### Community 24 - "RichText.types.ts"
Cohesion: 0.18
Nodes (12): RichTextContent(), RichText(), Checkmark, Default, FullFlow, Story, base, lists (+4 more)

### Community 25 - "TabsNativeSelect.stories.tsx"
Cohesion: 0.12
Nodes (15): BoundaryInputs, BreakpointFocusTransfer, Controlled, ControlledInvalidActiveId, createFakeMediaQueryList(), Desktop, DesktopWide, Empty (+7 more)

### Community 26 - "Tabs.stories.tsx"
Cohesion: 0.12
Nodes (15): ControlledAndInvalidActiveId, Default, Empty, HorizontalStroke, InteractionStates, InvalidDefaultActiveId, KeyboardWraparound, ManyTabs (+7 more)

### Community 27 - "test-next.cjs"
Cohesion: 0.22
Nodes (16): assert, assertCompiledCss(), assertNativeImports(), assertNestedUtilityIsNested(), componentCandidates(), configureConsumer(), filesBelow(), fixtureRoot (+8 more)

### Community 28 - "SectionHeader.types.ts"
Cohesion: 0.20
Nodes (11): SectionHeaderContent(), SectionHeader(), Centered, Default, HeadingOnly, Story, WithInlineLink, SectionHeaderAlignment (+3 more)

### Community 29 - "stat/index.ts"
Cohesion: 0.20
Nodes (11): StatGroup(), Stat(), Default, GroupColumn, GroupRow, Story, WithDescription, StatClassNames (+3 more)

### Community 30 - "Tabs.types.ts"
Cohesion: 0.18
Nodes (13): TabPanels(), TabPanelsProps, TabsList(), TabsListProps, UseTabsControllerOptions, Tabs(), HorizontalTabsProps, TabItem (+5 more)

### Community 31 - "Avatar.stories.tsx"
Cohesion: 0.20
Nodes (9): Avatar(), CropsWideMedia, Default, Sizes, Story, WithDescribedPortrait, AvatarClassNames, AvatarProps (+1 more)

### Community 32 - "TabsNativeSelect.client.tsx"
Cohesion: 0.26
Nodes (9): TabsResponsiveControls(), TabsResponsiveControlsProps, ResponsiveTabsFocusOptions, useResponsiveTabsFocus(), TabsNativeSelect(), TabsNativeSelectClassNames, TabsNativeSelectItem, TabsNativeSelectProps (+1 more)

### Community 33 - "Quote.stories.tsx"
Cohesion: 0.22
Nodes (9): QuoteFrame(), Quote(), Default, LongForm, RightToLeft, Story, WithAttribution, QuoteClassNames (+1 more)

### Community 34 - "build-exports.cjs"
Cohesion: 0.18
Nodes (13): checkDist, componentRecords(), componentsDir, expected, expectedExports(), fail(), fs, { implementationFiles, listComponentDirs } (+5 more)

### Community 35 - "check-release-commit.selftest.cjs"
Cohesion: 0.20
Nodes (12): git(), readReleaseCommits(), assert, { execFileSync }, fs, os, path, {
  readReleaseCommits,
  validateReleaseCommit,
  validateReleaseCommits,
} (+4 more)

### Community 36 - "validate-realization.cjs"
Cohesion: 0.26
Nodes (13): BEHAVIOR_KINDS, CARDINALITIES, CONDITION_PREDICATES, evidenceAssertion(), IDREF_ATTRIBUTES, isObject(), nodeReferences(), PROP_KINDS (+5 more)

### Community 37 - "check-figma-coverage.cjs"
Cohesion: 0.26
Nodes (12): checkCoverage(), COVERED_MATURITIES, fs, isPrimaryMatch(), {
  loadBaseline,
  validateBaseline,
  validateRegistrationSourceParity,
}, loadManifests(), main(), path (+4 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2022, ./src/*, stories, compilerOptions, allowSyntheticDefaultImports, baseUrl (+16 more)

### Community 39 - "pre-commit.cjs"
Cohesion: 0.24
Nodes (10): coversPaths(), frontmatter, fs, GENERATED, gitLines(), isGraphInput(), path, REPO_ROOT (+2 more)

### Community 40 - "peerDependencies"
Cohesion: 0.20
Nodes (10): embla-carousel-react, embla-carousel-react, react, react-dom, peerDependencies, embla-carousel-react, react, react-dom (+2 more)

### Community 41 - "build-accessibility-report.cjs"
Cohesion: 0.22
Nodes (9): COMPONENTS, fs, { listComponentDirs }, OUTPUT, path, renderReport(), RESPONSIBILITY_COPY, ROOT (+1 more)

### Community 42 - "check"
Cohesion: 0.44
Nodes (10): check(), checkSharedClientModules(), checkWorkspaceModuleGraph(), hasUseClient(), isClientPath(), parse(), physicalLines(), useClientIsFirst() (+2 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): components/**/*.ts, components/**/*.tsx, node_modules, **/*.spec.*, src/lib/**/*.ts, src/lib/**/*.tsx, **/*.stories.tsx, **/*.test.* (+16 more)

### Community 44 - "check-figma-coverage.selftest.cjs"
Cohesion: 0.22
Nodes (7): cases, { checkCoverage }, { INITIAL_COMPONENT_KEYS }, registration(), sourceParity, sourceParityBaseline, INITIAL_COMPONENT_KEYS

### Community 45 - "TabButton.client.tsx"
Cohesion: 0.50
Nodes (3): base, TabButton, TabButtonProps

### Community 47 - "Modal.types.ts"
Cohesion: 0.16
Nodes (11): ModalClassNames, ModalHeadingLevel, ModalProps, ModalBody(), ModalFooter(), ModalHeader(), ModalHeaderProps, ModalPanel() (+3 more)

### Community 49 - "check-component-architecture.selftest.cjs"
Cohesion: 0.29
Nodes (7): cases, {
  check,
  checkSharedClientModules,
  physicalLines,
}, fs, os, path, valid(), write()

### Community 50 - "check-contracts.selftest.cjs"
Cohesion: 0.25
Nodes (6): cases, { check }, DEFAULT_REALIZATION, fs, os, path

### Community 51 - "source-parity.selftest.cjs"
Cohesion: 0.25
Nodes (5): allSurfaces, baseBaseline, baseEvidence, cases, {
  INITIAL_COMPONENT_KEYS,
  validateBaseline,
  validateImplementationTargets,
  validateManifestSourceParity,
  validateRegistrationSourceParity,
  validateStorySourceParity,
}

### Community 53 - "component-files.cjs"
Cohesion: 0.38
Nodes (6): checkIndex(), fs, path, relativeFiles(), storyFiles(), walkFiles()

### Community 54 - "serve.cjs"
Cohesion: 0.29
Nodes (5): fs, http, path, server, TYPES

### Community 55 - "preview.ts"
Cohesion: 0.47
Nodes (3): preview, withA11yModes(), withDirection()

### Community 57 - "clean-dist.cjs"
Cohesion: 0.40
Nodes (4): dist, fs, path, root

### Community 59 - "./components/accordion"
Cohesion: 0.67
Nodes (3): import, types, ./components/accordion

### Community 60 - "./components/alert"
Cohesion: 0.67
Nodes (3): import, types, ./components/alert

### Community 61 - "./components/avatar"
Cohesion: 0.67
Nodes (3): import, types, ./components/avatar

### Community 62 - "./components/badge"
Cohesion: 0.67
Nodes (3): import, types, ./components/badge

### Community 63 - "./components/breadcrumbs"
Cohesion: 0.67
Nodes (3): import, types, ./components/breadcrumbs

### Community 64 - "./components/button"
Cohesion: 0.67
Nodes (3): import, types, ./components/button

### Community 65 - "./components/card"
Cohesion: 0.67
Nodes (3): import, types, ./components/card

### Community 66 - "./components/carousel"
Cohesion: 0.67
Nodes (3): import, types, ./components/carousel

### Community 67 - "./components/image"
Cohesion: 0.67
Nodes (3): import, types, ./components/image

### Community 68 - "./components/in-page-navigation"
Cohesion: 0.67
Nodes (3): import, types, ./components/in-page-navigation

### Community 69 - "./components/in-page-navigation--modal-drawer"
Cohesion: 0.67
Nodes (3): import, types, ./components/in-page-navigation--modal-drawer

### Community 70 - "./components/link"
Cohesion: 0.67
Nodes (3): import, types, ./components/link

### Community 71 - "./components/modal"
Cohesion: 0.67
Nodes (3): import, types, ./components/modal

### Community 72 - "./components/quote"
Cohesion: 0.67
Nodes (3): import, types, ./components/quote

### Community 73 - "./components/rich-text"
Cohesion: 0.67
Nodes (3): import, types, ./components/rich-text

### Community 74 - "./components/search-input"
Cohesion: 0.67
Nodes (3): import, types, ./components/search-input

### Community 75 - "./components/search-overlay"
Cohesion: 0.67
Nodes (3): import, types, ./components/search-overlay

### Community 76 - "./components/section-header"
Cohesion: 0.67
Nodes (3): import, types, ./components/section-header

### Community 77 - "./components/slider"
Cohesion: 0.67
Nodes (3): import, types, ./components/slider

### Community 78 - "./components/stat"
Cohesion: 0.67
Nodes (3): import, types, ./components/stat

### Community 79 - "./components/tabs"
Cohesion: 0.67
Nodes (3): import, types, ./components/tabs

### Community 80 - "./components/tabs--native-select"
Cohesion: 0.67
Nodes (3): import, types, ./components/tabs--native-select

### Community 81 - "./components/toast"
Cohesion: 0.67
Nodes (3): import, types, ./components/toast

### Community 87 - "Modal.stories.tsx"
Cohesion: 0.15
Nodes (12): ClosesFromButton, ClosesOnBackdrop, Default, InteractionStates, Medium, MODAL_INTERACTION_STATES, ReturnsFocusToRef, ScrollingBody (+4 more)

### Community 117 - "Toast.stories.tsx"
Cohesion: 0.22
Nodes (8): AutoDismiss, Critical, Default, InteractionStates, Persistent, persistentDismiss, Story, TOAST_INTERACTION_STATES

### Community 118 - "Toast.client.tsx"
Cohesion: 0.39
Nodes (5): ToastMessage(), useToastDismiss(), positions, Toast(), usePortalRoot()

### Community 119 - "backgroundInert.client.ts"
Cohesion: 0.60
Nodes (4): previous, restoreBackground(), syncBackground(), useBackgroundInert()

## Knowledge Gaps
- **641 isolated node(s):** `config`, `tagBadges`, `preview`, `faq`, `Story` (+636 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SlotClassNames` connect `classNames.ts` to `InPageNavigationModalDrawer.stories.tsx`, `components.ssr.test.tsx`, `Carousel.stories.tsx`, `Button.stories.tsx`, `Slider.stories.tsx`, `SearchOverlay.stories.tsx`, `SearchInput.stories.tsx`, `Toast.types.ts`, `Badge.stories.tsx`, `Image.types.ts`, `Card.stories.tsx`, `RichText.types.ts`, `SectionHeader.types.ts`, `stat/index.ts`, `Tabs.types.ts`, `Avatar.stories.tsx`, `TabsNativeSelect.client.tsx`, `Quote.stories.tsx`, `Modal.types.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `exports` connect `exports` to `package.json`, `./components/accordion`, `./components/alert`, `./components/avatar`, `./components/badge`, `./components/breadcrumbs`, `./components/button`, `./components/card`, `./components/carousel`, `./components/image`, `./components/in-page-navigation`, `./components/in-page-navigation--modal-drawer`, `./components/link`, `./components/modal`, `./components/quote`, `./components/rich-text`, `./components/search-input`, `./components/search-overlay`, `./components/section-header`, `./components/slider`, `./components/stat`, `./components/tabs`, `./components/tabs--native-select`, `./components/toast`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`, `peerDependencies`, `storybook`, `eslint-plugin-react-hooks`, `@semantic-release/github`, `@storybook/react-vite`, `@eslint/js`, `globals`, `husky`, `lint-staged`, `semantic-release`, `@semantic-release/commit-analyzer`, `@semantic-release/npm`, `@semantic-release/release-notes-generator`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `storybook-addon-pseudo-states`, `storybook-addon-tag-badges`, `@storybook/addon-vitest`, `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/postcss`, `@types/react-dom`, `@verndale/ai-commit`, `@verndale/ai-pr`, `typescript-eslint`, `@vitest/browser-playwright`, `vite`, `@vitejs/plugin-react`, `@vitest/browser`, `eslint`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `config`, `tagBadges`, `preview` to the rest of the system?**
  _641 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `InPageNavigationModalDrawer.stories.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05625 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._
- **Should `classNames.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06868686868686869 - nodes in this community are weakly interconnected._