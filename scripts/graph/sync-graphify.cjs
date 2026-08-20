#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const graphPath = path.join(root, 'graphify-out', 'graph.json');

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    env: options.env ?? process.env,
    stdio: 'inherit',
  });
}

if (process.env.GRAPHIFY_SKIP_HOOK === '1') {
  process.exit(0);
}

const env = {
  ...process.env,
  GRAPHIFY_MAX_WORKERS: process.env.GRAPHIFY_MAX_WORKERS || '1',
  PYTHONHASHSEED: '0',
};

const hasGraph = fs.existsSync(graphPath);
const graphifyArgs = hasGraph
  ? ['update', '.', '--force']
  : ['extract', '.', '--code-only', '--max-workers', env.GRAPHIFY_MAX_WORKERS];

if (!hasGraph) {
  console.log('[graphify sync] No local graph found; bootstrapping an AST-only graph.');
}

const candidates = [
  { command: 'graphify', args: graphifyArgs, label: 'graphify' },
  ...(process.env.GRAPHIFY_PYTHON
    ? [{
        command: process.env.GRAPHIFY_PYTHON,
        args: ['-m', 'graphify', ...graphifyArgs],
        label: 'GRAPHIFY_PYTHON',
      }]
    : []),
  { command: 'python3', args: ['-m', 'graphify', ...graphifyArgs], label: 'python3 -m graphify' },
  { command: 'python', args: ['-m', 'graphify', ...graphifyArgs], label: 'python -m graphify' },
];

let refreshed = false;

for (const candidate of candidates) {
  const result = run(candidate.command, candidate.args, { env });

  if (result.error?.code === 'ENOENT') {
    continue;
  }

  if (result.error) {
    console.error(`[graphify sync] Could not start ${candidate.label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[graphify sync] ${candidate.label} exited with status ${result.status}.`);
    process.exit(result.status || 1);
  }

  refreshed = true;
  break;
}

if (!refreshed) {
  console.error(
    '[graphify sync] Graphify is unavailable. Install the graphifyy package or set GRAPHIFY_PYTHON.',
  );
  process.exit(1);
}
