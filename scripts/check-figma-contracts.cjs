#!/usr/bin/env node
/**
 * check-figma-contracts.cjs — keep Figma nodes, stories, and public code snippets aligned.
 *
 * The registry is the governance boundary for published Figma node identity. This
 * checker intentionally does not publish or mutate Figma. It verifies that the
 * pilot identities remain frozen, every node has one parserless template, templates expose
 * only public package imports, story props are partitioned into mapped/fixed/code-
 * only props, and nested dependencies execute their own Code Connect templates.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(ROOT, 'figma/library.json');
const ACCESSOR_BY_KIND = {
  string: 'getString',
  boolean: 'getBoolean',
  enum: 'getEnum',
  slot: 'getSlot',
};
const FIGMA_PROPERTY_TYPE_BY_KIND = {
  string: 'TEXT',
  boolean: 'BOOLEAN',
  enum: 'VARIANT',
  slot: 'SLOT',
};
const PILOT_COMPONENT_IDS = ['button-light', 'button-dark', 'section-header', 'alert', 'card', 'card-media', 'modal'];
const PRESENTATION_PATTERNS = new Set(['component-matrix', 'responsive-specimens', 'responsive-full-viewport']);
const REQUIRED_VIEWPORT_WIDTHS = {
  desktop: 1440,
  tabletLarge: 1024,
  tabletSmall: 768,
  mobile: 390,
};
const REQUIRED_PROMOTION_RULES = {
  version: 'direct-canonical-responsive-v1',
  handoffTarget: 'direct-canonical-instance',
  componentFrameContents: 'component-only',
  annotationPlacement: 'outside-component-instance',
  canonicalLayerNaming: 'ui-design-brain',
  autoLayoutRequired: true,
};
const REQUIRED_TOKEN_REFERENCES = {
  canvasSurface: { figmaVariable: 'code/color/surface/base', cssToken: '--color-surface-base' },
  specimenSurface: { figmaVariable: 'code/color/surface/sunken', cssToken: '--color-surface-sunken' },
  specimenPadding: { figmaVariable: 'code/spacing/page-margin', cssToken: '--spacing-page-margin' },
  annotationGap: { figmaVariable: 'code/spacing/s', cssToken: '--spacing-s' },
  variantGap: { figmaVariable: 'code/spacing/xl', cssToken: '--spacing-xl' },
  viewportRowGap: { figmaVariable: 'code/spacing/xl', cssToken: '--spacing-xl' },
  sectionInset: { figmaVariable: 'code/spacing/m', cssToken: '--spacing-m' },
};
const REQUIRED_DEFINITION_OF_DONE = [
  'component visuals use library Tailwind semantic tokens',
  'canonical component name is unchanged',
  'developer handoff target is the direct canonical component instance',
  'annotations remain outside the component-only handoff frame',
  'responsive specimens cover 1440, 1024, 768, and 390 pixel viewports when applicable',
  'alignment, margins, padding, whitespace, clipping, and containment are audited',
  'published node identity is registered',
  'public API Code Connect template is present',
  'repository contracts and CLI parse pass',
];

function sorted(values) {
  return [...new Set(values)].sort();
}

function sameSet(left, right) {
  return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
}

function kebab(input) {
  return String(input)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractArgTypes(source) {
  const marker = source.indexOf('argTypes: {');
  if (marker === -1) return [];

  const block = source.slice(marker).split('\n');
  const props = [];
  let depth = 0;
  let started = false;

  for (const line of block) {
    const opens = (line.match(/{/g) ?? []).length;
    const closes = (line.match(/}/g) ?? []).length;
    if (!started) {
      started = true;
      depth = opens - closes;
      continue;
    }

    if (depth === 1) {
      const match = line.match(/^\s{4}["']([^"']+)["']\s*:/);
      if (match) props.push(match[1]);
    }

    depth += opens - closes;
    if (depth <= 0) break;
  }

  return props;
}

function extractCssCustomProperties(source) {
  return new Map(
    [...source.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)].map((match) => [match[1], match[2].trim()]),
  );
}

function check(options = {}) {
  const root = options.root ?? ROOT;
  const registryPath = options.registryPath ?? path.join(root, 'figma/library.json');
  const failures = [];
  const fail = (message) => failures.push(message);

  let registry = options.registry;
  if (!registry) {
    if (!fs.existsSync(registryPath)) return [`[registry] ${path.relative(root, registryPath)} is missing`];
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch (error) {
      return [`[registry] ${path.relative(root, registryPath)} is invalid JSON: ${error.message}`];
    }
  }

  const readTemplate = (relative) => {
    if (options.templateSources && Object.hasOwn(options.templateSources, relative)) {
      return options.templateSources[relative];
    }
    const absolute = path.join(root, relative);
    return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : null;
  };

  if (registry.schemaVersion !== 1) fail('[registry] schemaVersion must equal 1');
  const library = registry.library ?? {};
  if (library.fileKey !== 'gXT4bIDrkgva2uSzY763oG') fail('[ownership] registry must target the governed UI Design Library file key');
  if (library.tier !== 'organization') fail('[ownership] library tier must be organization');
  if (library.expectedOwner !== 'Verndale Organization') fail('[ownership] expectedOwner must be Verndale Organization');
  if (library.ownershipStatus !== 'maintainer-verification-required-before-publish') {
    fail('[ownership] ownershipStatus must preserve the manual pre-publish verification gate');
  }
  if (library.publishing?.figmaLibrary !== 'explicit-maintainer-action') {
    fail('[publishing] Figma library publication must remain an explicit maintainer action');
  }
  if (library.publishing?.codeConnect !== 'optional-explicit-maintainer-action') {
    fail('[publishing] Code Connect must remain optional and require an explicit maintainer action if adopted later');
  }
  if (library.publishing?.ci !== 'read-only-validation') fail('[publishing] CI must remain read-only validation');
  if (library.tokenPolicy?.componentSource !== 'src/tokens/semantic.css') fail('[tokens] Figma component styling must cite src/tokens/semantic.css');
  if (library.tokenPolicy?.componentVariableCollectionId !== '38:3') fail('[tokens] component variable collection identity drifted');
  if (library.tokenPolicy?.documentationPresentationOnly !== true) fail('[tokens] Cumulative styling must remain documentation-only');
  if (library.tokenPolicy?.modeLimit !== 20 || library.tokenPolicy?.maximumActiveClientModes !== 19) {
    fail('[modes] Organization-tier mode limits must remain 1 Cumulative + at most 19 client modes');
  }

  const promotionPattern = library.promotionPattern ?? {};
  for (const [field, expected] of Object.entries(REQUIRED_PROMOTION_RULES)) {
    if (promotionPattern[field] !== expected) fail(`[promotion] ${field} must equal ${JSON.stringify(expected)}`);
  }
  if (JSON.stringify(promotionPattern.viewportWidths) !== JSON.stringify(REQUIRED_VIEWPORT_WIDTHS)) {
    fail('[promotion] viewportWidths must remain Desktop 1440, Tablet Large 1024, Tablet Small 768, and Mobile 390');
  }

  const tokenSourcePath = path.join(root, library.tokenPolicy?.componentSource ?? '');
  const tokenBindings = promotionPattern.tokenBindings ?? {};
  if (!fs.existsSync(tokenSourcePath)) fail('[tokens] component token source is missing');
  else {
    const customProperties = extractCssCustomProperties(fs.readFileSync(tokenSourcePath, 'utf8'));
    for (const [role, binding] of Object.entries(tokenBindings)) {
      if (!binding.figmaVariable || !binding.cssToken || !binding.resolvedValue) {
        fail(`[promotion] token binding "${role}" must declare figmaVariable, cssToken, and resolvedValue`);
        continue;
      }
      const actual = customProperties.get(binding.cssToken);
      if (!actual) fail(`[tokens] promotion binding "${role}" references missing ${binding.cssToken}`);
      else if (actual !== binding.resolvedValue) {
        fail(`[tokens] promotion binding "${role}" drifted: ${binding.cssToken} resolves to ${actual}, not ${binding.resolvedValue}`);
      }
    }
  }
  for (const [role, expected] of Object.entries(REQUIRED_TOKEN_REFERENCES)) {
    const binding = tokenBindings[role];
    if (!binding) fail(`[promotion] token binding "${role}" is required`);
    else if (binding.figmaVariable !== expected.figmaVariable || binding.cssToken !== expected.cssToken) {
      fail(`[promotion] token binding "${role}" must map ${expected.figmaVariable} to ${expected.cssToken}`);
    }
  }

  const checklistPath = path.join(root, 'figma/PROMOTION-CHECKLIST.md');
  if (!fs.existsSync(checklistPath)) fail('[promotion] figma/PROMOTION-CHECKLIST.md is missing');

  const packagePath = path.join(root, 'package.json');
  if (!options.packageJson && !fs.existsSync(packagePath)) fail('[tooling] package.json is missing');
  else {
    const pkg = options.packageJson ?? JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (pkg.devDependencies?.['@figma/code-connect'] !== '2.0.0') fail('[tooling] @figma/code-connect must be pinned to the validated CLI version');
    if (pkg.scripts?.['figma:live'] !== 'node scripts/check-figma-live.cjs') {
      fail('[tooling] figma:live must run the read-only live Figma checker');
    }
    if (!String(pkg.scripts?.['figma:validate'] ?? '').includes('figma:live:if-token')) {
      fail('[tooling] figma:validate must include the optional local live Figma audit');
    }
    for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
      if (String(command).includes('figma connect publish')) {
        fail(`[publishing] package script "${name}" invokes optional Code Connect publication`);
      }
    }
  }

  const workflowPath = path.join(root, '.github/workflows/figma-library-validation.yml');
  if (options.workflowSource === undefined && !fs.existsSync(workflowPath)) fail('[ci] Figma library validation workflow is missing');
  else {
    const workflow = options.workflowSource ?? fs.readFileSync(workflowPath, 'utf8');
    if (!workflow.includes('permissions:\n  contents: read')) fail('[ci] Figma validation workflow must use read-only repository permissions');
    if (!workflow.includes('secrets.FIGMA_REST_TOKEN')) fail('[ci] live Figma validation must source its read-only REST secret from GitHub Actions');
    if (!workflow.includes('pnpm figma:validate')) fail('[ci] Figma validation workflow must run the governed validation script');
    if (workflow.includes('FIGMA_CODE_CONNECT_TOKEN') || workflow.includes('FIGMA_ACCESS_TOKEN')) {
      fail('[ci] Figma validation workflow must not require a Code Connect credential');
    }
    for (const line of workflow.split('\n')) {
      if (line.includes('figma connect publish')) fail('[ci] workflow must not invoke optional Code Connect publication');
    }
  }

  const components = Array.isArray(registry.components) ? registry.components : [];
  if (components.length === 0) fail('[registry] components must be a non-empty array');
  const componentIds = components.map((component) => component.id);
  const pilotComponentIds = registry.pilot?.componentIds ?? [];
  if (!sameSet(pilotComponentIds, PILOT_COMPONENT_IDS)) {
    fail('[pilot] pilot.componentIds must preserve the immutable seven-node pilot set');
  }
  for (const pilotId of pilotComponentIds) {
    if (!componentIds.includes(pilotId)) fail(`[pilot] immutable pilot node "${pilotId}" must remain registered`);
  }
  const definitionOfDone = registry.promotion?.definitionOfDone ?? [];
  for (const requirement of REQUIRED_DEFINITION_OF_DONE) {
    if (!definitionOfDone.includes(requirement)) fail(`[promotion] definitionOfDone must include "${requirement}"`);
  }

  for (const [label, values] of [
    ['component id', componentIds],
    ['Figma node id', components.map((component) => component.figma?.nodeId)],
    ['Figma node key', components.map((component) => component.figma?.nodeKey)],
    ['template path', components.map((component) => component.figma?.template)],
  ]) {
    const seen = new Set();
    for (const value of values) {
      if (!value) fail(`[identity] every ${label} must be present`);
      else if (seen.has(value)) fail(`[identity] duplicate ${label} "${value}"`);
      seen.add(value);
    }
  }

  const byId = new Map(components.map((component) => [component.id, component]));

  for (const component of components) {
    const prefix = `[${component.id ?? 'unknown'}]`;
    const figma = component.figma ?? {};
    const manifestPath = path.join(root, component.componentPath ?? '', 'component.json');
    const facadePath = path.join(root, component.componentPath ?? '', 'index.ts');
    const storyPath = path.join(root, component.storyPath ?? '');

    if (!/^[0-9]+:[0-9]+$/.test(figma.nodeId ?? '')) fail(`${prefix} nodeId must use Figma's colon form`);
    if (!/^[0-9a-f]{40}$/.test(figma.nodeKey ?? '')) fail(`${prefix} nodeKey must be a stable 40-character component key`);
    if (!['COMPONENT', 'COMPONENT_SET'].includes(figma.nodeType)) fail(`${prefix} nodeType must be COMPONENT or COMPONENT_SET`);
    if (figma.nodeName !== component.canonical) fail(`${prefix} Figma node name must equal canonical "${component.canonical}"`);
    if (figma.status !== 'ready-for-dev') fail(`${prefix} Figma status must be ready-for-dev`);
    if (!['published', 'unpublished'].includes(figma.publicationStatus)) {
      fail(`${prefix} publicationStatus must be published or unpublished`);
    }
    if (pilotComponentIds.includes(component.id) && figma.publicationStatus !== 'published') {
      fail(`${prefix} immutable pilot publicationStatus must remain published`);
    }
    if (figma.handoffPattern !== promotionPattern.handoffTarget) {
      fail(`${prefix} handoffPattern must equal the library promotion handoffTarget`);
    }
    if (!PRESENTATION_PATTERNS.has(figma.presentationPattern)) {
      fail(`${prefix} presentationPattern must be component-matrix, responsive-specimens, or responsive-full-viewport`);
    }
    if (!String(figma.template ?? '').endsWith('.figma.ts') || String(figma.template ?? '').endsWith('.figma.tsx')) {
      fail(`${prefix} template must be a parserless .figma.ts file`);
    }

    if (!fs.existsSync(manifestPath)) {
      fail(`${prefix} component manifest is missing`);
    } else {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const expectedCanonical = component.manifestCanonical ?? component.canonical;
      if (manifest.canonical !== expectedCanonical) fail(`${prefix} manifest canonical must be "${expectedCanonical}"`);
      if (manifest.slug !== component.slug) fail(`${prefix} manifest slug must be "${component.slug}"`);
      if (!component.secondaryExport && manifest.exportName !== component.exportName) {
        fail(`${prefix} primary exportName must agree with component.json`);
      }
      if (manifest.maturity !== 'supported') fail(`${prefix} promoted node must be backed by a supported component`);
    }

    if (!component.secondaryExport && kebab(component.canonical) !== component.slug) {
      fail(`${prefix} canonical must kebab-case to its public slug`);
    }
    const expectedPublicImport = `@verndale/ui-design-library/${component.componentPath}`;
    if (component.publicImport !== expectedPublicImport) fail(`${prefix} publicImport must be ${expectedPublicImport}`);

    if (!fs.existsSync(facadePath)) {
      fail(`${prefix} public facade is missing`);
    } else {
      const facade = fs.readFileSync(facadePath, 'utf8');
      const exportPattern = new RegExp(`export\\s*\\{[^}]*\\b${component.exportName}\\b[^}]*\\}`);
      if (!exportPattern.test(facade)) fail(`${prefix} ${component.exportName} is not exported from the public facade`);
    }

    if (!fs.existsSync(storyPath)) {
      fail(`${prefix} story contract is missing`);
    } else {
      const actualStoryProps = extractArgTypes(fs.readFileSync(storyPath, 'utf8'));
      if (component.storyParity === 'exact' && !sameSet(actualStoryProps, component.storyProps ?? [])) {
        fail(`${prefix} storyProps drifted from Storybook argTypes`);
      } else if (component.storyParity === 'subset') {
        for (const prop of component.storyProps ?? []) {
          if (!actualStoryProps.includes(prop)) fail(`${prefix} shared story argTypes are missing "${prop}"`);
        }
      } else if (!['exact', 'subset'].includes(component.storyParity)) {
        fail(`${prefix} storyParity must be exact or subset`);
      }
    }

    const mappings = Array.isArray(component.mappings) ? component.mappings : [];
    const fixedProps = Array.isArray(component.fixedProps) ? component.fixedProps : [];
    const codeOnlyProps = Array.isArray(component.codeOnlyProps) ? component.codeOnlyProps : [];
    const mappedCodeProps = mappings.map((mapping) => mapping.codeProp).filter(Boolean);
    const partition = [...mappedCodeProps, ...fixedProps.map((entry) => entry.codeProp), ...codeOnlyProps];
    if (!sameSet(partition, component.storyProps ?? [])) {
      fail(`${prefix} mapped, fixed, and code-only props must partition storyProps`);
    }
    const overlap = sorted([...mappedCodeProps, ...fixedProps.map((entry) => entry.codeProp)]).filter((prop) => codeOnlyProps.includes(prop));
    if (overlap.length > 0) fail(`${prefix} codeOnlyProps overlap mapped props: ${overlap.join(', ')}`);

    const figmaPropertyNames = mappings.map((mapping) => mapping.figmaProperty);
    if (new Set(figmaPropertyNames).size !== figmaPropertyNames.length) fail(`${prefix} Figma property names must be unique`);
    for (const mapping of mappings) {
      if (!ACCESSOR_BY_KIND[mapping.kind]) fail(`${prefix} mapping "${mapping.figmaProperty}" has unsupported kind "${mapping.kind}"`);
      if (mapping.kind === 'enum' && (!Array.isArray(mapping.values) || mapping.values.length === 0)) {
        fail(`${prefix} enum mapping "${mapping.figmaProperty}" must declare allowed values`);
      }
      if (mapping.visualBinding !== undefined && mapping.visualBinding !== 'nonvisual') {
        fail(`${prefix} mapping "${mapping.figmaProperty}" visualBinding must equal "nonvisual" when declared`);
      }
      if (mapping.visualBinding === 'nonvisual' && !String(mapping.nonvisualReason ?? '').trim()) {
        fail(`${prefix} nonvisual mapping "${mapping.figmaProperty}" must explain why it has no live visual binding`);
      }
      if (mapping.visualBinding !== 'nonvisual' && mapping.nonvisualReason !== undefined) {
        fail(`${prefix} mapping "${mapping.figmaProperty}" may declare nonvisualReason only with visualBinding "nonvisual"`);
      }
    }

    const liveProperties = Array.isArray(figma.properties) ? figma.properties : [];
    const livePropertyNames = liveProperties.map((property) => property.name);
    if (!sameSet(livePropertyNames, figmaPropertyNames)) {
      fail(`${prefix} captured live Figma properties must exactly match registry mappings`);
    }
    for (const property of liveProperties) {
      const mapping = mappings.find((entry) => entry.figmaProperty === property.name);
      if (!mapping) continue;
      const expectedType = FIGMA_PROPERTY_TYPE_BY_KIND[mapping.kind];
      if (property.type !== expectedType) {
        fail(`${prefix} live Figma property "${property.name}" must be ${expectedType}, received ${property.type}`);
      }
      if (mapping.kind === 'enum' && !sameSet(property.values ?? [], mapping.values ?? [])) {
        fail(`${prefix} live Figma variant values for "${property.name}" drifted from its mapping`);
      }
    }

    const source = readTemplate(figma.template);
    if (source === null) {
      fail(`${prefix} template ${figma.template} is missing`);
      continue;
    }

    const expectedUrl = `${library.url}?node-id=${String(figma.nodeId).replace(':', '-')}`;
    if (!source.startsWith(`// url=${expectedUrl}\n`)) fail(`${prefix} template URL must target the registered node`);
    if (!source.includes(`// source=${component.componentPath}/index.ts\n`)) fail(`${prefix} template source must target the public facade`);
    if (!source.includes(`// component=${component.exportName}\n`)) fail(`${prefix} template component metadata must equal exportName`);
    if (!source.includes("import figma from 'figma'")) fail(`${prefix} template must use the parserless figma API`);
    if (/figma\.connect\s*\(/.test(source)) fail(`${prefix} legacy figma.connect() is forbidden`);
    if (!source.includes('figma.code`')) fail(`${prefix} template must compose its snippet with figma.code`);
    if (!source.includes(`id: '${component.id}'`)) fail(`${prefix} Code Connect id must equal registry id`);

    const expectedImport = `import { ${component.exportName} } from "${component.publicImport}";`;
    if (!source.includes(expectedImport)) fail(`${prefix} displayed import must be exactly ${expectedImport}`);
    if (/(?:\/parts\/|@library\/|(?:^|["'])\.\.\/|(?:^|["'])\.\/|src\/components)/m.test(source)) {
      fail(`${prefix} template references a private or relative implementation path`);
    }
    for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
      if (match[1] !== 'figma' && !match[1].startsWith('@verndale/ui-design-library/components/')) {
        fail(`${prefix} template import "${match[1]}" is not a public package subpath`);
      }
    }

    const accessed = [...source.matchAll(/\.(?:getString|getBoolean|getEnum|getSlot)\(\s*["']([^"']+)["']/g)].map((match) => match[1]);
    if (!sameSet(accessed, figmaPropertyNames)) fail(`${prefix} template property accessors drifted from registry mappings`);
    for (const mapping of mappings) {
      const method = ACCESSOR_BY_KIND[mapping.kind];
      const single = `.${method}('${mapping.figmaProperty}'`;
      const double = `.${method}("${mapping.figmaProperty}"`;
      if (!source.includes(single) && !source.includes(double)) {
        fail(`${prefix} ${mapping.figmaProperty} must use ${method}()`);
      }
    }
    for (const fixed of fixedProps) {
      const hasRenderedProp = source.includes(`renderProp('${fixed.codeProp}'`) || source.includes(`renderProp("${fixed.codeProp}"`);
      const hasValue = typeof fixed.value === 'string'
        ? source.includes(`'${fixed.value}'`) || source.includes(`"${fixed.value}"`)
        : source.includes(`, ${JSON.stringify(fixed.value)})`);
      if (!hasRenderedProp || !hasValue) {
        fail(`${prefix} fixed prop ${fixed.codeProp}=${fixed.value} is not explicit in the template`);
      }
    }

    const dependencies = Array.isArray(component.nestedDependencies) ? component.nestedDependencies : [];
    for (const dependency of dependencies) {
      if (!byId.has(dependency)) fail(`${prefix} nested dependency "${dependency}" is not registered`);
    }
    if (dependencies.length > 0 && (!source.includes('.connectedInstances') || !source.includes('.executeTemplate()'))) {
      fail(`${prefix} nested dependencies must be resolved dynamically with connectedInstances and executeTemplate()`);
    }
  }

  if (!Array.isArray(registry.nodeMigrations)) fail('[migrations] nodeMigrations must be an array');
  else {
    for (const [index, migration] of registry.nodeMigrations.entries()) {
      if (!migration.fromNodeId || !migration.toNodeId || !migration.reason || !migration.approvedBy) {
        fail(`[migrations] entry ${index} must record fromNodeId, toNodeId, reason, and approvedBy`);
      }
    }
  }

  if (options.report !== false) {
    if (failures.length > 0) {
      console.error(`Figma contracts failed (${failures.length}):`);
      for (const failure of failures) console.error(`  - ${failure}`);
    } else {
      console.log(`Figma contracts passed (${components.length} promoted nodes).`);
    }
  }

  return failures;
}

if (require.main === module) process.exitCode = check().length > 0 ? 1 : 0;

module.exports = { check, extractArgTypes, extractCssCustomProperties };
