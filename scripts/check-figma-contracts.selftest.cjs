#!/usr/bin/env node
/** Exercise the Figma governance checker against deliberate contract drift. */

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { check, findForbiddenCodeConnectFiles } = require('./check-figma-contracts.cjs');

const ROOT = path.resolve(__dirname, '..');
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'figma/library.json'), 'utf8'));
const basePackage = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const baseWorkflow = fs.readFileSync(path.join(ROOT, '.github/workflows/figma-library-validation.yml'), 'utf8');
const clone = () => structuredClone(base);
const cases = [
  {
    name: 'current registry passes without a Code Connect surface',
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
    name: 'missing design review status fails',
    registry: (() => {
      const registry = clone();
      delete registry.components[0].figma.review.status;
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('review.status')),
  },
  {
    name: 'missing review evidence fails',
    registry: (() => {
      const registry = clone();
      registry.components[0].figma.review.evidence = 'wiki/journal/missing-review.md';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('review.evidence')),
  },
  {
    name: 'review evidence must identify the registered node',
    registry: (() => {
      const registry = clone();
      registry.components[0].figma.review.evidence = 'wiki/journal/2026-08-18-governed-code-to-figma-capture.md';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must name registered node')),
  },
  {
    name: 'review passes cannot contain duplicates',
    registry: (() => {
      const registry = clone();
      registry.components[0].figma.review.passes = ['adversarial', 'design', 'design'];
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('exactly once each')),
  },
  {
    name: 'primary registration cannot override manifest canonical',
    registry: (() => {
      const registry = clone();
      registry.components.find((component) => component.id === 'alert').manifestCanonical = 'Alert';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must not override manifest canonical')),
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
    name: 'duplicate captured live Figma property names fail',
    registry: (() => {
      const registry = clone();
      const properties = registry.components.find((component) => component.id === 'button-light').figma.properties;
      properties.push(structuredClone(properties[0]));
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('property names must be unique')),
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
    name: 'Code Connect dependency is rejected',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.devDependencies['@figma/code-connect'] = '2.0.0';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must not be installed')),
  },
  {
    name: 'Code Connect script is rejected',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts['figma:connect:parse'] = 'figma connect parse';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('exposes Code Connect')),
  },
  {
    name: 'disguised Code Connect package command is rejected',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts.devmode = 'npx @figma/code-connect publish';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('exposes Code Connect')),
  },
  {
    name: 'Code Connect lockfile residue is rejected',
    registry: clone(),
    lockSource: "packages:\n  '@figma/code-connect@2.0.0': {}\n",
    expect: (failures) => failures.some((failure) => failure.includes('pnpm-lock.yaml must not retain')),
  },
  {
    name: 'root contracts cannot omit Figma coverage',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts.contracts = 'pnpm contracts:code && pnpm figma:contracts';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('contracts must include the exact step')),
  },
  {
    name: 'full test cannot bypass aggregate contracts',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts.test = pkg.scripts.test.replace('pnpm contracts && ', '');
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('test must include the exact step "pnpm contracts"')),
  },
  {
    name: 'pre-Figma code test cannot omit browser accessibility',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts['test:code'] = pkg.scripts['test:code'].replace(' && pnpm test:a11y:webkit', '');
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('test:code must include the exact step "pnpm test:a11y:webkit"')),
  },
  {
    name: 'pre-Figma code test cannot depend on Figma registration',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts['test:code'] += ' && pnpm figma:coverage';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must remain runnable before Figma registration')),
  },
  {
    name: 'validation cannot satisfy coverage with a lookalike command',
    registry: clone(),
    packageJson: (() => {
      const pkg = structuredClone(basePackage);
      pkg.scripts['figma:validate'] = 'echo pnpm figma:coverage && pnpm figma:contracts && pnpm figma:live:if-token';
      return pkg;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must run coverage, registry contracts')),
  },
  {
    name: 'Code Connect credential in CI fails the REST-only policy',
    registry: clone(),
    workflowSource: `${baseWorkflow}\n# FIGMA_CODE_CONNECT_TOKEN\n`,
    expect: (failures) => failures.some((failure) => failure.includes('CI must not reference Code Connect')),
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
    name: 'registry Code Connect template is rejected',
    registry: (() => {
      const registry = clone();
      registry.components[0].figma.template = 'figma/components/button.figma.ts';
      return registry;
    })(),
    expect: (failures) => failures.some((failure) => failure.includes('must not contain a Code Connect template')),
  },
];

let failed = 0;
for (const testCase of cases) {
  const failures = check({
    registry: testCase.registry,
    packageJson: testCase.packageJson,
    workflowSource: testCase.workflowSource,
    lockSource: testCase.lockSource,
    report: false,
  });
  if (testCase.expect(failures)) console.log(`✓ ${testCase.name}`);
  else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    for (const failure of failures) console.error(`  ${failure}`);
  }
}

const forbiddenRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'figma-contract-files-'));
fs.mkdirSync(path.join(forbiddenRoot, 'tools'));
fs.writeFileSync(path.join(forbiddenRoot, 'tools', 'button.figma.ts'), 'export {};\n');
if (findForbiddenCodeConnectFiles(forbiddenRoot).includes('tools/button.figma.ts')) {
  console.log('✓ Code Connect templates are rejected outside the legacy directory');
} else {
  failed += 1;
  console.error('✗ Code Connect templates are rejected outside the legacy directory');
}
fs.rmSync(forbiddenRoot, { recursive: true, force: true });

if (failed > 0) process.exitCode = 1;
else console.log(`Figma contract self-test passed (${cases.length + 1} cases).`);
