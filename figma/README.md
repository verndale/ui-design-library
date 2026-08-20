# Figma library

The governed Figma source is the [UI Design Library](https://www.figma.com/design/gXT4bIDrkgva2uSzY763oG/UI-Design-Library). `library.json` owns the file identity, promoted node IDs and keys, public API mapping, Storybook and source-parity evidence, nested dependencies, and pre-publish gates.

## File rules

- Every promoted master keeps the exact ui-design-brain canonical name. Do not rename, delete, or recreate a registered master.
- `✅ Ready for Dev` sections stay at the top of each page. The 528px documentation rail stays at x=0 and uses the Button Light template exactly: accent, eyebrow, title, description, public import, five property rows, side-by-side Usage and Accessibility cards, then code-only props. Main, responsive specimens, and publish sources stay to its right.
- Master components live once. Catalog and documentation surfaces use instances.
- The developer handoff target is the direct canonical component instance. Do not wrap it in a `Dev frame` or add instructions such as `COPY THIS FRAME` to its layer name. Labels and viewport scaffolding stay outside the component-only instance.
- Component visuals bind to the library's Tailwind semantic tokens from `src/tokens/semantic.css`. Cumulative Foundations is presentation styling for documentation only.
- Auto Layout, semantic layer names, and Figma variables are required. Generic names such as `Frame 1`, `Group`, or `Vector` are not release-ready.
- The Organization-tier collection has one `Cumulative` mode and at most 19 centrally maintained client modes. Do not create duplicated client component libraries.

## Canonical family pages and structural variants

- Use one governed page per canonical family. Put the default `✅ Ready for Dev` section first and each structural alternate below in a separately labeled section.
- Preserve the default master identity and canonical node name. A qualified alternate is named `<Canonical> / <Variant label>` and maps to `components/<slug>--<variant>`; it is a separate master, not a property variant of the default import.
- Registry fields `variant`, `variantLabel`, `default`, and `familyPage` mirror `component.json`. Every structural implementation has a distinct `componentPath`/`publicImport`; all structural siblings share the designated family page identity.
- Button Light is the legacy Button `familyPage`. Its published node stays in place, and the existing Button Dark page remains a legacy presentation; this contract governs future structural alternates without rearranging published nodes.
- Promote a new ui-design-brain canonical when role, affordance, or interaction semantics differ. Structural variants are only for different implementations of the same semantic contract.

The only manual prerequisite before the first release is confirming that the target file is owned by the Verndale Organization and that the releasing account can publish libraries. Record any replacement of a registered node in `nodeMigrations`; never silently change node identity.

## Promotion presentation pattern

The governed pattern is recorded in `library.promotionPattern` and applied through three presentation types:

- `component-matrix` for compact, finite combinations such as Button.
- `responsive-specimens` for components whose layout responds to a container.
- `responsive-full-viewport` for components such as Modal whose canonical instance includes the exact viewport/backdrop.

Responsive specimens use 1440px Desktop, 1024px Tablet Large, 768px Tablet Small, and 390px Mobile widths. Presentation surfaces, padding, label gaps, variant gaps, viewport-row gaps, and Section insets bind to the registered semantic tokens; the contract checker compares their recorded values with `src/tokens/semantic.css` so token changes require an intentional Figma sync.

Follow [`PROMOTION-CHECKLIST.md`](PROMOTION-CHECKLIST.md) for the exact layer, spacing, containment, content, and visual-audit requirements. The checklist is part of promotion definition of done for all future components.

Every candidate or supported code component must have a reviewed primary registration. Candidates enter this governed file during capture but remain unpublished. `pnpm figma:coverage` enforces that code-to-Figma handoff and rejects published candidate registrations.

## Source-parity contract

Package contract version 1 links every component manifest, Storybook meta, and Figma registration to a private, immutable source decision using only an audited family key, digest, stable decision IDs, decision-scoped implementation keys, and target surfaces. Private client identity, paths, citations, and excerpts remain outside this public repository. Figma-targeted decisions are registered only on their implementation and use typed `representations`: property-backed decisions name real public props and Figma mappings, structural alternates register their qualified master, responsive decisions additionally map 1440/1024/768/390 specimen frames to the exact master instance they contain, and nonvisual metadata uses a nonvisual mapping without inventing visual nodes.

`figma/source-parity-baseline.json` records the immutable 21-key legacy migration set and the still-pending subset. New components cannot enter that baseline. A null structural `implementationKey` is allowed only while its family is grandfathered; leaving the baseline requires a real family implementation, complete target representations, and fresh post-remediation source-parity, adversarial, and design reviews. Completion is recorded privately as an append-only event; the original decision digest is not rewritten. The file and baseline logic are removed after the last key clears.

## Code-consumption boundary

AI orchestration consumes implementations only through canonical-slug npm subpaths:

```tsx
import { Button } from "@verndale/ui-design-library/components/button";
import { Navigation } from "@verndale/ui-design-library/components/navigation--mega";
```

Private `parts/`, source aliases, and relative implementation imports remain forbidden to consumers. Figma records property-to-code parity and nested component identity, but it does not carry a second code-template surface.

Resolution is deterministic: `canonical + optional variant → componentPath → publicImport → Figma node`. Enum, boolean, text/slot, and instance-swap properties are registered only when they mirror the public TypeScript/Storybook contract. Every visual property must reference a descendant layer. Properties that exist only as HTML, runtime, or accessibility metadata are marked `visualBinding: "nonvisual"` with a reason; an unexplained disconnected property is a contract failure.

```bash
pnpm test:code                # complete pre-Figma code, story, browser, accessibility, and motion gate
pnpm figma:coverage           # every candidate/supported component has a reviewed primary registration
pnpm figma:contracts          # registry, story, import, identity, review, and nesting contracts
pnpm figma:live               # read-only audit of registered live masters; requires FIGMA_REST_TOKEN
pnpm figma:live:selftest      # fixture tests for property, style, token, spacing, and specimen-width drift
pnpm figma:validate           # local checks plus the live audit when FIGMA_REST_TOKEN is present
```

The live audit reads the registered masters and source-parity specimens through Figma's [file-nodes endpoint](https://developers.figma.com/docs/rest-api/files/) and checks identity, property definitions, descendant property references, applied text styles, color-variable aliases, spacing aliases, representation master type, registered responsive widths, and specimen-to-master instance containment. The separate design review verifies that those aliases use the intended semantic collection. The audit never mutates the file.

CI requires only `FIGMA_REST_TOKEN` with `file_content:read` for the live node audit. A temporary personal token works but should be replaced with a read-only [Organization Plan Access Token](https://developers.figma.com/docs/rest-api/plan-access-tokens/) when IT provisions one. The contract checker rejects Code Connect dependencies, scripts, configuration, registry templates, and CI references.

## Release boundary

Figma library publication remains an explicit maintainer action. After the library is published, smoke-test instances in a separate consumer Figma file against the orchestration's canonical-slug-to-npm flow.
