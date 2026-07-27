# Knowledge graph

A visual, interactive map of this repo's knowledge — root docs, the semantic token layer,
each component's `component.json`, and the context-wiki pages as nodes; the relationships
already latent in the content as edges. Built deterministically from the files (no LLM),
rendered in the browser. Ported from [`@verndale/ui-design-brain`](https://github.com/verndale/ui-design-brain)
and adapted to this repo's shape — see "Differences from ui-design-brain" below.

## Contents

- Usage
- Node types
- Edge types
- How it works
- Internal agent navigation
- Differences from ui-design-brain
- Adding a source

## Usage

```bash
pnpm graph:build   # parse the repo → scripts/graph/data/graph.json
pnpm graph:view    # serve the viewer at http://localhost:4173
```

Open the printed URL. In the viewer: scroll to zoom, drag to pan, **search** by name, path, or
alias, toggle **node types** in the legend, and **click a node** to focus its neighborhood and
open a metadata panel (path, connection count, aliases, topics, cited PRs/issues, and clickable
neighbors). Choose a source and target under **Shortest path** to inspect the same weighted,
hub-avoiding route used by internal agent navigation.

`graph:view` serves only `scripts/graph/` over localhost — nothing is deployed. Set `GRAPH_PORT`
to change the port. A local server is required because browsers block `fetch()` of the JSON over
`file://`.

## Node types

One node per file: `root-doc` (AGENTS.md, README.md, CONTRIBUTING.md, CLAUDE.md), `token-layer`
(`src/tokens/semantic.css` — a single node, the styling contract every component depends on),
`component` (one per `components/<slug>/component.json`), the wiki pages `wiki-index`,
`wiki-journal`, `wiki-topic`, `wiki-plan`, and `surface` — a file a wiki topic's `covers:`
names that isn't already one of the above (a Storybook or Vitest config file, `check-contracts.cjs`).
Node size scales with degree (connection count); color encodes type.

## Edge types

All derived deterministically — every edge is grounded in file content, nothing is inferred:

- `uses-tokens` — a component → the token layer, when its `component.json` declares any
  `tokens`. This is the graph form of the third contract in `AGENTS.md` ("semantic tokens
  only"); `count` = number of tokens declared.
- `links-to` — a relative markdown link between two node files (root docs + wiki;
  `count` = weight).
- `topic` — a wiki page → `topics/<slug>.md`, from frontmatter `topics:`.
- `plan` — a wiki journal entry → its archived plan, from frontmatter `plan:`.
- `covers` — a wiki topic → the runtime surfaces it declares in `covers:`. A target that
  isn't already a node is promoted to a `surface` node if the file exists; if it doesn't,
  the edge dangles and the build fails — a stale covers path is caught, not silently dropped.

## How it works

[`build-graph.cjs`](build-graph.cjs) is zero-dependency Node. It reuses the flat-frontmatter
reader from [`../wiki/lib/frontmatter.cjs`](../wiki/lib/frontmatter.cjs). Output is
timestamp-free, so a rebuild only changes `graph.json` when the underlying content graph
changes. The build fails if any edge endpoint doesn't resolve to a node. Alongside `graph.json`,
the build regenerates the human-readable connections pages
([`../../wiki/connections.md`](../../wiki/connections.md) + sections under `wiki/connections/`)
— a markdown view of the same graph; do not edit those by hand.
[`../evals/graph-check.cjs`](../evals/graph-check.cjs) (`pnpm evals:graph`) byte-compares a fresh
rebuild against the committed artifacts so nothing drifts.

The viewer ([`viewer/`](viewer/)) is a static page that renders `graph.json` with a **vendored**
[Sigma.js](https://www.sigmajs.org/) (WebGL) stack — `viewer/vendor/sigma.min.js` over a
[graphology](https://graphology.github.io/) model (`graphology.umd.min.js`), laid out with
ForceAtlas2 from `graphology-library.min.js`. All three are committed static assets, not
`package.json` dependencies. Search, type filters, and click-to-focus are driven by Sigma's
node/edge reducers.

## Internal agent navigation

[`../wiki/navigate.cjs`](../wiki/navigate.cjs) (`pnpm graph:navigate`) resolves an agent-selected
`why`, `wiring`, or `impact` intent to a compact reading itinerary. It uses
[`routing-policy.json`](routing-policy.json) and this graph only: no embeddings, LLM classification,
or inferred edges. Each itinerary step states the traversed edge and the graph declaration that
makes the next file authoritative. The graph freshness check rejects malformed policy schemas
and unsafe numeric weights before either the Node or browser resolver can traverse them.

## Differences from ui-design-brain

This repo has no catalog manifest (each `component.json` is independent — the directory itself
is the catalog, verified by `pnpm contracts`) and no backtick-style see-also convention between
components. So `catalogs`, `see-also`, and `references` are not ported; `uses-tokens` replaces
them as this repo's structural edge. The `surface` node type is new — it exists because a wiki
topic's `covers:` here mostly names code/config files rather than other markdown pages, and those
still need to resolve to something for the integrity gate to mean anything.

## Adding a source

The node typing lives in `typeOf()` in [`build-graph.cjs`](build-graph.cjs); new content kinds
become new branches there plus, if needed, a new edge pass. Add the matching color/label to
`TYPE_COLORS` / `TYPE_LABELS` (and any new edge hue to `EDGE_COLORS`) in
[`viewer/viewer.js`](viewer/viewer.js) so the legend and rendering pick it up, and add an edge
cost + intent coverage to [`routing-policy.json`](routing-policy.json) so `pnpm evals:graph`
stays green.
