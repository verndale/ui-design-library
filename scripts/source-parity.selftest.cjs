#!/usr/bin/env node
'use strict';

const {
  INITIAL_COMPONENT_KEYS,
  validateBaseline,
  validateImplementationTargets,
  validateManifestSourceParity,
  validateRegistrationSourceParity,
  validateStorySourceParity,
} = require('./lib/source-parity.cjs');

const allSurfaces = ['ai-registry', 'code', 'figma', 'storybook'];
const baseEvidence = {
  contractVersion: 1,
  auditComponentKey: 'button',
  auditStatus: 'remediation-pending',
  privateAuditRef: 'library-source-parity:2026-08-19/components/button',
  privateAuditDigest: 'a'.repeat(64),
  decisionIds: ['sp-button-001', 'sp-button-002'],
  representationDecisions: [{ decisionId: 'sp-button-002', implementationKey: 'button', surfaces: allSurfaces }],
  requiredRepresentationSurfaces: allSurfaces,
};
const baseBaseline = {
  schemaVersion: 1,
  contractVersion: 1,
  initialKeys: [...INITIAL_COMPONENT_KEYS],
  remainingKeys: ['button'],
};
const storyFor = (evidence, prefix = '') => `${prefix}\nconst meta = {
  parameters: {
    sourceParityEvidence: ${JSON.stringify(evidence, null, 2)},
  },
} satisfies Record<string, unknown>;
export default meta;\n`;
const registrationFor = (evidence, representations, mappings = []) => ({
  id: evidence.auditComponentKey,
  figma: { nodeId: '1:2' },
  mappings,
  sourceParity: { ...evidence, representations },
});

const cases = [
  {
    name: 'pending legacy evidence is complete across manifest, story, and Figma registration',
    run(fail) {
      validateBaseline(baseBaseline, INITIAL_COMPONENT_KEYS, fail);
      validateManifestSourceParity({ sourceParity: baseEvidence }, 'button', baseBaseline, fail);
      validateStorySourceParity(storyFor(baseEvidence), { sourceParity: baseEvidence }, 'button', 'Button.stories.tsx', fail);
      validateRegistrationSourceParity(
        registrationFor(baseEvidence, [{
          decisionId: 'sp-button-002',
          kind: 'component-property',
          masterNodeId: null,
          publicProps: [],
          specimens: [],
        }]),
        { sourceParity: baseEvidence },
        'button',
        baseBaseline,
        fail,
      );
    },
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'the immutable initial baseline cannot accept a future component',
    run(fail) {
      validateBaseline(
        { ...baseBaseline, initialKeys: [...baseBaseline.initialKeys, 'future-component'] },
        [...INITIAL_COMPONENT_KEYS, 'future-component'],
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('immutable 21-component migration set')),
  },
  {
    name: 'a structural alternate inherits the audited family identity',
    run(fail) {
      const evidence = {
        ...baseEvidence,
        auditComponentKey: 'navigation',
        auditStatus: 'cleared',
        privateAuditRef: 'library-source-parity:2027-01-15/components/navigation',
        decisionIds: ['sp-navigation-001'],
        representationDecisions: [],
        requiredRepresentationSurfaces: [],
      };
      validateManifestSourceParity({ sourceParity: evidence }, 'navigation--mega', baseBaseline, fail);
      validateStorySourceParity(
        storyFor(evidence),
        { sourceParity: evidence },
        'navigation--mega',
        'NavigationMega.stories.tsx',
        fail,
      );
    },
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'a cleared component cannot remain grandfathered',
    run(fail) {
      validateManifestSourceParity(
        { sourceParity: { ...baseEvidence, auditStatus: 'cleared' } },
        'button',
        baseBaseline,
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('cleared but remains')),
  },
  {
    name: 'an unresolved structural target cannot leave the migration baseline',
    run(fail) {
      const evidence = {
        ...baseEvidence,
        auditStatus: 'cleared',
        representationDecisions: [{
          decisionId: 'sp-button-002',
          implementationKey: null,
          surfaces: allSurfaces,
        }],
      };
      validateManifestSourceParity(
        { sourceParity: evidence },
        'button',
        { ...baseBaseline, remainingKeys: [] },
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('unresolved representation implementationKey')),
  },
  {
    name: 'a structural implementation target must exist and inherit the audited projection',
    run(fail) {
      const evidence = {
        ...baseEvidence,
        auditStatus: 'cleared',
        representationDecisions: [{
          decisionId: 'sp-button-002',
          implementationKey: 'button--icon',
          surfaces: allSurfaces,
        }],
      };
      validateImplementationTargets([
        { componentKey: 'button', evidence },
        { componentKey: 'button--icon', evidence },
      ], { ...baseBaseline, remainingKeys: [] }, fail);
    },
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'Storybook decision drift is rejected',
    run(fail) {
      validateStorySourceParity(
        storyFor({ ...baseEvidence, decisionIds: ['sp-button-999'] }),
        { sourceParity: baseEvidence },
        'button',
        'Button.stories.tsx',
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('decisionIds must match component.json')),
  },
  {
    name: 'comments and decoy objects cannot satisfy Storybook source-parity evidence',
    run(fail) {
      const decoy = `/* sourceParityEvidence: ${JSON.stringify(baseEvidence)} */`;
      const invalid = { ...baseEvidence, privateAuditDigest: 'not-a-digest' };
      validateStorySourceParity(
        storyFor(invalid, decoy),
        { sourceParity: baseEvidence },
        'button',
        'Button.stories.tsx',
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('lowercase SHA-256')),
  },
  {
    name: 'Figma representations cover every Figma-targeted decision exactly once',
    run(fail) {
      validateRegistrationSourceParity(
        registrationFor(baseEvidence, []),
        { sourceParity: baseEvidence },
        'button',
        baseBaseline,
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('cover every Figma-targeted decision exactly once')),
  },
  {
    name: 'a duplicate decision mapping cannot satisfy exact Figma coverage',
    run(fail) {
      const representation = {
        decisionId: 'sp-button-002',
        kind: 'component-property',
        masterNodeId: null,
        publicProps: [],
        specimens: [],
      };
      validateRegistrationSourceParity(
        registrationFor(baseEvidence, [representation, representation]),
        { sourceParity: baseEvidence },
        'button',
        baseBaseline,
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('exactly once')),
  },
  {
    name: 'a remediated responsive representation requires four explicit instance mappings',
    run(fail) {
      const evidence = {
        ...baseEvidence,
        auditComponentKey: 'carousel',
        auditStatus: 'cleared',
        privateAuditRef: 'library-source-parity:2026-08-19/components/carousel',
        decisionIds: ['sp-carousel-001', 'sp-carousel-002'],
        representationDecisions: [{ decisionId: 'sp-carousel-002', implementationKey: 'carousel', surfaces: allSurfaces }],
      };
      validateRegistrationSourceParity(
        registrationFor(evidence, [{
          decisionId: 'sp-carousel-002',
          kind: 'component-property-responsive',
          masterNodeId: '1:2',
          publicProps: ['layout'],
          specimens: [{ componentNodeId: '1:2', nodeId: '2:1', viewportWidth: 1440 }],
        }], [{ codeProp: 'layout' }]),
        { sourceParity: evidence, realization: { props: [{ path: 'layout' }] } },
        'carousel',
        { ...baseBaseline, remainingKeys: [] },
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('1440, 1024, 768, and 390')),
  },
  {
    name: 'a completed visual decision cannot point at an unrelated Figma master',
    run(fail) {
      const evidence = { ...baseEvidence, auditStatus: 'cleared' };
      validateRegistrationSourceParity(
        registrationFor(evidence, [{
          decisionId: 'sp-button-002',
          kind: 'component-property',
          masterNodeId: '9:9',
          publicProps: ['presentation'],
          specimens: [],
        }], [{ codeProp: 'presentation' }]),
        { sourceParity: evidence, realization: { props: [{ path: 'presentation' }] } },
        'button',
        { ...baseBaseline, remainingKeys: [] },
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('must equal its registered Figma master')),
  },
  {
    name: 'completed nonvisual metadata must name a public realization prop',
    run(fail) {
      const evidence = {
        ...baseEvidence,
        auditComponentKey: 'slider',
        auditStatus: 'cleared',
        privateAuditRef: 'library-source-parity:2026-08-19/components/slider',
        decisionIds: ['sp-slider-001', 'sp-slider-002'],
        representationDecisions: [{ decisionId: 'sp-slider-002', implementationKey: 'slider', surfaces: allSurfaces }],
      };
      validateRegistrationSourceParity(
        registrationFor(evidence, [{
          decisionId: 'sp-slider-002',
          kind: 'nonvisual-metadata',
          masterNodeId: null,
          publicProps: ['name'],
          specimens: [],
        }], [{ codeProp: 'name', visualBinding: 'nonvisual' }]),
        { sourceParity: evidence, realization: { props: [] } },
        'slider',
        { ...baseBaseline, remainingKeys: [] },
        fail,
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('absent from the realization contract')),
  },
  {
    name: 'a completed nonvisual representation names metadata and registers no visual nodes',
    run(fail) {
      const evidence = {
        ...baseEvidence,
        auditComponentKey: 'slider',
        auditStatus: 'cleared',
        privateAuditRef: 'library-source-parity:2026-08-19/components/slider',
        decisionIds: ['sp-slider-001', 'sp-slider-002'],
        representationDecisions: [{ decisionId: 'sp-slider-002', implementationKey: 'slider', surfaces: allSurfaces }],
      };
      validateRegistrationSourceParity(
        registrationFor(evidence, [{
          decisionId: 'sp-slider-002',
          kind: 'nonvisual-metadata',
          masterNodeId: null,
          publicProps: ['name'],
          specimens: [],
        }], [{ codeProp: 'name', visualBinding: 'nonvisual' }]),
        { sourceParity: evidence, realization: { props: [{ path: 'name' }] } },
        'slider',
        { ...baseBaseline, remainingKeys: [] },
        fail,
      );
    },
    expect: (failures) => failures.length === 0,
  },
];

let failed = 0;
for (const testCase of cases) {
  const failures = [];
  testCase.run((failure) => failures.push(failure));
  if (testCase.expect(failures)) console.log(`✓ ${testCase.name}`);
  else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    for (const failure of failures) console.error(`  ${failure}`);
  }
}

if (failed > 0) process.exitCode = 1;
else console.log(`Source-parity self-test passed (${cases.length} cases).`);
