# Figma library

The governed Figma source is the [UI Design Library](https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library). `library.json` owns the file identity, promoted node IDs and keys, public API mapping, Storybook parity, nested dependencies, and pre-publish gates.

## File rules

- Every promoted master keeps the exact ui-design-brain canonical name. Do not rename, delete, or recreate a registered master.
- `✅ Ready for Dev` sections stay at the top of each page. The 528px documentation rail stays at x=0 and uses the Button Light template exactly: accent, eyebrow, title, description, public import, five property rows, side-by-side Usage and Accessibility cards, then code-only props. Main, responsive specimens, and publish sources stay to its right.
- Master components live once. Catalog and documentation surfaces use instances.
- The developer handoff target is the direct canonical component instance. Do not wrap it in a `Dev frame` or add instructions such as `COPY THIS FRAME` to its layer name. Labels and viewport scaffolding stay outside the component-only instance.
- Component visuals bind to the library's Tailwind semantic tokens from `src/tokens/semantic.css`. Cumulative Foundations is presentation styling for documentation only.
- Auto Layout, semantic layer names, and Figma variables are required. Generic names such as `Frame 1`, `Group`, or `Vector` are not release-ready.
- The Organization-tier collection has one `Cumulative` mode and at most 19 centrally maintained client modes. Do not create duplicated client component libraries.

The only manual prerequisite before the first release is confirming that the target file is owned by the Verndale Organization and that the releasing account can publish libraries. Record any replacement of a registered node in `nodeMigrations`; never silently change node identity.

## Promotion presentation pattern

The governed pattern is recorded in `library.promotionPattern` and applied through three presentation types:

- `component-matrix` for compact, finite combinations such as Button.
- `responsive-specimens` for components whose layout responds to a container.
- `responsive-full-viewport` for components such as Modal whose canonical instance includes the exact viewport/backdrop.

Responsive specimens use 1440px Desktop, 1024px Tablet Large, 768px Tablet Small, and 390px Mobile widths. Presentation surfaces, padding, label gaps, variant gaps, viewport-row gaps, and Section insets bind to the registered semantic tokens; the contract checker compares their recorded values with `src/tokens/semantic.css` so token changes require an intentional Figma sync.

Follow [`PROMOTION-CHECKLIST.md`](PROMOTION-CHECKLIST.md) for the exact layer, spacing, containment, content, and visual-audit requirements. The checklist is part of promotion definition of done for all future components.

Every candidate or supported code component must have a reviewed primary registration. Candidates enter this governed file during capture but remain unpublished. `pnpm figma:coverage` enforces that code-to-Figma handoff and rejects published candidate registrations.

## Code-consumption boundary

AI orchestration consumes implementations only through canonical-slug npm subpaths:

```tsx
import { Button } from "@verndale/ui-design-library/components/button";
```

Private `parts/`, source aliases, and relative implementation imports remain forbidden to consumers. Figma records property-to-code parity and nested component identity, but it does not carry a second code-template surface.

Every visual Figma property must reference a descendant layer. Properties that exist only as HTML, runtime, or accessibility metadata are marked `visualBinding: "nonvisual"` with a reason in `library.json`; an unexplained disconnected property is a contract failure.

```bash
pnpm test:code                # complete pre-Figma code, story, browser, accessibility, and motion gate
pnpm figma:coverage           # every candidate/supported component has a reviewed primary registration
pnpm figma:contracts          # registry, story, import, identity, review, and nesting contracts
pnpm figma:live               # read-only audit of registered live masters; requires FIGMA_REST_TOKEN
pnpm figma:live:selftest      # fixture tests for property, text-style, color, and spacing drift
pnpm figma:validate           # local checks plus the live audit when FIGMA_REST_TOKEN is present
```

The live audit reads the registered masters through Figma's [file-nodes endpoint](https://developers.figma.com/docs/rest-api/files/) and checks identity, property definitions, descendant property references, applied text styles, color-variable aliases, and spacing aliases. The separate design review verifies that those aliases use the intended semantic collection. The audit never mutates the file.

CI requires only `FIGMA_REST_TOKEN` with `file_content:read` for the live node audit. A temporary personal token works but should be replaced with a read-only [Organization Plan Access Token](https://developers.figma.com/docs/rest-api/plan-access-tokens/) when IT provisions one. The contract checker rejects Code Connect dependencies, scripts, configuration, registry templates, and CI references.

## Release boundary

Figma library publication remains an explicit maintainer action. After the library is published, smoke-test instances in a separate consumer Figma file against the orchestration's canonical-slug-to-npm flow.
