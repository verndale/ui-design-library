#!/usr/bin/env node
"use strict";

// Knowledge-graph builder for @verndale/ui-design-library. Walks the repo and emits a
// typed node/edge graph to scripts/graph/data/graph.json for the interactive viewer
// (scripts/graph/viewer/). Ported from @verndale/ui-design-brain and adapted: this repo
// has no catalog manifest and no backtick see-also convention between components, so
// those edge types are replaced by `uses-tokens` — the graph form of the third contract
// ("semantic tokens only") in AGENTS.md.
//
// Nodes  = knowledge units: each root doc, the token layer, each component's
//          component.json, the context-wiki pages, and any file a wiki topic's
//          `covers:` names (promoted to a `surface` node so the edge always resolves).
// Edges  = relationships already latent in the content:
//   uses-tokens  a component -> the token layer, when component.json declares tokens
//   links-to     relative markdown link between two node files (count = weight)
//   topic        a wiki page -> topics/<slug>.md (from frontmatter `topics:`)
//   plan         a wiki journal entry -> its archived plan (from frontmatter `plan:`)
//   covers       a wiki topic -> the runtime surfaces declared in its `covers:` metadata
//
// Everything is derived deterministically from the files — no guessing, no LLM.
// Output is timestamp-free so a rebuild only diffs when the content graph changes.
// Reuses the flat-frontmatter reader from scripts/wiki/lib/frontmatter.cjs.

const fs = require("fs");
const path = require("path");
const frontmatter = require("../wiki/lib/frontmatter.cjs");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const OUT_FILE = path.join(__dirname, "data", "graph.json");

const TOKEN_LAYER_ID = "src/tokens/semantic.css";
const COMPONENTS_DIR = "components";
const COMPONENT_JSON_RE = /^components\/([^/]+)\/component\.json$/;

// The generated governance-connections pages (a view of the graph, rendered into the
// wiki as a small index at wiki/connections.md plus per-section files under
// wiki/connections/). Excluded from the graph itself — otherwise their many links would
// become links-to edges, making them mega-nodes and coupling the graph to its own view.
const CONNECTIONS_INDEX_ID = "wiki/connections.md";
const CONNECTIONS_DIR_ID = "wiki/connections";
const isConnectionsView = (id) => id === CONNECTIONS_INDEX_ID || id.startsWith(`${CONNECTIONS_DIR_ID}/`);

// Root docs promoted to their own node type.
const ROOT_DOCS = new Set(["AGENTS.md", "README.md", "CONTRIBUTING.md", "CLAUDE.md"]);

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;
const FENCE_RE = /^```/;
const H1_RE = /^#\s+(.+?)\s*$/;
const PR_RE = /github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/g;
const ISSUE_RE = /github\.com\/[^/]+\/[^/]+\/issues\/(\d+)/g;
// NUL joins the (source, target) halves of an internal edge key so a node id that ever
// contained a space could never mis-split it (matches routing.cjs's edgeKey separator).
const EDGE_KEY_SEP = String.fromCharCode(0);

const toPosix = (p) => p.split(path.sep).join("/");
const rel = (abs) => toPosix(path.relative(REPO_ROOT, abs));

// Same skip rules as link resolution: external, anchors, template vars, placeholders.
function isSkippable(target) {
  return (
    target === "" ||
    target.startsWith("#") ||
    /^(https?:|mailto:)/.test(target) ||
    target.includes("${") ||
    target.includes("<") ||
    target.includes("...") ||
    target.startsWith("/")
  );
}

function walkMd(target) {
  let stat;
  try {
    stat = fs.statSync(target);
  } catch {
    return [];
  }
  if (stat.isFile()) return target.endsWith(".md") ? [target] : [];
  const out = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = path.join(target, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(p));
    else if (entry.isFile() && p.endsWith(".md")) out.push(p);
  }
  return out;
}

// Map a repo-relative posix path to a node type, or null to skip it.
function typeOf(r) {
  if (ROOT_DOCS.has(r)) return "root-doc";
  if (r === TOKEN_LAYER_ID) return "token-layer";
  if (COMPONENT_JSON_RE.test(r)) return "component";

  if (r.startsWith("wiki/")) {
    if (!r.endsWith(".md")) return null;
    const base = path.basename(r);
    if (base === "INDEX.md" || base === "MECHANICS.md") return "wiki-index";
    if (r.startsWith("wiki/journal/")) return "wiki-journal";
    if (r.startsWith("wiki/topics/")) return "wiki-topic";
    if (r.startsWith("wiki/plans/")) return "wiki-plan"; // plans/INDEX.md caught above
    return "wiki-index";
  }
  return null;
}

function extractLabel(id, type, text) {
  if (type === "component") {
    try {
      const parsed = JSON.parse(text);
      const label = parsed.canonical || parsed.slug || path.basename(path.dirname(id));
      // Variants share a canonical; disambiguate alternates so the graph does not
      // render two identically-labelled nodes. The default keeps the bare label.
      return parsed.variant && parsed.default !== true ? `${label} (${parsed.variant})` : label;
    } catch {
      return path.basename(path.dirname(id));
    }
  }
  if (type === "token-layer") return "Semantic tokens";
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(H1_RE);
    if (m) return m[1].replace(/`/g, "");
  }
  return path.basename(id);
}

// Extract resolvable relative markdown-link targets (repo-relative posix), skipping
// fenced code blocks and non-local targets. Markdown nodes only (root docs + wiki).
function extractLinks(absFile, text) {
  const targets = [];
  const lines = text.split(/\r?\n/);
  let fenced = false;
  for (const line of lines) {
    if (FENCE_RE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    LINK_RE.lastIndex = 0;
    let m;
    while ((m = LINK_RE.exec(line)) !== null) {
      const full = m[1].trim();
      const raw = full.split("#")[0].split(" ")[0];
      if (isSkippable(raw)) continue;
      const resolvedAbs = path.resolve(path.dirname(absFile), raw);
      targets.push({ target: rel(resolvedAbs), anchor: full.includes("#") ? full.split("#")[1] : null });
    }
  }
  return targets;
}

function uniqueMatches(text, re) {
  const out = [];
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

function build({ repoRoot = REPO_ROOT } = {}) {
  const componentDirs = fs.existsSync(path.join(repoRoot, COMPONENTS_DIR))
    ? fs
        .readdirSync(path.join(repoRoot, COMPONENTS_DIR), { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith("."))
        .map((e) => e.name)
        .sort()
    : [];
  const componentJsonAbs = componentDirs
    .map((slug) => path.join(repoRoot, COMPONENTS_DIR, slug, "component.json"))
    .filter((p) => fs.existsSync(p));

  const mdRoots = [path.join(repoRoot, "wiki"), ...[...ROOT_DOCS].map((d) => path.join(repoRoot, d))];
  const mdFiles = mdRoots.flatMap((rt) => walkMd(rt));
  const tokenLayerAbs = path.join(repoRoot, TOKEN_LAYER_ID);
  const absFiles = [...new Set([...mdFiles, ...componentJsonAbs, tokenLayerAbs])];

  const nodes = new Map(); // id -> node
  const fileText = new Map(); // id -> raw text

  for (const abs of absFiles) {
    const id = rel(abs);
    if (isConnectionsView(id)) continue; // the generated view is never a node in the graph
    const type = typeOf(id);
    if (!type) continue;
    let text;
    try {
      text = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    fileText.set(id, text);
    const isMd = id.endsWith(".md");
    nodes.set(id, {
      id,
      label: extractLabel(id, type, text),
      type,
      dir: toPosix(path.dirname(id)),
      topics: isMd ? frontmatter.readList(text, "topics") : [],
      aliases: isMd ? frontmatter.readList(text, "aliases") : [],
      prs: uniqueMatches(text, PR_RE),
      issues: uniqueMatches(text, ISSUE_RE),
      bytes: Buffer.byteLength(text, "utf8"),
      degree: 0,
    });
  }

  const edges = [];

  // 1. uses-tokens — a component -> the token layer, when component.json declares any
  //    `tokens`. This is the graph form of the third contract in AGENTS.md ("semantic
  //    tokens only") — check-contracts.cjs verifies each declared token exists; this
  //    edge just records the dependency exists at all.
  for (const [id, text] of fileText) {
    if (nodes.get(id)?.type !== "component") continue;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      continue;
    }
    const count = Array.isArray(parsed.tokens) ? parsed.tokens.length : 0;
    if (count > 0) edges.push({ source: id, target: TOKEN_LAYER_ID, type: "uses-tokens", count });
  }

  // 2. links-to — relative markdown links between two known node files (root docs + wiki).
  const linkCounts = new Map(); // `${src} ${tgt}` -> {count, anchors:Set}
  for (const [id, text] of fileText) {
    if (!id.endsWith(".md")) continue;
    for (const { target, anchor } of extractLinks(path.join(repoRoot, id), text)) {
      if (target === id || !nodes.has(target)) continue;
      const key = `${id}${EDGE_KEY_SEP}${target}`;
      let entry = linkCounts.get(key);
      if (!entry) {
        entry = { count: 0, anchors: new Set() };
        linkCounts.set(key, entry);
      }
      entry.count += 1;
      if (anchor) entry.anchors.add(anchor);
    }
  }
  for (const [key, { count, anchors }] of linkCounts) {
    const [source, target] = key.split(EDGE_KEY_SEP);
    edges.push({ source, target, type: "links-to", count, anchors: [...anchors] });
  }

  // 3. topic / 4. plan / 5. covers — wiki frontmatter relations. `covers` targets that
  //    are not already a node (e.g. a config or test-setup file, not a component or a
  //    root doc) are promoted to a lightweight `surface` node so the edge resolves —
  //    provided the file actually exists. A renamed/deleted covers target then produces
  //    a genuinely dangling edge, which is the integrity signal `pnpm evals:graph` wants:
  //    a stale topic-to-runtime declaration fails loudly instead of silently.
  const wikiSeen = new Set();
  const pushWiki = (source, target, type) => {
    const key = `${type}${EDGE_KEY_SEP}${source}${EDGE_KEY_SEP}${target}`;
    if (wikiSeen.has(key)) return;
    wikiSeen.add(key);
    edges.push({ source, target, type });
  };
  for (const [id, text] of fileText) {
    if (!id.startsWith("wiki/")) continue;
    for (const slug of frontmatter.readList(text, "topics")) {
      const target = `wiki/topics/${slug}.md`;
      if (nodes.has(target) && target !== id) pushWiki(id, target, "topic");
    }
    const planField = frontmatter.readField(text, "plan");
    if (planField && planField !== "none") {
      // Journal `plan:` is repo-root-relative under wiki/ (e.g. plans/... or wiki/plans/...).
      const candidate = planField.startsWith("wiki/") ? planField : `wiki/${planField.replace(/^\.?\//, "")}`;
      if (nodes.has(candidate)) pushWiki(id, candidate, "plan");
    }
    if (nodes.get(id)?.type === "wiki-topic") {
      for (const target of frontmatter.readList(text, "covers")) {
        if (!nodes.has(target)) {
          const abs = path.join(repoRoot, target);
          if (fs.existsSync(abs)) {
            let bytes = 0;
            try {
              const stat = fs.statSync(abs);
              // Directory st_size is filesystem metadata (for example, 256 on
              // macOS and 4096 on Linux), not content. Keep directory surfaces
              // at zero so a graph built locally is byte-identical in CI.
              bytes = stat.isFile() ? stat.size : 0;
            } catch {
              /* leave 0 */
            }
            nodes.set(target, {
              id: target,
              label: path.basename(target),
              type: "surface",
              dir: toPosix(path.dirname(target)),
              topics: [],
              aliases: [],
              prs: [],
              issues: [],
              bytes,
              degree: 0,
            });
          }
        }
        // Preserve unresolved targets so the integrity gate can fail loudly instead of
        // silently dropping a stale topic-to-runtime declaration.
        pushWiki(id, target, "covers");
      }
    }
  }

  // Degree.
  for (const e of edges) {
    if (nodes.has(e.source)) nodes.get(e.source).degree += 1;
    if (nodes.has(e.target)) nodes.get(e.target).degree += 1;
  }

  const nodeList = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  const edgeList = edges.sort(
    (a, b) => a.type.localeCompare(b.type) || a.source.localeCompare(b.source) || a.target.localeCompare(b.target),
  );

  const byType = {};
  for (const n of nodeList) byType[n.type] = (byType[n.type] || 0) + 1;
  const byEdge = {};
  for (const e of edgeList) byEdge[e.type] = (byEdge[e.type] || 0) + 1;

  return {
    counts: { nodes: nodeList.length, edges: edgeList.length, byType, byEdgeType: byEdge },
    nodes: nodeList,
    edges: edgeList,
  };
}

// Canonical serialization — the exact bytes graph:build writes. Shared with the
// graph-freshness eval so builder and checker never disagree on formatting.
function render(graph) {
  return JSON.stringify(graph, null, 2) + "\n";
}

// Coarse "area" for cross-subsystem filtering: components, the wiki, and root docs.
// A links-to edge is a seam when its endpoints sit in different areas.
function areaOf(id) {
  if (id.startsWith(`${COMPONENTS_DIR}/`) || id === TOKEN_LAYER_ID) return "components";
  if (id.startsWith("wiki/")) return "wiki";
  return "root";
}

// Render the graph as a set of human/agent-readable markdown pages: a small index at
// wiki/connections.md that routes to per-section files under wiki/connections/. Returns a
// { <repo-relative-posix-path>: <content> } map so a reader loads only the section its
// question needs. Node links from a section file resolve to the repo root via `../../<id>`
// (section files sit two levels down). Deterministic + timestamp-free, like render() above.
function renderConnections(graph) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const link = (id) => {
    const n = byId.get(id);
    const label = (n ? n.label : path.basename(id)).replace(/[[\]]/g, "");
    return `[${label}](../../${id})`;
  };
  const edgesOf = (t) => graph.edges.filter((e) => e.type === t);
  const finish = (lines) => lines.join("\n").replace(/\n*$/, "") + "\n";

  const head = (title, desc) => [
    `# Connections — ${title}`,
    "",
    desc,
    "",
    "Part of the [connections map](../connections.md), generated from the knowledge graph — **do not edit by hand**. Rebuilt on every `pnpm graph:build` and verified fresh by `pnpm evals:graph`.",
    "",
  ];

  // Component → token layer membership.
  const componentsSection = () => {
    const out = head("Components", "Every component's declared dependency on the semantic token layer.");
    const components = graph.nodes.filter((n) => n.type === "component").sort((a, b) => a.id.localeCompare(b.id));
    const usesTokens = edgesOf("uses-tokens");
    out.push(`${components.length} component${components.length === 1 ? "" : "s"} declare tokens:`, "");
    for (const c of components) {
      const edge = usesTokens.find((e) => e.source === c.id);
      out.push(`- ${link(c.id)} — ${edge ? edge.count : 0} token${edge?.count === 1 ? "" : "s"} declared`);
    }
    return finish(out);
  };

  // Wiki wiring — topics/plans/journal relations plus covers and cross-area seams.
  const wikiWiring = () => {
    const out = head("Wiki wiring", "How the context wiki connects: journal → plan, page → topic, topic → covered surface, and links that cross between root docs, components, and the wiki.");
    const planEdges = edgesOf("plan").sort((a, b) => a.source.localeCompare(b.source));
    out.push("## Journal → plan", "");
    if (planEdges.length) for (const e of planEdges) out.push(`- ${link(e.source)} → ${link(e.target)}`);
    else out.push("_No journal-to-plan links yet._");
    const topicEdges = edgesOf("topic").sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));
    out.push("", "## Page → topic", "");
    if (topicEdges.length) for (const e of topicEdges) out.push(`- ${link(e.source)} → ${link(e.target)}`);
    else out.push("_No topic links yet._");
    const coversEdges = edgesOf("covers").sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));
    out.push("", "## Topic → covered surface", "");
    if (coversEdges.length) for (const e of coversEdges) out.push(`- ${link(e.source)} → ${link(e.target)}`);
    else out.push("_No covers links yet._");
    const seams = edgesOf("links-to")
      .filter((e) => areaOf(e.source) !== areaOf(e.target))
      .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));
    out.push("", "## Cross-area links (seams)", "");
    if (seams.length) for (const e of seams) out.push(`- ${link(e.source)} → ${link(e.target)}${e.count > 1 ? ` (×${e.count})` : ""}`);
    else out.push("_No cross-area links yet._");
    return finish(out);
  };

  const index = () =>
    finish([
      "# Connections — component + wiki wiring",
      "",
      "Generated from the knowledge graph ([`scripts/graph/build-graph.cjs`](../scripts/graph/build-graph.cjs)) — **do not edit by hand**.",
      "Rebuilt on every `pnpm graph:build` and verified fresh by `pnpm evals:graph`. It maps how components,",
      "root docs, and the context wiki wire together (open the graph viewer with `pnpm graph:view` for the full, interactive picture).",
      "",
      "This is a small index — open the section your question needs:",
      "",
      "- [Components](connections/components.md) — every component's declared token dependency.",
      "- [Wiki wiring](connections/wiki-wiring.md) — journal → plan, page → topic, topic → covered surface, and cross-area seams.",
    ]);

  return {
    [CONNECTIONS_INDEX_ID]: index(),
    [`${CONNECTIONS_DIR_ID}/components.md`]: componentsSection(),
    [`${CONNECTIONS_DIR_ID}/wiki-wiring.md`]: wikiWiring(),
  };
}

function run() {
  const graph = build();

  // Integrity gate: every edge endpoint must resolve to a node. Check before writing so
  // a broken graph never overwrites the committed artifacts.
  const ids = new Set(graph.nodes.map((n) => n.id));
  const dangling = graph.edges.filter((e) => !ids.has(e.source) || !ids.has(e.target));
  if (dangling.length) {
    console.error(`FAIL: ${dangling.length} edge(s) with unresolved endpoints.`);
    for (const d of dangling.slice(0, 10)) console.error(`  ${d.type} ${d.source} -> ${d.target}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, render(graph));

  const connFiles = renderConnections(graph);
  for (const [relPath, content] of Object.entries(connFiles)) {
    const abs = path.join(REPO_ROOT, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }

  console.log(`Knowledge graph → ${rel(OUT_FILE)}`);
  console.log(`Connections pages → ${Object.keys(connFiles).length} files (index + sections under ${CONNECTIONS_DIR_ID}/)`);
  console.log(`  nodes: ${graph.counts.nodes}   edges: ${graph.counts.edges}`);
  const fmt = (obj) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}=${v}`)
      .join("  ");
  console.log(`  node types: ${fmt(graph.counts.byType)}`);
  console.log(`  edge types: ${fmt(graph.counts.byEdgeType)}`);
}

if (require.main === module) run();

module.exports = {
  build,
  render,
  renderConnections,
  typeOf,
  extractLinks,
  extractLabel,
  OUT_FILE,
  REPO_ROOT,
  CONNECTIONS_INDEX_ID,
  CONNECTIONS_DIR_ID,
};
