#!/usr/bin/env node
/**
 * check-contracts.cjs — every component keeps its side of the contract.
 *
 * The library is only deterministically usable if a canonical slug reliably
 * answers with a component. This checks the invariants that make that true:
 *
 *   1. Each components/<slug>/ has component.json, a matching implementation,
 *      and a stories file.
 *   2. component.json's `slug` matches its directory, and its `canonical`
 *      kebab-cases to that slug.
 *   3. Declared tokens actually exist in the semantic token layer — a component
 *      referencing a token nobody defines renders unstyled.
 *   4. Components use semantic tokens, not raw colour values.
 *   5. Provenance and maturity are present, so no component's origin is a mystery.
 *   6. The story's `maturity:*` tag agrees with component.json. The sidebar
 *      badge renders from the tag, so a disagreement shows the wrong maturity.
 *   7. The variant axis holds: one canonical can front several structurally
 *      distinct implementations. The default lives in the bare components/<slug>/;
 *      alternates live in components/<slug>--<variant>/. The key is
 *      (canonical, variant) → directory, and it must stay deterministic — one
 *      default per canonical, unique variant names, agreeing fields.
 *   8. Variant stories do not collide: the default's title is the canonical, an
 *      alternate's nests under it as "<Canonical> / <label>", and titles within
 *      a canonical are distinct.
 *   9. Each component identifies one primary value export and its derived
 *      server/hybrid/client rendering boundary for deterministic AI reuse.
 *  10. Each component carries the AI reuse compatibility triad using the shared
 *      governed slot, affordance, and role vocabulary.
 *
 * `variant` (singular) is the structural axis checked here. The free-form
 * `variants` array (a component's prop-value options) is a different thing. Its
 * entries are validated as unique, non-empty strings but carry no structural
 * meaning.
 *
 * Exit codes: 0 pass · 1 one or more failures.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { implementationFiles, listComponentDirs, storyFiles } = require('./lib/component-files.cjs');
const {
  loadBaseline,
  validateBaseline,
  validateImplementationTargets,
  validateManifestSourceParity,
  validateStorySourceParity,
} = require('./lib/source-parity.cjs');
const { validateRealization } = require('./lib/validate-realization.cjs');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const TOKENS = path.join(ROOT, 'src/tokens/semantic.css');
const SHARED = path.join(ROOT, 'src/lib');

const MATURITIES = ['candidate', 'supported', 'deprecated'];
const RENDERING_MODES = ['server', 'hybrid', 'client'];
const REUSE_SLOTS = [
  'media',
  'heading',
  'body',
  'meta',
  'action',
  'badge',
  'icon',
  'footer',
  'stat',
  'chart',
  'avatar',
  'caption',
  'toolbar',
  'field',
  'panel',
  'row',
  'close',
  'other',
];
const REUSE_AFFORDANCES = ['navigate', 'display', 'input', 'expand', 'select', 'trigger', 'contain', 'feedback', 'other'];
const REUSE_ROLES = [
  'entity-summary',
  'metric',
  'media-showcase',
  'editorial',
  'action-group',
  'container',
  'structural',
  'notification',
  'other',
];
// A hex or rgb() literal in a component means a value escaped the token layer.
const RAW_COLOR = /(#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\()/;
const RAW_TAILWIND_COLOR = /\b(?:bg|text|border|outline|ring|fill|stroke)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)\b/;
const NEXT_IMPORT = /(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)['"]next(?:\/|['"])/;
const CSS_VARIABLE = /var\(\s*--([a-z0-9-]+)/g;
const LEGACY_TAILWIND_VARIABLE = /[a-z0-9-]+-\[var\(--[a-z0-9-]+\)\]/i;

function kebab(input) {
  return String(input)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// A component dir is a bare slug ("button") or a compound "<base>--<variant>"
// naming an alternate. kebab() collapses separator runs to one "-", so a valid
// slug never contains "--"; a single "--" therefore unambiguously splits base
// from variant. Returns { base, variant, compound } or { error }.
function decompose(dirName) {
  const parts = dirName.split('--');
  if (parts.length === 1) return { base: dirName, variant: null, compound: false };
  if (parts.length !== 2) return { error: 'has more than one "--" separator' };
  const [base, variant] = parts;
  if (!base || !variant) return { error: 'has an empty half around "--"' };
  if (kebab(base) !== base) return { error: `base "${base}" is not kebab-case` };
  if (kebab(variant) !== variant) return { error: `variant "${variant}" is not kebab-case` };
  return { base, variant, compound: true };
}

function readTokenCss() {
  return fs.existsSync(TOKENS) ? fs.readFileSync(TOKENS, 'utf8') : '';
}

function validateReuseFingerprint(contract, dirName, fail) {
  const fingerprint = contract.reuseFingerprint;
  if (!fingerprint || typeof fingerprint !== 'object' || Array.isArray(fingerprint)) {
    fail(`[reuse] components/${dirName} is missing reuseFingerprint`);
    return;
  }

  const expectedKeys = ['affordance', 'role', 'slots'];
  const actualKeys = Object.keys(fingerprint).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    fail(`[reuse] components/${dirName} reuseFingerprint keys must be exactly ${expectedKeys.join(', ')}`);
  }

  if (!Array.isArray(fingerprint.slots) || fingerprint.slots.length === 0) {
    fail(`[reuse] components/${dirName} reuseFingerprint.slots must be a non-empty array`);
  } else {
    const seenSlots = new Set();
    for (const slot of fingerprint.slots) {
      if (!REUSE_SLOTS.includes(slot)) {
        fail(`[reuse] components/${dirName} reuseFingerprint slot "${slot}" is not governed`);
      }
      if (seenSlots.has(slot)) {
        fail(`[reuse] components/${dirName} reuseFingerprint slot "${slot}" is duplicated`);
      }
      seenSlots.add(slot);
    }
  }

  if (!REUSE_AFFORDANCES.includes(fingerprint.affordance)) {
    fail(`[reuse] components/${dirName} reuseFingerprint affordance "${fingerprint.affordance}" is not governed`);
  }
  if (!REUSE_ROLES.includes(fingerprint.role)) {
    fail(`[reuse] components/${dirName} reuseFingerprint role "${fingerprint.role}" is not governed`);
  }
}

function scanImplementation(absolute, display, definedTokens, fail) {
  const source = fs.readFileSync(absolute, 'utf8');
  const locallyDefinedVariables = new Set([...source.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  if (NEXT_IMPORT.test(source)) {
    fail(`[framework] ${display} imports next/*; the package core must stay framework-neutral`);
  }
  for (const [index, line] of source.split('\n').entries()) {
    if (line.trim().startsWith('*') || line.trim().startsWith('//')) continue;
    if (RAW_COLOR.test(line)) {
      fail(`[tokens] ${display}:${index + 1} uses a raw colour instead of a semantic token`);
    }
    if (RAW_TAILWIND_COLOR.test(line)) {
      fail(`[tokens] ${display}:${index + 1} uses a Tailwind palette colour instead of a semantic token`);
    }
    if (LEGACY_TAILWIND_VARIABLE.test(line)) {
      fail(`[tailwind] ${display}:${index + 1} uses legacy [var(--token)] syntax; use the canonical (--token) form`);
    }
    for (const match of line.matchAll(CSS_VARIABLE)) {
      if (!definedTokens.has(match[1]) && !locallyDefinedVariables.has(match[1])) {
        fail(`[tokens] ${display}:${index + 1} references undefined semantic token "${match[1]}"`);
      }
    }
  }
}

function check(options = {}) {
  const componentsDir = options.componentsDir ?? COMPONENTS;
  const tokenCss = options.tokenCss ?? readTokenCss();
  const sharedDir = Object.hasOwn(options, 'sharedDir')
    ? options.sharedDir
    : componentsDir === COMPONENTS
      ? SHARED
      : null;
  const failures = [];
  const fail = (msg) => failures.push(msg);
  const sourceParityEnabled = options.sourceParityEnabled ?? componentsDir === COMPONENTS;

  if (!tokenCss) fail(`[tokens] ${path.relative(ROOT, TOKENS)} is missing`);
  const definedTokens = new Set([...tokenCss.matchAll(/^\s*--([a-z0-9-]+):/gm)].map((m) => m[1]));

  const dirs = listComponentDirs(componentsDir);
  if (dirs.length === 0) fail('[components] no components found');
  if (componentsDir === COMPONENTS) {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    if (pkg.uiDesignLibrary?.reuseContractVersion !== 2) {
      fail('[package] package.json uiDesignLibrary.reuseContractVersion must equal 2');
    }
    if (pkg.uiDesignLibrary?.realizationContractVersion !== 1) {
      fail('[package] package.json uiDesignLibrary.realizationContractVersion must equal 1');
    }
    if (pkg.uiDesignLibrary?.sourceParityContractVersion !== 1) {
      fail('[package] package.json uiDesignLibrary.sourceParityContractVersion must equal 1');
    }
  }

  let sourceParityBaseline = null;
  if (sourceParityEnabled) {
    try {
      sourceParityBaseline = options.sourceParityBaseline ?? loadBaseline(ROOT);
      validateBaseline(sourceParityBaseline, dirs, fail);
    } catch (error) {
      fail(`[source-parity] could not load migration baseline: ${error.message}`);
    }
  }

  // Collected for the cross-canonical pass after the per-dir loop.
  const seen = [];
  const sourceParityRecords = [];

  for (const dirName of dirs) {
    const dir = path.join(componentsDir, dirName);
    const contractPath = path.join(dir, 'component.json');

    const parts = decompose(dirName);
    if (parts.error) {
      fail(`[variant] components/${dirName} ${parts.error}`);
      continue;
    }
    const { base, variant: dirVariant, compound } = parts;

    if (!fs.existsSync(contractPath)) {
      fail(`[contract] components/${dirName}/component.json is missing`);
      continue;
    }

    let contract;
    try {
      contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    } catch (err) {
      fail(`[contract] components/${dirName}/component.json is not valid JSON: ${err.message}`);
      continue;
    }

    // slug still means kebab(canonical) — the base of the directory name. All
    // variant dirs of one canonical share it; the "--<variant>" suffix differs.
    if (contract.slug !== base) {
      fail(`[contract] components/${dirName}/component.json declares slug "${contract.slug}" (expected "${base}")`);
    }
    if (!contract.canonical) {
      fail(`[contract] components/${dirName} has no canonical name`);
    } else if (kebab(contract.canonical) !== base) {
      fail(
        `[contract] components/${dirName}: kebab("${contract.canonical}") is "${kebab(contract.canonical)}" but the directory base is "${base}"`,
      );
    }

    // The variant axis. The bare dir holds the default; "<base>--<variant>" dirs
    // hold alternates. `variant` (singular) is the structural axis — distinct
    // from the free-form `variants` prop-value array, which is not checked here.
    if (compound) {
      if (contract.variant !== dirVariant) {
        fail(
          `[variant] components/${dirName} directory names variant "${dirVariant}" but component.json declares variant "${contract.variant}"`,
        );
      }
      if (contract.default === true) {
        fail(
          `[variant] components/${dirName} is an alternate variant but sets default:true — the default lives in the bare directory components/${base}`,
        );
      }
    } else if (contract.variant != null) {
      if (kebab(contract.variant) !== contract.variant) {
        fail(`[variant] components/${dirName} variant "${contract.variant}" is not kebab-case`);
      }
      if (contract.default !== true) {
        fail(
          `[variant] components/${dirName} declares a variant but not default:true — the bare directory holds the default variant`,
        );
      }
    }

    if (!MATURITIES.includes(contract.maturity)) {
      fail(`[contract] components/${dirName} maturity "${contract.maturity}" is not one of ${MATURITIES.join(', ')}`);
    }
    if (typeof contract.exportName !== 'string' || !/^[A-Za-z_$][\w$]*$/.test(contract.exportName)) {
      fail(`[reuse] components/${dirName} exportName must be a non-empty JavaScript identifier`);
    }
    if (!RENDERING_MODES.includes(contract.rendering)) {
      fail(`[reuse] components/${dirName} rendering "${contract.rendering}" is not one of ${RENDERING_MODES.join(', ')}`);
    }
    if (!Array.isArray(contract.variants)) {
      fail(`[reuse] components/${dirName} variants must be an array`);
    } else {
      const seenVariants = new Set();
      for (const variantValue of contract.variants) {
        if (typeof variantValue !== 'string' || variantValue.trim().length === 0) {
          fail(`[reuse] components/${dirName} variants entries must be non-empty strings`);
          continue;
        }
        if (seenVariants.has(variantValue)) {
          fail(`[reuse] components/${dirName} variants value "${variantValue}" is duplicated`);
        }
        seenVariants.add(variantValue);
      }
    }
    for (const key of ['project', 'source']) {
      if (!contract.provenance || !contract.provenance[key]) {
        fail(`[provenance] components/${dirName} is missing provenance.${key}`);
      }
    }
    if (!Array.isArray(contract.slots) || contract.slots.length === 0) {
      fail(`[contract] components/${dirName} declares no slots`);
    }
    validateReuseFingerprint(contract, dirName, fail);
    if (sourceParityEnabled && sourceParityBaseline) {
      validateManifestSourceParity(contract, dirName, sourceParityBaseline, fail);
      sourceParityRecords.push({ componentKey: dirName, evidence: contract.sourceParity });
    }

    for (const token of contract.tokens || []) {
      if (!definedTokens.has(token)) {
        fail(`[tokens] components/${dirName} declares "${token}", which the semantic layer does not define`);
      }
    }

    const implementations = implementationFiles(dir);
    const storiesList = storyFiles(dir);
    const stories = storiesList[0];
    if (implementations.length === 0) fail(`[files] components/${dirName} has no implementation (.ts/.tsx)`);
    if (storiesList.length > 1) fail(`[files] components/${dirName} must contain exactly one stories file`);
    if (!stories) fail(`[files] components/${dirName} has no stories file — the story is the API contract`);

    let title = null;
    let storySource = null;
    if (stories) {
      const source = fs.readFileSync(path.join(dir, stories), 'utf8');
      storySource = source;

      // The sidebar maturity badge reads a story tag, but maturity is declared in
      // component.json. Two sources for one fact drift silently, so they must agree.
      if (contract.maturity) {
        const tagged = source.match(/'maturity:([a-z]+)'/);
        if (!tagged) {
          fail(`[maturity] components/${dirName}/${stories} has no 'maturity:*' tag — the sidebar badge reads it`);
        } else if (tagged[1] !== contract.maturity) {
          fail(
            `[maturity] components/${dirName} is "${contract.maturity}" in component.json but tagged "${tagged[1]}" in ${stories}`,
          );
        }
      }

      if (sourceParityEnabled && sourceParityBaseline) {
        validateStorySourceParity(source, contract, dirName, `components/${dirName}/${stories}`, fail);
      }

      // Variants of one canonical share the Storybook sidebar and story-id
      // namespace, so their titles must not collide. The default's title is the
      // canonical; an alternate nests under it as "<Canonical> / <label>".
      // Anchor to a line-leading `title:` so a string-valued `title` inside args
      // or argTypes is not mistaken for the meta title.
      const titleMatch = source.match(/^\s*title:\s*['"]([^'"]+)['"]/m);
      title = titleMatch ? titleMatch[1] : null;
      if (contract.canonical) {
        if (!title) {
          fail(`[stories] components/${dirName}/${stories} has no story title`);
        } else if (compound) {
          const prefix = `${contract.canonical} /`;
          if (!title.startsWith(prefix) || title.slice(prefix.length).trim().length === 0) {
            fail(
              `[stories] components/${dirName} alternate story title "${title}" must start with "${contract.canonical} /" so variants group under one canonical`,
            );
          }
        } else if (title !== contract.canonical) {
          fail(`[stories] components/${dirName} story title "${title}" must equal the canonical "${contract.canonical}"`);
        }
      }
    }

    validateRealization(contract, dirName, storySource, fail);

    for (const impl of implementations) {
      scanImplementation(
        path.join(dir, impl),
        `components/${dirName}/${impl}`,
        definedTokens,
        fail,
      );
    }

    seen.push({
      dirName,
      base,
      compound,
      variant: compound ? dirVariant : contract.variant ?? null,
      isDefault: contract.default === true,
      canonical: contract.canonical,
      title,
    });
  }

  if (sharedDir && fs.existsSync(sharedDir)) {
    for (const file of implementationFiles(sharedDir)) {
      scanImplementation(path.join(sharedDir, file), `src/lib/${file}`, definedTokens, fail);
    }
  }

  if (sourceParityEnabled && sourceParityBaseline) {
    validateImplementationTargets(sourceParityRecords, sourceParityBaseline, fail);
  }

  // Cross-canonical pass: a canonical's directories must together form one
  // coherent variant set. Grouped by the directory-derived base (kebab(canonical)).
  const byBase = new Map();
  for (const r of seen) {
    if (!byBase.has(r.base)) byBase.set(r.base, []);
    byBase.get(r.base).push(r);
  }

  for (const [base, group] of byBase) {
    const alternates = group.filter((r) => r.compound);
    const bare = group.find((r) => !r.compound);
    const declaredDefaults = group.filter((r) => r.isDefault);

    if (alternates.length > 0) {
      if (!bare) {
        fail(
          `[variant] canonical "${base}" has alternate variant(s) ${alternates
            .map((a) => `components/${a.dirName}`)
            .join(', ')} but no default directory components/${base}/`,
        );
      } else if (bare.variant == null || !bare.isDefault) {
        fail(
          `[variant] components/${base} holds the default for a multi-variant canonical but does not declare variant + default:true`,
        );
      }
    } else if (bare && bare.variant != null) {
      fail(
        `[variant] components/${bare.dirName} declares a variant but the canonical has no alternate variants — a single-variant canonical must not declare a variant axis`,
      );
    }

    if (declaredDefaults.length > 1) {
      fail(
        `[variant] canonical "${base}" declares ${declaredDefaults.length} default variants (${declaredDefaults
          .map((d) => `components/${d.dirName}`)
          .join(', ')}); exactly one is allowed`,
      );
    }

    const names = group.map((r) => r.variant).filter((v) => v != null);
    for (const dup of new Set(names.filter((v, i) => names.indexOf(v) !== i))) {
      fail(`[variant] canonical "${base}" declares variant "${dup}" more than once`);
    }

    const canonicals = [...new Set(group.map((r) => r.canonical).filter(Boolean))];
    if (canonicals.length > 1) {
      fail(
        `[variant] canonical "${base}" is spelled inconsistently across its directories: ${canonicals
          .map((c) => JSON.stringify(c))
          .join(', ')}`,
      );
    }

    const titles = group.map((r) => r.title).filter((t) => t != null);
    for (const dup of new Set(titles.filter((t, i) => titles.indexOf(t) !== i))) {
      fail(`[stories] canonical "${base}" has two stories titled "${dup}" — variant titles must be distinct`);
    }
  }

  return failures;
}

if (require.main === module) {
  const failures = check();
  if (failures.length) {
    for (const failure of failures) process.stderr.write(`FAIL ${failure}\n`);
    process.stderr.write(`FAILED ${failures.length} check(s)\n`);
    process.exit(1);
  }
  process.stdout.write(`PASS ${listComponentDirs(COMPONENTS).length} component contract(s) intact.\n`);
}

module.exports = { check, kebab, decompose };
