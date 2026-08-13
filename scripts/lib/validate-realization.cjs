'use strict';

const PROP_KINDS = new Set(['string', 'number', 'boolean', 'node', 'callback', 'collection', 'enum', 'ref', 'element']);
const CARDINALITIES = new Set(['one', 'zero-or-one', 'zero-or-more', 'one-or-more']);
const BEHAVIOR_KINDS = new Set(['semantics', 'keyboard', 'focus', 'state', 'announcement', 'motion', 'pointer-alternative']);
const RESPONSIBILITIES = new Set([
  'accessible-copy',
  'text-alternatives',
  'heading-context',
  'landmark-context',
  'dynamic-content',
  'token-contrast',
  'safe-class-overrides',
  'complete-page-assistive-technology-testing',
]);
const PROTECTED_PROPERTIES = new Set([
  'display',
  'visibility',
  'pointer-events',
  'focus-indicator',
  'semantics',
  'reading-order',
  'target-size',
]);
const IDREF_ATTRIBUTES = new Set(['aria-controls', 'aria-describedby', 'aria-labelledby']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateUnique(items, key, label, prefix, fail) {
  const seen = new Set();
  for (const item of items) {
    const value = item?.[key];
    if (typeof value !== 'string' || value.length === 0) {
      fail(`${prefix} ${label} entries require a non-empty ${key}`);
    } else if (seen.has(value)) {
      fail(`${prefix} ${label} ${key} "${value}" is duplicated`);
    }
    seen.add(value);
  }
}

function nodeReferences(value, label, prefix, fail) {
  const hasNode = typeof value?.node === 'string' && value.node.length > 0;
  const hasNodes = Array.isArray(value?.nodes) && value.nodes.length > 0;
  if (hasNode === hasNodes) {
    fail(`${prefix} ${label} requires exactly one of node or non-empty nodes`);
    return [];
  }
  const refs = hasNode ? [value.node] : value.nodes;
  if (new Set(refs).size !== refs.length || refs.some((ref) => typeof ref !== 'string' || ref.length === 0)) {
    fail(`${prefix} ${label} has invalid or duplicate node references`);
    return [];
  }
  return refs;
}

function validateRealization(contract, dirName, storySource, fail) {
  const prefix = `[realization] components/${dirName}`;
  const realization = contract.realization;
  if (!isObject(realization)) {
    fail(`${prefix} is missing realization`);
    return;
  }
  if (realization.version !== 1) fail(`${prefix} realization.version must equal 1`);

  const props = Array.isArray(realization.props) ? realization.props : [];
  if (props.length === 0) fail(`${prefix} props must be a non-empty array`);
  validateUnique(props, 'path', 'props', prefix, fail);
  const propPaths = new Set(props.map((prop) => prop?.path));
  for (const prop of props) {
    if (!PROP_KINDS.has(prop?.type)) fail(`${prefix} prop "${prop?.path}" has unsupported type "${prop?.type}"`);
    if (typeof prop?.required !== 'boolean') fail(`${prefix} prop "${prop?.path}" requires a boolean required field`);
    if (prop?.type === 'enum' && (!Array.isArray(prop.values) || prop.values.length === 0)) {
      fail(`${prefix} enum prop "${prop?.path}" requires values`);
    }
    if (prop?.type === 'element' && prop.values !== undefined && (!Array.isArray(prop.values) || prop.values.length === 0 || prop.values.some((value) => typeof value !== 'string' || value.length === 0))) {
      fail(`${prefix} element prop "${prop?.path}" has invalid safe values`);
    }
  }

  const nodes = Array.isArray(realization.dom?.nodes) ? realization.dom.nodes : [];
  if (nodes.length === 0) fail(`${prefix} dom.nodes must be a non-empty array`);
  validateUnique(nodes, 'id', 'dom.nodes', prefix, fail);
  const nodeIds = new Set(nodes.map((node) => node?.id));
  for (const node of nodes) {
    const elements = Array.isArray(node?.element) ? node.element : [node?.element];
    if (elements.length === 0 || elements.some((element) => typeof element !== 'string' || element.length === 0)) {
      fail(`${prefix} DOM node "${node?.id}" requires an element or safe element alternatives`);
    }
    if (!CARDINALITIES.has(node?.cardinality)) {
      fail(`${prefix} DOM node "${node?.id}" has unsupported cardinality "${node?.cardinality}"`);
    }
    if (node?.parent !== null && !nodeIds.has(node?.parent)) {
      fail(`${prefix} DOM node "${node?.id}" references missing parent "${node?.parent}"`);
    }
    if (node?.whenProp && !propPaths.has(node.whenProp)) {
      fail(`${prefix} DOM node "${node?.id}" references missing condition prop "${node.whenProp}"`);
    }
  }
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    const seen = new Set([node.id]);
    let current = node;
    while (current?.parent !== null && nodeIds.has(current?.parent)) {
      if (seen.has(current.parent)) {
        fail(`${prefix} DOM ancestry for "${node.id}" contains a cycle at "${current.parent}"`);
        break;
      }
      seen.add(current.parent);
      current = nodesById.get(current.parent);
    }
  }
  const constraints = Array.isArray(realization.constraints) ? realization.constraints : [];
  for (const [index, constraint] of constraints.entries()) {
    if (!propPaths.has(constraint?.when?.prop)) fail(`${prefix} constraint ${index} references missing condition prop "${constraint?.when?.prop}"`);
    if (!Array.isArray(constraint?.requireAny) || constraint.requireAny.length === 0) fail(`${prefix} constraint ${index} requires a non-empty requireAny`);
    for (const prop of constraint?.requireAny ?? []) {
      if (!propPaths.has(prop)) fail(`${prefix} constraint ${index} references missing required prop "${prop}"`);
    }
  }

  const bindings = Array.isArray(realization.contentBindings) ? realization.contentBindings : [];
  for (const binding of bindings) {
    if (!propPaths.has(binding?.prop)) fail(`${prefix} content binding references missing prop "${binding?.prop}"`);
    for (const node of nodeReferences(binding, `content binding for "${binding?.prop}"`, prefix, fail)) {
      if (!nodeIds.has(node)) fail(`${prefix} content binding references missing node "${node}"`);
    }
  }

  const safeAttributes = Array.isArray(realization.safeAttributes) ? realization.safeAttributes : [];
  for (const attribute of safeAttributes) {
    if (!propPaths.has(attribute?.prop)) fail(`${prefix} safe attribute references missing prop "${attribute?.prop}"`);
    for (const node of nodeReferences(attribute, `safe attribute for "${attribute?.prop}"`, prefix, fail)) {
      if (!nodeIds.has(node)) fail(`${prefix} safe attribute references missing node "${node}"`);
    }
    if (typeof attribute?.attribute !== 'string' || attribute.attribute.length === 0) {
      fail(`${prefix} safe attribute for "${attribute?.prop}" requires an attribute`);
    }
  }

  const relationships = Array.isArray(realization.relationships) ? realization.relationships : [];
  for (const relationship of relationships) {
    if (!nodeIds.has(relationship?.from)) fail(`${prefix} relationship references missing source node "${relationship?.from}"`);
    if (!nodeIds.has(relationship?.to)) fail(`${prefix} relationship references missing target node "${relationship?.to}"`);
    if (!IDREF_ATTRIBUTES.has(relationship?.attribute)) {
      fail(`${prefix} relationship has unsupported IDREF attribute "${relationship?.attribute}"`);
    }
  }

  const styleSlots = Array.isArray(realization.styleSlots) ? realization.styleSlots : [];
  validateUnique(styleSlots, 'path', 'styleSlots', prefix, fail);
  for (const slot of styleSlots) {
    if (!slot?.path?.startsWith('classNames.')) fail(`${prefix} style slot "${slot?.path}" must start with classNames.`);
    if (!propPaths.has(slot?.path)) fail(`${prefix} style slot "${slot?.path}" references a missing public prop path`);
    for (const node of nodeReferences(slot, `style slot "${slot?.path}"`, prefix, fail)) {
      if (!nodeIds.has(node)) fail(`${prefix} style slot "${slot?.path}" references missing node "${node}"`);
    }
    for (const property of slot?.protectedProperties ?? []) {
      if (!PROTECTED_PROPERTIES.has(property)) {
        fail(`${prefix} style slot "${slot?.path}" has unsupported protected property "${property}"`);
      }
    }
  }

  const behaviors = Array.isArray(realization.behaviors) ? realization.behaviors : [];
  if (behaviors.length === 0) fail(`${prefix} behaviors must be a non-empty array`);
  validateUnique(behaviors, 'id', 'behaviors', prefix, fail);
  for (const behavior of behaviors) {
    if (!BEHAVIOR_KINDS.has(behavior?.kind)) {
      fail(`${prefix} behavior "${behavior?.id}" has unsupported kind "${behavior?.kind}"`);
    }
    if (!Array.isArray(behavior?.wcag) || behavior.wcag.length === 0) {
      fail(`${prefix} behavior "${behavior?.id}" requires WCAG criterion IDs`);
    }
    if (typeof behavior?.evidence !== 'string' || behavior.evidence.length === 0) {
      fail(`${prefix} behavior "${behavior?.id}" requires an evidence ID`);
    } else if (behavior.evidence !== behavior.id) {
      fail(`${prefix} behavior "${behavior?.id}" evidence must use the same ID`);
    } else if (!storySource?.includes(`'${behavior.evidence}'`) && !storySource?.includes(`"${behavior.evidence}"`)) {
      fail(`${prefix} behavior "${behavior?.id}" evidence "${behavior.evidence}" is not keyed in its story`);
    } else if (!/\bplay\s*:/.test(storySource)) {
      fail(`${prefix} behavior "${behavior?.id}" has keyed evidence but its story contains no play assertion`);
    }
  }

  const accessibility = realization.accessibility;
  if (!isObject(accessibility)) {
    fail(`${prefix} requires accessibility metadata`);
    return;
  }
  if (accessibility.standard !== 'WCAG-2.2-AA') fail(`${prefix} accessibility.standard must equal WCAG-2.2-AA`);
  if (!(accessibility.apgPattern === null || typeof accessibility.apgPattern === 'string')) {
    fail(`${prefix} accessibility.apgPattern must be a string or null`);
  }
  if (!Array.isArray(accessibility.consumerResponsibilities) || accessibility.consumerResponsibilities.length === 0) {
    fail(`${prefix} accessibility.consumerResponsibilities must be a non-empty array`);
  } else {
    for (const responsibility of accessibility.consumerResponsibilities) {
      if (!RESPONSIBILITIES.has(responsibility)) {
        fail(`${prefix} consumer responsibility "${responsibility}" is not governed`);
      }
    }
  }
}

module.exports = { validateRealization };
