# Accessibility contract

> Generated from `components/*/component.json` by `pnpm accessibility:report`. Do not edit by hand.

Reference fixtures run the configured WCAG 2.x A/AA axe rules and keyed Storybook assertions in Chromium and WebKit. Manifests cite the WCAG 2.2 criteria and APG patterns associated with each owned behavior. These automated checks cover only part of WCAG, so this report is not a whole-page conformance claim and is not a VoiceOver certification.

WebKit coverage is a Safari-engine regression proxy. Human assistive-technology testing remains a consuming-project responsibility.

## Consumer responsibilities

- `accessible-copy`: Supply meaningful labels and visible copy in context.
- `complete-page-assistive-technology-testing`: Test complete consuming pages with supported assistive technologies, including VoiceOver where required.
- `dynamic-content`: Supply accessible dynamic content and avoid duplicate announcement paths.
- `heading-context`: Choose heading levels that preserve the complete page hierarchy.
- `landmark-context`: Keep landmark names unique and meaningful on the complete page.
- `safe-class-overrides`: Do not use classNames to hide labels or required nodes, suppress focus, or disable pointer or keyboard access.
- `text-alternatives`: Supply meaningful text alternatives, using empty alternatives only for decorative images.
- `timed-content`: When enabling auto-dismiss, provide a persistent equivalent or applicable user control over the time limit.
- `token-contrast`: Preserve WCAG 2.2 AA contrast when overriding semantic tokens.

## Component-owned guarantees

| Component | Rendering | APG pattern | Owned evidence | Consumer responsibilities |
| --- | --- | --- | --- | --- |
| Accordion | `hybrid` | `accordion` | `accordion.keyboard.toggle` (2.1.1, 2.1.2, 2.5.8)<br>`accordion.state.relationships` (1.3.1, 4.1.2)<br>`accordion.focus.collapsed` (2.4.3, 2.4.11)<br>`accordion.motion.reduced` (2.3.3) | `accessible-copy`<br>`heading-context`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Alert | `hybrid` | `alert` | `alert.announcement.priority` (1.3.1, 4.1.3)<br>`alert.dismiss.keyboard` (2.1.1, 2.5.3, 2.5.8, 4.1.2)<br>`alert.timing.opt-out` (2.2.1) | `accessible-copy`<br>`dynamic-content`<br>`timed-content`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Avatar | `server` | Native semantics | `avatar.semantics.content` (1.1.1, 1.3.1) | `text-alternatives`<br>`accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Badge | `hybrid` | Native semantics | `badge.semantics.name` (1.1.1, 2.5.3)<br>`badge.remove.keyboard` (2.1.1, 2.5.8, 4.1.2) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Breadcrumbs | `server` | `breadcrumb` | `breadcrumbs.semantics.hierarchy` (1.3.1, 2.4.8, 2.5.8, 4.1.2)<br>`breadcrumbs.responsive.hidden` (2.4.3, 4.1.2) | `accessible-copy`<br>`landmark-context`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Button | `server` | `button` | `button.keyboard.activation` (2.1.1, 2.5.8, 4.1.2)<br>`button.focus.visible` (2.4.7, 2.4.11)<br>`button.icons.decorative` (1.1.1) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Card | `server` | Native semantics | `card.semantics.root` (1.3.1, 4.1.2) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Carousel | `client` | `carousel` | `carousel.keyboard.controls` (2.1.1, 2.5.7, 2.5.8)<br>`carousel.state.slides` (1.3.1, 4.1.2)<br>`carousel.announcement.status` (4.1.3) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Image | `server` | Native semantics | `image.alternative.text` (1.1.1)<br>`image.fallback.single` (1.1.1, 1.3.1) | `text-alternatives`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| In-page navigation | `hybrid` | `disclosure-navigation` | `in-page-navigation.disclosure.keyboard` (2.1.1, 2.5.8, 4.1.2)<br>`in-page-navigation.disclosure.state` (1.3.1, 4.1.2)<br>`in-page-navigation.responsive.hidden` (2.4.3) | `accessible-copy`<br>`landmark-context`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Link | `server` | `link` | `link.keyboard.activation` (2.1.1, 2.4.4)<br>`link.state.disabled` (4.1.2)<br>`link.target.size` (2.5.8, 2.4.7) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Modal | `client` | `modal-dialog` | `modal.focus.containment` (2.1.2, 2.4.3, 2.4.11, 2.5.8)<br>`modal.focus.restoration` (2.4.3)<br>`modal.keyboard.escape` (2.1.1, 2.1.2)<br>`modal.semantics.relationships` (1.3.1, 4.1.2)<br>`modal.background.inert` (2.4.3) | `accessible-copy`<br>`heading-context`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Quote | `server` | Native semantics | `quote.semantics.blockquote` (1.3.1) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Rich text | `server` | Native semantics | `rich-text.semantics.authored` (1.3.1, 2.4.6, 3.1.2) | `accessible-copy`<br>`heading-context`<br>`text-alternatives`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Search input | `client` | `search` | `search-input.keyboard.submit` (2.1.1, 2.4.3, 2.4.11, 2.5.8)<br>`search-input.semantics.label` (1.3.1, 2.4.6, 3.3.2)<br>`search-input.announcement.results` (4.1.3) | `accessible-copy`<br>`heading-context`<br>`landmark-context`<br>`dynamic-content`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Search overlay | `client` | `modal-dialog` | `search-overlay.focus.modal` (2.1.2, 2.4.3, 2.4.11, 2.5.8)<br>`search-overlay.focus.restoration` (2.4.3)<br>`search-overlay.focus.background-inert` (2.1.2, 2.4.3)<br>`search-overlay.semantics.dialog` (1.3.1, 4.1.2)<br>`search-overlay.announcement.results` (4.1.3) | `accessible-copy`<br>`dynamic-content`<br>`heading-context`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Section header | `server` | Native semantics | `section-header.heading.logical` (1.3.1, 2.4.6) | `accessible-copy`<br>`heading-context`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Slider | `client` | `slider` | `slider.keyboard.native` (2.1.1, 2.5.8, 4.1.2)<br>`slider.value.announced` (4.1.2)<br>`slider.description.valid` (1.3.1, 4.1.2) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Stat | `server` | Native semantics | `stat.reading.order` (1.3.1, 1.3.2) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Tabs | `client` | `tabs` | `tabs.keyboard.roving` (2.1.1, 2.4.3, 2.4.11, 2.5.8)<br>`tabs.keyboard.vertical` (2.1.1, 2.4.3)<br>`tabs.state.selection` (1.3.1, 4.1.2) | `accessible-copy`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |
| Toast | `client` | Native semantics | `toast.announcement.priority` (4.1.3)<br>`toast.icon.decorative` (1.1.1)<br>`toast.timing.opt-out` (2.2.1) | `accessible-copy`<br>`dynamic-content`<br>`timed-content`<br>`token-contrast`<br>`safe-class-overrides`<br>`complete-page-assistive-technology-testing` |

The exact package-owned DOM nodes, safe attributes, IDREF relationships, protected styling properties, and public prop types are authoritative in each component manifest.
