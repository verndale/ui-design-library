#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const {
  implementationFiles,
  implementationTsxFiles,
  listComponentDirs,
  storyFiles,
} = require('./lib/component-files.cjs');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const CLIENT_HOOKS = new Set([
  'useCallback',
  'useContext',
  'useDeferredValue',
  'useEffect',
  'useImperativeHandle',
  'useId',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
]);
const BROWSER_GLOBALS = new Set([
  'document',
  'window',
  'navigator',
  'localStorage',
  'sessionStorage',
  'IntersectionObserver',
  'MutationObserver',
  'ResizeObserver',
  'cancelAnimationFrame',
  'customElements',
  'getComputedStyle',
  'history',
  'location',
  'matchMedia',
  'requestAnimationFrame',
]);

function physicalLines(source) {
  const normalized = source.replace(/\r\n?/g, '\n');
  return normalized.endsWith('\n') ? normalized.slice(0, -1).split('\n').length : normalized.split('\n').length;
}

function isClientPath(file) {
  return /\.client\.(?:ts|tsx)$/.test(file);
}

function scriptKind(file) {
  return file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

function parse(file, source) {
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
}

function hasUseClient(sourceFile) {
  return sourceFile.statements.some(
    (statement) =>
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === 'use client',
  );
}

function useClientIsFirst(sourceFile) {
  if (!hasUseClient(sourceFile)) return true;
  const first = sourceFile.statements[0];
  return Boolean(
    first &&
      ts.isExpressionStatement(first) &&
      ts.isStringLiteral(first.expression) &&
      first.expression.text === 'use client',
  );
}

function callName(expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return null;
}

function declaredFunctionName(node) {
  if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name) return node.name.text;
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    const parent = node.parent;
    if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) return parent.name.text;
    if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) return parent.name.text;
  }
  return null;
}

function nearestFunction(node) {
  let current = node.parent;
  while (current) {
    if (ts.isFunctionLike(current)) return current;
    current = current.parent;
  }
  return null;
}

function isGlobalIdentifier(node) {
  if (!ts.isIdentifier(node) || !BROWSER_GLOBALS.has(node.text)) return false;
  const parent = node.parent;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
  if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent) || ts.isTypeReferenceNode(parent)) return false;
  return true;
}

function exportedRuntimeSources(sourceFile) {
  const sources = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || statement.isTypeOnly) continue;
    if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      const runtime = statement.exportClause.elements.some((element) => !element.isTypeOnly);
      if (!runtime) continue;
    }
    sources.push(statement.moduleSpecifier.text);
  }
  return sources;
}

function runtimeImports(sourceFile) {
  const sources = [...exportedRuntimeSources(sourceFile)];
  const bindings = new Map();
  const namespaces = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const source = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) {
      sources.push(source);
      continue;
    }
    if (clause.isTypeOnly) continue;
    let runtime = Boolean(clause.name);
    if (clause.name) bindings.set(clause.name.text, { source, imported: 'default' });
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      runtime = true;
      namespaces.add(clause.namedBindings.name.text);
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if (element.isTypeOnly) continue;
        runtime = true;
        bindings.set(element.name.text, {
          source,
          imported: element.propertyName?.text ?? element.name.text,
        });
      }
    }
    if (runtime) sources.push(source);
  }

  function collectDynamicImports(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      (ts.isStringLiteral(node.arguments[0]) || ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))
    ) {
      sources.push(node.arguments[0].text);
    }
    ts.forEachChild(node, collectDynamicImports);
  }
  collectDynamicImports(sourceFile);

  return { sources: [...new Set(sources)], bindings, namespaces };
}

function resolveRelativeModule(file, specifier, records) {
  if (!specifier.startsWith('.')) return null;
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  const sourceBase = base.endsWith('.js') ? base.slice(0, -3) : base;
  for (const candidate of [
    base,
    sourceBase,
    `${sourceBase}.ts`,
    `${sourceBase}.tsx`,
    `${sourceBase}/index.ts`,
    `${sourceBase}/index.tsx`,
  ]) {
    if (records.has(candidate)) return candidate;
  }
  return null;
}

function isTopLevelFunction(node) {
  if (ts.isFunctionDeclaration(node)) return ts.isSourceFile(node.parent);
  if (!ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) return false;
  const declaration = node.parent;
  const list = ts.isVariableDeclaration(declaration) ? declaration.parent : null;
  const statement = list && ts.isVariableDeclarationList(list) ? list.parent : null;
  return Boolean(statement && ts.isVariableStatement(statement) && ts.isSourceFile(statement.parent));
}

function analyzeModuleGraph(records, prefix, fail) {
  const adjacency = new Map();
  const directiveRoots = [];
  for (const [file, record] of records) {
    const imports = runtimeImports(record.sourceFile);
    record.imports = imports;
    const targets = imports.sources
      .map((source) => resolveRelativeModule(file, source, records))
      .filter(Boolean);
    adjacency.set(file, targets);
    if (record.directive) directiveRoots.push(file);

    if (!record.clientPath && !record.directive) {
      for (const target of targets) {
        const imported = records.get(target);
        if ((imported.clientPath || imported.directive) && !imported.directive) {
          fail(`[boundary] ${prefix}/${file} imports client module ${target} without a 'use client' boundary`);
        }
      }
    }
  }

  const beneathBoundary = new Set(directiveRoots);
  const queue = [...directiveRoots];
  while (queue.length > 0) {
    const file = queue.shift();
    for (const target of adjacency.get(file) ?? []) {
      if (beneathBoundary.has(target)) continue;
      beneathBoundary.add(target);
      queue.push(target);
    }
  }
  for (const [file, record] of records) {
    if (record.clientPath && !record.directive && !beneathBoundary.has(file)) {
      fail(`[boundary] ${prefix}/${file} is named as a client module but is not beneath a 'use client' boundary`);
    }
  }

  const functions = new Map();
  const globals = [];
  const edges = new Map();
  for (const [file, record] of records) {
    function collect(node) {
      const name = ts.isFunctionLike(node) ? declaredFunctionName(node) : null;
      if (name) functions.set(`${file}:${name}`, { file, name, topLevel: isTopLevelFunction(node) });
      ts.forEachChild(node, collect);
    }
    collect(record.sourceFile);
  }

  for (const [file, record] of records) {
    function visit(node) {
      const owner = nearestFunction(node);
      const ownerName = owner ? declaredFunctionName(owner) : null;
      const ownerId = ownerName ? `${file}:${ownerName}` : null;
      if (isGlobalIdentifier(node)) globals.push({ file, name: node.text, ownerId, hasFunction: Boolean(owner) });

      if (ts.isCallExpression(node) && ownerId) {
        let targetId = null;
        if (ts.isIdentifier(node.expression)) {
          const local = node.expression.text;
          const imported = record.imports.bindings.get(local);
          if (imported) {
            const targetFile = resolveRelativeModule(file, imported.source, records);
            if (targetFile) targetId = `${targetFile}:${imported.imported}`;
          } else if (functions.has(`${file}:${local}`)) {
            targetId = `${file}:${local}`;
          }
        }
        if (targetId) {
          if (!edges.has(ownerId)) edges.set(ownerId, new Set());
          edges.get(ownerId).add(targetId);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(record.sourceFile);
  }

  const renderReachable = new Set(
    [...functions.entries()]
      .filter(([, value]) => value.topLevel && (/^[A-Z]/.test(value.name) || /^use[A-Z]/.test(value.name)))
      .map(([id]) => id),
  );
  const functionQueue = [...renderReachable];
  while (functionQueue.length > 0) {
    const id = functionQueue.shift();
    for (const target of edges.get(id) ?? []) {
      if (renderReachable.has(target)) continue;
      renderReachable.add(target);
      functionQueue.push(target);
    }
  }

  for (const global of globals) {
    const record = records.get(global.file);
    if (!record.clientPath && !record.directive) continue;
    if (!global.hasFunction || (global.ownerId && renderReachable.has(global.ownerId))) {
      fail(`[ssr] ${prefix}/${global.file} accesses browser global ${global.name} at module or render time`);
    }
  }

  for (const [file, record] of records) {
    if (record.clientPath || record.directive) continue;
    function visit(node) {
      if (ts.isCallExpression(node)) {
        let importedClientHook = null;
        if (ts.isIdentifier(node.expression)) {
          const imported = record.imports.bindings.get(node.expression.text);
          if (imported && /^use[A-Z]/.test(imported.imported)) {
            const target = resolveRelativeModule(file, imported.source, records);
            if (target && (records.get(target).clientPath || records.get(target).directive)) {
              importedClientHook = imported.imported;
            }
          }
        } else if (
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          record.imports.namespaces.has(node.expression.expression.text) &&
          /^use[A-Z]/.test(node.expression.name.text)
        ) {
          importedClientHook = node.expression.name.text;
        }
        if (importedClientHook) {
          fail(`[boundary] ${prefix}/${file} calls client hook ${importedClientHook} from a neutral module`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(record.sourceFile);
  }

  return adjacency;
}

function explicitExportTargets(sourceFile, exportName) {
  const targets = [];
  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.isTypeOnly ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) continue;
    for (const element of statement.exportClause.elements) {
      if (!element.isTypeOnly && element.name.text === exportName) {
        targets.push(statement.moduleSpecifier.text);
      }
    }
  }
  return targets;
}

function checkPrimaryRendering(dirName, contract, records, adjacency, fail) {
  if (typeof contract.exportName !== 'string' || contract.exportName.length === 0) {
    fail(`[rendering] components/${dirName}/component.json must declare exportName`);
    return;
  }
  const indexFile = `components/${dirName}/index.ts`;
  const indexRecord = records.get(indexFile);
  if (!indexRecord) return;
  const sources = explicitExportTargets(indexRecord.sourceFile, contract.exportName);
  if (sources.length !== 1) {
    fail(
      `[rendering] components/${dirName}/index.ts must explicitly export ${contract.exportName} exactly once (found ${sources.length})`,
    );
    return;
  }
  const primaryFile = resolveRelativeModule(indexFile, sources[0], records);
  if (!primaryFile) {
    fail(
      `[rendering] components/${dirName}/index.ts export ${contract.exportName} does not resolve to a source module`,
    );
    return;
  }

  const primaryRecord = records.get(primaryFile);
  let derived = primaryRecord.directive || primaryRecord.clientPath ? 'client' : 'server';
  if (derived === 'server') {
    const seen = new Set([primaryFile]);
    const queue = [...(adjacency.get(primaryFile) ?? [])];
    while (queue.length > 0) {
      const file = queue.shift();
      if (seen.has(file)) continue;
      seen.add(file);
      const record = records.get(file);
      if (record?.directive || record?.clientPath) {
        derived = 'hybrid';
        break;
      }
      queue.push(...(adjacency.get(file) ?? []));
    }
  }

  if (contract.rendering !== derived) {
    fail(
      `[rendering] components/${dirName} declares rendering "${contract.rendering}" but primary export ${contract.exportName} derives as "${derived}"`,
    );
  }
}

function checkIndex(dirName, dir, sourceFile, directive, fail) {
  for (const statement of sourceFile.statements) {
    const isDirective =
      ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression) && statement.expression.text === 'use client';
    if (!isDirective && !ts.isExportDeclaration(statement)) {
      fail(`[facade] components/${dirName}/index.ts may contain only exports and an optional 'use client' directive`);
      break;
    }
  }

  const sources = exportedRuntimeSources(sourceFile);
  const clientSources = sources.filter((source) => source.includes('.client'));
  const serverSources = sources.filter((source) => !source.includes('.client') && !source.includes('.types'));
  if (clientSources.length > 0 && serverSources.length === 0 && !directive) {
    fail(`[facade] components/${dirName}/index.ts must declare 'use client' because every runtime export is client-only`);
  }
  if (serverSources.length > 0 && directive) {
    fail(`[facade] components/${dirName}/index.ts must omit 'use client' because it exposes server-compatible runtime exports`);
  }

  const stories = storyFiles(dir);
  if (stories.length === 1) {
    const storyPath = path.join(dir, stories[0]);
    const storySource = fs.readFileSync(storyPath, 'utf8');
    const storyFile = parse(stories[0], storySource);
    for (const statement of storyFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (specifier.startsWith('.') && specifier !== './index') {
        fail(`[stories] components/${dirName}/${stories[0]} must import component code only from './index' (found "${specifier}")`);
      }
    }
  }
}

function checkWorkspaceModuleGraph({ root, componentsDir }, fail) {
  const records = new Map();
  for (const dirName of listComponentDirs(componentsDir)) {
    const dir = path.join(componentsDir, dirName);
    for (const file of implementationFiles(dir)) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      const sourceFile = parse(file, source);
      records.set(`components/${dirName}/${file}`, {
        source,
        sourceFile,
        directive: hasUseClient(sourceFile),
        clientPath: isClientPath(file),
      });
    }
  }
  const libDir = path.join(root, 'src/lib');
  if (fs.existsSync(libDir)) {
    for (const file of implementationFiles(libDir)) {
      const source = fs.readFileSync(path.join(libDir, file), 'utf8');
      const sourceFile = parse(file, source);
      records.set(`src/lib/${file}`, {
        source,
        sourceFile,
        directive: hasUseClient(sourceFile),
        clientPath: isClientPath(file),
      });
    }
  }
  const adjacency = analyzeModuleGraph(records, 'workspace', fail);
  return { records, adjacency };
}

function check({ componentsDir = COMPONENTS, root = path.dirname(componentsDir) } = {}) {
  const failures = [];
  const fail = (message) => failures.push(message);
  const dirs = listComponentDirs(componentsDir);
  if (dirs.length === 0) return ['[components] no components found'];

  for (const dirName of dirs) {
    const dir = path.join(componentsDir, dirName);
    const files = implementationFiles(dir);
    const indexFiles = files.filter((file) => file === 'index.ts');
    const typesFiles = files.filter((file) => /^[^/]+\.types\.ts$/.test(file));
    const tsxFiles = implementationTsxFiles(dir);

    if (indexFiles.length !== 1) fail(`[facade] components/${dirName} must contain exactly one root index.ts`);
    if (typesFiles.length !== 1) fail(`[types] components/${dirName} must contain exactly one root *.types.ts module`);
    if (tsxFiles.length < 2) {
      fail(`[shape] components/${dirName} must contain at least two non-story implementation TSX modules`);
    }

    for (const file of files) {
      const absolute = path.join(dir, file);
      const source = fs.readFileSync(absolute, 'utf8');
      const sourceFile = parse(file, source);
      const directive = hasUseClient(sourceFile);
      const clientPath = isClientPath(file);
      if ((clientPath || directive) && physicalLines(source) > 120) {
        fail(`[size] components/${dirName}/${file} has ${physicalLines(source)} physical lines; client modules are limited to 120`);
      }
      if (directive && file !== 'index.ts' && !clientPath) {
        fail(`[boundary] components/${dirName}/${file} declares 'use client' but is not named *.client.ts(x)`);
      }
      if (!useClientIsFirst(sourceFile)) {
        fail(`[boundary] components/${dirName}/${file} must place 'use client' as its first statement`);
      }
      if (file === 'index.ts') checkIndex(dirName, dir, sourceFile, directive, fail);

      function visit(node) {
        if (ts.isCallExpression(node)) {
          const name = callName(node.expression);
          if (name && CLIENT_HOOKS.has(name) && !clientPath && !directive) {
            fail(`[boundary] components/${dirName}/${file} uses client hook ${name} in a neutral module`);
          }
        }
        if (isGlobalIdentifier(node)) {
          if (!clientPath && !directive) {
            fail(`[boundary] components/${dirName}/${file} uses browser global ${node.text} in a neutral module`);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(sourceFile);
    }
  }
  const graph = checkWorkspaceModuleGraph({ root, componentsDir }, fail);
  for (const dirName of dirs) {
    const manifestPath = path.join(componentsDir, dirName, 'component.json');
    if (!fs.existsSync(manifestPath)) {
      fail(`[rendering] components/${dirName}/component.json is missing`);
      continue;
    }
    try {
      const contract = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      checkPrimaryRendering(dirName, contract, graph.records, graph.adjacency, fail);
    } catch (error) {
      fail(`[rendering] components/${dirName}/component.json is not valid JSON: ${error.message}`);
    }
  }

  return [...new Set(failures)];
}

function checkSharedClientModules({ root = ROOT } = {}) {
  const failures = [];
  const libDir = path.join(root, 'src/lib');
  if (!fs.existsSync(libDir)) return failures;
  for (const file of implementationFiles(libDir)) {
    const absolute = path.join(libDir, file);
    const source = fs.readFileSync(absolute, 'utf8');
    const sourceFile = parse(file, source);
    const directive = hasUseClient(sourceFile);
    const clientPath = isClientPath(file);
    if ((clientPath || directive) && physicalLines(source) > 120) {
      failures.push(`[size] src/lib/${file} has ${physicalLines(source)} physical lines; client modules are limited to 120`);
    }
    if (directive && !clientPath) {
      failures.push(`[boundary] src/lib/${file} declares 'use client' but is not named *.client.ts(x)`);
    }
    if (!useClientIsFirst(sourceFile)) {
      failures.push(`[boundary] src/lib/${file} must place 'use client' as its first statement`);
    }
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const name = callName(node.expression);
        if (name && CLIENT_HOOKS.has(name) && !clientPath && !directive) {
          failures.push(`[boundary] src/lib/${file} uses client hook ${name} in a neutral module`);
        }
      }
      if (isGlobalIdentifier(node) && !clientPath && !directive) {
        failures.push(`[boundary] src/lib/${file} uses browser global ${node.text} in a neutral module`);
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
  return [...new Set(failures)];
}

if (require.main === module) {
  const failures = [...check(), ...checkSharedClientModules()];
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`FAIL ${failure}\n`);
    process.stderr.write(`FAILED ${failures.length} architecture check(s)\n`);
    process.exit(1);
  }
  process.stdout.write(`PASS ${listComponentDirs(COMPONENTS).length} component architecture(s) intact.\n`);
}

module.exports = { check, checkSharedClientModules, physicalLines };
