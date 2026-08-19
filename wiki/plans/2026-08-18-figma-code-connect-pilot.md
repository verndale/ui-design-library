---
status: partial
executed: 2026-08-18
evidence:
  - "issue #49"
  - "seven stable Ready for Dev Figma nodes"
  - "pnpm figma:validate"
  - "pnpm contracts"
  - "pnpm test"
  - "pnpm build"
source_tool: codex
source: approved Organization-tier Figma Library and Code Connect Pilot task
topics: [figma-code-connect]
audit_note: The Figma masters, direct-canonical responsive presentation pattern, documentation, registry, parserless mappings, promotion checklist, contracts, and CI dry-run shipped in the working tree. Organization ownership/publish permission, the CI secret, explicit Figma and Code Connect publication, and the post-publication consumer-file smoke test remain maintainer-controlled external steps.
---
# Organization-tier Figma Library and Code Connect Pilot

## Summary

Build the library in the empty [UI Design Library](https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library?node-id=0-1&p=f&t=fYIBy1uQVGtULN0o-0), using:

- [Cumulative Foundations](https://www.figma.com/design/ZC3eyYJTBFlQEWPAwqs22U/Cumulative-Foundations?m=dev) for Figma presentation styling only.
- [CN Library](https://www.figma.com/design/nnPCCDzrf7mCSLzzOUnOnB/CN-Library?node-id=0-1&p=f&t=9Wox5i0e8TPfsoW8-0) as an organizational reference, without copying its component nodes.
- The public React API as the source of truth for component properties and Code Connect snippets.

No manual frames or placeholder components need to be created in Figma now. The target is empty, and creating placeholders would produce the wrong long-term node identities.

## GitHub Kickoff

1. Present this exact issue draft for explicit confirmation before filing it:

   **Title:** `[Feature] Promote UI design library components to Figma with Code Connect`

   **Labels:** `Feature`, `area: components`, `documentation`

   **Body:**

   ```markdown
   ## Summary

   Promote governed public React components into the Verndale UI Design Library Figma file and connect them to the public npm API with Code Connect.

   ## Context

   Designers and outside design houses deliver in Figma. The target UI Design Library is currently empty, Cumulative Foundations supplies the Figma presentation theme, and CN Library is the reference for file organization. Stable published component ownership and node identity are required.

   ## Details

   Build centrally managed Organization-tier Figma variables and presentation pages, promote the representative component pilot, and add parserless Code Connect templates using public package imports. Add dynamic nested mappings, registry/contracts, documentation, and CI dry-run validation. Cumulative styling remains Figma-only and does not alter the code package’s tokens.

   ## Expected Outcome

   Published, stable Figma component instances produce correct `@verndale/ui-design-library/components/<slug>` snippets and pass repository and Figma contract validation.

   ## Additional Notes

   Organization tier does not provide Enterprise extended collections, so brand modes are centrally managed in this library. Figma library and Code Connect publishing remain explicit maintainer-controlled release steps.
   ```

2. After the issue is created, update local `main` with a fast-forward-only pull and create:

   `codex/<issue-number>-figma-code-connect-pilot`

3. Keep the branch local unless the maintainer separately authorizes commits and pushing. Do not merge, tag, release, or publish.

## Figma Library Setup

- Verify the target file is owned by the Verndale Organization and the implementing account can edit and publish libraries. This ownership/publishing check is the only possible manual prerequisite.
- Structure the file with cover, foundations, usage, component catalog, dedicated pilot component pages, and an archive page. Master components live once; catalog and documentation pages use instances.
- Use Cumulative variables and text styles for the Figma presentation. Do not add a Cumulative CSS export or change `src/tokens/semantic.css`.
- Create local semantic variables for promoted components:
  - A `Cumulative` default mode.
  - Centrally maintained client brand modes.
  - No Enterprise-only extended collections and no duplicated client component libraries.
  - Respect the Organization limit of 20 modes per collection: one Cumulative mode plus at most 19 active client modes.
- Promote seven stable nodes for the pilot:
  - Button — Light
  - Button — Dark
  - SectionHeader
  - Alert
  - Card
  - CardMedia
  - Modal
- Derive component properties from the public TypeScript types and Storybook `argTypes`. Add descriptions, allowed values, defaults, accessibility guidance, and usage examples.
- Record every published node ID in the repository governance registry. Published masters are edited in place rather than deleted and recreated; replacement requires an explicit node-migration entry.
- Code Connect mapping is part of each component’s promotion definition of done.

## Repository and Code Connect Changes

- Add `figma.config.json`, a Figma-specific TypeScript configuration, a `figma/library.json` ownership/node registry, and parserless `.figma.ts` templates.
- Add the Code Connect CLI as a development dependency and expose validation/dry-run scripts.
- Templates import only public paths such as:

  ```ts
  import { Button } from "@verndale/ui-design-library/components/button";
  ```

- Never reference private implementation files, `parts/`, source aliases, or relative internal paths.
- Map Figma properties to the existing public component API. Do not introduce runtime component API changes for the pilot.
- Resolve nested components dynamically so, for example, Card emits the mapped CardMedia instance rather than hard-coded substitute markup.
- Add contracts covering:
  - Registry node uniqueness and stable ownership.
  - Supported-component mapping completeness.
  - Public-package-only imports.
  - Story/property/mapping parity.
  - Valid nested dependency references.
- Update component documentation and repository wiki history in the same delivery, then run `pnpm graphify:sync`.

## Verification and Release

- Validate that every registered node resolves to the intended component or component set in the target file.
- Run Code Connect’s dry-run in CI using a least-privileged Figma credential stored as a GitHub Actions secret; CI must never publish mappings.
- Verify generated snippets for all seven pilot nodes, including conditional props, Light/Dark Button behavior, and Card/CardMedia nesting.
- Run `pnpm contracts`, `pnpm test`, and `pnpm build`.
- Smoke-test published-library instances in a separate consumer Figma file and confirm Dev Mode displays the correct public npm imports.
- Figma library publication and Code Connect publication remain separate, explicit maintainer release actions.
- Treat the Cumulative theme as Figma-only presentation/design context; Code Connect maps structure and public APIs, not Cumulative code styling.
