#!/usr/bin/env node
/**
 * Read-only live Figma audit for the registered component masters.
 *
 * The repository registry remains the contract source. This script compares it
 * with Figma's file-nodes REST response and audits the visual implementation
 * details that a captured JSON snapshot cannot prove. It never mutates or
 * publishes the Figma library.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'figma/library.json');
const FIGMA_API = 'https://api.figma.com/v1';
const FIGMA_TYPE_BY_KIND = {
  string: 'TEXT',
  boolean: 'BOOLEAN',
  enum: 'VARIANT',
  slot: 'SLOT',
};
const SPACING_FIELDS = [
  'itemSpacing',
  'counterAxisSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
];
function sorted(values) {
  return [...new Set(values)].sort();
}

function sameSet(left, right) {
  return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
}

function propertyName(key) {
  return String(key).replace(/#[^#]+$/, '');
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

function instantiableComponentIds(payload, componentNodeId) {
  const master = payload.nodes?.[componentNodeId]?.document;
  if (master?.type !== 'COMPONENT_SET') return new Set([componentNodeId]);
  return new Set((master.children ?? [])
    .filter((child) => child.type === 'COMPONENT')
    .map((child) => child.id));
}

function containsComponentInstance(root, componentNodeIds) {
  let found = false;
  walk(root, (node) => {
    if (node.type === 'INSTANCE' && componentNodeIds.has(node.componentId)) found = true;
  });
  return found;
}

function containsNode(root, nodeId) {
  let found = false;
  walk(root, (node) => {
    if (node.id === nodeId) found = true;
  });
  return found;
}

function isVisible(node) {
  return node.visible !== false && Number(node.opacity ?? 1) > 0;
}

function isSemanticText(node) {
  if (node.type !== 'TEXT' || !isVisible(node)) return false;
  if (/icon/i.test(node.name ?? '')) return false;
  return /[\p{L}\p{N}]/u.test(String(node.characters ?? ''));
}

function hasAlias(value) {
  if (!value) return false;
  if (Array.isArray(value)) return value.some(hasAlias);
  if (typeof value !== 'object') return false;
  if (value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string') return true;
  return Object.values(value).some(hasAlias);
}

function collectAliasIds(root) {
  const ids = new Set();
  walk(root, (node) => {
    const bindings = node.boundVariables ?? {};
    const visit = (value) => {
      if (!value) return;
      if (Array.isArray(value)) return value.forEach(visit);
      if (typeof value !== 'object') return;
      if (value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string') ids.add(value.id);
      else Object.values(value).forEach(visit);
    };
    visit(bindings);
    for (const field of ['fills', 'strokes']) {
      for (const paint of Array.isArray(node[field]) ? node[field] : []) visit(paint?.boundVariables);
    }
  });
  return ids;
}

function paintHasColorAlias(node, paint, field) {
  if (hasAlias(paint?.boundVariables?.color)) return true;
  const nodeBinding = node.boundVariables?.[field];
  return hasAlias(nodeBinding);
}

function referencedPropertyKeys(root) {
  const references = new Set();
  walk(root, (node) => {
    for (const value of Object.values(node.componentPropertyReferences ?? {})) {
      if (typeof value === 'string') references.add(value);
      else if (Array.isArray(value)) {
        for (const entry of value) if (typeof entry === 'string') references.add(entry);
      }
    }
  });
  return references;
}

function definitionsByName(root) {
  const definitions = new Map();
  for (const [key, definition] of Object.entries(root.componentPropertyDefinitions ?? {})) {
    definitions.set(definition.name ?? propertyName(key), { key, ...definition });
  }
  return definitions;
}

function duplicateDefinitionNames(root) {
  const seen = new Set();
  const duplicates = new Set();
  for (const [key, definition] of Object.entries(root.componentPropertyDefinitions ?? {})) {
    const name = definition.name ?? propertyName(key);
    if (seen.has(name)) duplicates.add(name);
    seen.add(name);
  }
  return [...duplicates].sort();
}

function variantValues(root, name, definition) {
  if (Array.isArray(definition.variantOptions)) return definition.variantOptions;
  const values = [];
  for (const child of root.children ?? []) {
    const value = child.variantProperties?.[name];
    if (value !== undefined) values.push(value);
  }
  return values;
}

function nodeLabel(node) {
  return `${node.name || 'Unnamed'} (${node.id || 'unknown'})`;
}

function auditVisualTree(component, root, fail) {
  const prefix = `[${component.id}]`;
  walk(root, (node) => {
    if (!isVisible(node)) return;

    if (isSemanticText(node) && !node.styles?.text) {
      fail(`${prefix} semantic text ${nodeLabel(node)} has no applied text style`);
    }

    for (const field of ['fills', 'strokes']) {
      if (!Array.isArray(node[field])) continue;
      for (const [index, paint] of node[field].entries()) {
        if (paint?.type !== 'SOLID' || paint.visible === false || Number(paint.opacity ?? 1) === 0) continue;
        if (!paintHasColorAlias(node, paint, field)) {
          fail(`${prefix} ${nodeLabel(node)} ${field}[${index}] uses an unbound solid color`);
        }
      }
    }

    if (node.type === 'COMPONENT_SET') return;
    for (const field of SPACING_FIELDS) {
      const value = node[field];
      if (typeof value !== 'number' || value === 0) continue;
      if (!hasAlias(node.boundVariables?.[field])) {
        fail(`${prefix} ${nodeLabel(node)} ${field}=${value} is not bound to a spacing variable`);
      }
    }
  });
}

function auditLiveNodes({ registry, payload }) {
  const failures = [];
  const fail = (message) => failures.push(message);
  const components = Array.isArray(registry?.components) ? registry.components : [];
  const tokenPolicy = registry?.library?.tokenPolicy ?? {};
  const variableIds = tokenPolicy.componentVariableIds ?? {};
  const allowedVariableIds = new Set(Object.values(variableIds));
  const legacyBindingComponentIds = new Set(tokenPolicy.legacyBindingComponentIds ?? []);

  if (!payload || typeof payload !== 'object' || !payload.nodes) {
    return ['[live] Figma response does not contain a nodes object'];
  }

  for (const component of components) {
    const prefix = `[${component.id ?? 'unknown'}]`;
    const expected = component.figma ?? {};
    const responseNode = payload.nodes[expected.nodeId];
    const root = responseNode?.document;
    if (!root) {
      fail(`${prefix} registered Figma node ${expected.nodeId} is missing from the live response`);
      continue;
    }

    if (root.id !== expected.nodeId) fail(`${prefix} live node id is ${root.id}, expected ${expected.nodeId}`);
    if (root.type !== expected.nodeType) fail(`${prefix} live node type is ${root.type}, expected ${expected.nodeType}`);
    if (root.name !== expected.nodeName) fail(`${prefix} live node name is "${root.name}", expected "${expected.nodeName}"`);

    const mappings = Array.isArray(component.mappings) ? component.mappings : [];
    const definitions = definitionsByName(root);
    const duplicateNames = duplicateDefinitionNames(root);
    if (duplicateNames.length > 0) {
      fail(`${prefix} live component property names are duplicated: ${duplicateNames.join(', ')}`);
    }
    if (!sameSet(definitions.keys(), mappings.map((mapping) => mapping.figmaProperty))) {
      fail(`${prefix} live component property names drifted from registry mappings`);
    }

    for (const mapping of mappings) {
      const definition = definitions.get(mapping.figmaProperty);
      if (!definition) continue;
      const expectedType = FIGMA_TYPE_BY_KIND[mapping.kind];
      if (definition.type !== expectedType) {
        fail(`${prefix} live property "${mapping.figmaProperty}" is ${definition.type}, expected ${expectedType}`);
      }
      if (mapping.kind === 'enum') {
        const actualValues = variantValues(root, mapping.figmaProperty, definition);
        if (!sameSet(actualValues, mapping.values ?? [])) {
          fail(`${prefix} live variant values for "${mapping.figmaProperty}" drifted from the registry`);
        }
      }
    }

    const references = referencedPropertyKeys(root);
    for (const mapping of mappings) {
      if (mapping.kind === 'enum' || mapping.visualBinding === 'nonvisual') continue;
      const definition = definitions.get(mapping.figmaProperty);
      if (definition && !references.has(definition.key)) {
        fail(`${prefix} visual property "${mapping.figmaProperty}" is not referenced by a descendant layer`);
      }
    }

    auditVisualTree(component, root, fail);

    const bindingAudit = expected.tokenBindingAudit;
    if (!legacyBindingComponentIds.has(component.id) && !bindingAudit) {
      fail(`${prefix} new component registration requires figma.tokenBindingAudit`);
    }
    if (bindingAudit) {
      for (const aliasId of collectAliasIds(root)) {
        if (!allowedVariableIds.has(aliasId)) {
          fail(`${prefix} master uses variable ${aliasId} outside the code-parity token collection`);
        }
      }
      const statesById = new Map((expected.stateCoverage?.states ?? []).map((state) => [state.id, state]));
      for (const [stateId, tokens] of Object.entries(bindingAudit.stateRequirements ?? {})) {
        const state = statesById.get(stateId);
        const stateRoot = state ? payload.nodes?.[state.componentNodeId]?.document : null;
        if (!stateRoot) {
          fail(`${prefix} token-binding state ${stateId} has no live component node`);
          continue;
        }
        const aliases = collectAliasIds(stateRoot);
        for (const token of tokens) {
          const variableId = variableIds[token];
          if (!variableId || !aliases.has(variableId)) {
            fail(`${prefix} token-binding state ${stateId} must use ${token}`);
          }
        }
      }
    }

    const presentation = expected.presentationEvidence;
    if (!legacyBindingComponentIds.has(component.id) && !presentation) {
      fail(`${prefix} new component registration requires figma.presentationEvidence`);
    }
    if (presentation) {
      const page = payload.nodes?.[expected.pageId]?.document;
      const referencePage = payload.nodes?.[presentation.referencePageId]?.document;
      if (!page || page.type !== 'CANVAS') fail(`${prefix} documented page ${expected.pageId} is missing or not a page`);
      else if (page.name !== expected.pageName) fail(`${prefix} live page name is "${page.name}", expected "${expected.pageName}"`);
      if (!referencePage || referencePage.name !== presentation.referencePageName) {
        fail(`${prefix} presentation precedent ${presentation.referencePageId} does not match ${presentation.referencePageName}`);
      }
      const roles = ['documentation', 'main', 'interactionStates', 'publishSource'];
      const sections = roles.map((role) => ({ role, evidence: presentation.sections?.[role], node: payload.nodes?.[presentation.sections?.[role]?.nodeId]?.document }));
      for (const { role, evidence, node } of sections) {
        if (!evidence || !node || node.type !== 'SECTION') fail(`${prefix} presentation ${role} section is missing or not a SECTION`);
        else if (!containsNode(page, evidence.nodeId)) fail(`${prefix} presentation ${role} section is not on page ${expected.pageId}`);
      }
      const documentation = sections.find((entry) => entry.role === 'documentation')?.node;
      const main = sections.find((entry) => entry.role === 'main')?.node;
      const interaction = sections.find((entry) => entry.role === 'interactionStates')?.node;
      const publish = sections.find((entry) => entry.role === 'publishSource')?.node;
      if (documentation?.absoluteBoundingBox?.width !== 528) fail(`${prefix} documentation rail must be 528px wide`);
      if (documentation && !/^✅ Ready for Dev \/ 01 • Documentation \/ /.test(documentation.name)) fail(`${prefix} documentation section name drifted from the governed grammar`);
      if (main && !/^✅ Ready for Dev \/ 02 • Main components \/ /.test(main.name)) fail(`${prefix} main section name drifted from the governed grammar`);
      if (interaction && !/^✅ Ready for Dev \/ 03 • Interaction states \/ /.test(interaction.name)) fail(`${prefix} Interaction states section name drifted from the governed grammar`);
      if (publish && !/^Publish source \/ /.test(publish.name)) fail(`${prefix} Publish source section must remain unnumbered`);
      if (publish && !containsNode(publish, expected.nodeId)) fail(`${prefix} Publish source section does not contain master ${expected.nodeId}`);
      const ordered = (page?.children ?? []).map((node) => node.id);
      const numbered = ['documentation', 'main', 'interactionStates'].map((role) => presentation.sections?.[role]?.nodeId);
      if (numbered.some((id, index) => ordered.indexOf(id) < 0 || (index > 0 && ordered.indexOf(id) <= ordered.indexOf(numbered[index - 1])))) {
        fail(`${prefix} numbered documentation sections are not in governed order`);
      }
    }

    const representations = component.sourceParity?.representations ?? [];
    for (const representation of representations) {
      if (representation.masterNodeId) {
        const master = payload.nodes[representation.masterNodeId]?.document;
        if (!master || !['COMPONENT', 'COMPONENT_SET'].includes(master.type)) {
          fail(`${prefix} source-parity decision ${representation.decisionId} master ${representation.masterNodeId} is missing or not a component`);
        }
      }
      for (const specimenMapping of representation.specimens ?? []) {
        const specimen = payload.nodes[specimenMapping.nodeId]?.document;
        if (!specimen) {
          fail(`${prefix} registered source-parity specimen ${specimenMapping.nodeId} is missing from the live response`);
          continue;
        }
        const actualWidth = specimen.absoluteBoundingBox?.width;
        if (actualWidth !== specimenMapping.viewportWidth) {
          fail(`${prefix} source-parity specimen ${specimenMapping.nodeId} width is ${actualWidth}, expected ${specimenMapping.viewportWidth}`);
        }
        const componentNodeIds = instantiableComponentIds(payload, specimenMapping.componentNodeId);
        if (!containsComponentInstance(specimen, componentNodeIds)) {
          fail(`${prefix} source-parity specimen ${specimenMapping.nodeId} does not contain an instance of ${specimenMapping.componentNodeId}`);
        }
      }
    }

    const stateCoverage = expected.stateCoverage;
    if (stateCoverage?.status === 'covered') {
      for (const state of stateCoverage.states ?? []) {
        if (state.classification === 'runtime-only') continue;
        const statePrefix = `${prefix} interaction state ${state.id}`;
        const frame = payload.nodes[state.frameNodeId]?.document;
        const instance = payload.nodes[state.instanceNodeId]?.document;
        const stateComponent = payload.nodes[state.componentNodeId]?.document;
        if (!frame || frame.type !== 'FRAME') {
          fail(`${statePrefix} frame ${state.frameNodeId} is missing or not a FRAME`);
          continue;
        }
        if (!instance || instance.type !== 'INSTANCE') {
          fail(`${statePrefix} instance ${state.instanceNodeId} is missing or not an INSTANCE`);
          continue;
        }
        if (!stateComponent || stateComponent.type !== 'COMPONENT') {
          fail(`${statePrefix} component ${state.componentNodeId} is missing or not a COMPONENT`);
        }
        if (instance.componentId !== state.componentNodeId) {
          fail(`${statePrefix} instance ${state.instanceNodeId} is connected to ${instance.componentId}, expected ${state.componentNodeId}`);
        }
        if (!containsNode(frame, state.instanceNodeId)) {
          fail(`${statePrefix} frame ${state.frameNodeId} does not contain instance ${state.instanceNodeId}`);
        }
      }
    }
  }

  return failures;
}

async function fetchLiveNodes({ registry, token, fetchImpl = fetch }) {
  const fileKey = registry.library?.fileKey;
  const ids = sorted(registry.components.flatMap((component) => [
    component.figma.nodeId,
    component.figma.pageId,
    component.figma.presentationEvidence?.referencePageId,
    ...Object.values(component.figma.presentationEvidence?.sections ?? {}).map((section) => section.nodeId),
    ...(component.sourceParity?.representations ?? []).flatMap((representation) => [
      representation.masterNodeId,
      ...(representation.specimens ?? []).map((specimen) => specimen.nodeId),
    ]).filter(Boolean),
    ...(component.figma?.stateCoverage?.states ?? []).flatMap((state) => [
      state.frameNodeId,
      state.instanceNodeId,
      state.componentNodeId,
    ]).filter(Boolean),
  ]).filter(Boolean)).join(',');
  const url = new URL(`${FIGMA_API}/files/${encodeURIComponent(fileKey)}/nodes`);
  url.searchParams.set('ids', ids);

  const response = await fetchImpl(url, {
    headers: {
      Accept: 'application/json',
      'X-Figma-Token': token,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Figma REST request failed (${response.status}): ${body.slice(0, 500)}`);
  }
  return response.json();
}

async function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const token = process.env.FIGMA_REST_TOKEN;
  const optional = process.argv.includes('--if-token');

  if (!token) {
    if (optional) {
      console.log('Live Figma audit skipped: FIGMA_REST_TOKEN is not configured.');
      return;
    }
    throw new Error('FIGMA_REST_TOKEN is required for the live Figma audit.');
  }

  const payload = await fetchLiveNodes({ registry, token });
  const failures = auditLiveNodes({ registry, payload });
  if (failures.length > 0) {
    console.error(`Live Figma audit failed (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`Live Figma audit passed (${registry.components.length} registered nodes).`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Live Figma audit failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  auditLiveNodes,
  collectAliasIds,
  containsNode,
  duplicateDefinitionNames,
  fetchLiveNodes,
  hasAlias,
  isSemanticText,
  propertyName,
};
