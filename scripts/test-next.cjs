#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const fixtureRoot = path.join(repoRoot, 'tests', 'fixtures', 'next-consumer');
const nestedUtility = 'right-(--spacing-3xs)';

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' },
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) process.stderr.write(`${result.stdout || ''}${result.stderr || ''}`);
    throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
  }
  return (result.stdout || '').trim();
}

function filesBelow(root, suffix) {
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...filesBelow(absolute, suffix));
    else if (!suffix || entry.name.endsWith(suffix)) found.push(absolute);
  }
  return found;
}

function inspectTarball(tarball) {
  const entries = run('tar', ['-tzf', tarball], repoRoot, true).split('\n');
  assert(!entries.some((entry) => entry.startsWith('package/tests/fixtures/next-consumer')),
    'packed package must exclude the Next consumer fixture');

  const manifest = JSON.parse(run('tar', ['-xOf', tarball, 'package/package.json'], repoRoot, true));
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    assert(!manifest[field]?.next, `packed package must not declare Next in ${field}`);
  }
  assert(!manifest.bundledDependencies?.includes?.('next'), 'packed package must not bundle Next');
  return manifest;
}

function assertNestedUtilityIsNested() {
  const matches = filesBelow(path.join(repoRoot, 'dist'), '.js')
    .filter((file) => fs.readFileSync(file, 'utf8').includes(nestedUtility));
  assert(matches.length > 0, `expected ${nestedUtility} in compiled output`);
  assert(matches.every((file) => file.includes(`${path.sep}parts${path.sep}`)),
    `${nestedUtility} must be sourced only from a nested component part`);
}

function componentCandidates(consumerRoot, installedManifest) {
  const packageRoot = path.join(consumerRoot, 'node_modules', '@verndale', 'ui-design-library');
  return Object.keys(installedManifest.exports)
    .filter((subpath) => /^\.\/components\/[^/]+$/.test(subpath))
    .sort()
    .map((subpath) => {
      const directory = subpath.slice('./components/'.length);
      const manifest = JSON.parse(fs.readFileSync(
        path.join(packageRoot, 'components', directory, 'component.json'),
        'utf8',
      ));
      assert.match(manifest.exportName, /^[A-Za-z_$][\w$]*$/, `${subpath} has no valid exportName`);
      return {
        module: `@verndale/ui-design-library/components/${directory}`,
        exportName: manifest.exportName,
      };
    });
}

function assertNativeImports(consumerRoot, installedManifest) {
  assert.equal(
    installedManifest.uiDesignLibrary?.reuseContractVersion,
    2,
    'packed package must declare reuse contract version 2',
  );
  const candidates = componentCandidates(consumerRoot, installedManifest);
  assert.equal(candidates.length, 23, 'packed package must expose exactly 23 component candidates');
  const source = `
    const candidates = ${JSON.stringify(candidates)};
    for (const candidate of candidates) {
      const loaded = await import(candidate.module);
      if (!(candidate.exportName in loaded)) {
        throw new Error(candidate.module + ' does not export ' + candidate.exportName);
      }
    }
    process.stdout.write('PASS ' + candidates.length + ' native ESM component imports.\\n');
  `;
  run('node', ['--input-type=module', '--eval', source], consumerRoot);
}

function configureConsumer(consumerRoot, tarball) {
  fs.cpSync(fixtureRoot, consumerRoot, { recursive: true });
  const manifestPath = path.join(consumerRoot, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.dependencies['@verndale/ui-design-library'] = `file:${tarball}`;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function assertCompiledCss(consumerRoot) {
  const fixtureSources = filesBelow(fixtureRoot).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  assert(!fixtureSources.includes(nestedUtility), 'fixture must not duplicate the nested utility sentinel');

  const cssFiles = filesBelow(path.join(consumerRoot, '.next'), '.css');
  assert(cssFiles.length > 0, 'Next build emitted no CSS assets');
  const css = cssFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n').replace(/\s+/g, '');
  assert(css.includes('right:var(--spacing-3xs)'),
    `Tailwind did not emit ${nestedUtility} from the package dist @source`);
}

function main() {
  run('pnpm', ['build'], repoRoot);
  assertNestedUtilityIsNested();

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-design-library-next-'));
  try {
    const tarball = path.join(tempRoot, 'ui-design-library.tgz');
    run('pnpm', ['--config.ignore-scripts=true', 'pack', '--out', tarball], repoRoot, true);
    const packedManifest = inspectTarball(tarball);

    const consumerRoot = path.join(tempRoot, 'consumer');
    configureConsumer(consumerRoot, tarball);
    run('pnpm', ['install', '--prefer-offline', '--ignore-scripts', '--no-frozen-lockfile'], consumerRoot);

    const installedManifest = JSON.parse(fs.readFileSync(
      path.join(consumerRoot, 'node_modules', '@verndale', 'ui-design-library', 'package.json'),
      'utf8',
    ));
    assert.equal(installedManifest.version, packedManifest.version, 'consumer did not install the packed version');
    assertNativeImports(consumerRoot, installedManifest);

    run('pnpm', ['build'], consumerRoot);
    assertCompiledCss(consumerRoot);
    process.stdout.write('PASS packed package loads in native Node, builds in Next 16, and exposes nested Tailwind utilities.\n');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`FAIL ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
