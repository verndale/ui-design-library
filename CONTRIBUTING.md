# Contributing

This repository publishes `@verndale/ui-design-library` to npm. Projects install an exact version and import compiled component subpaths; merges to `main` release automatically after the full quality gate.

## Quick start

    pnpm install
    pnpm exec playwright install chromium   # once per machine, for the story tests
    pnpm storybook        # browse at http://localhost:6006
    # add or change a component
    pnpm test
    pnpm build
    git add -A
    pnpm commit

## The three contracts

Enforced by `pnpm contracts`:

1. **Slug equality** — `components/<slug>/` with `slug == kebab(canonical)` from `ui-design-brain`. A canonical with more than one structural implementation keeps its default on the bare slug and adds each alternate as `components/<slug>--<variant>/` (same `canonical`/`slug`, distinct `variant`, one `default`).
2. **Stories exist** — the story file is the API contract, not documentation.
3. **Semantic tokens only** — no raw colours, no client brand names. Declared tokens must exist in `src/tokens/semantic.css`.

Plus: `component.json` needs `provenance` (which project and run it came from), a `maturity` of `candidate`, `supported`, or `deprecated`, and a governed `reuseFingerprint` (`slots`, `affordance`, `role`) for deterministic AI compatibility. The API-level `slots` remain separate. Maturity is mirrored as a `maturity:*` tag on the story meta so the sidebar can badge it — `pnpm contracts` fails if the two disagree, because two sources for one fact drift silently.

## The component architecture

Every directory exposes one `index.ts` facade, keeps public types in one root `*.types.ts`, and contains at least two meaningful non-story TSX modules. Split the implementation into a tree and private branches/leaves under `parts/`; stories import only `./index`.

Components are server-compatible by default. A module that owns state, effects, portals, focus behavior, or browser globals is named `*.client.ts(x)` and stays at or below 120 physical lines. Put `'use client'` on the smallest public or hybrid entry boundary; modules already beneath that boundary do not repeat the directive. Do not import `next/*` into component core; framework adapters belong to consumers, while this repo's Next dependency exists only for its consumer fixture.

`pnpm architecture` enforces the file shape and boundaries. `pnpm test:ssr` catches browser access during module evaluation or server rendering.

## Adding a component

Start from a capture in a `project-retrospective` run. Executing it is a rewrite:

1. Replace project-internal imports with library primitives in `src/lib/`, or write a new one — dependency-free.
2. Map client tokens onto semantic tokens. If a value has no semantic home, add the token rather than inlining the value.
3. Drop client copy, assets, and brand colours.
4. Write stories covering the default, each variant, and the edge states that break layouts (empty, very long, missing optional slot).
5. Fill `component.json`, including the `declienting` array and `reuseFingerprint`. Use only the governed compatibility vocabulary; do not copy API prop names into the structural fingerprint.
6. Land as `maturity: "candidate"`.
7. Classify it as server-compatible, hybrid, or client-only; isolate each genuinely interactive branch and prefer serializable node slots over render callbacks.
8. If the capture is a structurally-distinct implementation of a canonical already in the library (a mega menu where Navigation ships a plain bar), land it as `components/<slug>--<variant>/` rather than overwriting the incumbent: share the `canonical` and `slug`, set `variant`, mark exactly one implementation `default: true`, and title the variant's stories `<Canonical> / <label>`. `pnpm contracts` checks the axis holds. This is separate from the `variants` array, which stays the list of prop-value options within one implementation.
9. Run `pnpm exports:sync`; the committed map is derived from component directories, and all read-only build/test gates fail if it drifts.

## Verify the behaviour, not the markup

`pnpm test` compiles, checks the contracts, then renders every story in a real Chromium — running its `play` function and axe over the result.

A story without a `play` function still counts as a passing test: Storybook generates a smoke render for it. That is a floor, not coverage. Put the behaviour that would actually break in a `play` function, and assert the effect rather than the cause:

- **Computed style, not class names.** `group-hover:*:scale-[1.05]` and `*:group-hover:scale-[1.05]` differ by one position; the second compiles to no CSS in Tailwind v4. A class-name assertion passes on both.
- **Real interaction, not programmatic calls.** `:focus-visible` deliberately does not match `element.focus()`, so a test that calls it is testing nothing. Tab instead.
- **Resolution, not presence.** `aria-labelledby` pointing at an id that does not exist looks identical in the DOM to one that resolves.

If the component animates, tag its story `motion` so `pnpm test:motion` re-runs it under an emulated `prefers-reduced-motion`, and branch the assertion on `matchMedia`.

Still worth opening the story yourself — use the toolbar to check the other writing direction, the pseudo-states you cannot trigger by hand, and the breakpoints where layout switches.

## Commit messages

Conventional Commits via `@verndale/ai-commit`, scope required:

    feat(modal): Add Modal captured from CN
    fix(tokens): Correct the scrim opacity
    docs(readme): Clarify exact-version package consumption

Enforced by the `commit-msg` hook and in CI. `pnpm commit` generates a pre-validated message.

The squash commit on `main` is also the release signal: breaking changes produce majors, `feat` produces minors, and every other allowed type produces a patch. Publishing itself is never run manually.

## What not to do

- Do not hard-code a colour, duration, or spacing value in a component.
- Do not add a runtime dependency without a strong reason — prefer CSS and a small primitive.
- Do not copy a component in from a client project without de-clienting it and recording what came out.
- Do not promote a component to `supported` as a side effect of another change.
- Do not fold a structurally-distinct implementation into an existing component's `variants` array. That array is prop-value options; a mega menu is a `variant` **directory**, not a Navigation prop.
- Do not add `'use client'` to a whole component because one leaf needs interaction.
- Do not bypass a component's `index.ts` from a story or a consumer.
- Do not pass render functions across a server/client boundary when a serializable node slot expresses the same customization.
- Do not import `next/*` into the library core.
- Do not commit secrets or `.env`.
