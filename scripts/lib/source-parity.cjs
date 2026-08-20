'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const CONTRACT_VERSION = 1;
const INITIAL_COMPONENT_KEYS = [
  'accordion',
  'alert',
  'avatar',
  'badge',
  'breadcrumbs',
  'button',
  'card',
  'carousel',
  'image',
  'in-page-navigation',
  'link',
  'modal',
  'quote',
  'rich-text',
  'search-input',
  'search-overlay',
  'section-header',
  'slider',
  'stat',
  'tabs',
  'toast',
];
const REPRESENTATION_SURFACES = ['ai-registry', 'code', 'figma', 'storybook'];
const STATUSES = ['cleared', 'remediation-pending'];
const SOURCE_PARITY_KEYS = [
  'auditComponentKey',
  'auditStatus',
  'contractVersion',
  'decisionIds',
  'privateAuditDigest',
  'privateAuditRef',
  'representationDecisions',
  'requiredRepresentationSurfaces',
];
const FIGMA_REPRESENTATION_KINDS = [
  'component-property',
  'component-property-responsive',
  'nonvisual-metadata',
  'responsive-specimens',
  'structural-master',
  'structural-master-responsive',
];
const SOURCE_PARITY_VIEWPORT_WIDTHS = [1440, 1024, 768, 390];

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function sameSet(left, right) {
  return JSON.stringify(sortedUnique(left)) === JSON.stringify(sortedUnique(right));
}

function loadBaseline(root) {
  const baselinePath = path.join(root, 'figma/source-parity-baseline.json');
  return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
}

function validateBaseline(baseline, componentKeys, fail) {
  if (!baseline || typeof baseline !== 'object' || Array.isArray(baseline)) {
    fail('[source-parity] figma/source-parity-baseline.json must contain an object');
    return;
  }
  if (baseline.schemaVersion !== 1) fail('[source-parity] baseline schemaVersion must equal 1');
  if (baseline.contractVersion !== CONTRACT_VERSION) {
    fail(`[source-parity] baseline contractVersion must equal ${CONTRACT_VERSION}`);
  }
  if (!Array.isArray(baseline.initialKeys) || !sameSet(baseline.initialKeys, INITIAL_COMPONENT_KEYS)) {
    fail('[source-parity] baseline initialKeys must preserve the immutable 21-component migration set');
  }
  if (!Array.isArray(baseline.remainingKeys)) {
    fail('[source-parity] baseline remainingKeys must be an array');
    return;
  }
  if (baseline.remainingKeys.length !== new Set(baseline.remainingKeys).size) {
    fail('[source-parity] baseline remainingKeys must be unique');
  }
  for (const key of baseline.remainingKeys) {
    if (!INITIAL_COMPONENT_KEYS.includes(key)) {
      fail(`[source-parity] baseline remaining key "${key}" was not in the immutable migration set`);
    }
  }
  for (const key of componentKeys) {
    if (!INITIAL_COMPONENT_KEYS.includes(key) && baseline.remainingKeys.includes(key)) {
      fail(`[source-parity] new component "${key}" cannot be added to the legacy baseline`);
    }
  }
}

function validateCommonEvidence(evidence, componentKey, label, fail) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    fail(`[source-parity] ${label} is missing source-parity evidence`);
    return false;
  }
  const actualKeys = Object.keys(evidence).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(SOURCE_PARITY_KEYS)) {
    fail(`[source-parity] ${label} keys must be exactly ${SOURCE_PARITY_KEYS.join(', ')}`);
  }
  if (evidence.contractVersion !== CONTRACT_VERSION) {
    fail(`[source-parity] ${label} contractVersion must equal ${CONTRACT_VERSION}`);
  }
  if (!STATUSES.includes(evidence.auditStatus)) {
    fail(`[source-parity] ${label} auditStatus must be cleared or remediation-pending`);
  }
  const auditComponentKey = evidence.auditComponentKey;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(auditComponentKey ?? '')) {
    fail(`[source-parity] ${label} auditComponentKey must be a canonical component key`);
  } else if (auditComponentKey !== componentKey && !componentKey.startsWith(`${auditComponentKey}--`)) {
    fail(`[source-parity] ${label} may inherit audit identity only from its structural family key`);
  }
  const escapedKey = String(auditComponentKey ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const auditRefPattern = new RegExp(
    `^library-source-parity:[0-9]{4}-[0-9]{2}-[0-9]{2}/components/${escapedKey}$`,
  );
  if (!auditRefPattern.test(evidence.privateAuditRef ?? '')) {
    fail(
      `[source-parity] ${label} privateAuditRef must use a dated stable private audit identifier for ${auditComponentKey}`,
    );
  }
  if (!/^[0-9a-f]{64}$/.test(evidence.privateAuditDigest ?? '')) {
    fail(`[source-parity] ${label} privateAuditDigest must be a lowercase SHA-256 digest`);
  }
  if (!Array.isArray(evidence.decisionIds) || evidence.decisionIds.length === 0) {
    fail(`[source-parity] ${label} decisionIds must be a non-empty array`);
  } else {
    if (evidence.decisionIds.length !== new Set(evidence.decisionIds).size) {
      fail(`[source-parity] ${label} decisionIds must be unique`);
    }
    for (const id of evidence.decisionIds) {
      const prefix = `sp-${auditComponentKey}-`;
      if (typeof id !== 'string' || !id.startsWith(prefix) || !/^[0-9]{3}$/.test(id.slice(prefix.length))) {
        fail(`[source-parity] ${label} decision id "${id}" does not belong to ${auditComponentKey}`);
      }
    }
  }
  if (!Array.isArray(evidence.representationDecisions)) {
    fail(`[source-parity] ${label} representationDecisions must be an array`);
  } else {
    const representedIds = [];
    const representedSurfaces = [];
    for (const decision of evidence.representationDecisions) {
      if (!decision || typeof decision !== 'object' || Array.isArray(decision) ||
        JSON.stringify(Object.keys(decision).sort()) !== JSON.stringify(['decisionId', 'implementationKey', 'surfaces'])) {
        fail(`[source-parity] ${label} representation decisions require exactly decisionId, implementationKey, and surfaces`);
        continue;
      }
      representedIds.push(decision.decisionId);
      if (!evidence.decisionIds?.includes(decision.decisionId)) {
        fail(`[source-parity] ${label} representation decision ${decision.decisionId} is absent from decisionIds`);
      }
      if (decision.implementationKey !== null &&
        (typeof decision.implementationKey !== 'string' ||
          (decision.implementationKey !== auditComponentKey &&
            !decision.implementationKey.startsWith(`${auditComponentKey}--`)))) {
        fail(`[source-parity] ${label} representation decision ${decision.decisionId} must target its audited family or remain null while grandfathered`);
      }
      if (!Array.isArray(decision.surfaces) || decision.surfaces.length === 0 ||
        decision.surfaces.length !== new Set(decision.surfaces).size ||
        decision.surfaces.some((surface) => !REPRESENTATION_SURFACES.includes(surface))) {
        fail(`[source-parity] ${label} representation decision ${decision.decisionId} has invalid surfaces`);
      } else representedSurfaces.push(...decision.surfaces);
    }
    if (representedIds.length !== new Set(representedIds).size) {
      fail(`[source-parity] ${label} representation decision IDs must be unique`);
    }
    if (!sameSet(representedSurfaces, evidence.requiredRepresentationSurfaces ?? [])) {
      fail(`[source-parity] ${label} requiredRepresentationSurfaces must equal the representation decision surface union`);
    }
  }
  if (!Array.isArray(evidence.requiredRepresentationSurfaces)) {
    fail(`[source-parity] ${label} requiredRepresentationSurfaces must be an array`);
  } else {
    if (evidence.requiredRepresentationSurfaces.length !== new Set(evidence.requiredRepresentationSurfaces).size) {
      fail(`[source-parity] ${label} requiredRepresentationSurfaces must be unique`);
    }
    for (const surface of evidence.requiredRepresentationSurfaces) {
      if (!REPRESENTATION_SURFACES.includes(surface)) {
        fail(`[source-parity] ${label} representation surface "${surface}" is not governed`);
      }
    }
    if (evidence.auditStatus === 'remediation-pending' && evidence.requiredRepresentationSurfaces.length === 0) {
      fail(`[source-parity] ${label} remediation-pending evidence must declare target representation surfaces`);
    }
  }
  return true;
}

function validateManifestSourceParity(manifest, componentKey, baseline, fail) {
  const label = `components/${componentKey}/component.json`;
  if (!validateCommonEvidence(manifest.sourceParity, componentKey, label, fail)) return;
  const remaining = baseline.remainingKeys.includes(manifest.sourceParity.auditComponentKey);
  if (manifest.sourceParity.auditStatus === 'remediation-pending' && !remaining) {
    fail(`[source-parity] ${label} is remediation-pending but is absent from baseline remainingKeys`);
  }
  if (manifest.sourceParity.auditStatus === 'cleared' && remaining) {
    fail(`[source-parity] ${label} is cleared but remains in the migration baseline`);
  }
  if (!remaining && manifest.sourceParity.representationDecisions.some((decision) => decision.implementationKey === null)) {
    fail(`[source-parity] ${label} cannot leave the baseline with an unresolved representation implementationKey`);
  }
}

function validateImplementationTargets(records, baseline, fail) {
  const byKey = new Map(records.map((record) => [record.componentKey, record.evidence]));
  const byAudit = new Map();
  for (const record of records) {
    const auditKey = record.evidence.auditComponentKey;
    if (!byAudit.has(auditKey)) byAudit.set(auditKey, []);
    byAudit.get(auditKey).push(record);
  }
  for (const [auditKey, family] of byAudit) {
    for (const record of family.slice(1)) {
      compareEvidence(
        record.evidence,
        family[0].evidence,
        `components/${record.componentKey}/component.json audited family ${auditKey}`,
        fail,
      );
    }
    const remaining = baseline.remainingKeys.includes(auditKey);
    for (const decision of family[0].evidence.representationDecisions) {
      if (decision.implementationKey === null) {
        if (!remaining) {
          fail(`[source-parity] decision ${decision.decisionId} has no implementation target outside the migration baseline`);
        }
        continue;
      }
      const target = byKey.get(decision.implementationKey);
      if (!target) {
        fail(`[source-parity] decision ${decision.decisionId} targets missing components/${decision.implementationKey}`);
      } else if (target.auditComponentKey !== auditKey) {
        fail(`[source-parity] decision ${decision.decisionId} target must inherit audit identity ${auditKey}`);
      }
    }
  }
}

function unwrapExpression(node) {
  let current = node;
  while (current && (ts.isSatisfiesExpression(current) || ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) || ts.isParenthesizedExpression(current))) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return null;
}

function objectProperty(object, name) {
  if (!object || !ts.isObjectLiteralExpression(object)) return null;
  const property = object.properties.find((entry) =>
    ts.isPropertyAssignment(entry) && propertyName(entry.name) === name);
  return property ? unwrapExpression(property.initializer) : null;
}

function literalValue(node) {
  const value = unwrapExpression(node);
  if (!value) return undefined;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (value.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(value)) {
    const entries = value.elements.map(literalValue);
    return entries.some((entry) => entry === undefined) ? undefined : entries;
  }
  if (ts.isObjectLiteralExpression(value)) {
    const result = {};
    for (const property of value.properties) {
      if (!ts.isPropertyAssignment(property)) return undefined;
      const name = propertyName(property.name);
      const entry = literalValue(property.initializer);
      if (name === null || entry === undefined) return undefined;
      result[name] = entry;
    }
    return result;
  }
  return undefined;
}

function parseStoryEvidence(source) {
  const file = ts.createSourceFile('component.stories.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = new Map();
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) declarations.set(declaration.name.text, declaration.initializer);
    }
  }
  const exported = file.statements.find((statement) => ts.isExportAssignment(statement) && !statement.isExportEquals);
  if (!exported) return null;
  let meta = unwrapExpression(exported.expression);
  if (ts.isIdentifier(meta)) meta = unwrapExpression(declarations.get(meta.text));
  const parameters = objectProperty(meta, 'parameters');
  const evidence = objectProperty(parameters, 'sourceParityEvidence');
  const parsed = literalValue(evidence);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
}

function compareEvidence(actual, expected, label, fail) {
  if (!actual) {
    fail(`[source-parity] ${label} is missing parameters.sourceParityEvidence`);
    return;
  }
  for (const field of ['contractVersion', 'auditComponentKey', 'auditStatus', 'privateAuditRef', 'privateAuditDigest']) {
    if (actual[field] !== expected[field]) {
      fail(`[source-parity] ${label} ${field} must match component.json`);
    }
  }
  for (const field of ['decisionIds', 'requiredRepresentationSurfaces']) {
    if (!Array.isArray(actual[field]) || !sameSet(actual[field], expected[field])) {
      fail(`[source-parity] ${label} ${field} must match component.json`);
    }
  }
  if (JSON.stringify(actual.representationDecisions) !== JSON.stringify(expected.representationDecisions)) {
    fail(`[source-parity] ${label} representationDecisions must match component.json in stable order`);
  }
}

function validateStorySourceParity(source, manifest, componentKey, storyPath, fail) {
  const parsed = parseStoryEvidence(source);
  if (parsed) validateCommonEvidence(parsed, componentKey, storyPath, fail);
  compareEvidence(parsed, manifest.sourceParity, storyPath, fail);
}

function validateRegistrationSourceParity(registration, manifest, componentKey, baseline, fail) {
  const label = `Figma registration ${registration.id ?? 'unknown'}`;
  const evidence = registration.sourceParity;
  const commonEvidence = evidence && typeof evidence === 'object' && !Array.isArray(evidence)
    ? Object.fromEntries(Object.entries(evidence).filter(([key]) => key !== 'representations'))
    : evidence;
  if (!validateCommonEvidence(commonEvidence, componentKey, label, fail)) return;
  compareEvidence(commonEvidence, manifest.sourceParity, label, fail);
  if (!Array.isArray(evidence.representations)) {
    fail(`[source-parity] ${label} representations must be an array`);
    return;
  }
  const figmaDecisionIds = manifest.sourceParity.representationDecisions
    .filter((decision) => decision.surfaces.includes('figma') && decision.implementationKey === componentKey)
    .map((decision) => decision.decisionId);
  const representationDecisionIds = evidence.representations.map((entry) => entry?.decisionId);
  if (representationDecisionIds.length !== new Set(representationDecisionIds).size ||
    representationDecisionIds.length !== figmaDecisionIds.length ||
    !sameSet(representationDecisionIds, figmaDecisionIds)) {
    fail(`[source-parity] ${label} representations must cover every Figma-targeted decision exactly once`);
  }
  const remaining = baseline.remainingKeys.includes(manifest.sourceParity.auditComponentKey);
  const specimenNodeIds = new Set();
  for (const representation of evidence.representations) {
    if (!representation || typeof representation !== 'object' || Array.isArray(representation) ||
      JSON.stringify(Object.keys(representation).sort()) !==
        JSON.stringify(['decisionId', 'kind', 'masterNodeId', 'publicProps', 'specimens'])) {
      fail(`[source-parity] ${label} representation entries require decisionId, kind, masterNodeId, publicProps, and specimens`);
      continue;
    }
    if (!FIGMA_REPRESENTATION_KINDS.includes(representation.kind)) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} has an invalid kind`);
    }
    if (representation.masterNodeId !== null && !/^[0-9]+:[0-9]+$/.test(representation.masterNodeId ?? '')) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} masterNodeId must be a Figma node id or null`);
    }
    if (!Array.isArray(representation.publicProps) ||
      representation.publicProps.length !== new Set(representation.publicProps).size ||
      representation.publicProps.some((entry) => typeof entry !== 'string' || !entry.trim())) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} publicProps must be unique non-empty strings`);
    }
    if (!Array.isArray(representation.specimens)) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} specimens must be an array`);
      continue;
    }
    const nodeIds = new Set();
    const widths = new Set();
    for (const specimen of representation.specimens) {
      if (!specimen || typeof specimen !== 'object' || Array.isArray(specimen) ||
        JSON.stringify(Object.keys(specimen).sort()) !== JSON.stringify(['componentNodeId', 'nodeId', 'viewportWidth']) ||
        !/^[0-9]+:[0-9]+$/.test(specimen.nodeId ?? '') ||
        !/^[0-9]+:[0-9]+$/.test(specimen.componentNodeId ?? '') ||
        !SOURCE_PARITY_VIEWPORT_WIDTHS.includes(specimen.viewportWidth)) {
        fail(`[source-parity] ${label} representation ${representation.decisionId} has an invalid specimen mapping`);
        continue;
      }
      if (nodeIds.has(specimen.nodeId) || widths.has(specimen.viewportWidth)) {
        fail(`[source-parity] ${label} representation ${representation.decisionId} specimens must have unique nodes and widths`);
      }
      if (specimenNodeIds.has(specimen.nodeId)) {
        fail(`[source-parity] ${label} specimen ${specimen.nodeId} cannot represent more than one decision`);
      }
      nodeIds.add(specimen.nodeId);
      widths.add(specimen.viewportWidth);
      specimenNodeIds.add(specimen.nodeId);
      if (representation.masterNodeId && specimen.componentNodeId !== representation.masterNodeId) {
        fail(`[source-parity] ${label} representation ${representation.decisionId} specimen must instantiate its declared master`);
      }
    }
    if (remaining) continue;
    const responsive = [
      'component-property-responsive', 'responsive-specimens', 'structural-master-responsive',
    ].includes(representation.kind);
    const propertyBacked = ['component-property', 'component-property-responsive', 'nonvisual-metadata'].includes(representation.kind);
    const publicProps = new Set((manifest.realization?.props ?? []).map((prop) => String(prop.path).split('.')[0]));
    const mappings = new Map((registration.mappings ?? []).map((mapping) => [mapping.codeProp, mapping]));
    if (propertyBacked && representation.publicProps.length === 0) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} requires at least one public prop after remediation`);
    }
    if (!propertyBacked && representation.publicProps.length > 0) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} cannot claim public props for this representation kind`);
    }
    for (const prop of representation.publicProps) {
      if (!publicProps.has(prop)) {
        fail(`[source-parity] ${label} public prop "${prop}" is absent from the realization contract`);
      }
      if (!mappings.has(prop)) {
        fail(`[source-parity] ${label} public prop "${prop}" has no Figma property mapping`);
      } else if (representation.kind === 'nonvisual-metadata' && mappings.get(prop).visualBinding !== 'nonvisual') {
        fail(`[source-parity] ${label} nonvisual public prop "${prop}" must use a nonvisual Figma mapping`);
      }
    }
    if (representation.kind === 'nonvisual-metadata') {
      if (representation.masterNodeId !== null || representation.specimens.length > 0) {
        fail(`[source-parity] ${label} nonvisual metadata requires named public props and no visual master/specimens`);
      }
    } else if (!representation.masterNodeId) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} requires a registered master after remediation`);
    } else if (representation.masterNodeId !== registration.figma?.nodeId) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} master must equal its registered Figma master`);
    }
    if (responsive && !sameSet([...widths], SOURCE_PARITY_VIEWPORT_WIDTHS)) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} requires mapped 1440, 1024, 768, and 390 specimens`);
    }
    if (!responsive && representation.specimens.length > 0) {
      fail(`[source-parity] ${label} representation ${representation.decisionId} is non-responsive and cannot register viewport specimens`);
    }
  }
}

module.exports = {
  CONTRACT_VERSION,
  INITIAL_COMPONENT_KEYS,
  REPRESENTATION_SURFACES,
  SOURCE_PARITY_VIEWPORT_WIDTHS,
  compareEvidence,
  loadBaseline,
  parseStoryEvidence,
  sameSet,
  validateBaseline,
  validateImplementationTargets,
  validateManifestSourceParity,
  validateRegistrationSourceParity,
  validateStorySourceParity,
};
