# Contributing

Nothing consumes this repo through a registry — projects pin it as a git submodule and import the source. So there is no release path; the bar is the three contracts and a component that actually works.

## Quick start

    pnpm install
    pnpm storybook        # browse at http://localhost:6006
    # add or change a component
    pnpm test
    git add -A
    pnpm commit

## The three contracts

Enforced by `pnpm contracts`:

1. **Slug equality** — `components/<slug>/` with `slug == kebab(canonical)` from `ui-design-brain`.
2. **Stories exist** — the story file is the API contract, not documentation.
3. **Semantic tokens only** — no raw colours, no client brand names. Declared tokens must exist in `src/tokens/semantic.css`.

Plus: `component.json` needs `provenance` (which project and run it came from) and a `maturity` of `candidate`, `supported`, or `deprecated`.

## Adding a component

Start from a capture in a `project-retrospective` run. Executing it is a rewrite:

1. Replace project-internal imports with library primitives in `src/lib/`, or write a new one — dependency-free.
2. Map client tokens onto semantic tokens. If a value has no semantic home, add the token rather than inlining the value.
3. Drop client copy, assets, and brand colours.
4. Write stories covering the default, each variant, and the edge states that break layouts (empty, very long, missing optional slot).
5. Fill `component.json`, including the `declienting` array — every removal, specifically. "Minor cleanup" is not an entry.
6. Land as `maturity: "candidate"`.

## Verify in the browser

`pnpm test` proves it compiles and keeps its contracts. It does not prove the component works. Before handing back, open the story and check the behaviour that matters — focus moving in and out, keyboard operation, the responsive switch, and the a11y panel clean.

## Commit messages

Conventional Commits via `@verndale/ai-commit`, scope required:

    feat(modal): Add Modal captured from CN
    fix(tokens): Correct the scrim opacity
    docs(readme): Clarify the submodule consumption model

Enforced by the `commit-msg` hook and in CI. `pnpm commit` generates a pre-validated message.

## What not to do

- Do not hard-code a colour, duration, or spacing value in a component.
- Do not add a runtime dependency without a strong reason — prefer CSS and a small primitive.
- Do not copy a component in from a client project without de-clienting it and recording what came out.
- Do not promote a component to `supported` as a side effect of another change.
- Do not commit secrets or `.env`.
