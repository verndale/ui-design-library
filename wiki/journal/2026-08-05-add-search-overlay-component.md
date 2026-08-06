---
date: 2026-08-05
topics: []
plan: none
pr: pending
---
# Add the Search overlay component

## Why

- A full-screen search surface — a prominent field with a heading and supporting copy, idle quick-links that give way to a results panel once the visitor types — was promoted into the ui-design-brain catalog as **Search overlay**, distinct from the inline Search input, a plain Modal, and a Combobox. A mature client implementation with a build pack (a dedicated open/closed × idle/active state machine and an accessibility contract) existed, worth banking rather than rebuilding.
- Its value is the dialog + search state machine: focus moves to the field on open, is trapped while open, and returns to the opener on close; Escape and the dimmed backdrop dismiss; and the idle↔active split swaps the quick links for a results region.

## What changed

- Added `components/search-overlay/` — a de-cliented capture: `SearchOverlay` takes a controlled `query` / `onQueryChange`, an optional `onSubmit`, a required `title`, and `supportingCopy` / `quickLinks` / `resultsPanel` slots.
- **Reused rather than rebuilt.** The field is the library's own **SearchInput** — its input, submit, clear, and polite results live region carry over, and the results panel rides through its `results` slot. The dismiss control is a new shared **CloseButton** primitive (`src/lib/CloseButton.tsx`). The dialog contract — SSR portal gate, focus trap, scroll lock, Escape-to-close, focus restoration — was extracted into a shared **`useDialog`** hook (`src/lib/dialog.ts`) on top of the existing `focus.ts`.
- **Modal adopted the same shared pieces.** `Modal` now consumes `useDialog` and `CloseButton` instead of its own inline copies, so the overlay shell and the close control live in one place; Modal's own story tests verify the refactor is behaviour-preserving.
- Mapped client tokens onto library semantic tokens: panel `color-surface-raised`, backdrop `color-surface-scrim`, elevation `shadow-overlay`, bottom corners `radius-medium`, text `color-text-primary` / `color-text-secondary`; the field and close control map their own tokens through SearchInput and CloseButton.
- Dropped as client/CMS concerns: the search-API / results-feed wiring (results and suggestions are now the `resultsPanel` slot; the overlay emits query and submit events), the CMS field bindings for the heading and quick links, and the decorative brand glow asset. Dropped the client's bespoke arrow-key suggestion navigation — results are caller-owned in a polite live region, so option-level activedescendant is the caller's responsibility. Kept verbatim: the focus trap, Escape/backdrop dismissal, focus restoration, and the idle↔active state split.
- Captured from a project retrospective; provenance and the de-client record live in `component.json`.

## Files

- components/search-overlay/SearchOverlay.tsx, components/search-overlay/SearchOverlay.stories.tsx, components/search-overlay/component.json
- src/lib/dialog.ts (new — the shared overlay contract), src/lib/CloseButton.tsx (new — the shared dismiss control)
- components/modal/Modal.tsx (adopted `useDialog` + `CloseButton`)
- package.json (exports synced for the new component)

## Follow-ups

- Other overlays can now build on `useDialog` + `CloseButton` rather than re-implementing the shell.
- The results panel is a caller-owned slot in a polite live region; a consumer wanting full combobox arrow-navigation over a fixed suggestion list would own that option / activedescendant contract.
