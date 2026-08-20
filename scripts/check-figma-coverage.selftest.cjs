#!/usr/bin/env node
/** Exercise the code-to-Figma coverage gate against deliberate drift. */

'use strict';

const { checkCoverage } = require('./check-figma-coverage.cjs');
const { INITIAL_COMPONENT_KEYS } = require('./lib/source-parity.cjs');

const sourceParity = {
  contractVersion: 1,
  auditComponentKey: 'alert',
  auditStatus: 'cleared',
  privateAuditRef: 'library-source-parity:2026-08-19/components/alert',
  privateAuditDigest: 'a'.repeat(64),
  decisionIds: ['sp-alert-001'],
  representationDecisions: [],
  requiredRepresentationSurfaces: [],
};
const sourceParityBaseline = {
  schemaVersion: 1,
  contractVersion: 1,
  initialKeys: [...INITIAL_COMPONENT_KEYS],
  remainingKeys: [],
};

function manifest(relativePath, overrides = {}) {
  return {
    relativePath,
    manifestPath: `${relativePath}/component.json`,
    manifest: {
      canonical: 'Alert',
      slug: 'alert',
      exportName: 'Alert',
      maturity: 'candidate',
      ...overrides,
    },
  };
}

function registration(overrides = {}) {
  return {
    id: 'alert',
    canonical: 'Alert',
    slug: 'alert',
    exportName: 'Alert',
    componentPath: 'components/alert',
    figma: { publicationStatus: 'unpublished' },
    ...overrides,
  };
}

const cases = [
  {
    name: 'candidate primary registration passes while unpublished',
    manifests: [manifest('components/alert')],
    components: [registration()],
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'supported primary registration may be published',
    manifests: [manifest('components/alert', { maturity: 'supported' })],
    components: [registration({ figma: { publicationStatus: 'published' } })],
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'missing candidate registration fails',
    manifests: [manifest('components/alert')],
    components: [],
    expect: (failures) => failures.some((failure) => failure.includes('no matching primary')),
  },
  {
    name: 'missing supported registration fails',
    manifests: [manifest('components/alert', { maturity: 'supported' })],
    components: [],
    expect: (failures) => failures.some((failure) => failure.includes('no matching primary')),
  },
  {
    name: 'mismatched identity does not satisfy coverage',
    manifests: [manifest('components/alert')],
    components: [registration({ exportName: 'Banner' })],
    expect: (failures) => failures.some((failure) => failure.includes('no matching primary')),
  },
  {
    name: 'primary registration cannot override a mismatched canonical',
    manifests: [manifest('components/alert')],
    components: [registration({ canonical: 'Alert!', manifestCanonical: 'Alert' })],
    expect: (failures) => failures.some((failure) => failure.includes('no matching primary')),
  },
  {
    name: 'candidate publication fails',
    manifests: [manifest('components/alert')],
    components: [registration({ figma: { publicationStatus: 'published' } })],
    expect: (failures) => failures.some((failure) => failure.includes('must remain unpublished')),
  },
  {
    name: 'duplicate primary presentations are allowed',
    manifests: [manifest('components/alert')],
    components: [registration(), registration({ id: 'alert-compact' })],
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'secondary export does not satisfy primary coverage',
    manifests: [manifest('components/alert')],
    components: [registration({ exportName: 'AlertIcon', secondaryExport: true })],
    expect: (failures) => failures.some((failure) => failure.includes('no matching primary')),
  },
  {
    name: 'structural variant is keyed by its exact directory',
    manifests: [manifest('components/navigation--mega', { canonical: 'Navigation', slug: 'navigation', variant: 'mega', exportName: 'Navigation' })],
    components: [
      registration({
        id: 'navigation-mega',
        canonical: 'Navigation',
        slug: 'navigation',
        exportName: 'Navigation',
        variant: 'mega',
        componentPath: 'components/navigation--mega',
      }),
    ],
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'a different structural variant does not satisfy coverage',
    manifests: [manifest('components/navigation--mega', { canonical: 'Navigation', slug: 'navigation', variant: 'mega', exportName: 'Navigation' })],
    components: [registration({ canonical: 'Navigation', slug: 'navigation', exportName: 'Navigation', variant: 'drawer', componentPath: 'components/navigation--mega' })],
    expect: (failures) => failures.some((failure) => failure.includes('no matching primary')),
  },
  {
    name: 'deprecated manifests are outside the capture coverage gate',
    manifests: [manifest('components/alert', { maturity: 'deprecated' })],
    components: [],
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'Figma source-parity evidence must match the component manifest',
    manifests: [manifest('components/alert', { sourceParity })],
    components: [registration({ sourceParity: { ...sourceParity, decisionIds: ['sp-alert-999'], representations: [] } })],
    sourceParityEnabled: true,
    sourceParityBaseline,
    expect: (failures) => failures.some((failure) => failure.includes('decisionIds must match component.json')),
  },
];

let failed = 0;
for (const testCase of cases) {
  const result = checkCoverage({
    manifests: testCase.manifests,
    registry: { components: testCase.components },
    sourceParityEnabled: testCase.sourceParityEnabled,
    sourceParityBaseline: testCase.sourceParityBaseline,
  });
  if (testCase.expect(result.failures)) console.log(`✓ ${testCase.name}`);
  else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    for (const failure of result.failures) console.error(`  ${failure}`);
  }
}

if (failed > 0) process.exitCode = 1;
else console.log(`Figma coverage self-test passed (${cases.length} cases).`);
