# Graph Report - ui-design-library  (2026-08-13)

## Corpus Check
- 274 files · ~105,957 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1486 nodes · 2104 edges · 160 communities (122 shown, 38 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6dfdf2cf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build-graph.cjs
- on-merge-sync.cjs
- Toast.types.ts
- SearchInput.types.ts
- scripts
- Breadcrumbs.stories.tsx
- compilerOptions
- Carousel.stories.tsx
- Image.types.ts
- InPageNavigation.types.ts
- Slider.stories.tsx
- compilerOptions
- exports
- Badge.stories.tsx
- viewer.js
- classNames.ts
- Button.tsx
- Tabs.stories.tsx
- devDependencies
- SearchOverlay.types.ts
- Card.types.ts
- check-component-architecture.cjs
- check-contracts.cjs
- RichText.types.ts
- build-exports.cjs
- test-next.cjs
- SearchOverlay.stories.tsx
- wiki/INDEX.md
- SectionHeader.types.ts
- Native variant axis for `@verndale/ui-design-library`
- Adopt server-first component architecture
- dependencies
- peerDependencies
- check
- check-component-architecture.selftest.cjs
- refresh-issue-state.cjs
- ui-design-library
- build-accessibility-report.cjs
- serve.cjs
- component-files.cjs
- clean-dist.cjs
- preview.ts
- page.jsx
- vitest.shared.ts
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
- routing.js
- Validated Plan: npm-Published UI Library + Deterministic AI Reuse
- eslint
- UI Design Library — agent guide
- commit-msg
- pre-commit
- prepare-commit-msg
- semantic-release
- @semantic-release/github
- @storybook/addon-a11y
- storybook-addon-pseudo-states
- storybook-addon-tag-badges
- @storybook/addon-vitest
- @storybook/react-vite
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
- Wiki Mechanics
- Implementation Changes
- package.json
- Contributing
- Server-first component architecture migration
- Plan Audit
- Knowledge graph
- Context Wiki
- Add story tests and enforce accessibility
- Storybook review addons and reduced-motion coverage
- Add the Rich text component
- Add the Section header component
- Add the Stat component
- Add the Accordion component
- Add the Alert component
- Add the Image component
- Add the Slider component
- Add the Toast component
- Add the In-page navigation component
- Add the Tabs component
- Add the Search overlay component
- Story tests and the a11y gate
- Connections — Wiki wiring
- Storybook Docs audit
- Knowledge graph + wiki automation
- Reduced-motion coverage
- Storybook review tooling
- Stat metadata stops advertising StatGroup variants
- Native variant axis
- Realization-First Reuse with WCAG 2.2 AA Accessibility
- Add Graphify code mapping
- stat/index.ts
- sync-graphify.cjs
- Fix wiki sync pagination
- Storybook tooling — Design History
- Knowledge graph & wiki automation — Design History
- Publish the UI library as a deterministic npm package
- post-checkout
- Publish accessible realization contracts
- post-merge
- husky
- next
- playwright
- @semantic-release/commit-analyzer
- @semantic-release/release-notes-generator
- storybook
- @storybook/addon-docs
- tailwindcss
- @tailwindcss/postcss
- Avatar.stories.tsx
- Story testing — Design History
- Accessibility contract
- Modal.stories.tsx
- dialog.client.ts
- Package distribution — Design History
- check-release-commit.selftest.cjs
- Coordinated UI Library Contract v2 and AI Reuse Hardening
- Modal.types.ts
- Publish executable ESM and reuse contract v2
- Component architecture — Design History

## God Nodes (most connected - your core abstractions)
1. `exports` - 45 edges
2. `scripts` - 38 edges
3. `SlotClassNames` - 22 edges
4. `compilerOptions` - 15 edges
5. `ui-design-library` - 15 edges
6. `check()` - 14 edges
7. `build()` - 14 edges
8. `check()` - 13 edges
9. `validateRealization()` - 12 edges
10. `UI Design Library — agent guide` - 12 edges

## Surprising Connections (you probably didn't know these)
- `SearchOverlay()` --calls--> `useDialog()`  [EXTRACTED]
  components/search-overlay/SearchOverlay.client.tsx → src/lib/dialog.client.ts
- `Accordion()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/Accordion.tsx → src/lib/classNames.ts
- `AccordionItem()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/parts/AccordionItem.client.tsx → src/lib/classNames.ts
- `AccordionList()` --calls--> `classes()`  [EXTRACTED]
  components/accordion/parts/AccordionList.client.tsx → src/lib/classNames.ts
- `AlertFrame()` --calls--> `classes()`  [EXTRACTED]
  components/alert/parts/AlertFrame.tsx → src/lib/classNames.ts

## Import Cycles
- None detected.

## Communities (160 total, 38 thin omitted)

### Community 0 - "build-graph.cjs"
Cohesion: 0.07
Nodes (51): { build, render, renderConnections, OUT_FILE, REPO_ROOT, CONNECTIONS_DIR_ID }, fs, { loadPolicy, policyProblems }, path, run(), areaOf(), build(), EDGE_KEY_SEP (+43 more)

### Community 1 - "on-merge-sync.cjs"
Cohesion: 0.06
Nodes (44): { classify }, fs, main(), warningForPaths(), config(), draftEntry(), extractText(), parseSections() (+36 more)

### Community 2 - "Toast.types.ts"
Cohesion: 0.15
Nodes (15): ToastIcon(), ToastMessage(), tone, useToastDismiss(), positions, Toast(), AutoDismiss, Critical (+7 more)

### Community 3 - "SearchInput.types.ts"
Cohesion: 0.11
Nodes (17): control, SearchControls(), SearchField(), SearchFieldProps, SearchForm(), SearchFormProps, ClearGlyph(), SearchGlyph() (+9 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (38): scripts, accessibility, accessibility:report, architecture, architecture:selftest, build, build-storybook, commit (+30 more)

### Community 5 - "Breadcrumbs.stories.tsx"
Cohesion: 0.07
Nodes (32): Breadcrumbs(), CollapsedBackLink, CustomLandmarkLabel, DeepTrail, Default, NoAncestors, OnDarkSurface, SingleLevel (+24 more)

### Community 6 - "compilerOptions"
Cohesion: 0.09
Nodes (23): DOM, DOM.Iterable, ES2022, ./src/*, compilerOptions, allowSyntheticDefaultImports, baseUrl, esModuleInterop (+15 more)

### Community 7 - "Carousel.stories.tsx"
Cohesion: 0.11
Nodes (17): Carousel(), Default, Empty, KeyboardTraversal, Looping, SingleSlide, Story, CarouselClassNames (+9 more)

### Community 8 - "Image.types.ts"
Cohesion: 0.14
Nodes (17): Image(), buildSrcSet(), CustomLoader, Decorative, Default, Responsive, Rounded, Story (+9 more)

### Community 9 - "InPageNavigation.types.ts"
Cohesion: 0.15
Nodes (16): InPageNavigation(), ActiveSection, Default, MobileDrawer, ReducedMotion, sections, Story, InPageNavigationClassNames (+8 more)

### Community 10 - "Slider.stories.tsx"
Cohesion: 0.14
Nodes (17): SliderScale(), SliderSelectedValue(), SliderTrack(), SliderTrackProps, optionIndex(), Slider(), Default, LongLabels (+9 more)

### Community 11 - "compilerOptions"
Cohesion: 0.08
Nodes (24): components/**/*.ts, components/**/*.tsx, node_modules, **/*.spec.*, src/lib/**/*.ts, src/lib/**/*.tsx, **/*.stories.tsx, **/*.test.* (+16 more)

### Community 12 - "exports"
Cohesion: 0.08
Nodes (24): exports, ./components/accordion/component.json, ./components/alert/component.json, ./components/avatar/component.json, ./components/badge/component.json, ./components/breadcrumbs/component.json, ./components/button/component.json, ./components/card/component.json (+16 more)

### Community 13 - "Badge.stories.tsx"
Cohesion: 0.14
Nodes (17): Badge(), BadgeStoryArgs, CustomRemoveLabel, Default, Disabled, disabledRemove, Dismissible, Group (+9 more)

### Community 14 - "viewer.js"
Cohesion: 0.19
Nodes (22): applyView(), buildIndexes(), buildLegend(), buildModel(), buildRenderer(), clearFocus(), EDGE_COLORS, edgeReducer() (+14 more)

### Community 15 - "classNames.ts"
Cohesion: 0.06
Nodes (43): Accordion(), Default, faq, FocusGating, ReducedMotion, ShowMore, Standalone, Story (+35 more)

### Community 16 - "Button.tsx"
Cohesion: 0.15
Nodes (16): Button(), SIZES, Default, Disabled, OnDarkSurface, Sizes, Story, Variants (+8 more)

### Community 17 - "Tabs.stories.tsx"
Cohesion: 0.13
Nodes (16): base, TabButton, TabButtonProps, TabsList(), TabsListProps, Tabs(), Default, KeyboardWraparound (+8 more)

### Community 18 - "devDependencies"
Cohesion: 0.15
Nodes (13): @commitlint/cli, eslint-plugin-react-hooks, devDependencies, @commitlint/cli, eslint-plugin-react-hooks, @semantic-release/npm, @types/react, @verndale/ai-commit (+5 more)

### Community 19 - "SearchOverlay.types.ts"
Cohesion: 0.23
Nodes (10): SearchOverlayContent(), SearchOverlayContentProps, SearchOverlayHeader(), SearchOverlayHeaderProps, SearchOverlayPanel(), SearchOverlayPanelProps, SearchOverlay(), SearchOverlayClassNames (+2 more)

### Community 20 - "Card.types.ts"
Cohesion: 0.19
Nodes (10): Card(), Default, Story, UnsetBackground, WithMedia, CardBaseProps, CardClassNames, CardMediaProps (+2 more)

### Community 21 - "check-component-architecture.cjs"
Cohesion: 0.11
Nodes (19): analyzeModuleGraph(), BROWSER_GLOBALS, checkPrimaryRendering(), checkPrimaryVariantOwnership(), CLIENT_HOOKS, COMPONENTS, explicitExportTargets(), explicitRuntimeExportNames() (+11 more)

### Community 22 - "check-contracts.cjs"
Cohesion: 0.08
Nodes (35): check(), COMPONENTS, decompose(), fs, { implementationFiles, listComponentDirs, storyFiles }, kebab(), MATURITIES, path (+27 more)

### Community 23 - "RichText.types.ts"
Cohesion: 0.18
Nodes (12): RichTextContent(), RichText(), Checkmark, Default, FullFlow, Story, base, lists (+4 more)

### Community 24 - "build-exports.cjs"
Cohesion: 0.18
Nodes (13): checkDist, componentRecords(), componentsDir, expected, expectedExports(), fail(), fs, { implementationFiles, listComponentDirs } (+5 more)

### Community 25 - "test-next.cjs"
Cohesion: 0.22
Nodes (16): assert, assertCompiledCss(), assertNativeImports(), assertNestedUtilityIsNested(), componentCandidates(), configureConsumer(), filesBelow(), fixtureRoot (+8 more)

### Community 26 - "SearchOverlay.stories.tsx"
Cohesion: 0.20
Nodes (7): ActiveShowsResults, ClosesOnBackdrop, Default, IdleShowsQuickLinks, RespectsReducedMotion, Story, TrapsFocus

### Community 28 - "SectionHeader.types.ts"
Cohesion: 0.20
Nodes (11): SectionHeaderContent(), SectionHeader(), Centered, Default, HeadingOnly, Story, WithInlineLink, SectionHeaderAlignment (+3 more)

### Community 29 - "Native variant axis for `@verndale/ui-design-library`"
Cohesion: 0.12
Nodes (17): 1. `scripts/check-contracts.cjs` (the sole enforcement point), 2. New failure messages (existing `[category] components/<path> …` style), 3. Self-test + fixtures (new `scripts/check-contracts.selftest.cjs`), 4. `scripts/graph/build-graph.cjs` — label de-dup (optional but included), 5. Docs (paste-ready deltas — additive, nothing implies the 9 changed), 6. Wiki capture (MECHANICS same-delivery protocol; slug `variant-axis`, date `2026-07-30`), 7. Storybook title convention (documented alongside the enforced check), Assumptions & blast radius (+9 more)

### Community 30 - "Adopt server-first component architecture"
Cohesion: 0.40
Nodes (5): Adopt server-first component architecture, Files, Follow-ups, What changed, Why

### Community 31 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, embla-carousel-react, next, react, react-dom, tailwindcss, @tailwindcss/postcss, @verndale/ui-design-library (+14 more)

### Community 32 - "peerDependencies"
Cohesion: 0.20
Nodes (10): embla-carousel-react, react, react-dom, embla-carousel-react, react, react-dom, peerDependencies, embla-carousel-react (+2 more)

### Community 33 - "check"
Cohesion: 0.44
Nodes (10): check(), checkSharedClientModules(), checkWorkspaceModuleGraph(), hasUseClient(), isClientPath(), parse(), physicalLines(), useClientIsFirst() (+2 more)

### Community 34 - "check-component-architecture.selftest.cjs"
Cohesion: 0.29
Nodes (7): cases, {
  check,
  checkSharedClientModules,
  physicalLines,
}, fs, os, path, valid(), write()

### Community 35 - "refresh-issue-state.cjs"
Cohesion: 0.32
Nodes (6): { execFileSync }, fs, main(), parseArgs(), path, refresh()

### Community 36 - "ui-design-library"
Cohesion: 0.12
Nodes (16): Accessibility is enforced, Consuming it, Context wiki, Environment, How a component gets here, Layout, Quality gates, Related (+8 more)

### Community 37 - "build-accessibility-report.cjs"
Cohesion: 0.22
Nodes (9): COMPONENTS, fs, { listComponentDirs }, OUTPUT, path, renderReport(), RESPONSIBILITY_COPY, ROOT (+1 more)

### Community 38 - "serve.cjs"
Cohesion: 0.29
Nodes (5): fs, http, path, server, TYPES

### Community 39 - "component-files.cjs"
Cohesion: 0.38
Nodes (6): checkIndex(), fs, path, relativeFiles(), storyFiles(), walkFiles()

### Community 40 - "clean-dist.cjs"
Cohesion: 0.40
Nodes (4): dist, fs, path, root

### Community 41 - "preview.ts"
Cohesion: 0.47
Nodes (3): preview, withA11yModes(), withDirection()

### Community 44 - "./components/accordion"
Cohesion: 0.67
Nodes (3): import, types, ./components/accordion

### Community 45 - "./components/alert"
Cohesion: 0.67
Nodes (3): import, types, ./components/alert

### Community 46 - "./components/avatar"
Cohesion: 0.67
Nodes (3): import, types, ./components/avatar

### Community 47 - "./components/badge"
Cohesion: 0.67
Nodes (3): import, types, ./components/badge

### Community 48 - "./components/breadcrumbs"
Cohesion: 0.67
Nodes (3): import, types, ./components/breadcrumbs

### Community 49 - "./components/button"
Cohesion: 0.67
Nodes (3): import, types, ./components/button

### Community 50 - "./components/card"
Cohesion: 0.67
Nodes (3): import, types, ./components/card

### Community 51 - "./components/carousel"
Cohesion: 0.67
Nodes (3): import, types, ./components/carousel

### Community 52 - "./components/image"
Cohesion: 0.67
Nodes (3): import, types, ./components/image

### Community 53 - "./components/in-page-navigation"
Cohesion: 0.67
Nodes (3): import, types, ./components/in-page-navigation

### Community 54 - "./components/link"
Cohesion: 0.67
Nodes (3): import, types, ./components/link

### Community 55 - "./components/modal"
Cohesion: 0.67
Nodes (3): import, types, ./components/modal

### Community 56 - "./components/quote"
Cohesion: 0.67
Nodes (3): import, types, ./components/quote

### Community 57 - "./components/rich-text"
Cohesion: 0.67
Nodes (3): import, types, ./components/rich-text

### Community 58 - "./components/search-input"
Cohesion: 0.67
Nodes (3): import, types, ./components/search-input

### Community 59 - "./components/search-overlay"
Cohesion: 0.67
Nodes (3): import, types, ./components/search-overlay

### Community 60 - "./components/section-header"
Cohesion: 0.67
Nodes (3): import, types, ./components/section-header

### Community 61 - "./components/slider"
Cohesion: 0.67
Nodes (3): import, types, ./components/slider

### Community 62 - "./components/stat"
Cohesion: 0.67
Nodes (3): import, types, ./components/stat

### Community 63 - "./components/tabs"
Cohesion: 0.67
Nodes (3): import, types, ./components/tabs

### Community 64 - "./components/toast"
Cohesion: 0.67
Nodes (3): import, types, ./components/toast

### Community 66 - "Validated Plan: npm-Published UI Library + Deterministic AI Reuse"
Cohesion: 0.13
Nodes (15): Automatic releases, Boundary Map v3, Candidate inventory and selection, Deterministic build, Exact opt-in, Final Acceptance, P0 — GitHub Tracking and Branches, P1 acceptance (+7 more)

### Community 68 - "UI Design Library — agent guide"
Cohesion: 0.15
Nodes (13): Accessibility is the point, Adding a component, Commits & release — the maintainer's job, not the agent's, Component architecture, Context wiki, Environment, graphify, Graphify repository workflow (+5 more)

### Community 97 - "Wiki Mechanics"
Cohesion: 0.17
Nodes (12): Archived plan frontmatter, Automation, Capture trigger, Content rules, Contents, Journal entry, Per capture, in the same delivery, plans/INDEX.md row (+4 more)

### Community 98 - "Implementation Changes"
Cohesion: 0.18
Nodes (11): Assumptions and Delivery, Breaking public API changes, Capture workflow, Component architecture, Existing component migration, Implementation Changes, Server-first component architecture and full library migration, Summary (+3 more)

### Community 99 - "package.json"
Cohesion: 0.07
Nodes (27): author, description, engines, node, files, components, dist, license (+19 more)

### Community 100 - "Contributing"
Cohesion: 0.22
Nodes (8): Adding a component, Commit messages, Contributing, Quick start, The component architecture, The three contracts, Verify the behaviour, not the markup, What not to do

### Community 101 - "Server-first component architecture migration"
Cohesion: 0.22
Nodes (9): Alert, Badge, Button, Carousel, Executable ESM and reuse contract v2, Next.js status, Server and client use, Server-first component architecture migration (+1 more)

### Community 102 - "Plan Audit"
Cohesion: 0.40
Nodes (5): A note on provenance, Contents, Plan Audit, Plans, Status legend

### Community 103 - "Knowledge graph"
Cohesion: 0.22
Nodes (9): Adding a source, Contents, Differences from ui-design-brain, Edge types, How it works, Internal agent navigation, Knowledge graph, Node types (+1 more)

### Community 104 - "Context Wiki"
Cohesion: 0.25
Nodes (8): Connections, Contents, Context Wiki, Differences from ui-design-brain's wiki, How to navigate, Journal, Plans, Topics

### Community 105 - "Add story tests and enforce accessibility"
Cohesion: 0.29
Nodes (7): Add story tests and enforce accessibility, Assumptions, Files, Problem, Smallest fix, The addon question, What could break

### Community 106 - "Storybook review addons and reduced-motion coverage"
Cohesion: 0.29
Nodes (7): Already in the box — config, not installs, Scope, Skipping, Storybook review addons and reduced-motion coverage, The one to add outside Storybook, What I'd actually add, Worth a conversation, not a default

### Community 107 - "Add the Rich text component"
Cohesion: 0.33
Nodes (5): Add the Rich text component, Files, Follow-ups, What changed, Why

### Community 108 - "Add the Section header component"
Cohesion: 0.33
Nodes (5): Add the Section header component, Files, Follow-ups, What changed, Why

### Community 109 - "Add the Stat component"
Cohesion: 0.33
Nodes (5): Add the Stat component, Files, Follow-ups, What changed, Why

### Community 110 - "Add the Accordion component"
Cohesion: 0.33
Nodes (5): Add the Accordion component, Files, Follow-ups, What changed, Why

### Community 111 - "Add the Alert component"
Cohesion: 0.33
Nodes (5): Add the Alert component, Files, Follow-ups, What changed, Why

### Community 112 - "Add the Image component"
Cohesion: 0.33
Nodes (5): Add the Image component, Files, Follow-ups, What changed, Why

### Community 113 - "Add the Slider component"
Cohesion: 0.33
Nodes (5): Add the Slider component, Files, Follow-ups, What changed, Why

### Community 114 - "Add the Toast component"
Cohesion: 0.33
Nodes (5): Add the Toast component, Files, Follow-ups, What changed, Why

### Community 115 - "Add the In-page navigation component"
Cohesion: 0.33
Nodes (5): Add the In-page navigation component, Files, Follow-ups, What changed, Why

### Community 116 - "Add the Tabs component"
Cohesion: 0.33
Nodes (5): Add the Tabs component, Files, Follow-ups, What changed, Why

### Community 117 - "Add the Search overlay component"
Cohesion: 0.33
Nodes (5): Add the Search overlay component, Files, Follow-ups, What changed, Why

### Community 118 - "Story tests and the a11y gate"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Story tests and the a11y gate, What changed, Why

### Community 119 - "Connections — Wiki wiring"
Cohesion: 0.40
Nodes (5): Connections — Wiki wiring, Cross-area links (seams), Journal → plan, Page → topic, Topic → covered surface

### Community 120 - "Storybook Docs audit"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Storybook Docs audit, What changed, Why

### Community 121 - "Knowledge graph + wiki automation"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Knowledge graph + wiki automation, What changed, Why

### Community 122 - "Reduced-motion coverage"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Reduced-motion coverage, What changed, Why

### Community 123 - "Storybook review tooling"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Storybook review tooling, What changed, Why

### Community 124 - "Stat metadata stops advertising StatGroup variants"
Cohesion: 0.40
Nodes (4): Evidence, Stat metadata stops advertising StatGroup variants, What changed, Why

### Community 125 - "Native variant axis"
Cohesion: 0.18
Nodes (9): Files, Follow-ups, Native variant axis, What changed, Why, Current state, Decisions, Open threads (+1 more)

### Community 126 - "Realization-First Reuse with WCAG 2.2 AA Accessibility"
Cohesion: 0.22
Nodes (9): Accessibility and Realization Contract, AI Orchestration, Assumptions, Automated Accessibility Gates, Component Audit, Delivery and Verification, Project Retrospective, Realization-First Reuse with WCAG 2.2 AA Accessibility (+1 more)

### Community 127 - "Add Graphify code mapping"
Cohesion: 0.40
Nodes (5): Add Graphify code mapping, Files, Follow-ups, What changed, Why

### Community 128 - "stat/index.ts"
Cohesion: 0.20
Nodes (11): StatGroup(), Stat(), Default, GroupColumn, GroupRow, Story, WithDescription, StatClassNames (+3 more)

### Community 129 - "sync-graphify.cjs"
Cohesion: 0.20
Nodes (8): candidates, env, fs, graphPath, path, root, shouldStage, { spawnSync }

### Community 130 - "Fix wiki sync pagination"
Cohesion: 0.50
Nodes (4): Files, Fix wiki sync pagination, What changed, Why

### Community 131 - "Storybook tooling — Design History"
Cohesion: 0.40
Nodes (5): Current state, Decisions, Open threads, Storybook tooling — Design History, The maturity duplication

### Community 132 - "Knowledge graph & wiki automation — Design History"
Cohesion: 0.50
Nodes (4): Current state, Decisions, Knowledge graph & wiki automation — Design History, Open threads

### Community 133 - "Publish the UI library as a deterministic npm package"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Publish the UI library as a deterministic npm package, What changed, Why

### Community 136 - "Publish accessible realization contracts"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Publish accessible realization contracts, What changed, Why

### Community 149 - "Avatar.stories.tsx"
Cohesion: 0.20
Nodes (9): Avatar(), CropsWideMedia, Default, Sizes, Story, WithDescribedPortrait, AvatarClassNames, AvatarProps (+1 more)

### Community 150 - "Story testing — Design History"
Cohesion: 0.40
Nodes (5): Assertion rules, Current state, Decisions, Open threads, Story testing — Design History

### Community 151 - "Accessibility contract"
Cohesion: 0.50
Nodes (3): Accessibility contract, Component-owned guarantees, Consumer responsibilities

### Community 152 - "Modal.stories.tsx"
Cohesion: 0.18
Nodes (10): ClosesFromButton, ClosesOnBackdrop, Default, Medium, ReturnsFocusToRef, ScrollingBody, StackedOverlays, Story (+2 more)

### Community 153 - "dialog.client.ts"
Cohesion: 0.22
Nodes (15): Modal(), useDialog(), UseDialogOptions, FOCUSABLE, getFocusableElements(), useFocusTrap(), acquireScrollLock(), emit() (+7 more)

### Community 154 - "Package distribution — Design History"
Cohesion: 0.50
Nodes (4): Current state, Decisions, Open threads, Package distribution — Design History

### Community 155 - "check-release-commit.selftest.cjs"
Cohesion: 0.20
Nodes (12): git(), readReleaseCommits(), assert, { execFileSync }, fs, os, path, {
  readReleaseCommits,
  validateReleaseCommit,
  validateReleaseCommits,
} (+4 more)

### Community 156 - "Coordinated UI Library Contract v2 and AI Reuse Hardening"
Cohesion: 0.29
Nodes (7): AI Orchestration, Assumptions, Coordinated UI Library Contract v2 and AI Reuse Hardening, Release hardening, Test and Rollout, Tracking and Branches, UI Design Library

### Community 157 - "Modal.types.ts"
Cohesion: 0.16
Nodes (11): ModalClassNames, ModalHeadingLevel, ModalProps, ModalBody(), ModalFooter(), ModalHeader(), ModalHeaderProps, ModalPanel() (+3 more)

### Community 159 - "Publish executable ESM and reuse contract v2"
Cohesion: 0.40
Nodes (5): Files, Follow-ups, Publish executable ESM and reuse contract v2, What changed, Why

### Community 161 - "Component architecture — Design History"
Cohesion: 0.67
Nodes (3): Component architecture — Design History, Current state, Decisions

## Knowledge Gaps
- **744 isolated node(s):** `config`, `tagBadges`, `preview`, `faq`, `Story` (+739 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SlotClassNames` connect `classNames.ts` to `stat/index.ts`, `Toast.types.ts`, `SearchInput.types.ts`, `Breadcrumbs.stories.tsx`, `Carousel.stories.tsx`, `Image.types.ts`, `InPageNavigation.types.ts`, `Slider.stories.tsx`, `Badge.stories.tsx`, `Button.tsx`, `Tabs.stories.tsx`, `SearchOverlay.types.ts`, `Card.types.ts`, `Avatar.stories.tsx`, `RichText.types.ts`, `SectionHeader.types.ts`, `Modal.types.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `exports` connect `exports` to `./components/accordion`, `./components/alert`, `./components/avatar`, `./components/badge`, `./components/breadcrumbs`, `./components/button`, `./components/card`, `./components/carousel`, `./components/image`, `./components/in-page-navigation`, `./components/link`, `./components/modal`, `./components/quote`, `./components/rich-text`, `./components/search-input`, `./components/search-overlay`, `./components/section-header`, `./components/slider`, `./components/stat`, `./components/tabs`, `./components/toast`, `package.json`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `husky`, `next`, `playwright`, `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `storybook`, `@storybook/addon-docs`, `tailwindcss`, `@tailwindcss/postcss`, `peerDependencies`, `eslint`, `semantic-release`, `@semantic-release/github`, `@storybook/addon-a11y`, `storybook-addon-pseudo-states`, `storybook-addon-tag-badges`, `@storybook/addon-vitest`, `@storybook/react-vite`, `@tailwindcss/vite`, `@types/react-dom`, `typescript`, `@typescript-eslint/parser`, `@verndale/ai-pr`, `vite`, `@vitejs/plugin-react`, `@vitest/browser`, `@vitest/browser-playwright`, `package.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `config`, `tagBadges`, `preview` to the rest of the system?**
  _744 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build-graph.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07138047138047138 - nodes in this community are weakly interconnected._
- **Should `on-merge-sync.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06334841628959276 - nodes in this community are weakly interconnected._
- **Should `SearchInput.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._