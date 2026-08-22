#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const frontmatter = require("../wiki/lib/frontmatter.cjs");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const GENERATED = [
  "scripts/graph/data/graph.json",
  "wiki/connections.md",
  "wiki/connections",
];

function gitLines(args) {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.split(/\r?\n/).filter(Boolean).map((file) => file.split(path.sep).join("/"));
}

function coversPaths() {
  const topicsDir = path.join(REPO_ROOT, "wiki", "topics");
  if (!fs.existsSync(topicsDir)) return new Set();
  const paths = new Set();
  for (const name of fs.readdirSync(topicsDir)) {
    if (!name.endsWith(".md")) continue;
    const text = fs.readFileSync(path.join(topicsDir, name), "utf8");
    for (const target of frontmatter.readList(text, "covers")) paths.add(target);
  }
  return paths;
}

function isGraphInput(file, covered) {
  if (["AGENTS.md", "README.md", "CONTRIBUTING.md", "CLAUDE.md"].includes(file)) return true;
  if (file === "src/tokens/semantic.css") return true;
  if (/^components\/[^/]+\/component\.json$/.test(file)) return true;
  if (file === "wiki/connections.md" || file.startsWith("wiki/connections/")) return false;
  if (file.startsWith("wiki/") && file.endsWith(".md")) return true;
  return covered.has(file);
}

function run() {
  if (process.env.CI) return { status: "skipped-ci", files: [] };

  try {
    const covered = coversPaths();
    const dirty = [
      ...gitLines(["diff", "--name-only", "--diff-filter=ACMRD"]),
      ...gitLines(["ls-files", "--others", "--exclude-standard"]),
    ];
    const inputs = [...new Set(dirty.filter((file) => isGraphInput(file, covered)))].sort();
    if (inputs.length > 0) {
      console.warn("warning: knowledge graph refresh skipped because graph inputs have unstaged or untracked changes:");
      for (const file of inputs) console.warn(`  - ${file}`);
      return { status: "skipped-dirty-inputs", files: inputs };
    }

    const build = spawnSync(process.execPath, [path.join(__dirname, "build-graph.cjs")], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    if (build.status !== 0) throw new Error(build.stderr.trim() || build.stdout.trim() || "graph build failed");

    const stage = spawnSync("git", ["add", "--", ...GENERATED], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    if (stage.status !== 0) throw new Error(stage.stderr.trim() || "generated graph staging failed");
    return { status: "refreshed", files: GENERATED };
  } catch (error) {
    console.warn(`warning: knowledge graph refresh failed; commit will continue (${error.message})`);
    return { status: "failed", files: [] };
  }
}

if (require.main === module) run();

module.exports = { coversPaths, isGraphInput, run };
