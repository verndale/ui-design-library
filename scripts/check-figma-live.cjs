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

function propertyIdentity(name) {
  return propertyName(name).toLowerCase().replace(/[^a-z0-9]+/g, '');
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
    const liveName = definition.name ?? propertyName(key);
    definitions.set(propertyIdentity(liveName), { key, liveName, ...definition });
  }
  return definitions;
}

function duplicateDefinitionNames(root) {
  const seen = new Map();
  const duplicates = new Set();
  for (const [key, definition] of Object.entries(root.componentPropertyDefinitions ?? {})) {
    const name = definition.name ?? propertyName(key);
    const identity = propertyIdentity(name);
    if (seen.has(identity)) duplicates.add(seen.get(identity));
    else seen.set(identity, name);
  }
  return [...duplicates].sort();
}

function variantValues(root, definition) {
  if (Array.isArray(definition.variantOptions)) return definition.variantOptions;
  const values = [];
  for (const child of root.children ?? []) {
    const value = child.variantProperties?.[definition.liveName];
    if (value !== undefined) values.push(value);
  }
  return values;
}

function nodeLabel(node) {
  return `${node.name || 'Unnamed'} (${node.id || 'unknown'})`;
}

function directChild(root, name, type) {
  return (root?.children ?? []).find((node) => node.name === name && (!type || node.type === type));
}

function childNames(root) {
  return (root?.children ?? []).map((node) => node.name);
}

function boxValue(node, field) {
  return node?.absoluteBoundingBox?.[field];
}

function relativeBoxValue(node, parent, field) {
  const value = boxValue(node, field);
  const parentValue = boxValue(parent, field);
  return typeof value === 'number' && typeof parentValue === 'number' ? value - parentValue : undefined;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function sectionAppearance(node) {
  return stableValue({
    fills: node?.fills ?? [],
    strokes: node?.strokes ?? [],
    strokeWeight: node?.strokeWeight,
    cornerRadius: node?.cornerRadius,
  });
}

function auditSectionAppearance({ prefix, role, section, reference, fail }) {
  if (!reference || reference.type !== 'SECTION') {
    fail(`${prefix} ${role} appearance reference is missing or not a SECTION`);
    return;
  }
  if (JSON.stringify(sectionAppearance(section)) !== JSON.stringify(sectionAppearance(reference))) {
    fail(`${prefix} ${role} section appearance drifted from the governed live precedent`);
  }
}

function auditDescendantContainment({ prefix, role, root, fail }) {
  const tolerance = 0.5;
  const visit = (parent) => {
    const parentBox = parent?.absoluteBoundingBox;
    if (!parentBox || !Array.isArray(parent.children)) return;
    for (const child of parent.children) {
      const childBox = child?.absoluteBoundingBox;
      if (childBox && isVisible(child)) {
        if (childBox.x < parentBox.x - tolerance || childBox.y < parentBox.y - tolerance ||
            childBox.x + childBox.width > parentBox.x + parentBox.width + tolerance ||
            childBox.y + childBox.height > parentBox.y + parentBox.height + tolerance) {
          fail(`${prefix} ${role} child ${nodeLabel(child)} overflows ${nodeLabel(parent)}`);
        }
      }
      if (!['INSTANCE', 'COMPONENT', 'COMPONENT_SET'].includes(child.type)) visit(child);
    }
  };
  visit(root);
}

function auditComponentPage({ component, expected, presentation, payload, contract, fail }) {
  const prefix = `[${component.id}]`;
  if (!contract) {
    fail(`${prefix} live response is missing the component-page machine contract`);
    return;
  }

  const pageOrder = payload.pageOrder ?? [];
  const startIndex = pageOrder.findIndex((page) => page.id === contract.groupStartPageId && page.name === contract.groupStartPageName);
  const endIndex = pageOrder.findIndex((page) => page.id === contract.groupEndPageId && page.name === contract.groupEndPageName);
  const pageIndex = pageOrder.findIndex((page) => page.id === expected.pageId && page.name === expected.pageName);
  if (startIndex < 0 || endIndex <= startIndex) {
    fail(`${prefix} Components group boundary pages are missing or out of order`);
  } else if (pageIndex <= startIndex || pageIndex >= endIndex) {
    fail(`${prefix} page ${expected.pageName} is not inside the governed Components group`);
  }

  const page = payload.nodes?.[expected.pageId]?.document;
  if (!page) return;
  const roles = ['documentation', 'main', 'interactionStates', 'publishSource'];
  const sections = Object.fromEntries(roles.map((role) => [role, payload.nodes?.[presentation.sections?.[role]?.nodeId]?.document]));
  for (const role of roles) {
    if (sections[role] && !(page.children ?? []).some((node) => node.id === sections[role].id)) {
      fail(`${prefix} ${role} section must be a direct child of page ${expected.pageId}`);
    }
  }

  const documentation = sections.documentation;
  const main = sections.main;
  const interaction = sections.interactionStates;
  const publish = sections.publishSource;
  const documentationContract = contract.documentation;
  const presentationContract = contract.presentation;
  const referenceSections = Object.fromEntries(roles.map((role) => [
    role,
    payload.nodes?.[contract.referenceSectionIds?.[role]]?.document,
  ]));

  for (const role of roles) {
    if (sections[role]) auditSectionAppearance({ prefix, role, section: sections[role], reference: referenceSections[role], fail });
  }

  if (documentation) {
    if (documentation.name !== `✅ Ready for Dev / 01 • Documentation / ${expected.pageName}`) {
      fail(`${prefix} documentation section name must exactly match the governed component template`);
    }
    if (boxValue(documentation, 'x') !== documentationContract.sectionX ||
        boxValue(documentation, 'y') !== documentationContract.sectionY ||
        boxValue(documentation, 'width') !== documentationContract.sectionWidth) {
      fail(`${prefix} documentation rail geometry drifted from the governed component template`);
    }
    const frame = directChild(documentation, `Documentation / ${expected.pageName}`, 'FRAME');
    if (!frame) fail(`${prefix} documentation rail is missing its canonical template frame`);
    else {
      if (relativeBoxValue(frame, documentation, 'x') !== documentationContract.frameX ||
          relativeBoxValue(frame, documentation, 'y') !== documentationContract.frameY ||
          boxValue(frame, 'width') !== documentationContract.frameWidth) {
        fail(`${prefix} documentation template frame geometry drifted`);
      }
      if (JSON.stringify(childNames(frame)) !== JSON.stringify(documentationContract.requiredChildren)) {
        fail(`${prefix} documentation template children must exactly match Button Light`);
      }
      const properties = directChild(frame, 'Properties', 'FRAME');
      if (!properties || (properties.children ?? []).length !== documentationContract.propertyRows ||
          (properties.children ?? []).some((row) => row.type !== 'FRAME' || !directChild(row, 'Property', 'TEXT') || !directChild(row, 'Values', 'TEXT'))) {
        fail(`${prefix} documentation properties must contain exactly ${documentationContract.propertyRows} governed rows`);
      }
    }
  }

  if (main) {
    if (main.name !== `✅ Ready for Dev / 02 • Main components / ${expected.pageName}`) {
      fail(`${prefix} main section name must exactly match the governed component template`);
    }
    if (boxValue(main, 'x') !== presentationContract.mainX ||
        boxValue(main, 'y') !== presentationContract.mainY ||
        boxValue(main, 'width') < presentationContract.minimumWidth) {
      fail(`${prefix} main section geometry drifted from the governed component template`);
    }
    const frame = directChild(main, `Main components / ${expected.pageName}`, 'FRAME');
    if (!frame) fail(`${prefix} main section is missing its canonical template frame`);
    else {
      if (relativeBoxValue(frame, main, 'x') !== presentationContract.frameX ||
          relativeBoxValue(frame, main, 'y') !== presentationContract.frameY ||
          boxValue(frame, 'width') !== boxValue(main, 'width') - presentationContract.frameHorizontalInset) {
        fail(`${prefix} main template frame geometry drifted`);
      }
      const expectedChildren = ['Eyebrow', 'Title', 'Description', 'Variant badge', `Responsive specimens / ${expected.pageName}`];
      if (JSON.stringify(childNames(frame)) !== JSON.stringify(expectedChildren)) {
        fail(`${prefix} main template children drifted from the governed component standard`);
      }
      auditDescendantContainment({ prefix, role: 'main', root: frame, fail });
    }
  }

  if (interaction && main) {
    if (interaction.name !== `✅ Ready for Dev / 03 • Interaction states / ${expected.pageName}`) {
      fail(`${prefix} interaction section name must exactly match the governed component template`);
    }
    if (boxValue(interaction, 'x') !== boxValue(main, 'x') ||
        boxValue(interaction, 'y') !== boxValue(main, 'y') + boxValue(main, 'height') + presentationContract.interactionGap ||
        boxValue(interaction, 'width') !== boxValue(main, 'width')) {
      fail(`${prefix} interaction section geometry drifted from the governed component template`);
    }
    const frame = directChild(interaction, `Interaction states / ${expected.pageName}`, 'FRAME');
    if (!frame) fail(`${prefix} interaction section is missing its canonical template frame`);
    else {
      if (relativeBoxValue(frame, interaction, 'x') !== presentationContract.frameX ||
          relativeBoxValue(frame, interaction, 'y') !== presentationContract.frameY ||
          boxValue(frame, 'width') !== boxValue(interaction, 'width') - presentationContract.frameHorizontalInset) {
        fail(`${prefix} interaction template frame geometry drifted`);
      }
      const expectedChildren = ['Header / Interaction states', `State matrices / ${expected.pageName}`];
      if (JSON.stringify(childNames(frame)) !== JSON.stringify(expectedChildren)) {
        fail(`${prefix} interaction template children drifted from the governed component standard`);
      }
      const header = directChild(frame, 'Header / Interaction states', 'FRAME');
      if (!header || JSON.stringify(childNames(header)) !== JSON.stringify(['Title', 'Description'])) {
        fail(`${prefix} interaction header must contain only Title and Description`);
      }
      auditDescendantContainment({ prefix, role: 'interaction', root: frame, fail });
    }
  }

  if (publish && main) {
    if (publish.name !== `Publish source / ${expected.pageName}`) {
      fail(`${prefix} publish-source section name must exactly match the governed component template`);
    }
    if (boxValue(publish, 'x') !== boxValue(main, 'x') + boxValue(main, 'width') + presentationContract.publishGap ||
        boxValue(publish, 'y') !== 0 || boxValue(publish, 'width') !== presentationContract.publishWidth) {
      fail(`${prefix} publish-source section geometry drifted from the governed component template`);
    }
    const master = (publish.children ?? []).find((node) => node.id === expected.nodeId);
    if (!master || publish.children.length !== 1) {
      fail(`${prefix} publish-source section must contain only the direct canonical master`);
    } else {
      if (relativeBoxValue(master, publish, 'x') !== presentationContract.masterX ||
          relativeBoxValue(master, publish, 'y') !== presentationContract.masterY) {
        fail(`${prefix} canonical master inset drifted from the governed component template`);
      }
      if (master.type === 'COMPONENT_SET' && (master.layoutMode !== 'HORIZONTAL' || master.layoutWrap !== 'WRAP' ||
          master.itemSpacing !== presentationContract.masterGap || master.counterAxisSpacing !== presentationContract.masterGap ||
          ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].some((field) => master[field] !== presentationContract.masterPadding))) {
        fail(`${prefix} component-set publish source must use the governed wrapped 24px master grid`);
      }
    }
  }
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
    if (!sameSet(definitions.keys(), mappings.map((mapping) => propertyIdentity(mapping.figmaProperty)))) {
      fail(`${prefix} live component property names drifted from registry mappings`);
    }

    for (const mapping of mappings) {
      const definition = definitions.get(propertyIdentity(mapping.figmaProperty));
      if (!definition) continue;
      const expectedType = FIGMA_TYPE_BY_KIND[mapping.kind];
      if (definition.type !== expectedType) {
        fail(`${prefix} live property "${mapping.figmaProperty}" is ${definition.type}, expected ${expectedType}`);
      }
      if (mapping.kind === 'enum') {
        const actualValues = variantValues(root, definition);
        if (!sameSet(actualValues, mapping.values ?? [])) {
          fail(`${prefix} live variant values for "${mapping.figmaProperty}" drifted from the registry`);
        }
      }
    }

    const references = referencedPropertyKeys(root);
    for (const mapping of mappings) {
      if (mapping.kind === 'enum' || mapping.visualBinding === 'nonvisual') continue;
      const definition = definitions.get(propertyIdentity(mapping.figmaProperty));
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
      auditComponentPage({
        component,
        expected,
        presentation,
        payload,
        contract: registry.library?.promotionPattern?.componentPage,
        fail,
      });
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
  const componentPage = registry.library?.promotionPattern?.componentPage;
  const ids = sorted([
    componentPage?.referencePageId,
    ...Object.values(componentPage?.referenceSectionIds ?? {}),
    ...registry.components.flatMap((component) => [
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
    ]),
  ].filter(Boolean)).join(',');
  const url = new URL(`${FIGMA_API}/files/${encodeURIComponent(fileKey)}/nodes`);
  url.searchParams.set('ids', ids);

  const request = {
    headers: {
      Accept: 'application/json',
      'X-Figma-Token': token,
    },
  };
  const fileUrl = new URL(`${FIGMA_API}/files/${encodeURIComponent(fileKey)}`);
  fileUrl.searchParams.set('depth', '1');
  const [response, fileResponse] = await Promise.all([
    fetchImpl(url, request),
    fetchImpl(fileUrl, request),
  ]);
  for (const candidate of [response, fileResponse]) {
    if (!candidate.ok) {
      const body = await candidate.text();
      throw new Error(`Figma REST request failed (${candidate.status}): ${body.slice(0, 500)}`);
    }
  }
  const [payload, file] = await Promise.all([response.json(), fileResponse.json()]);
  payload.pageOrder = (file.document?.children ?? [])
    .filter((node) => node.type === 'CANVAS')
    .map((node) => ({ id: node.id, name: node.name }));
  return payload;
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
  propertyIdentity,
};
