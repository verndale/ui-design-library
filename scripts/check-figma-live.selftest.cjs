#!/usr/bin/env node
/** Exercise the read-only live Figma audit against deliberate visual drift. */

'use strict';

const { auditLiveNodes } = require('./check-figma-live.cjs');

const alias = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:1' };
const boundPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, boundVariables: { color: alias } };
const registry = {
  library: { fileKey: 'fixture' },
  components: [
    {
      id: 'example',
      figma: { nodeId: '1:2', nodeType: 'COMPONENT', nodeName: 'Example' },
      mappings: [
        { figmaProperty: 'Title', kind: 'string', codeProp: 'title' },
        {
          figmaProperty: 'Aria label',
          kind: 'string',
          codeProp: 'ariaLabel',
          visualBinding: 'nonvisual',
          nonvisualReason: 'Accessible name only.',
        },
        { figmaProperty: 'State', kind: 'enum', codeProp: 'state', values: ['Default', 'Active'] },
      ],
    },
  ],
};
const basePayload = {
  nodes: {
    '1:2': {
      document: {
        id: '1:2',
        type: 'COMPONENT',
        name: 'Example',
        layoutMode: 'VERTICAL',
        itemSpacing: 8,
        paddingTop: 8,
        boundVariables: { itemSpacing: alias, paddingTop: alias },
        fills: [boundPaint],
        componentPropertyDefinitions: {
          'Title#1:0': { type: 'TEXT', defaultValue: 'Example title' },
          'Aria label#1:1': { type: 'TEXT', defaultValue: 'Example' },
          State: { type: 'VARIANT', defaultValue: 'Default', variantOptions: ['Default', 'Active'] },
        },
        children: [
          {
            id: '1:3',
            type: 'TEXT',
            name: 'Title',
            characters: 'Example title',
            styles: { text: 'S:example' },
            fills: [boundPaint],
            componentPropertyReferences: { characters: 'Title#1:0' },
          },
        ],
      },
    },
  },
};

const clone = () => structuredClone(basePayload);
const cases = [
  {
    name: 'fully governed live fixture passes',
    payload: clone(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'missing visual property reference fails',
    payload: (() => {
      const payload = clone();
      delete payload.nodes['1:2'].document.children[0].componentPropertyReferences;
      return payload;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('not referenced by a descendant layer')),
  },
  {
    name: 'nonvisual property needs no layer reference',
    payload: clone(),
    expect: (failures) => !failures.some((failure) => failure.includes('Aria label')),
  },
  {
    name: 'raw spacing fails',
    payload: (() => {
      const payload = clone();
      delete payload.nodes['1:2'].document.boundVariables.itemSpacing;
      return payload;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('itemSpacing=8')),
  },
  {
    name: 'unstyled semantic text fails',
    payload: (() => {
      const payload = clone();
      delete payload.nodes['1:2'].document.children[0].styles;
      return payload;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('has no applied text style')),
  },
  {
    name: 'unbound color fails',
    payload: (() => {
      const payload = clone();
      delete payload.nodes['1:2'].document.fills[0].boundVariables;
      return payload;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('uses an unbound solid color')),
  },
  {
    name: 'live property type drift fails',
    payload: (() => {
      const payload = clone();
      payload.nodes['1:2'].document.componentPropertyDefinitions['Title#1:0'].type = 'BOOLEAN';
      return payload;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('is BOOLEAN, expected TEXT')),
  },
  {
    name: 'duplicate live property names fail instead of being collapsed',
    payload: (() => {
      const payload = clone();
      payload.nodes['1:2'].document.componentPropertyDefinitions['Title#1:9'] = {
        type: 'TEXT',
        defaultValue: 'Duplicate title',
      };
      return payload;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('property names are duplicated: Title')),
  },
];

let failed = 0;
for (const testCase of cases) {
  const failures = auditLiveNodes({ registry, payload: testCase.payload });
  if (testCase.expect(failures)) console.log(`✓ ${testCase.name}`);
  else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    for (const failure of failures) console.error(`  ${failure}`);
  }
}

if (failed > 0) process.exitCode = 1;
else console.log(`Live Figma audit self-test passed (${cases.length} cases).`);
