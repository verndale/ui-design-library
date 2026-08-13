#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { implementationFiles, listComponentDirs } = require('./lib/component-files.cjs');

const root = path.resolve(__dirname, '..');
const componentsDir = path.join(root, 'components');
const packagePath = path.join(root, 'package.json');
const write = process.argv.includes('--write');
const checkDist = process.argv.includes('--dist');

function fail(message) {
  process.stderr.write(`ERROR: ${message}\n`);
  process.exit(1);
}

function componentRecords() {
  return listComponentDirs(componentsDir)
    .map((directory) => {
      const dir = path.join(componentsDir, directory);
      const manifestPath = path.join(dir, 'component.json');
      if (!fs.existsSync(manifestPath)) fail(`components/${directory}/component.json is missing`);
      if (!fs.existsSync(path.join(dir, 'index.ts'))) fail(`components/${directory}/index.ts is missing`);
      return { directory };
    })
    .sort((a, b) => a.directory.localeCompare(b.directory));
}

function expectedExports() {
  const exportsMap = {};
  for (const record of componentRecords()) {
    const publicBase = `./components/${record.directory}`;
    const distBase = `./dist/components/${record.directory}/index`;
    exportsMap[publicBase] = {
      types: `${distBase}.d.ts`,
      import: `${distBase}.js`,
    };
    exportsMap[`${publicBase}/component.json`] = `${publicBase}/component.json`;
  }
  exportsMap['./styles.css'] = './styles.css';
  exportsMap['./package.json'] = './package.json';
  return exportsMap;
}

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const expected = expectedExports();

if (write) {
  pkg.exports = expected;
  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  process.stdout.write(`PASS wrote ${Object.keys(expected).length} package exports.\n`);
  process.exit(0);
}

if (JSON.stringify(pkg.exports) !== JSON.stringify(expected)) {
  fail('package.json exports do not match components/. Run `pnpm exports:sync`.');
}

if (checkDist) {
  for (const [subpath, target] of Object.entries(expected)) {
    if (typeof target !== 'object') continue;
    for (const kind of ['types', 'import']) {
      const absolute = path.join(root, target[kind]);
      if (!fs.existsSync(absolute)) fail(`${subpath} ${kind} target is missing: ${target[kind]}`);
    }
  }
  for (const record of componentRecords()) {
    const componentDir = path.join(componentsDir, record.directory);
    for (const file of implementationFiles(componentDir)) {
      const source = fs.readFileSync(path.join(componentDir, file), 'utf8');
      if (!/^\s*['"]use client['"];?/.test(source)) continue;
      const builtPath = path.join(
        root,
        'dist/components',
        record.directory,
        file.replace(/\.(?:ts|tsx)$/, '.js'),
      );
      if (!fs.existsSync(builtPath)) fail(`components/${record.directory}/${file} was not emitted to dist`);
      const built = fs.readFileSync(builtPath, 'utf8');
      if (!/^\s*['"]use client['"];?/.test(built)) {
        fail(`components/${record.directory}/${file} client directive was not preserved in dist`);
      }
    }
  }
}

process.stdout.write(`PASS ${Object.keys(expected).length} package exports are deterministic${checkDist ? ' and built' : ''}.\n`);
