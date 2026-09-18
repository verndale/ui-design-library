#!/usr/bin/env node
/** Exercise the read-only live Figma audit against deliberate visual drift. */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { auditLiveNodes } = require('./check-figma-live.cjs');

const COMPONENT_PAGE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'figma', 'library.json'), 'utf8'))
  .library.promotionPattern.componentPage;

const alias = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:1' };
const boundPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, boundVariables: { color: alias } };
const registry = {
  library: {
    fileKey: 'fixture',
    tokenPolicy: {
      componentVariableIds: { 'color/action/base': 'VariableID:1:1' },
      legacyBindingComponentIds: ['example'],
    },
  },
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
const withSpecimens = () => {
  const specimenRegistry = structuredClone(registry);
  specimenRegistry.components[0].sourceParity = {
    representations: [{
      decisionId: 'sp-example-001',
      kind: 'responsive-specimens',
      masterNodeId: '1:2',
      publicProps: [],
      specimens: [1440, 1024, 768, 390].map((viewportWidth, index) => ({
        componentNodeId: '1:2',
        nodeId: `2:${index + 1}`,
        viewportWidth,
      })),
    }],
  };
  const payload = clone();
  [1440, 1024, 768, 390].forEach((width, index) => {
    const id = `2:${index + 1}`;
    payload.nodes[id] = {
      document: {
        id,
        type: 'FRAME',
        name: `Specimen ${width}`,
        absoluteBoundingBox: { width },
        children: [{ id: `${id}:1`, type: 'INSTANCE', name: 'Example', componentId: '1:2' }],
      },
    };
  });
  return { specimenRegistry, payload };
};
const withComponentSetSpecimens = () => {
  const { specimenRegistry, payload } = withSpecimens();
  specimenRegistry.components[0].figma.nodeType = 'COMPONENT_SET';
  const master = payload.nodes['1:2'].document;
  const title = master.children[0];
  master.type = 'COMPONENT_SET';
  master.children = [
    { id: '1:4', type: 'COMPONENT', name: 'State=Default', children: [title] },
    { id: '1:5', type: 'COMPONENT', name: 'State=Active', children: [] },
  ];
  for (const [index, id] of ['2:1', '2:2', '2:3', '2:4'].entries()) {
    payload.nodes[id].document.children[0].componentId = index % 2 === 0 ? '1:4' : '1:5';
  }
  return { specimenRegistry, payload };
};
const withInteractionState = () => {
  const stateRegistry = structuredClone(registry);
  stateRegistry.components[0].figma.stateCoverage = {
    status: 'covered',
    storyExport: 'InteractionStates',
    states: [
      {
        id: 'example.hover',
        label: 'Hover',
        source: { trigger: 'pseudo', value: ':hover' },
        target: 'Example root',
        classification: 'rendered',
        frameNodeId: '3:1',
        instanceNodeId: '3:2',
        componentNodeId: '1:2',
      },
      {
        id: 'example.keyboard',
        label: 'Keyboard activation',
        source: { trigger: 'behavior', value: 'Enter or Space' },
        target: 'Native control',
        classification: 'runtime-only',
        reason: 'Keyboard activation cannot be represented truthfully in a static frame.',
      },
    ],
  };
  const payload = clone();
  payload.nodes['3:1'] = {
    document: {
      id: '3:1',
      type: 'FRAME',
      name: 'Hover',
      children: [{ id: '3:2', type: 'INSTANCE', name: 'Example', componentId: '1:2' }],
    },
  };
  payload.nodes['3:2'] = { document: payload.nodes['3:1'].document.children[0] };
  return { stateRegistry, payload };
};
const withPresentation = () => {
  const presentationRegistry = structuredClone(registry);
  presentationRegistry.library.promotionPattern = { componentPage: structuredClone(COMPONENT_PAGE) };
  const component = presentationRegistry.components[0];
  component.figma.pageId = '4:2';
  component.figma.pageName = 'Example';
  component.figma.presentationEvidence = {
    contractVersion: 1,
    referencePageId: '4:1',
    referencePageName: 'Button — Light',
    sections: {
      documentation: { nodeId: '5:1', order: 1 },
      main: { nodeId: '5:2', order: 2 },
      interactionStates: { nodeId: '5:3', order: 3 },
      publishSource: { nodeId: '5:4', order: null },
    },
  };
  const payload = clone();
  const whiteSection = {
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }],
    strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.1 }],
    strokeWeight: 1,
    cornerRadius: 2,
  };
  const documentationSection = {
    ...structuredClone(whiteSection),
    fills: [{ type: 'SOLID', color: { r: 0.941, g: 0.976, b: 0.953 }, opacity: 1 }],
  };
  const text = (id, name) => ({ id, name, type: 'TEXT' });
  const propertyRows = Array.from({ length: 5 }, (_, index) => ({
    id: `6:${index + 20}`,
    name: `Row ${index + 1}`,
    type: 'FRAME',
    children: [text(`6:${index + 30}`, 'Property'), text(`6:${index + 40}`, 'Values')],
  }));
  const documentationFrame = {
    id: '6:1',
    name: 'Documentation / Example',
    type: 'FRAME',
    absoluteBoundingBox: { x: 24, y: 48, width: 480, height: 1200 },
    children: [
      { id: '6:2', name: 'Accent', type: 'RECTANGLE' },
      text('6:3', 'Eyebrow'),
      text('6:4', 'Title'),
      text('6:5', 'Description'),
      { id: '6:6', name: 'Public import', type: 'FRAME' },
      text('6:7', 'Properties heading'),
      { id: '6:8', name: 'Properties', type: 'FRAME', children: propertyRows },
      { id: '6:9', name: 'Guidance', type: 'FRAME' },
      text('6:10', 'Code only'),
    ],
  };
  const documentation = {
    ...structuredClone(documentationSection),
    id: '5:1',
    name: '✅ Ready for Dev / 01 • Documentation / Example',
    type: 'SECTION',
    absoluteBoundingBox: { x: 0, y: 0, width: 528, height: 1376 },
    children: [documentationFrame],
  };
  const mainFrame = {
    id: '6:11',
    name: 'Main components / Example',
    type: 'FRAME',
    absoluteBoundingBox: { x: 592, y: 48, width: 1224, height: 304 },
    children: [
      text('6:12', 'Eyebrow'),
      text('6:13', 'Title'),
      text('6:14', 'Description'),
      { id: '6:15', name: 'Variant badge', type: 'FRAME' },
      { id: '6:16', name: 'Responsive specimens / Example', type: 'FRAME' },
    ],
  };
  const main = {
    ...structuredClone(whiteSection),
    id: '5:2',
    name: '✅ Ready for Dev / 02 • Main components / Example',
    type: 'SECTION',
    absoluteBoundingBox: { x: 568, y: 0, width: 1272, height: 400 },
    children: [mainFrame],
  };
  const interactionFrame = {
    id: '6:17',
    name: 'Interaction states / Example',
    type: 'FRAME',
    absoluteBoundingBox: { x: 592, y: 488, width: 1224, height: 228 },
    children: [
      { id: '6:18', name: 'Header / Interaction states', type: 'FRAME', children: [text('6:50', 'Title'), text('6:51', 'Description')] },
      { id: '6:19', name: 'State matrices / Example', type: 'FRAME' },
    ],
  };
  const interaction = {
    ...structuredClone(whiteSection),
    id: '5:3',
    name: '✅ Ready for Dev / 03 • Interaction states / Example',
    type: 'SECTION',
    absoluteBoundingBox: { x: 568, y: 440, width: 1272, height: 300 },
    children: [interactionFrame],
  };
  const master = payload.nodes['1:2'].document;
  master.absoluteBoundingBox = { x: 1920, y: 64, width: 200, height: 100 };
  const publish = {
    ...structuredClone(whiteSection),
    id: '5:4',
    name: 'Publish source / Example',
    type: 'SECTION',
    absoluteBoundingBox: { x: 1880, y: 0, width: 1272, height: 296 },
    children: [master],
  };
  const page = { id: '4:2', name: 'Example', type: 'CANVAS', children: [documentation, main, interaction, publish] };
  payload.nodes['4:1'] = { document: { id: '4:1', name: 'Button — Light', type: 'CANVAS', children: [] } };
  payload.nodes['4:2'] = { document: page };
  payload.nodes['5:1'] = { document: documentation };
  payload.nodes['5:2'] = { document: main };
  payload.nodes['5:3'] = { document: interaction };
  payload.nodes['5:4'] = { document: publish };
  payload.nodes[COMPONENT_PAGE.referencePageId] = {
    document: { id: COMPONENT_PAGE.referencePageId, name: COMPONENT_PAGE.referencePageName, type: 'CANVAS', children: [] },
  };
  for (const [role, id] of Object.entries(COMPONENT_PAGE.referenceSectionIds)) {
    const style = role === 'documentation' ? documentationSection : whiteSection;
    payload.nodes[id] = { document: { id, name: `Reference ${role}`, type: 'SECTION', ...structuredClone(style) } };
  }
  payload.pageOrder = [
    { id: COMPONENT_PAGE.groupStartPageId, name: COMPONENT_PAGE.groupStartPageName },
    { id: '4:2', name: 'Example' },
    { id: COMPONENT_PAGE.groupEndPageId, name: COMPONENT_PAGE.groupEndPageName },
  ];
  return { presentationRegistry, payload };
};
const cases = [
  {
    name: 'fully governed live fixture passes',
    payload: clone(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'REST property keys match registry display labels without definition names',
    payload: (() => {
      const payload = clone();
      const root = payload.nodes['1:2'].document;
      root.componentPropertyDefinitions = {
        'title#1:0': root.componentPropertyDefinitions['Title#1:0'],
        'ariaLabel#1:1': root.componentPropertyDefinitions['Aria label#1:1'],
        state: root.componentPropertyDefinitions.State,
      };
      root.children[0].componentPropertyReferences.characters = 'title#1:0';
      return payload;
    })(),
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
  {
    name: 'registered source-parity specimens use the four governed widths',
    ...(() => {
      const { specimenRegistry, payload } = withSpecimens();
      return { registry: specimenRegistry, payload };
    })(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'component-set specimens accept instances of governed child variants',
    ...(() => {
      const { specimenRegistry, payload } = withComponentSetSpecimens();
      return { registry: specimenRegistry, payload };
    })(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'component-set specimens reject instances outside the governed set',
    ...(() => {
      const { specimenRegistry, payload } = withComponentSetSpecimens();
      payload.nodes['2:1'].document.children[0].componentId = '9:9';
      return { registry: specimenRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('does not contain an instance of 1:2')),
  },
  {
    name: 'source-parity specimen width drift fails',
    ...(() => {
      const { specimenRegistry, payload } = withSpecimens();
      payload.nodes['2:4'].document.absoluteBoundingBox.width = 375;
      return { registry: specimenRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('expected 390')),
  },
  {
    name: 'an empty frame cannot satisfy a source-parity specimen mapping',
    ...(() => {
      const { specimenRegistry, payload } = withSpecimens();
      payload.nodes['2:1'].document.children = [];
      return { registry: specimenRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('does not contain an instance of 1:2')),
  },
  {
    name: 'registered interaction-state frames preserve connected instance identity',
    ...(() => {
      const { stateRegistry, payload } = withInteractionState();
      return { registry: stateRegistry, payload };
    })(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'state token audit accepts the registered code-parity variable',
    ...(() => {
      const { stateRegistry, payload } = withInteractionState();
      stateRegistry.components[0].figma.tokenBindingAudit = {
        contractVersion: 1,
        stateRequirements: { 'example.hover': ['color/action/base'] },
      };
      return { registry: stateRegistry, payload };
    })(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'state token audit rejects variables outside the code-parity collection',
    ...(() => {
      const { stateRegistry, payload } = withInteractionState();
      stateRegistry.components[0].figma.tokenBindingAudit = {
        contractVersion: 1,
        stateRequirements: { 'example.hover': ['color/action/base'] },
      };
      payload.nodes['1:2'].document.boundVariables.itemSpacing = { type: 'VARIABLE_ALIAS', id: 'VariableID:9:9' };
      return { registry: stateRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('outside the code-parity token collection')),
  },
  {
    name: 'interaction-state instance connection drift fails',
    ...(() => {
      const { stateRegistry, payload } = withInteractionState();
      payload.nodes['3:2'].document.componentId = '9:9';
      payload.nodes['3:1'].document.children[0].componentId = '9:9';
      return { registry: stateRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('connected to 9:9')),
  },
  {
    name: 'interaction-state frame must contain the registered instance',
    ...(() => {
      const { stateRegistry, payload } = withInteractionState();
      payload.nodes['3:1'].document.children = [];
      return { registry: stateRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('does not contain instance 3:2')),
  },
  {
    name: 'governed component page passes the machine template',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'component pages outside the Components group fail',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      payload.pageOrder = [payload.pageOrder[0], payload.pageOrder[2], payload.pageOrder[1]];
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('is not inside the governed Components group')),
  },
  {
    name: 'ad hoc documentation chrome fails the machine template',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      payload.nodes['5:1'].document.children[0].children.shift();
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('documentation template children must exactly match')),
  },
  {
    name: 'wrapped publish masters fail direct handoff placement',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      const publish = payload.nodes['5:4'].document;
      publish.children = [{ id: '9:1', name: 'Wrapper', type: 'FRAME', children: publish.children }];
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must contain only the direct canonical master')),
  },
  {
    name: 'component section geometry drift fails',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      payload.nodes['5:2'].document.absoluteBoundingBox.x = 600;
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('main section geometry drifted')),
  },
  {
    name: 'component section appearance drift fails',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      payload.nodes['5:2'].document.fills[0].color = { r: 0.267, g: 0.267, b: 0.267 };
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('main section appearance drifted')),
  },
  {
    name: 'interaction-state descendants cannot overflow their containers',
    ...(() => {
      const { presentationRegistry, payload } = withPresentation();
      const interactionFrame = payload.nodes['5:3'].document.children[0];
      const matrix = interactionFrame.children[1];
      matrix.absoluteBoundingBox = { x: 500, y: 600, width: 1400, height: 100 };
      return { registry: presentationRegistry, payload };
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('interaction child') && failure.includes('overflows')),
  },
];

let failed = 0;
for (const testCase of cases) {
  const failures = auditLiveNodes({ registry: testCase.registry ?? registry, payload: testCase.payload });
  if (testCase.expect(failures)) console.log(`✓ ${testCase.name}`);
  else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    for (const failure of failures) console.error(`  ${failure}`);
  }
}

if (failed > 0) process.exitCode = 1;
else console.log(`Live Figma audit self-test passed (${cases.length} cases).`);
