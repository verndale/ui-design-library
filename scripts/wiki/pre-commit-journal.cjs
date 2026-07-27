#!/usr/bin/env node
"use strict";

// Pre-commit reminder for the context wiki. Warns (never blocks) when a commit
// stages a substantive change but no wiki/journal entry. Exits 0 always; fails
// open on any error. Skipped under $CI so it can't wedge a bot commit.
//
// Adapted from @verndale/ui-design-brain's pre-commit-journal.cjs. That version also
// scans ~/.claude/plans for an executed-but-unarchived plan and suggests
// `archive-plan.cjs`; this repo has no such CLI — wiki/MECHANICS.md documents
// archiving a plan by hand — so that half is dropped rather than pointing at a
// script that doesn't exist here.

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const { classify } = require("./lib/substantive.cjs");

function stagedPaths() {
  const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

// Pure: given the staged paths, return the warning lines.
function buildWarnings({ stagedPaths }) {
  const paths = stagedPaths || [];
  const { substantive, substantivePaths } = classify(paths);
  const hasJournal = paths.some((p) => p.startsWith("wiki/journal/"));

  const notes = [];
  if (substantive && !hasJournal) {
    notes.push(
      "wiki: this commit stages a substantive change with no wiki/journal entry.",
      "  Changed: " + substantivePaths.slice(0, 6).join(", ") + (substantivePaths.length > 6 ? " …" : ""),
      "  Add one per wiki/MECHANICS.md, or ignore. The merge workflow will draft a stub if you skip it.",
    );
  }
  return notes;
}

function main() {
  if (process.env.CI) return 0;
  let staged;
  try {
    staged = stagedPaths();
  } catch {
    return 0; // no git / fail open
  }
  const notes = buildWarnings({ stagedPaths: staged });
  if (notes.length) {
    const rule = "=".repeat(64);
    console.warn(`\n${rule}\n  !!  WIKI REMINDER — action likely needed before you commit\n${rule}\n${notes.join("\n")}\n${rule}\n`);
  }
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { main, buildWarnings, stagedPaths };
