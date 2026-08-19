#!/usr/bin/env node
/**
 * Ensure every candidate or supported code component has a reviewed primary
 * registration in the governed Figma library. This checker is read-only.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const COVERED_MATURITIES = new Set(['candidate', 'supported']);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadManifests(root) {
  const componentsDir = path.join(root, 'components');
  if (!fs.existsSync(componentsDir)) return [];

  const manifests = [];
  for (const entry of fs.readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const relativePath = `components/${entry.name}`;
    const manifestPath = path.join(root, relativePath, 'component.json');
    if (!fs.existsSync(manifestPath)) continue;
    manifests.push({ relativePath, manifestPath, manifest: readJson(manifestPath) });
  }
  return manifests.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function isPrimaryMatch(registration, record) {
  const { manifest, relativePath } = record;
  return (
    registration.componentPath === relativePath &&
    registration.secondaryExport !== true &&
    registration.canonical === manifest.canonical &&
    registration.slug === manifest.slug &&
    registration.exportName === manifest.exportName &&
    (registration.variant ?? null) === (manifest.variant ?? null) &&
    Boolean(registration.default) === Boolean(manifest.default)
  );
}

function checkCoverage(options = {}) {
  const root = options.root ?? ROOT;
  const failures = [];
  const registry = options.registry ?? readJson(path.join(root, 'figma/library.json'));
  const records = options.manifests ?? loadManifests(root);
  const registrations = Array.isArray(registry.components) ? registry.components : [];
  const governed = records.filter(({ manifest }) => COVERED_MATURITIES.has(manifest.maturity));

  for (const record of governed) {
    const { manifest, relativePath } = record;
    const primary = registrations.filter((registration) => isPrimaryMatch(registration, record));
    if (primary.length === 0) {
      failures.push(
        `[coverage] ${relativePath} (${manifest.canonical} / ${manifest.exportName}) has no matching primary Figma registration`,
      );
      continue;
    }

    if (manifest.maturity === 'candidate') {
      const published = registrations.filter(
        (registration) =>
          registration.componentPath === relativePath && registration.figma?.publicationStatus === 'published',
      );
      for (const registration of published) {
        failures.push(`[publication] candidate ${relativePath} registration "${registration.id}" must remain unpublished`);
      }
    }
  }

  return {
    failures,
    manifests: governed.length,
    registrations: registrations.length,
  };
}

function main() {
  let result;
  try {
    result = checkCoverage();
  } catch (error) {
    console.error(`Figma coverage failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (result.failures.length > 0) {
    console.error(`Figma coverage failed (${result.failures.length}):`);
    for (const failure of result.failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Figma coverage passed (${result.manifests} candidate/supported manifests, ${result.registrations} registered nodes).`,
  );
}

if (require.main === module) main();

module.exports = { checkCoverage, isPrimaryMatch, loadManifests };
