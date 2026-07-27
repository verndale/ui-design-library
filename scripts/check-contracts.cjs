#!/usr/bin/env node
/**
 * check-contracts.cjs — every component keeps its side of the contract.
 *
 * The library is only deterministically usable if a canonical slug reliably
 * answers with a component. This checks the invariants that make that true:
 *
 *   1. Each components/<slug>/ has component.json, a matching implementation,
 *      and a stories file.
 *   2. component.json's `slug` matches its directory, and its `canonical`
 *      kebab-cases to that slug.
 *   3. Declared tokens actually exist in the semantic token layer — a component
 *      referencing a token nobody defines renders unstyled.
 *   4. Components use semantic tokens, not raw colour values.
 *   5. Provenance and maturity are present, so no component's origin is a mystery.
 *
 * Exit codes: 0 pass · 1 one or more failures.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const TOKENS = path.join(ROOT, 'src/tokens/semantic.css');

const MATURITIES = ['candidate', 'supported', 'deprecated'];
// A hex or rgb() literal in a component means a value escaped the token layer.
const RAW_COLOR = /(#[0-9a-fA-F]{3,8}\b|\brgba?\()/;

const failures = [];
const fail = (msg) => failures.push(msg);

function kebab(input) {
  return String(input)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const tokenCss = fs.existsSync(TOKENS) ? fs.readFileSync(TOKENS, 'utf8') : '';
if (!tokenCss) fail(`[tokens] ${path.relative(ROOT, TOKENS)} is missing`);
const definedTokens = new Set([...tokenCss.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((m) => m[1]));

const dirs = fs.existsSync(COMPONENTS)
  ? fs
      .readdirSync(COMPONENTS, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort()
  : [];

if (dirs.length === 0) fail('[components] no components found');

for (const slug of dirs) {
  const dir = path.join(COMPONENTS, slug);
  const contractPath = path.join(dir, 'component.json');

  if (!fs.existsSync(contractPath)) {
    fail(`[contract] components/${slug}/component.json is missing`);
    continue;
  }

  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  } catch (err) {
    fail(`[contract] components/${slug}/component.json is not valid JSON: ${err.message}`);
    continue;
  }

  if (contract.slug !== slug) {
    fail(`[contract] components/${slug}/component.json declares slug "${contract.slug}"`);
  }
  if (!contract.canonical) {
    fail(`[contract] components/${slug} has no canonical name`);
  } else if (kebab(contract.canonical) !== slug) {
    fail(`[contract] components/${slug}: kebab("${contract.canonical}") is "${kebab(contract.canonical)}"`);
  }

  if (!MATURITIES.includes(contract.maturity)) {
    fail(`[contract] components/${slug} maturity "${contract.maturity}" is not one of ${MATURITIES.join(', ')}`);
  }
  for (const key of ['project', 'source']) {
    if (!contract.provenance || !contract.provenance[key]) {
      fail(`[provenance] components/${slug} is missing provenance.${key}`);
    }
  }
  if (!Array.isArray(contract.slots) || contract.slots.length === 0) {
    fail(`[contract] components/${slug} declares no slots`);
  }

  for (const token of contract.tokens || []) {
    if (!definedTokens.has(token)) {
      fail(`[tokens] components/${slug} declares "${token}", which the semantic layer does not define`);
    }
  }

  const files = fs.readdirSync(dir);
  const impl = files.find((f) => /\.tsx$/.test(f) && !/\.stories\.tsx$/.test(f));
  const stories = files.find((f) => /\.stories\.tsx$/.test(f));
  if (!impl) fail(`[files] components/${slug} has no implementation (.tsx)`);
  if (!stories) fail(`[files] components/${slug} has no stories file — the story is the API contract`);

  if (impl) {
    const source = fs.readFileSync(path.join(dir, impl), 'utf8');
    for (const [index, line] of source.split('\n').entries()) {
      if (line.trim().startsWith('*') || line.trim().startsWith('//')) continue;
      if (RAW_COLOR.test(line)) {
        fail(`[tokens] components/${slug}/${impl}:${index + 1} uses a raw colour instead of a semantic token`);
      }
    }
  }
}

if (failures.length) {
  for (const failure of failures) process.stderr.write(`FAIL ${failure}\n`);
  process.stderr.write(`FAILED ${failures.length} check(s)\n`);
  process.exit(1);
}

process.stdout.write(`PASS ${dirs.length} component contract(s) intact.\n`);
