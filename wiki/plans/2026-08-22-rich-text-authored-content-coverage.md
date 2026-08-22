---
status: implemented
executed: 2026-08-22
evidence:
  - "issue #80"
  - "Rich Text master 173:62"
  - "authored-content section 417:26"
  - "targeted Storybook tests"
  - "authenticated Figma validation"
  - "PR #81 https://github.com/verndale/ui-design-library/pull/81 (merged 2026-08-22)"
source_tool: codex
source: Codex task 01a026d0-a6f3-7420-be54-22d288818738
topics: [figma-code-connect, story-testing]
audit_note: The captured Bentley source did not include tables; semantic table coverage was added from the explicit authored-content requirement while CMS ingestion, sanitization, media controls, and table behavior remained caller concerns.
---
# Rich Text authored-content coverage

## Goal

Restore the source-backed breadth that was lost during Rich Text capture and document the complete authored-content surface in code, Storybook, and Figma without widening the React API or replacing the canonical Figma master.

## Plan

1. Audit the captured Bentley template, stylesheet, and story against the current library and live Rich Text Figma page.
2. Restore code-backed H1–H6 typography, direct-child and list rhythm, and responsive image, picture, video, and iframe behavior.
3. Add neutral figure/caption and native semantic-table styling because rich-text authors can supply those structures.
4. Expand the FullFlow Storybook evidence and behavior assertions across heading levels, lists, responsive media, captions, and scoped table headers.
5. Correct the existing Rich Text Figma master in place, preserve its node ID, key, properties, variants, and connected instances, and add a separate authored-content documentation section for arbitrary children that do not belong on a finite variant axis.
6. Use exact code-backed text styles, semantic variables, and connected canonical instances; create only a missing code-backed text style when discovery proves no reusable style exists.
7. Run code, Storybook, Figma, graph, and whitespace validation, then record the result in the repository wiki.

## Boundaries

- Do not add CMS-string ingestion or sanitization.
- Do not invent media controls, table sorting, table pagination, or other runtime behavior.
- Do not change the public Rich Text API or canonical Figma identity.
- Do not commit, push, publish, merge, or release without maintainer authorization.
