#!/usr/bin/env node
"use strict";

// Focused parity check for offline GitHub evidence, token-efficient graph
// navigation, reconciliation automation, workflow identities, and hook safety.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const github = require("../wiki/lib/github.cjs");
const merge = require("../wiki/on-merge-sync.cjs");
const refresher = require("../wiki/refresh-issue-state.cjs");
const { build, extractLinks, legacyGithubNumbers } = require("../graph/build-graph.cjs");
const { formatRoute, resolveNode, route } = require("../graph/routing.cjs");
const graphPrecommit = require("../graph/pre-commit.cjs");

const results = [];
function check(label, condition, details = "") {
  results.push({ label, ok: Boolean(condition), details });
}

function read(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function readFrom(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function tempWiki() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ui-design-library-wiki-"));
  for (const name of ["journal", "topics", "plans"]) fs.mkdirSync(path.join(root, name), { recursive: true });
  fs.writeFileSync(path.join(root, "INDEX.md"), "# Wiki\n\n## Journal\n\n- old\n");
  fs.writeFileSync(
    path.join(root, "plans", "INDEX.md"),
    "# Plans\n\n| Date | Plan | Status | Evidence | Topics |\n| --- | --- | --- | --- | --- |\n",
  );
  fs.writeFileSync(
    path.join(root, "topics", "graph-wiki-subsystem.md"),
    "# Graph + wiki\n\n## Decisions\n\n## Open threads\n",
  );
  fs.writeFileSync(
    path.join(root, "journal", "pending.md"),
    [
      "---",
      "date: 2026-08-23",
      "topics: [graph-wiki-subsystem]",
      "plan: none",
      "pr: pending",
      "---",
      "# Pending",
      "",
      "## Why",
      "",
      "- Test.",
      "",
    ].join("\n"),
  );
  return root;
}

async function run() {
  const extracted = github.extractGithubRefs([
    "https://WWW.GITHUB.com/Verndale/UI-Design-Library/pull/87",
    "https://github.com/verndale/ui-design-library/pull/87",
    "https://github.com/Other/Repo/issues/12",
    "https://github.com.evil.example/verndale/ui-design-library/issues/9",
    "https://evil.example/https://github.com/hostile/repo/issues/14",
    "\x60\x60\x60",
    "https://github.com/verndale/ui-design-library/issues/999",
    "\x60\x60\x60",
    "~~~md",
    "https://github.com/verndale/ui-design-library/pull/998",
    "~~~",
    "````md",
    "```",
    "https://github.com/verndale/ui-design-library/issues/997",
    "```",
    "````",
  ].join("\n"));
  check(
    "GitHub URLs normalize, deduplicate, reject hostile hosts, and ignore fenced examples",
    JSON.stringify(extracted) === JSON.stringify([
      {
        kind: "pull-request",
        repository: "verndale/ui-design-library",
        number: 87,
        url: "https://github.com/verndale/ui-design-library/pull/87",
      },
      {
        kind: "issue",
        repository: "other/repo",
        number: 12,
        url: "https://github.com/other/repo/issues/12",
      },
    ]),
  );
  check(
    "legacy PR and issue arrays derive only from canonical filtered evidence",
    JSON.stringify(legacyGithubNumbers(extracted, "pull-request")) === JSON.stringify(["87"])
      && JSON.stringify(legacyGithubNumbers(extracted, "issue")) === JSON.stringify(["12"]),
  );
  check("full GitHub URL query resolves", github.parseGithubQuery("https://github.com/verndale/ui-design-library/pull/87")?.kind === "pull-request");
  check("qualified PR query resolves", github.parseGithubQuery("verndale/ui-design-library PR #87")?.number === 87);
  check("qualified issue query resolves", github.parseGithubQuery("verndale/ui-design-library issue 87")?.kind === "issue");
  check("compact repo-qualified query stays kind-neutral", github.parseGithubQuery("verndale/ui-design-library#87")?.kind === null);
  check("bare number query is deliberately rejected", github.parseGithubQuery("#87") === null);
  check("embedded-host GitHub URLs are rejected", github.parseGithubQuery("https://evil.example/https://github.com/hostile/repo/issues/14") === null);
  check(
    "GitHub URL query and fragment normalize to the canonical endpoint",
    github.parseGithubQuery("https://github.com/verndale/ui-design-library/issues/87?notification=1#issuecomment-2")?.url === "https://github.com/verndale/ui-design-library/issues/87",
  );
  check("alphanumeric issue-number suffixes are rejected", github.parseGithubQuery("https://github.com/verndale/ui-design-library/issues/87abc") === null);

  const closing = github.extractClosingIssues(
    "Fixes #87, other/repo#12, and https://github.com/verndale/third/issues/3. Resolves #88 & fourth/repo#4\n~~~md\nFixes hidden/repo#98\n~~~\n```md\nCloses hidden/repo#99\n```\n````md\n```\nFixes hidden/repo#97\n```\n````",
    "verndale/ui-design-library",
  );
  check(
    "multiple closing references retain repository identity",
    closing.map((ref) => ref.url).join("|") === [
      "https://github.com/verndale/ui-design-library/issues/87",
      "https://github.com/other/repo/issues/12",
      "https://github.com/verndale/third/issues/3",
      "https://github.com/verndale/ui-design-library/issues/88",
      "https://github.com/fourth/repo/issues/4",
    ].join("|"),
  );

  const synthetic = {
    nodes: [
      {
        id: "wiki/journal/change.md",
        label: "Change",
        type: "wiki-journal",
        topics: [],
        aliases: [],
        githubRefs: [{
          kind: "pull-request",
          repository: "verndale/ui-design-library",
          number: 87,
          url: "https://github.com/verndale/ui-design-library/pull/87",
        }],
        bytes: 80,
        degree: 1,
      },
      {
        id: "wiki/topics/graph-wiki-subsystem.md",
        label: "Graph + wiki",
        type: "wiki-topic",
        topics: [],
        aliases: [],
        githubRefs: [],
        bytes: 40,
        degree: 1,
      },
    ],
    edges: [{ source: "wiki/journal/change.md", target: "wiki/topics/graph-wiki-subsystem.md", type: "topic" }],
  };
  const policy = {
    edgeCosts: { topic: 1 },
    hubPenalty: 0,
    bytePenaltyPerKiB: 0,
    excludedIntermediateTypes: [],
    intents: {
      why: { preferredSourceTypes: ["wiki-journal"], preferredTargetTypes: ["wiki-topic"] },
      wiring: { preferredSourceTypes: ["wiki-journal"], preferredTargetTypes: ["wiki-topic"] },
      impact: { preferredSourceTypes: ["wiki-journal"], preferredTargetTypes: ["wiki-topic"] },
    },
  };
  check(
    "router resolves exact evidence to its citing Markdown node",
    resolveNode(synthetic, "verndale/ui-design-library PR #87").node?.id === "wiki/journal/change.md",
  );
  check("router does not reinterpret a bare #87 as evidence", resolveNode(synthetic, "#87").node === null);
  const routed = route(synthetic, {
    intent: "why",
    query: "verndale/ui-design-library PR #87",
    to: "wiki/topics/graph-wiki-subsystem.md",
    policy,
  });
  check("route itinerary reports a deterministic byte budget", routed.status === "ok" && routed.totalBytes === 120);
  check(
    "compact route output contains route authority, relations, and byte costs",
    formatRoute(routed).includes("120 B to read")
      && formatRoute(routed).includes("Authority: wiki/journal/change.md → wiki/topics/graph-wiki-subsystem.md")
      && formatRoute(routed).includes("included because it cites verndale/ui-design-library PR #87"),
  );

  const wiki = tempWiki();
  const context = {
    schemaVersion: 1,
    repository: "Verndale/UI-Design-Library",
    number: 87,
    title: "Wiki parity",
    body: "Fixes #87 and other/repo#12",
    url: "https://github.com/verndale/ui-design-library/pull/87",
    mergedAt: "2026-08-23T18:00:00Z",
    changedPaths: ["scripts/wiki/lib/github.cjs", "wiki/journal/pending.md"],
    commits: [{ hash: "abc", subject: "fix(wiki): reconcile evidence" }],
  };
  const first = await merge.run(context, wiki);
  const pending = fs.readFileSync(path.join(wiki, "journal", "pending.md"), "utf8");
  check("merge reconciliation fills the PR URL", pending.includes("pr: https://github.com/verndale/ui-design-library/pull/87"));
  check("merge reconciliation preserves the singular issue field", pending.includes("issue: https://github.com/verndale/ui-design-library/issues/87"));
  check("merge reconciliation adds every repo-qualified closing issue", pending.includes("https://github.com/other/repo/issues/12"));
  check("merge reconciliation writes a repo-qualified topic decision", readFrom(wiki, "topics/graph-wiki-subsystem.md").includes("verndale/ui-design-library PR #87"));
  const second = await merge.run(context, wiki);
  check("merge reconciliation is idempotent", first.changes.length > 0 && second.changes.length === 0);
  const prefilledPath = path.join(wiki, "journal", "prefilled.md");
  fs.writeFileSync(prefilledPath, `---\ndate: 2026-08-23\ntopics: []\nplan: none\npr: ${context.url}\nissue: pending\n---\n# Prefilled\n`);
  const replay = { ...context, body: "Closes #88 and other/repo#89.", changedPaths: ["wiki/journal/prefilled.md"] };
  const replayFirst = await merge.run(replay, wiki);
  const replayText = fs.readFileSync(prefilledPath, "utf8");
  check("manual replay reconciles all issues when the journal already cites the PR", replayText.includes("issues/88") && replayText.includes("other/repo/issues/89") && !replayText.includes("issue: pending"));
  const replaySecond = await merge.run(replay, wiki);
  check("prefilled-PR issue reconciliation is idempotent", replayFirst.changes.length > 0 && replaySecond.changes.length === 0);
  let badSchema = false;
  try {
    merge.normalizeContext({ ...context, schemaVersion: 2 });
  } catch {
    badSchema = true;
  }
  check("merge reconciliation rejects unsupported context schemas", badSchema);
  let badIdentity = false;
  let badTraversal = false;
  try {
    merge.normalizeContext({ ...context, repository: "other/repo" });
  } catch {
    badIdentity = true;
  }
  try {
    merge.normalizeContext({ ...context, changedPaths: ["wiki/journal/../../other.md"] });
  } catch {
    badTraversal = true;
  }
  check("merge reconciliation rejects mismatched PR identity", badIdentity);
  check("merge reconciliation rejects repository path traversal", badTraversal);
  let badPathEntry = false;
  let badCommitEntry = false;
  try {
    merge.normalizeContext({ ...context, changedPaths: [87] });
  } catch {
    badPathEntry = true;
  }
  try {
    merge.normalizeContext({ ...context, commits: [{ hash: "abc", subject: 87 }] });
  } catch {
    badCommitEntry = true;
  }
  const legacyContext = merge.normalizeContext({
    ...context,
    changedPaths: undefined,
    files: ["src/index.ts"],
    commits: [{ sha: "abc", message: "fix: legacy alias\nbody" }],
  });
  check("merge reconciliation rejects non-string path and commit entries", badPathEntry && badCommitEntry);
  check("merge reconciliation preserves explicit legacy files and commit aliases", legacyContext.changedPaths[0] === "src/index.ts" && legacyContext.commits[0].subject === "fix: legacy alias");
  const malformedScalars = [
    { title: 87 },
    { body: null },
    { mergedAt: 87 },
    { merged_at: false },
  ];
  check(
    "merge reconciliation rejects non-string PR text and merge timestamps",
    malformedScalars.every((override) => {
      try {
        merge.normalizeContext({ ...context, ...override });
        return false;
      } catch {
        return true;
      }
    }),
  );

  fs.writeFileSync(
    path.join(wiki, "topics", "issue-state.md"),
    [
      "# Issue state",
      "",
      "## Open threads",
      "",
      "```md",
      "## Decisions",
      "- Fenced [ignored/repo issue #90](https://github.com/ignored/repo/issues/90)",
      "```",
      "~~~txt",
      "- Also fenced [ignored/repo issue #91](https://github.com/ignored/repo/issues/91)",
      "~~~",
      "````md",
      "```",
      "## Decisions",
      "- Nested fence [ignored/repo issue #92](https://github.com/ignored/repo/issues/92)",
      "```",
      "````",
      "- All closed [other/repo issue #12](https://github.com/other/repo/issues/12), [third/repo issue #13](https://github.com/third/repo/issues/13), duplicate [other/repo issue #12](https://github.com/other/repo/issues/12)",
      "- Mixed [other/repo issue #12](https://github.com/other/repo/issues/12) and [third/repo issue #14](https://github.com/third/repo/issues/14) — closed",
      "- Uncertain [third/repo issue #13](https://github.com/third/repo/issues/13) and [third/repo issue #15](https://github.com/third/repo/issues/15) — closed",
      "- Duplicate across lines [other/repo issue #12](https://github.com/other/repo/issues/12)",
      "",
    ].join("\n"),
  );
  const issueCalls = [];
  const issueChanges = refresher.refresh(path.join(wiki, "topics"), (number, repository) => {
    issueCalls.push(repository + "#" + number);
    return {
      "other/repo#12": "closed",
      "third/repo#13": "closed",
      "third/repo#14": "open",
      "third/repo#15": null,
    }[repository + "#" + number] ?? null;
  });
  const issueState = readFrom(wiki, "topics/issue-state.md");
  check(
    "issue refresh queries every repo-qualified citation",
    JSON.stringify(issueCalls.sort()) === JSON.stringify(["other/repo#12", "third/repo#13", "third/repo#14", "third/repo#15"]),
  );
  check("issue refresh caches duplicate repo-qualified lookups", issueCalls.filter((item) => item === "other/repo#12").length === 1);
  check("issue refresh ignores nested fenced citations and headings", !issueCalls.some((item) => item.startsWith("ignored/repo#")) && !/ignored\/repo\/issues\/(?:90|91|92)\) — closed/.test(issueState));
  check("issue refresh closes a line only when all cited issues are closed", /All closed .* — closed$/m.test(issueState));
  check("issue refresh removes a stale annotation when any known citation is open", /- Mixed .*third\/repo\/issues\/14\)$/m.test(issueState));
  check("issue refresh leaves an uncertain multi-citation line unchanged", /- Uncertain .*third\/repo\/issues\/15\) — closed$/m.test(issueState));
  check("issue refresh reports one change per changed line", issueChanges.length === 3);
  const symlinkRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ui-design-library-symlink-"));
  const symlinkTopics = path.join(symlinkRoot, "topics");
  fs.mkdirSync(symlinkTopics);
  const symlinkTarget = path.join(symlinkRoot, "outside-topic.md");
  const symlinkBody = "# Outside\n\n## Open threads\n\n- [issue](https://github.com/other/repo/issues/12)\n";
  fs.writeFileSync(symlinkTarget, symlinkBody);
  fs.symlinkSync(symlinkTarget, path.join(symlinkTopics, "linked.md"));
  let symlinkLookups = 0;
  check(
    "issue refresh skips Markdown symlinks",
    refresher.refresh(symlinkTopics, () => { symlinkLookups += 1; return "closed"; }).length === 0
      && symlinkLookups === 0
      && fs.readFileSync(symlinkTarget, "utf8") === symlinkBody,
  );
  const directorySymlinkRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ui-design-library-dir-symlink-"));
  const outsideWiki = path.join(directorySymlinkRoot, "outside-wiki");
  const outsideTopics = path.join(outsideWiki, "topics");
  fs.mkdirSync(outsideTopics, { recursive: true });
  const outsideTopic = path.join(outsideTopics, "outside.md");
  fs.writeFileSync(outsideTopic, symlinkBody);
  const realWiki = path.join(directorySymlinkRoot, "real-wiki");
  fs.mkdirSync(realWiki);
  fs.symlinkSync(outsideTopics, path.join(realWiki, "topics"));
  fs.symlinkSync(outsideWiki, path.join(directorySymlinkRoot, "wiki-link"));
  let directorySymlinkLookups = 0;
  const directoryLookup = () => { directorySymlinkLookups += 1; return "closed"; };
  check(
    "issue refresh rejects symlinked topics directories and wiki ancestors",
    refresher.refresh(path.join(realWiki, "topics"), directoryLookup).length === 0
      && refresher.refresh(path.join(directorySymlinkRoot, "wiki-link", "topics"), directoryLookup).length === 0
      && directorySymlinkLookups === 0
      && fs.readFileSync(outsideTopic, "utf8") === symlinkBody,
  );

  const extractedLinks = extractLinks(path.join(REPO_ROOT, "wiki", "source.md"), [
    "[Visible](topics/visible.md)",
    "````md",
    "```",
    "[Hidden](topics/hidden.md)",
    "```",
    "````",
  ].join("\n"));
  check(
    "curated graph link extraction honors complete nested fence semantics",
    JSON.stringify(extractedLinks.map((item) => item.target)) === JSON.stringify(["wiki/topics/visible.md"]),
  );

  const graph = build();
  check("every curated graph node exposes additive githubRefs metadata", graph.nodes.every((node) => Array.isArray(node.githubRefs)));
  check(
    "curated graph GitHub references are canonical",
    graph.nodes.flatMap((node) => node.githubRefs).every((ref) =>
      ref.url === github.canonicalRef(ref)?.url && ref.repository === ref.repository.toLowerCase()),
  );
  check("GitHub evidence remains metadata rather than first-class nodes", graph.nodes.every((node) => !/^github-/.test(node.type)));
  check(
    "curated graph legacy number arrays cannot diverge from canonical evidence",
    graph.nodes.every((node) =>
      JSON.stringify(node.prs) === JSON.stringify(legacyGithubNumbers(node.githubRefs, "pull-request"))
      && JSON.stringify(node.issues) === JSON.stringify(legacyGithubNumbers(node.githubRefs, "issue"))),
  );

  const workflows = {
    quality: read(".github/workflows/quality.yml"),
    commitlint: read(".github/workflows/commitlint.yml"),
    check: read(".github/workflows/wiki-check.yml"),
    sync: read(".github/workflows/wiki-sync.yml"),
    issue: read(".github/workflows/wiki-issue-sync.yml"),
    pr: read(".github/workflows/pr.yml"),
  };
  check("Quality/quality workflow identity is stable", /^name: Quality$/m.test(workflows.quality) && /^ {2}quality:$/m.test(workflows.quality));
  check("Commit message lint/commitlint workflow identity is stable", /^name: Commit message lint$/m.test(workflows.commitlint) && /^ {2}commitlint:$/m.test(workflows.commitlint));
  check("Wiki integrity/check workflow identity is stable", /^name: Wiki integrity$/m.test(workflows.check) && /^ {2}check:$/m.test(workflows.check));
  check("Sync context wiki/sync workflow identity is stable", /^name: Sync context wiki$/m.test(workflows.sync) && /^ {2}sync:$/m.test(workflows.sync));
  check("Sync wiki issue state/sync workflow identity is stable", /^name: Sync wiki issue state$/m.test(workflows.issue) && /^ {2}sync:$/m.test(workflows.issue));
  check("Create or update PR/pr helper identity is stable", /^name: Create or update PR$/m.test(workflows.pr) && /^ {2}pr:$/m.test(workflows.pr));
  check(
    "Wiki integrity covers PR, main push, and manual replay",
    /pull_request:[\s\S]*push:[\s\S]*workflow_dispatch: \{\}/.test(workflows.check),
  );
  check("Quality uses the canonical PR and manual triggers", /pull_request:\n {4}branches: \[main\]/.test(workflows.quality) && /types: \[opened, synchronize, reopened\]/.test(workflows.quality) && workflows.quality.includes("workflow_dispatch: {}"));
  check(
    "Quality delegates validation only to verify:ci",
    (workflows.quality.match(/pnpm run verify:ci/g) || []).length === 1
      && !workflows.quality.includes("ci-journal-warn.cjs"),
  );
  check("Commit message lint uses the canonical PR trigger", /pull_request:\n {4}branches: \[main\]/.test(workflows.commitlint) && /types: \[opened, synchronize, reopened, edited\]/.test(workflows.commitlint));
  check("merged wiki sync supports closed events and numbered manual replay", /pull_request:\n {4}types: \[closed\]/.test(workflows.sync) && /workflow_dispatch:[\s\S]*pr_number:/.test(workflows.sync));
  check("Wiki integrity delegates to the one canonical check script", (workflows.check.match(/pnpm run wiki:check/g) || []).length === 1);
  check("commitlint workflow uses the hoisted provider runner twice", (workflows.commitlint.match(/pnpm exec commitlint --config commitlint\.config\.cjs/g) || []).length === 2);
  check("merged PR context paginates and slurps files and commits", (workflows.sync.match(/--paginate --slurp/g) || []).length === 2);
  check("merged PR context is versioned and repo-qualified", workflows.sync.includes("schemaVersion: 1") && workflows.sync.includes("repository: $repository"));
  check("manual replay rejects unmerged and bot wiki PRs", workflows.sync.includes(".merged == true") && workflows.sync.includes("Refusing to replay bot wiki PR"));
  check("writer workflows disable Graphify hooks", workflows.sync.includes('GRAPHIFY_SKIP_HOOK: "1"') && workflows.issue.includes('GRAPHIFY_SKIP_HOOK: "1"'));
  check("writer workflows use explicit bot auth and lease-safe pushes", [workflows.sync, workflows.issue].every((text) => text.includes("PR_BOT_TOKEN") && text.includes("--force-with-lease")));
  check("issue refresh uses the exact UTC schedule and manual trigger", workflows.issue.includes('- cron: "30 11 * * *" # Daily at 11:30 UTC') && workflows.issue.includes("workflow_dispatch: {}"));
  check("PR helper ignores and rejects bot/wiki branches", workflows.pr.includes('"bot/wiki-**"') && workflows.pr.includes("!startsWith(github.ref_name, 'bot/wiki-')"));

  const pkg = JSON.parse(read("package.json"));
  const workspace = read("pnpm-workspace.yaml");
  check("ai-commit 2.7.0 is the sole direct commitlint provider", pkg.devDependencies["@verndale/ai-commit"] === "2.7.0" && !pkg.devDependencies["@commitlint/cli"]);
  check("pnpm exposes only ai-commit's bundled commitlint CLI", /publicHoistPattern:\s*\n\s*- "@commitlint\/cli"/.test(workspace));
  check("commitlint configuration is the exact one-line provider export", read("commitlint.config.cjs") === 'module.exports = require("@verndale/ai-commit");\n');
  check("commit-msg hook invokes the sole provider literally", read(".husky/commit-msg").trim().split("\n").at(-1) === 'pnpm exec ai-commit lint --edit "$1"');

  const viewer = read("scripts/graph/viewer/viewer.js");
  check("viewer searches repo-qualified GitHub evidence", viewer.includes("node.githubRefs") && viewer.includes("ref.repository"));
  check("viewer renders GitHub links with safe DOM APIs", viewer.includes('link.rel = "noopener noreferrer"') && !viewer.includes("meta.insertAdjacentHTML") && !viewer.includes("li.innerHTML"));
  const browserContext = { window: {} };
  vm.runInNewContext(read("scripts/graph/viewer/routing.js"), browserContext);
  check(
    "viewer search normalizes pasted GitHub query and fragment decoration",
    browserContext.window.KGRouting.normalizeGithubQuery("https://github.com/verndale/ui-design-library/issues/87?notification=1#issuecomment-2") === "https://github.com/verndale/ui-design-library/issues/87",
  );
  check(
    "viewer search does not canonicalize malformed issue-number suffixes",
    browserContext.window.KGRouting.normalizeGithubQuery("https://github.com/verndale/ui-design-library/issues/87abc").endsWith("87abc"),
  );
  check(
    "viewer search does not canonicalize unsafe issue numbers",
    browserContext.window.KGRouting.normalizeGithubQuery("https://github.com/verndale/ui-design-library/issues/9007199254740993").endsWith("9007199254740993"),
  );
  const browserGraph = {
    nodes: [{ id: "a", type: "wiki-journal", bytes: 10 }, { id: "b", type: "wiki-topic", bytes: 10 }],
    edges: [{ source: "a", target: "b", type: "topic" }],
  };
  check(
    "viewer routing rejects missing and nonpositive costs for live edge kinds",
    !browserContext.window.KGRouting.hasSafeNumericPolicy({ edgeCosts: {}, hubPenalty: 0, bytePenaltyPerKiB: 0, excludedIntermediateTypes: [] }, browserGraph)
      && !browserContext.window.KGRouting.hasSafeNumericPolicy({ edgeCosts: { topic: 0 }, hubPenalty: 0, bytePenaltyPerKiB: 0, excludedIntermediateTypes: [] }, browserGraph),
  );
  check(
    "viewer routing rejects exclusions that do not exist in the live graph",
    !browserContext.window.KGRouting.hasSafeNumericPolicy({ edgeCosts: { topic: 1 }, hubPenalty: 0, bytePenaltyPerKiB: 0, excludedIntermediateTypes: ["missing"] }, browserGraph),
  );
  const budgetGraph = {
    nodes: [
      { id: "source", label: "Source", type: "wiki-journal", degree: 2, bytes: 10, topics: [], aliases: [] },
      { id: "large", label: "Large", type: "wiki-topic", degree: 2, bytes: 16384, topics: [], aliases: [] },
      { id: "small", label: "Small", type: "wiki-topic", degree: 2, bytes: 16, topics: [], aliases: [] },
      { id: "target", label: "Target", type: "wiki-topic", degree: 2, bytes: 10, topics: [], aliases: [] },
    ],
    edges: [
      { source: "source", target: "large", type: "topic" },
      { source: "large", target: "target", type: "topic" },
      { source: "source", target: "small", type: "topic" },
      { source: "small", target: "target", type: "topic" },
    ],
  };
  const budgetIntent = { preferredSourceTypes: ["wiki-journal", "wiki-topic"], preferredTargetTypes: ["wiki-topic"] };
  const budgetPolicy = { edgeCosts: { topic: 1 }, hubPenalty: 0, bytePenaltyPerKiB: 0.05, excludedIntermediateTypes: [], intents: { why: budgetIntent, wiring: budgetIntent, impact: budgetIntent } };
  check(
    "Node and viewer routing prefer the lower-byte equal-hop itinerary",
    route(budgetGraph, { intent: "wiring", from: "source", to: "target", policy: budgetPolicy }).itinerary.map((item) => item.id).join("|") === "source|small|target"
      && browserContext.window.KGRouting.shortestPath(budgetGraph, "source", "target", budgetPolicy).nodes.join("|") === "source|small|target",
  );
  const graphHook = read("scripts/graph/pre-commit.cjs");
  const preCommit = read(".husky/pre-commit");
  check(
    "pre-commit graph refresh remains contamination-safe and advisory",
    graphHook.includes("unstaged or untracked changes") &&
      graphHook.indexOf("if (inputs.length > 0)") < graphHook.indexOf("const build = spawnSync") &&
      preCommit.includes("node scripts/graph/pre-commit.cjs ||"),
  );
  check(
    "pre-commit contamination guard covers the graph builder and parser inputs",
    ["scripts/graph/build-graph.cjs", "scripts/wiki/lib/frontmatter.cjs", "scripts/wiki/lib/github.cjs"]
      .every((file) => graphPrecommit.isGraphInput(file, new Set())),
  );

  console.log("Wiki parity check");
  for (const result of results) {
    const detail = !result.ok && result.details ? " — " + result.details : "";
    console.log((result.ok ? "PASS" : "FAIL") + " " + result.label + detail);
  }
  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    console.error("\nFAIL Wiki parity check (" + failed.length + "/" + results.length + ").");
    return 1;
  }
  console.log("\nPASS Wiki parity check (" + results.length + " cases).");
  return 0;
}

if (require.main === module) {
  run()
    .then((status) => process.exit(status))
    .catch((error) => {
      console.error("FAIL Wiki parity check: " + (error && error.stack ? error.stack : error));
      process.exit(1);
    });
}

module.exports = { run };
