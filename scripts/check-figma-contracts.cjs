#!/usr/bin/env node
/**
 * check-figma-contracts.cjs — keep Figma nodes, stories, and public code contracts aligned.
 *
 * The registry is the governance boundary for published Figma node identity. This
 * checker intentionally does not publish or mutate Figma. It verifies that the
 * pilot identities remain frozen, story props are partitioned into mapped/fixed/code-only
 * props, candidates remain unpublished, and every registration carries review evidence.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  loadBaseline,
  validateBaseline,
  validateRegistrationSourceParity,
} = require('./lib/source-parity.cjs');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(ROOT, 'figma/library.json');
const FIGMA_PROPERTY_TYPE_BY_KIND = {
  string: 'TEXT',
  boolean: 'BOOLEAN',
  enum: 'VARIANT',
  slot: 'SLOT',
  instance: 'INSTANCE_SWAP',
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
  'source-parity, adversarial, and design review findings are fixed and recorded',
  'candidate components remain unpublished pending maintainer action',
  'stable node identity is registered',
  'repository contracts pass',
];
const CODE_CONNECT_PATTERN = /@figma\/code-connect|figma[\s:_-]*connect|code[\s:_-]*connect/i;
const REQUIRED_CODE_TEST_STEPS = [
  'pnpm typecheck',
  'pnpm lint',
  'pnpm architecture',
  'pnpm architecture:selftest',
  'pnpm contracts:code',
  'pnpm contracts:code:selftest',
  'pnpm accessibility:report',
  'pnpm release:preflight:selftest',
  'pnpm exports:check',
  'pnpm test:ssr',
  'pnpm accessibility',
  'pnpm test:a11y:webkit',
  'pnpm test:a11y:modes',
  'pnpm test:motion',
];

function sorted(values) {
  return [...new Set(values)].sort();
}

function sameSet(left, right) {
  return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
}

function samePrimaryIdentity(left, right) {
  return left.secondaryExport !== true && right.secondaryExport !== true &&
    left.componentPath === right.componentPath &&
    left.canonical === right.canonical &&
    left.slug === right.slug &&
    left.exportName === right.exportName &&
    (left.variant ?? null) === (right.variant ?? null) &&
    Boolean(left.default) === Boolean(right.default);
}

function fixedPropDifferenceCount(left, right) {
  const leftProps = new Map((left.fixedProps ?? []).map((entry) => [entry.codeProp, entry.value]));
  const rightProps = new Map((right.fixedProps ?? []).map((entry) => [entry.codeProp, entry.value]));
  const keys = new Set([...leftProps.keys(), ...rightProps.keys()]);
  let differences = 0;
  for (const key of keys) {
    if (!leftProps.has(key) || !rightProps.has(key) ||
      JSON.stringify(leftProps.get(key)) !== JSON.stringify(rightProps.get(key))) {
      differences += 1;
    }
  }
  return differences;
}

function sharesMatchingBasePresentationPage(component, family) {
  return family.some((candidate) =>
    candidate.presentationLabel === undefined &&
    candidate.componentPath === component.componentPath &&
    candidate.figma?.pageId === component.figma?.pageId &&
    candidate.figma?.pageName === component.figma?.pageName &&
    fixedPropDifferenceCount(component, candidate) === 1);
}

function commandSteps(command) {
  return String(command ?? '').split('&&').map((step) => step.trim()).filter(Boolean);
}

function findCodeConnectSurfaces(value, location = 'registry') {
  const surfaces = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => surfaces.push(...findCodeConnectSurfaces(entry, `${location}[${index}]`)));
    return surfaces;
  }
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && CODE_CONNECT_PATTERN.test(value)) surfaces.push(location);
    return surfaces;
  }
  for (const [key, entry] of Object.entries(value)) {
    const child = `${location}.${key}`;
    if (CODE_CONNECT_PATTERN.test(key)) surfaces.push(child);
    surfaces.push(...findCodeConnectSurfaces(entry, child));
  }
  return surfaces;
}

function findForbiddenCodeConnectFiles(root) {
  const matches = [];
  const ignored = new Set(['.git', 'node_modules', 'wiki', 'graphify-out']);
  const visit = (directory, relative = '') => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignored.has(entry.name)) continue;
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (childRelative === 'figma/components') matches.push(childRelative);
        else visit(child, childRelative);
      } else if (/\.figma\.[cm]?[jt]sx?$/i.test(entry.name) || /code[-_.]?connect/i.test(entry.name) ||
        /^figma\.config\./i.test(entry.name) || /^tsconfig\.figma(?:\.|$)/i.test(entry.name)) {
        matches.push(childRelative);
      }
    }
  };
  visit(root);
  return matches.sort();
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

  if (registry.schemaVersion !== 1) fail('[registry] schemaVersion must equal 1');
  for (const surface of findCodeConnectSurfaces(registry)) {
    fail(`[code-connect] ${surface} must not expose Code Connect`);
  }
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
    for (const surface of findCodeConnectSurfaces(pkg, 'package.json')) {
      fail(`[code-connect] ${surface} must not expose Code Connect`);
    }
    if (pkg.devDependencies?.['@figma/code-connect'] || pkg.dependencies?.['@figma/code-connect']) {
      fail('[code-connect] @figma/code-connect must not be installed');
    }
    if (pkg.scripts?.['figma:live'] !== 'node scripts/check-figma-live.cjs') {
      fail('[tooling] figma:live must run the read-only live Figma checker');
    }
    if (pkg.scripts?.['contracts:code'] !== 'node scripts/check-contracts.cjs') {
      fail('[tooling] contracts:code must expose the pre-Figma component contract checker');
    }
    if (pkg.scripts?.['contracts:code:selftest'] !== 'node scripts/check-contracts.selftest.cjs') {
      fail('[tooling] contracts:code:selftest must expose the pre-Figma component contract fixtures');
    }
    if (pkg.scripts?.['figma:coverage'] !== 'node scripts/check-figma-coverage.cjs') {
      fail('[tooling] figma:coverage must run the read-only code-to-Figma coverage checker');
    }
    if (pkg.scripts?.['figma:contracts'] !== 'node scripts/check-figma-contracts.cjs') {
      fail('[tooling] figma:contracts must run the Figma registry contract checker');
    }
    if (pkg.scripts?.['figma:live:if-token'] !== 'node scripts/check-figma-live.cjs --if-token') {
      fail('[tooling] figma:live:if-token must run the read-only live audit in optional-local mode');
    }
    if (pkg.uiDesignLibrary?.sourceParityContractVersion !== 1) {
      fail('[tooling] uiDesignLibrary.sourceParityContractVersion must equal 1');
    }
    const expectedValidation = 'pnpm figma:coverage && pnpm figma:contracts && pnpm figma:live:if-token';
    if (pkg.scripts?.['figma:validate'] !== expectedValidation) {
      fail('[tooling] figma:validate must run coverage, registry contracts, and the optional local live audit in order');
    }
    const contractSteps = commandSteps(pkg.scripts?.contracts);
    for (const required of ['pnpm contracts:code', 'pnpm figma:coverage', 'pnpm figma:contracts']) {
      if (!contractSteps.includes(required)) fail(`[tooling] contracts must include the exact step "${required}"`);
    }
    if (!commandSteps(pkg.scripts?.['contracts:selftest']).includes('pnpm figma:coverage:selftest')) {
      fail('[tooling] contracts:selftest must include the exact step "pnpm figma:coverage:selftest"');
    }
    if (!commandSteps(pkg.scripts?.['contracts:selftest']).includes('pnpm contracts:code:selftest')) {
      fail('[tooling] contracts:selftest must include the exact step "pnpm contracts:code:selftest"');
    }
    if (!commandSteps(pkg.scripts?.['contracts:selftest']).includes('pnpm source-parity:selftest')) {
      fail('[tooling] contracts:selftest must include the exact step "pnpm source-parity:selftest"');
    }
    const codeTestSteps = commandSteps(pkg.scripts?.['test:code']);
    for (const required of REQUIRED_CODE_TEST_STEPS) {
      if (!codeTestSteps.includes(required)) fail(`[tooling] test:code must include the exact step "${required}"`);
    }
    if (codeTestSteps.some((step) => /\bfigma:/.test(step))) {
      fail('[tooling] test:code must remain runnable before Figma registration');
    }
    const testSteps = commandSteps(pkg.scripts?.test);
    for (const required of ['pnpm contracts', 'pnpm contracts:selftest']) {
      if (!testSteps.includes(required)) fail(`[tooling] test must include the exact step "${required}"`);
    }
    for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
      if (CODE_CONNECT_PATTERN.test(name) || CODE_CONNECT_PATTERN.test(String(command))) {
        fail(`[code-connect] package script "${name}" exposes Code Connect`);
      }
    }
  }
  const lockPath = path.join(root, 'pnpm-lock.yaml');
  const lockSource = options.lockSource ?? (fs.existsSync(lockPath) ? fs.readFileSync(lockPath, 'utf8') : '');
  if (CODE_CONNECT_PATTERN.test(lockSource)) fail('[code-connect] pnpm-lock.yaml must not retain Code Connect');
  for (const forbidden of findForbiddenCodeConnectFiles(root)) {
    fail(`[code-connect] ${forbidden} must not exist`);
  }

  const workflowPath = path.join(root, '.github/workflows/figma-library-validation.yml');
  if (options.workflowSource === undefined && !fs.existsSync(workflowPath)) fail('[ci] Figma library validation workflow is missing');
  else {
    const workflow = options.workflowSource ?? fs.readFileSync(workflowPath, 'utf8');
    if (!workflow.includes('permissions:\n  contents: read')) fail('[ci] Figma validation workflow must use read-only repository permissions');
    if (!workflow.includes('FIGMA_REST_TOKEN: ${{ secrets.FIGMA_REST_TOKEN }}')) {
      fail('[ci] live Figma validation must source its read-only REST secret from GitHub Actions');
    }
    if (!workflow.includes('run: test -n "$FIGMA_REST_TOKEN"')) {
      fail('[ci] Figma validation workflow must fail closed when the read-only REST secret is unavailable');
    }
    if (!workflow.includes('pnpm figma:validate')) fail('[ci] Figma validation workflow must run the governed validation script');
    if (CODE_CONNECT_PATTERN.test(workflow)) fail('[code-connect] CI must not reference Code Connect');
  }

  const components = Array.isArray(registry.components) ? registry.components : [];
  if (components.length === 0) fail('[registry] components must be a non-empty array');
  let sourceParityBaseline = null;
  try {
    sourceParityBaseline = options.sourceParityBaseline ?? loadBaseline(root);
    validateBaseline(
      sourceParityBaseline,
      components
        .filter((component) => !component.secondaryExport)
        .map((component) => path.basename(component.componentPath)),
      fail,
    );
  } catch (error) {
    fail(`[source-parity] could not load migration baseline: ${error.message}`);
  }
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
    const expectedNodeName = component.variant && component.default !== true
      ? `${component.canonical} / ${component.variantLabel}`
      : component.presentationLabel
        ? `${component.canonical} / ${component.presentationLabel}`
        : component.canonical;
    if (figma.nodeName !== expectedNodeName) fail(`${prefix} Figma node name must equal "${expectedNodeName}"`);
    if (figma.status !== 'ready-for-dev') fail(`${prefix} Figma status must be ready-for-dev`);
    if (!['published', 'unpublished'].includes(figma.publicationStatus)) {
      fail(`${prefix} publicationStatus must be published or unpublished`);
    }
    const review = figma.review ?? {};
    if (review.status !== 'passed') fail(`${prefix} review.status must equal "passed"`);
    if (review.standard !== 'button-standard-v1') {
      fail(`${prefix} review.standard must equal "button-standard-v1"`);
    }
    const componentKey = path.basename(component.componentPath ?? '');
    const isGrandfathered = sourceParityBaseline?.remainingKeys.includes(componentKey) ?? false;
    const requiredReviewPasses = isGrandfathered ? ['adversarial', 'design'] : ['source-parity', 'adversarial', 'design'];
    if (
      !Array.isArray(review.passes) ||
      review.passes.length !== requiredReviewPasses.length ||
      !sameSet(review.passes, requiredReviewPasses)
    ) {
      fail(
        `${prefix} review.passes must equal ${requiredReviewPasses.join(', ')} exactly once each` +
          (isGrandfathered ? ' while the component remains in the source-parity migration baseline' : ''),
      );
    }
    if (!/^wiki\/journal\/[a-z0-9-]+\.md$/.test(review.evidence ?? '')) {
      fail(`${prefix} review.evidence must reference a repository journal entry`);
    } else if (!fs.existsSync(path.join(root, review.evidence))) {
      fail(`${prefix} review.evidence ${review.evidence} is missing`);
    } else {
      const evidence = fs.readFileSync(path.join(root, review.evidence), 'utf8');
      if (!evidence.includes(`\`${figma.nodeId}\``)) {
        fail(`${prefix} review.evidence must name registered node ${figma.nodeId}`);
      }
      if (!/source-parity/i.test(evidence) || !/adversarial/i.test(evidence) || !/design review/i.test(evidence)) {
        fail(`${prefix} review.evidence must record the source-parity state plus adversarial and design review`);
      }
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
    if (figma.template !== undefined) fail(`${prefix} registry must not contain a Code Connect template`);

    if (!fs.existsSync(manifestPath)) {
      fail(`${prefix} component manifest is missing`);
    } else {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const expectedCanonical = component.manifestCanonical ?? component.canonical;
      if (manifest.canonical !== expectedCanonical) fail(`${prefix} manifest canonical must be "${expectedCanonical}"`);
      if (!component.secondaryExport && component.manifestCanonical !== undefined) {
        fail(`${prefix} primary registration must not override manifest canonical`);
      }
      if (!component.secondaryExport && component.canonical !== manifest.canonical) {
        fail(`${prefix} primary registration canonical must equal component.json canonical`);
      }
      if (manifest.slug !== component.slug) fail(`${prefix} manifest slug must be "${component.slug}"`);
      if (!component.secondaryExport && (component.variant ?? null) !== (manifest.variant ?? null)) {
        fail(`${prefix} primary structural variant must agree with component.json`);
      }
      if (!component.secondaryExport && Boolean(component.default) !== Boolean(manifest.default)) {
        fail(`${prefix} primary default flag must agree with component.json`);
      }
      if (!component.secondaryExport && manifest.exportName !== component.exportName) {
        fail(`${prefix} primary exportName must agree with component.json`);
      }
      if (manifest.maturity === 'candidate' && figma.publicationStatus !== 'unpublished') {
        fail(`${prefix} candidate component must remain unpublished in Figma`);
      }
      if (sourceParityBaseline) {
        validateRegistrationSourceParity(
          component,
          manifest,
          path.basename(component.componentPath),
          sourceParityBaseline,
          fail,
          { familyRegistrations: components.filter((candidate) => samePrimaryIdentity(component, candidate)) },
        );
      }
    }

    if (!component.secondaryExport && kebab(component.canonical) !== component.slug) {
      fail(`${prefix} canonical must kebab-case to its public slug`);
    }
    if (component.variant !== undefined) {
      if (typeof component.variant !== 'string' || kebab(component.variant) !== component.variant) {
        fail(`${prefix} variant must be a non-empty kebab-case structural identity`);
      }
      if (typeof component.variantLabel !== 'string' || !component.variantLabel.trim()) {
        fail(`${prefix} variantLabel is required when variant is declared`);
      }
    } else if (component.variantLabel !== undefined || component.default !== undefined) {
      fail(`${prefix} variantLabel/default require a structural variant`);
    }
    if (component.presentationLabel !== undefined &&
      (typeof component.presentationLabel !== 'string' || !component.presentationLabel.trim())) {
      fail(`${prefix} presentationLabel must be a non-empty string when declared`);
    }
    if (component.presentationLabel !== undefined && component.variant !== undefined) {
      fail(`${prefix} presentationLabel cannot replace or accompany structural variant identity`);
    }
    if (component.familyPage !== undefined && typeof component.familyPage !== 'boolean') {
      fail(`${prefix} familyPage must be boolean when declared`);
    }
    if (component.default === true && component.familyPage !== true) {
      fail(`${prefix} a structural default must designate the family page`);
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
      const storyProps = Array.isArray(component.storyProps) ? component.storyProps : [];
      if (!Array.isArray(component.storyProps)) fail(`${prefix} storyProps must be an array`);
      if (component.storyParity === 'exact' && !sameSet(actualStoryProps, storyProps)) {
        fail(`${prefix} storyProps drifted from Storybook argTypes`);
      } else if (component.storyParity === 'subset') {
        for (const prop of storyProps) {
          if (!actualStoryProps.includes(prop)) fail(`${prefix} shared story argTypes are missing "${prop}"`);
        }
      } else if (!['exact', 'subset'].includes(component.storyParity)) {
        fail(`${prefix} storyParity must be exact or subset`);
      }
    }

    const mappings = Array.isArray(component.mappings) ? component.mappings : [];
    const fixedProps = Array.isArray(component.fixedProps) ? component.fixedProps : [];
    const codeOnlyProps = Array.isArray(component.codeOnlyProps) ? component.codeOnlyProps : [];
    const storyProps = Array.isArray(component.storyProps) ? component.storyProps : [];
    if (new Set(storyProps).size !== storyProps.length) {
      fail(`${prefix} storyProps must not contain duplicates`);
    }
    if (new Set(codeOnlyProps).size !== codeOnlyProps.length) fail(`${prefix} codeOnlyProps must not contain duplicates`);
    const fixedCodeProps = fixedProps.map((entry) => entry.codeProp);
    if (new Set(fixedCodeProps).size !== fixedCodeProps.length) fail(`${prefix} fixedProps codeProp values must be unique`);
    const mappedCodeProps = mappings.map((mapping) => mapping.codeProp).filter(Boolean);
    const partition = [...mappedCodeProps, ...fixedCodeProps, ...codeOnlyProps];
    if (!sameSet(partition, storyProps)) {
      fail(`${prefix} mapped, fixed, and code-only props must partition storyProps`);
    }
    const overlap = sorted([...mappedCodeProps, ...fixedCodeProps]).filter((prop) => codeOnlyProps.includes(prop));
    if (overlap.length > 0) fail(`${prefix} codeOnlyProps overlap mapped props: ${overlap.join(', ')}`);

    const figmaPropertyNames = mappings.map((mapping) => mapping.figmaProperty);
    if (new Set(figmaPropertyNames).size !== figmaPropertyNames.length) fail(`${prefix} Figma property names must be unique`);
    for (const mapping of mappings) {
      if (!FIGMA_PROPERTY_TYPE_BY_KIND[mapping.kind]) fail(`${prefix} mapping "${mapping.figmaProperty}" has unsupported kind "${mapping.kind}"`);
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
    if (new Set(livePropertyNames).size !== livePropertyNames.length) {
      fail(`${prefix} captured live Figma property names must be unique`);
    }
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

    const dependencies = Array.isArray(component.nestedDependencies) ? component.nestedDependencies : [];
    if (new Set(dependencies).size !== dependencies.length) fail(`${prefix} nestedDependencies must not contain duplicates`);
    for (const dependency of dependencies) {
      if (!byId.has(dependency)) fail(`${prefix} nested dependency "${dependency}" is not registered`);
    }
  }

  const byCanonical = new Map();
  for (const component of components.filter((entry) => !entry.secondaryExport)) {
    if (!byCanonical.has(component.canonical)) byCanonical.set(component.canonical, []);
    byCanonical.get(component.canonical).push(component);
  }
  for (const [canonical, family] of byCanonical) {
    const structuralPaths = new Set(family.map((component) => component.componentPath));
    const needsFamilyPage = family.length > 1 || structuralPaths.size > 1;
    const designated = family.filter((component) => component.familyPage === true);
    if (needsFamilyPage && designated.length !== 1) {
      fail(`[family] ${canonical} must designate exactly one familyPage registration`);
      continue;
    }
    if (structuralPaths.size > 1 && designated.length === 1) {
      const page = designated[0].figma ?? {};
      for (const component of family) {
        if (component.figma?.pageId !== page.pageId || component.figma?.pageName !== page.pageName) {
          fail(`[family] ${component.id} must share ${canonical}'s family page identity`);
        }
      }
    } else if (structuralPaths.size === 1) {
      for (const component of family.filter((entry) => entry.presentationLabel !== undefined)) {
        if (!sharesMatchingBasePresentationPage(component, family)) {
          fail(`[family] ${component.id} must share ${canonical}'s family page identity`);
        }
      }
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

module.exports = { check, extractArgTypes, extractCssCustomProperties, findForbiddenCodeConnectFiles };
