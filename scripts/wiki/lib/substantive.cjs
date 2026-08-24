#!/usr/bin/env node
"use strict";

// Classifies a set of changed repo paths for the wiki automation: is the change
// "substantive" (worth a journal entry), and which wiki topic slug(s) does it
// touch? Both are deliberately best-effort heuristics — a missed topic is a
// small cost, and the journal warn is non-blocking. Topic slugs match the pages
// under wiki/topics/. Adapted from @verndale/ui-design-brain's SUBSTANTIVE_RE/TOPIC_RE
// for this repo's shape: components + the token layer instead of a pattern catalog.

// A path is substantive when it changes what the repo ships or how it is built:
// a component, the token layer, or the graph/wiki/test tooling (the story-test
// setup, the Storybook config, the graph builder, collectors, freshness gate,
// workflows, hooks).
const SUBSTANTIVE_RE = [
  /^components\//,
  /^src\/tokens\//,
  /^scripts\/(?:graph|wiki|evals|check-contracts)/,
  /^\.storybook\//,
  /^vitest(?:\..*)?\.config\.ts$/,
  /^vitest\.shared\.ts$/,
  /^\.github\/workflows\//,
  /^\.husky\//,
];

// wiki/ edits are never substantive — this is what stops a wiki-sync bot PR from
// triggering another round of capture.
const NEVER_RE = [/^wiki\//];

// Ordered path → topic-slug guesses. First match wins per path; a path may be
// substantive without matching any topic (topics is best-effort). Component/token
// edits deliberately match no topic here — same as upstream's catalog-content
// edits — since a single component change stands on its own journal entry until
// a dedicated topic exists for it.
const TOPIC_RE = [
  [/^scripts\/(?:graph|wiki|evals)\//, "graph-wiki-subsystem"],
  [/^\.github\/workflows\/(?:wiki|graph)/, "graph-wiki-subsystem"],
  [/^\.husky\//, "graph-wiki-subsystem"],
  [/^vitest(?:\..*)?\.config\.ts$/, "story-testing"],
  [/^vitest\.shared\.ts$/, "story-testing"],
  [/^\.github\/workflows\/quality\.yml$/, "story-testing"],
  [/^\.storybook\/preview\.ts$/, "story-testing"],
  [/^\.storybook\/(?:main|manager)\.ts$/, "storybook-tooling"],
  [/^\.storybook\/withDirection\.tsx$/, "storybook-tooling"],
  [/^scripts\/check-contracts\.cjs$/, "storybook-tooling"],
];

function classify(paths) {
  const changed = (paths || []).map((p) => String(p).trim()).filter(Boolean);
  const relevant = changed.filter((p) => !NEVER_RE.some((re) => re.test(p)));
  const substantivePaths = relevant.filter((p) => SUBSTANTIVE_RE.some((re) => re.test(p)));
  const topics = [];
  for (const p of substantivePaths) {
    for (const [re, slug] of TOPIC_RE) {
      if (re.test(p)) {
        if (!topics.includes(slug)) topics.push(slug);
        break;
      }
    }
  }
  return { substantive: substantivePaths.length > 0, substantivePaths, topics };
}

module.exports = { classify, SUBSTANTIVE_RE, TOPIC_RE };
