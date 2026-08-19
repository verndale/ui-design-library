#!/usr/bin/env node
/** Exercise the Figma governance checker against deliberate contract drift. */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { check } = require('./check-figma-contracts.cjs');

const ROOT = path.resolve(__dirname, '..');
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'figma/library.json'), 'utf8'));
const basePackage = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const baseWorkflow = fs.readFileSync(path.join(ROOT, '.github/workflows/figma-library-validation.yml'), 'utf8');
const clone = () => structuredClone(base);
const cases = [
  {
    name: 'current registry and templates pass',
    registry: clone(),
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'duplicate stable node identity fails',
    registry: (() => {
      const registry = clone();
      registry.components[1].figma.nodeId = registry.components[0].figma.nodeId;
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('duplicate Figma node id')),
  },
  {
    name: 'wrapper-based handoff pattern fails',
    registry: (() => {
      const registry = clone();
      registry.components.find((component) => component.id === 'section-header').figma.handoffPattern = 'copy-this-wrapper';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('handoffPattern must equal')),
  },
  {
    name: 'responsive viewport contract drift fails',
    registry: (() => {
      const registry = clone();
      registry.library.promotionPattern.viewportWidths.mobile = 375;
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('viewportWidths must remain')),
  },
  {
    name: 'Figma token snapshot drift fails',
    registry: (() => {
      const registry = clone();
      registry.library.promotionPattern.tokenBindings.variantGap.resolvedValue = '2rem';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('promotion binding "variantGap" drifted')),
  },
  {
    name: 'promotion definition-of-done drift fails',
    registry: (() => {
      const registry = clone();
      registry.promotion.definitionOfDone = registry.promotion.definitionOfDone.filter(
        (requirement) => requirement !== 'annotations remain outside the component-only handoff frame',
      );
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('definitionOfDone must include')),
  },
  {
    name: 'pilot identity drift fails',
    registry: (() => {
      const registry = clone();
      registry.pilot.componentIds = registry.pilot.componentIds.slice(1);
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('immutable seven-node pilot set')),
  },
  {
    name: 'captured live Figma property type drift fails',
    registry: (() => {
      const registry = clone();
      registry.components.find((component) => component.id === 'button-light').figma.properties
        .find((property) => property.name === 'Disabled').type = 'BOOLEAN';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must be VARIANT')),
  },
  {
    name: 'nonvisual mapping without a reason fails',
    registry: (() => {
      const registry = clone();
      const mapping = registry.components.find((component) => component.id === 'link').mappings
        .find((entry) => entry.figmaProperty === 'Href');
      mapping.nonvisualReason = '';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must explain why it has no live visual binding')),
  },
  {
    name: 'Code Connect publication script fails the REST-only policy',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts['figma:connect:publish'] = 'figma connect publish --config figma.config.json --dry-run';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('invokes optional Code Connect publication')),
  },
  {
    name: 'Code Connect credential in CI fails the REST-only policy',
    registry: clone(),
    workflowSource: `${baseWorkflow}\n# FIGMA_CODE_CONNECT_TOKEN\n`,
    expect: (failures) => failures.some((failure) => failure.includes('must not require a Code Connect credential')),
  },
  {
    name: 'unregistered nested dependency fails',
    registry: (() => {
      const registry = clone();
      registry.components.find((component) => component.id === 'card').nestedDependencies = ['missing'];
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('nested dependency "missing"')),
  },
  {
    name: 'story partition drift fails',
    registry: (() => {
      const registry = clone();
      registry.components.find((component) => component.id === 'alert').codeOnlyProps = [];
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must partition storyProps')),
  },
  {
    name: 'private template import fails',
    registry: clone(),
    templateSources: {
      'figma/components/modal.figma.ts': fs
        .readFileSync(path.join(ROOT, 'figma/components/modal.figma.ts'), 'utf8')
        .replace('@verndale/ui-design-library/components/modal', '../components/modal/parts/Modal'),
    },
    expect: (failures) => failures.some((failure) => failure.includes('private or relative implementation path')),
  },
  {
    name: 'Figma property accessor drift fails',
    registry: clone(),
    templateSources: {
      'figma/components/alert.figma.ts': fs
        .readFileSync(path.join(ROOT, 'figma/components/alert.figma.ts'), 'utf8')
        .replace("instance.getBoolean('Show accent')", "instance.getBoolean('Accent')"),
    },
    expect: (failures) => failures.some((failure) => failure.includes('property accessors drifted')),
  },
];

let failed = 0;
for (const testCase of cases) {
  const failures = check({
    registry: testCase.registry,
    templateSources: testCase.templateSources,
    packageJson: testCase.packageJson,
    workflowSource: testCase.workflowSource,
    report: false,
  });
  if (testCase.expect(failures)) console.log(`✓ ${testCase.name}`);
  else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    for (const failure of failures) console.error(`  ${failure}`);
  }
}

if (failed > 0) process.exitCode = 1;
else console.log(`Figma contract self-test passed (${cases.length} cases).`);
