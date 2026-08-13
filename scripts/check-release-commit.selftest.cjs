#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  readReleaseCommits,
  validateReleaseCommit,
  validateReleaseCommits,
} = require('./check-release-commit.cjs');

assert.deepEqual(validateReleaseCommit({ subject: 'feat(package): publish contract v2', body: '' }), []);
assert.deepEqual(validateReleaseCommit({ subject: 'feat(package)!: publish contract v3', body: '' }), []);
assert.match(
  validateReleaseCommit({
    subject: 'ci: refresh release workflow',
    body: 'Combined changes\n\nBREAKING CHANGE: stale text from an earlier PR',
  })[0],
  /must not carry a BREAKING CHANGE body/,
);
assert.match(
  validateReleaseCommit({ subject: 'feat(package) !: malformed', body: '' })[0],
  /conventional type/,
);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-release-preflight-'));
try {
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.email', 'release@example.com');
  git('config', 'user.name', 'Release Fixture');
  git('commit', '--allow-empty', '-q', '-m', 'chore: published baseline');
  git('tag', 'v1.0.0');
  git('commit', '--allow-empty', '-q', '-m', 'feat: aggregated change', '-m', 'BREAKING CHANGE: stale footer');
  git('commit', '--allow-empty', '-q', '-m', 'fix: clean head');
  const releaseRange = readReleaseCommits(root);
  assert.equal(releaseRange.lastTag, 'v1.0.0');
  assert.equal(releaseRange.commits.length, 2);
  assert.match(validateReleaseCommits(releaseRange.commits)[0], /feat: aggregated change/);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

process.stdout.write('PASS release commit preflight self-tests.\n');
