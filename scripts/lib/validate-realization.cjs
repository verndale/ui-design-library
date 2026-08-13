'use strict';

const ts = require('typescript');

const PROP_KINDS = new Set(['string', 'number', 'boolean', 'node', 'callback', 'collection', 'enum', 'ref', 'element']);
const CARDINALITIES = new Set(['one', 'zero-or-one', 'zero-or-more', 'one-or-more']);
const BEHAVIOR_KINDS = new Set(['semantics', 'keyboard', 'focus', 'state', 'announcement', 'motion', 'pointer-alternative']);
const RESPONSIBILITIES = new Set([
  'accessible-copy',
  'text-alternatives',
  'heading-context',
  'landmark-context',
  'dynamic-content',
  'timed-content',
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
const IDREF_ATTRIBUTES = new Set(['aria-controls', 'aria-describedby', 'aria-labelledby', 'for']);
const CONDITION_PREDICATES = new Set(['present', 'truthy', 'equals', 'not-equals', 'non-empty']);

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

function evidenceAssertion(storySource, evidenceId) {
  const source = ts.createSourceFile('component.stories.tsx', storySource || '', ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let matched = false;
  let asserted = false;
  const exportedPlayFunctions = [];
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isObjectLiteralExpression(declaration.initializer)) continue;
      const play = declaration.initializer.properties.find((property) =>
        ts.isPropertyAssignment(property) &&
        ((ts.isIdentifier(property.name) && property.name.text === 'play') || (ts.isStringLiteralLike(property.name) && property.name.text === 'play')) &&
        (ts.isArrowFunction(property.initializer) || ts.isFunctionExpression(property.initializer)),
      );
      if (play) exportedPlayFunctions.push(play.initializer);
    }
  }
  const forEachReachableChild = (node, visitor) => {
    if (ts.isBlock(node)) {
      for (const statement of node.statements) {
        visitor(statement);
        if (ts.isReturnStatement(statement) || ts.isThrowStatement(statement) || ts.isBreakStatement(statement) || ts.isContinueStatement(statement)) break;
      }
      return;
    }
    if (ts.isIfStatement(node) && node.expression.kind === ts.SyntaxKind.FalseKeyword) {
      if (node.elseStatement) visitor(node.elseStatement);
      return;
    }
    if (ts.isIfStatement(node) && node.expression.kind === ts.SyntaxKind.TrueKeyword) {
      visitor(node.thenStatement);
      return;
    }
    ts.forEachChild(node, visitor);
  };
  const visit = (node) => {
    if (
      (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) &&
      !(ts.isCallExpression(node.parent) && node.parent.arguments.includes(node))
    ) return;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'step' &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      node.arguments[0].text === evidenceId &&
      (ts.isArrowFunction(node.arguments[1]) || ts.isFunctionExpression(node.arguments[1]))
    ) {
      matched = true;
      const findExpect = (child) => {
        if (
          (ts.isArrowFunction(child) || ts.isFunctionExpression(child) || ts.isFunctionDeclaration(child)) &&
          !(ts.isCallExpression(child.parent) && child.parent.arguments.includes(child))
        ) return;
        if (ts.isCallExpression(child) && ts.isIdentifier(child.expression) && child.expression.text === 'expect') asserted = true;
        forEachReachableChild(child, findExpect);
      };
      findExpect(node.arguments[1].body);
    }
    forEachReachableChild(node, visit);
  };
  for (const play of exportedPlayFunctions) visit(play.body);
  return { matched, asserted };
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
    if (Array.isArray(node?.element)) {
      const selection = node.elementSelection;
      const selectionProp = props.find((prop) => prop.path === selection?.prop);
      const cases = Array.isArray(selection?.cases) ? selection.cases : [];
      const caseValues = cases.map((item) => item?.value);
      const caseElements = cases.map((item) => item?.element);
      const sameSet = (left, right) => JSON.stringify([...new Set(left.map((item) => JSON.stringify(item)))].sort()) === JSON.stringify([...new Set(right.map((item) => JSON.stringify(item)))].sort());
      if (!isObject(selection) || !selectionProp || !Array.isArray(selectionProp.values) || cases.length === 0) {
        fail(`${prefix} DOM node "${node?.id}" element alternatives require prop-backed elementSelection cases`);
      } else if (
        new Set(caseValues.map(JSON.stringify)).size !== caseValues.length ||
        new Set(caseElements).size !== caseElements.length ||
        cases.some((item) => !isObject(item) || typeof item.element !== 'string' || item.element.length === 0 || Object.keys(item).some((key) => !['value', 'element'].includes(key))) ||
        !sameSet(caseValues, selectionProp.values) ||
        !sameSet(caseElements, elements)
      ) {
        fail(`${prefix} DOM node "${node?.id}" elementSelection must exactly cover its prop values and element alternatives`);
      }
    } else if (node?.elementSelection !== undefined) {
      fail(`${prefix} DOM node "${node?.id}" cannot declare elementSelection for one fixed element`);
    }
    if (node?.attributes !== undefined && !isObject(node.attributes)) {
      fail(`${prefix} DOM node "${node?.id}" attributes must be an object`);
    }
    for (const [attribute, value] of Object.entries(node?.attributes ?? {})) {
      if (typeof attribute !== 'string' || attribute.length === 0 || IDREF_ATTRIBUTES.has(attribute)) {
        fail(`${prefix} DOM node "${node?.id}" has invalid owned attribute "${attribute}"`);
      }
      if (isObject(value)) {
        const keys = Object.keys(value);
        const hasProp = keys.length === 1 && typeof value.prop === 'string' && value.prop.length > 0;
        const hasState = keys.length === 1 && typeof value.state === 'string' && value.state.length > 0;
        if (hasProp === hasState) fail(`${prefix} DOM node "${node?.id}" attribute "${attribute}" requires exactly one prop or state source`);
        if (hasProp && !propPaths.has(value.prop)) fail(`${prefix} DOM node "${node?.id}" attribute "${attribute}" references missing prop "${value.prop}"`);
      } else if (!['string', 'boolean', 'number'].includes(typeof value)) {
        fail(`${prefix} DOM node "${node?.id}" attribute "${attribute}" has an unsupported value`);
      }
    }
    if (node?.parent !== null && !nodeIds.has(node?.parent)) {
      fail(`${prefix} DOM node "${node?.id}" references missing parent "${node?.parent}"`);
    }
    const condition = node?.condition;
    const repeat = node?.repeat;
    if (node?.cardinality === 'zero-or-one' && !isObject(condition)) {
      fail(`${prefix} DOM node "${node?.id}" requires a structured condition for zero-or-one cardinality`);
    } else if (node?.cardinality !== 'zero-or-one' && condition !== undefined) {
      fail(`${prefix} DOM node "${node?.id}" may declare condition only with zero-or-one cardinality`);
    }
    if (isObject(condition)) {
      const hasProp = typeof condition.prop === 'string' && condition.prop.length > 0;
      const hasState = typeof condition.state === 'string' && condition.state.length > 0;
      if (hasProp === hasState) fail(`${prefix} DOM node "${node?.id}" condition requires exactly one of prop or state`);
      if (hasProp && !propPaths.has(condition.prop)) fail(`${prefix} DOM node "${node?.id}" references missing condition prop "${condition.prop}"`);
      if (!CONDITION_PREDICATES.has(condition.predicate)) fail(`${prefix} DOM node "${node?.id}" has unsupported condition predicate "${condition.predicate}"`);
      if (['equals', 'not-equals'].includes(condition.predicate) !== Object.hasOwn(condition, 'value')) {
        fail(`${prefix} DOM node "${node?.id}" condition value does not match predicate "${condition.predicate}"`);
      }
    }
    if (node?.cardinality === 'zero-or-more' || node?.cardinality === 'one-or-more') {
      const repeatProp = props.find((prop) => prop.path === repeat?.prop);
      const hasProp = typeof repeat?.prop === 'string' && repeat.prop.length > 0;
      const hasState = typeof repeat?.state === 'string' && repeat.state.length > 0;
      if (!isObject(repeat) || hasProp === hasState || (hasProp && repeatProp?.type !== 'collection')) fail(`${prefix} DOM node "${node?.id}" requires exactly one collection prop or derived state repeat declaration`);
    } else if (repeat !== undefined) {
      fail(`${prefix} DOM node "${node?.id}" may declare repeat only with repeated cardinality`);
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
    } else if (behavior.evidenceType !== 'storybook-step') {
      fail(`${prefix} behavior "${behavior?.id}" evidenceType must equal storybook-step`);
    } else {
      const evidence = evidenceAssertion(storySource, behavior.evidence);
      if (!evidence.matched) fail(`${prefix} behavior "${behavior?.id}" evidence "${behavior.evidence}" is not a keyed Storybook step`);
      else if (!evidence.asserted) fail(`${prefix} behavior "${behavior?.id}" evidence step contains no executable assertion`);
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
