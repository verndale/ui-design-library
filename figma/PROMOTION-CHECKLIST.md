# Figma component promotion checklist

Use this checklist for every component promoted into the governed UI Design Library. A component is not Ready for Dev until the component, documentation, registry, and Code Connect mapping pass together.

## 1. Preserve identity

- Use the exact ui-design-brain canonical name for the master and every developer-facing instance. Do not add instructions such as `COPY THIS FRAME` to the component layer name.
- Create the master once. Edit a registered master in place; never delete and recreate it to reorganize a page.
- Record the stable node ID and component key in `figma/library.json`. A replacement requires a `nodeMigrations` entry.

## 2. Build the component from code contracts

- Derive properties, allowed values, defaults, and optional content from the public TypeScript types and Storybook `argTypes`.
- Bind component visuals to the semantic tokens in `src/tokens/semantic.css`. Do not approximate a code token with a Cumulative value or copy a raw color into the component.
- Use strict Auto Layout and semantic layers inside the component. The layout should behave like its code implementation at the governed widths.
- Use meaningful, production-like content that demonstrates the component's intended role and stress-tests wrapping.

## 3. Use the direct-canonical handoff pattern

- The selectable developer handoff target is the canonical component instance itself—not a zero-padding wrapper, a `Dev frame`, or a `COPY THIS FRAME` container.
- Keep the handoff target component-only. Put viewport labels, variant labels, usage notes, and presentation backgrounds outside the instance.
- A presentation group may use Auto Layout to arrange annotations and the instance. That group is documentation context and must not masquerade as the handoff target.
- Keep the canonical layer name unchanged so Code Connect, library search, and inspection all point to the same identity.
- Keep the 528px Button-standard documentation rail at x=0. Place Main, responsive specimens, and publish sources to its right; documentation never sits above or between component specimens.

## 4. Present responsive behavior

Use the widths registered in `library.promotionPattern.viewportWidths` when the component responds to its container:

| Viewport | Width |
| --- | ---: |
| Desktop | 1440px |
| Tablet Large | 1024px |
| Tablet Small | 768px |
| Mobile | 390px |

- Show each meaningful variant as a separate specimen with visible whitespace between variants.
- Use a white `code/color/surface/base` canvas around specimens.
- Use `code/color/surface/sunken` for a presentation panel only when contrast is needed; it is not part of the component.
- Bind specimen padding to `code/spacing/page-margin`, annotation-to-instance spacing to `code/spacing/s`, and variant/viewport-row spacing to `code/spacing/xl`.
- Bind the Ready for Dev Section inset to `code/spacing/m` and leave at least that inset below the final child.
- Full-viewport components such as Modal are the exception to specimen padding: the canonical instance is the exact viewport/backdrop. Keep its label outside and preserve the 1440×900, 1024×768, 768×1024, or 390×844 viewport frame.
- Use the `component-matrix` presentation for compact finite combinations such as Button. Use `responsive-specimens` for container-responsive components and `responsive-full-viewport` for exact viewport/backdrop components.

## 5. Audit before Ready for Dev

- Confirm every developer handoff target is a direct instance of the registered canonical master.
- Check alignment, text alignment, margins, padding, label padding, inter-variant whitespace, and viewport-row spacing at 100% zoom.
- Check wrapping, clipping, overflow, and parent containment at every governed width. No child may run outside its specimen, main canvas, or Ready for Dev Section.
- Confirm component dimensions and visual tokens match the code implementation. Documentation styling may use Cumulative Foundations; component styling may not.
- Confirm nested components remain real connected instances so their own Code Connect templates execute dynamically.
- Confirm every visible TEXT or BOOLEAN component property references the descendant layer it controls. Mark HTML-, runtime-, and accessibility-only mappings as `visualBinding: "nonvisual"` with a specific reason; do not use that marker to waive a visible binding.
- Confirm semantic text has an applied Code/Tailwind text style and visible solid fills/strokes use semantic color-variable aliases.
- Confirm every nonzero Auto Layout gap and padding value inside the canonical component is bound to a spacing variable. Component-set spacing used only to arrange variant masters is not component styling.
- Confirm `figma/library.json` uses `handoffPattern: "direct-canonical-instance"` and the appropriate `presentationPattern`.
- Run `FIGMA_REST_TOKEN=<read-only-plan-token> pnpm figma:live`, then `pnpm figma:validate`, `pnpm contracts`, `pnpm test`, and `pnpm build`.

## 6. Release separately

Library publication is an explicit maintainer action. Code Connect templates are maintained as locally parsed optional metadata because the AI orchestration resolves components through canonical slugs and npm; CI neither authenticates to nor publishes Code Connect.
