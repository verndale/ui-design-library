#!/usr/bin/env node
/**
 * check-contracts.selftest.cjs — tests the contract checker's variant axis.
 *
 * `pnpm contracts` runs the checker against the real components/. That proves
 * the current tree is valid, but not that the checker would *catch* a broken
 * variant axis — a validator nobody exercises is a validator nobody trusts.
 * This builds throwaway fixture trees in a temp dir, runs check() against each,
 * and asserts the exact failures (or clean pass) it should produce.
 *
 * Exit codes: 0 all cases behave · 1 one or more cases misbehave.
 */

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { check } = require('./check-contracts.cjs');

// A minimal, valid-by-default component. Override fields per case to break it.
function comp(root, dirName, opts) {
  const dir = path.join(root, dirName);
  fs.mkdirSync(dir, { recursive: true });
  const {
    canonical,
    slug,
    variant,
    isDefault,
    maturity = 'candidate',
    title = canonical,
    tokens = [],
    slots = ['children'],
    reuseFingerprint = { slots: ['body'], affordance: 'display', role: 'container' },
    name = 'C',
    exportName = name,
    rendering = 'server',
    variants = [],
  } = opts;
  const contract = {
    canonical,
    slug,
    framework: 'react',
    styling: 'tailwind',
    slots,
    variants,
    exportName,
    rendering,
    reuseFingerprint,
    tokens,
    provenance: { project: 'x', source: 'y' },
    maturity,
  };
  if (variant !== undefined) contract.variant = variant;
  if (isDefault) contract.default = true;
  fs.writeFileSync(path.join(dir, `${name}.tsx`), `export const ${name} = () => null;\n`);
  // Multiline meta with `title` on its own line, matching real story files (the
  // checker anchors its title regex to a line-leading `title:`).
  fs.writeFileSync(
    path.join(dir, `${name}.stories.tsx`),
    `const meta = {\n  title: '${title}',\n  tags: ['maturity:${maturity}'],\n};\nexport default meta;\n`,
  );
  fs.writeFileSync(path.join(dir, 'component.json'), JSON.stringify(contract, null, 2));
}

const TOKEN_CSS = ':root { --x: 1px; }';

// Each case builds a fixtures dir and asserts on check()'s returned failures.
const cases = [
  {
    name: 'passing multi-variant pair returns no failures',
    build(root) {
      comp(root, 'navigation', { canonical: 'Navigation', slug: 'navigation', variant: 'bar', isDefault: true, title: 'Navigation' });
      comp(root, 'navigation--mega-menu', { canonical: 'Navigation', slug: 'navigation', variant: 'mega-menu', title: 'Navigation / Mega Menu' });
    },
    expect: (f) => f.length === 0,
  },
  {
    name: 'single-variant component with neither field passes',
    build(root) {
      comp(root, 'button', { canonical: 'Button', slug: 'button', title: 'Button' });
    },
    expect: (f) => f.length === 0,
  },
  {
    name: 'raw colour in a nested implementation fails',
    build(root) {
      comp(root, 'button', { canonical: 'Button', slug: 'button', title: 'Button' });
      const parts = path.join(root, 'button', 'parts');
      fs.mkdirSync(parts, { recursive: true });
      fs.writeFileSync(path.join(parts, 'ButtonLabel.tsx'), "export const ButtonLabel = () => <span className=\"text-[#fff]\" />;\n");
    },
    expect: (f) => f.some((m) => m.includes('parts/ButtonLabel.tsx') && m.includes('raw colour')),
  },
  {
    name: 'Next import in a nested implementation fails',
    build(root) {
      comp(root, 'button', { canonical: 'Button', slug: 'button', title: 'Button' });
      const parts = path.join(root, 'button', 'parts');
      fs.mkdirSync(parts, { recursive: true });
      fs.writeFileSync(path.join(parts, 'ButtonLabel.tsx'), "import Link from 'next/link';\nexport const ButtonLabel = Link;\n");
    },
    expect: (f) => f.some((m) => m.includes('parts/ButtonLabel.tsx') && m.includes('imports next/*')),
  },
  {
    name: 'shared nested implementation is scanned for framework and colour violations',
    build(root) {
      comp(root, 'card', { canonical: 'Card', slug: 'card', title: 'Card' });
      const shared = path.join(path.dirname(root), 'src/lib/nested');
      fs.mkdirSync(shared, { recursive: true });
      fs.writeFileSync(
        path.join(shared, 'Bad.ts'),
        "import Link from 'next/link';\nexport const raw = 'hsl(0 100% 50%)';\n",
      );
    },
    expect: (f) =>
      f.some((m) => m.includes('src/lib/nested/Bad.ts imports next/*')) &&
      f.some((m) => m.includes('src/lib/nested/Bad.ts:2 uses a raw colour')),
  },
  {
    name: 'missing reuse fingerprint fails',
    build(root) {
      comp(root, 'button', { canonical: 'Button', slug: 'button', title: 'Button', reuseFingerprint: null });
    },
    expect: (f) => f.some((m) => m.includes('components/button is missing reuseFingerprint')),
  },
  {
    name: 'ungoverned reuse fingerprint slot fails',
    build(root) {
      comp(root, 'button', {
        canonical: 'Button',
        slug: 'button',
        title: 'Button',
        reuseFingerprint: { slots: ['children'], affordance: 'trigger', role: 'action-group' },
      });
    },
    expect: (f) => f.some((m) => m.includes('reuseFingerprint slot "children" is not governed')),
  },
  {
    name: 'governed other fingerprint values pass contract validation',
    build(root) {
      comp(root, 'button', {
        canonical: 'Button',
        slug: 'button',
        title: 'Button',
        reuseFingerprint: { slots: ['other'], affordance: 'other', role: 'other' },
      });
    },
    expect: (f) => f.length === 0,
  },
  {
    name: 'missing primary export name fails',
    build(root) {
      comp(root, 'button', { canonical: 'Button', slug: 'button', title: 'Button', exportName: '' });
    },
    expect: (f) => f.some((m) => m.includes('exportName must be a non-empty JavaScript identifier')),
  },
  {
    name: 'unknown rendering classification fails',
    build(root) {
      comp(root, 'button', { canonical: 'Button', slug: 'button', title: 'Button', rendering: 'edge' });
    },
    expect: (f) => f.some((m) => m.includes('rendering "edge" is not one of')),
  },
  {
    name: 'duplicate and empty style variants fail',
    build(root) {
      comp(root, 'button', {
        canonical: 'Button',
        slug: 'button',
        title: 'Button',
        variants: ['primary', '', 'primary'],
      });
    },
    expect: (f) =>
      f.some((m) => m.includes('variants entries must be non-empty strings')) &&
      f.some((m) => m.includes('variants value "primary" is duplicated')),
  },
  {
    name: 'orphan alternate (no default dir) fails',
    build(root) {
      comp(root, 'foo--bar', { canonical: 'Foo', slug: 'foo', variant: 'bar', title: 'Foo / Bar' });
    },
    expect: (f) => f.some((m) => m.includes('has alternate variant(s)') && m.includes('no default directory components/foo/')),
  },
  {
    name: 'bare dir declares a variant but not default:true fails',
    build(root) {
      comp(root, 'nav', { canonical: 'Nav', slug: 'nav', variant: 'bar', title: 'Nav' });
      comp(root, 'nav--mega', { canonical: 'Nav', slug: 'nav', variant: 'mega', title: 'Nav / Mega' });
    },
    expect: (f) => f.some((m) => m.includes('components/nav declares a variant but not default:true')),
  },
  {
    name: 'compound variant disagreeing with its suffix fails',
    build(root) {
      comp(root, 'nav', { canonical: 'Nav', slug: 'nav', variant: 'bar', isDefault: true, title: 'Nav' });
      comp(root, 'nav--mega', { canonical: 'Nav', slug: 'nav', variant: 'mega-menu', title: 'Nav / Mega' });
    },
    expect: (f) => f.some((m) => m.includes('directory names variant "mega" but component.json declares variant "mega-menu"')),
  },
  {
    name: 'alternate setting default:true fails',
    build(root) {
      comp(root, 'nav', { canonical: 'Nav', slug: 'nav', variant: 'bar', isDefault: true, title: 'Nav' });
      comp(root, 'nav--mega', { canonical: 'Nav', slug: 'nav', variant: 'mega', isDefault: true, title: 'Nav / Mega' });
    },
    expect: (f) => f.some((m) => m.includes('components/nav--mega is an alternate variant but sets default:true')),
  },
  {
    name: 'duplicate variant name across the canonical fails',
    build(root) {
      comp(root, 'nav', { canonical: 'Nav', slug: 'nav', variant: 'mega', isDefault: true, title: 'Nav' });
      comp(root, 'nav--mega', { canonical: 'Nav', slug: 'nav', variant: 'mega', title: 'Nav / Mega' });
    },
    expect: (f) => f.some((m) => m.includes('declares variant "mega" more than once')),
  },
  {
    name: 'alternate title not nested under the canonical fails',
    build(root) {
      comp(root, 'nav', { canonical: 'Nav', slug: 'nav', variant: 'bar', isDefault: true, title: 'Nav' });
      comp(root, 'nav--mega', { canonical: 'Nav', slug: 'nav', variant: 'mega', title: 'Nav' });
    },
    expect: (f) => f.some((m) => m.includes('alternate story title "Nav" must start with "Nav /"')),
  },
  {
    name: 'directory name with more than one "--" fails',
    build(root) {
      comp(root, 'a--b--c', { canonical: 'A', slug: 'a', variant: 'b', title: 'A / B' });
    },
    expect: (f) => f.some((m) => m.includes('components/a--b--c has more than one "--" separator')),
  },
  {
    name: 'directory name with an empty half fails',
    build(root) {
      comp(root, 'foo--', { canonical: 'Foo', slug: 'foo', variant: 'x', title: 'Foo / X' });
    },
    expect: (f) => f.some((m) => m.includes('components/foo-- has an empty half around "--"')),
  },
  {
    name: 'lone dir declaring a variant axis (no alternates) fails',
    build(root) {
      comp(root, 'solo', { canonical: 'Solo', slug: 'solo', variant: 'only', isDefault: true, title: 'Solo' });
    },
    expect: (f) => f.some((m) => m.includes('components/solo declares a variant but the canonical has no alternate variants')),
  },
  {
    name: 'two alternates sharing a story title fail',
    build(root) {
      comp(root, 'nav', { canonical: 'Nav', slug: 'nav', variant: 'bar', isDefault: true, title: 'Nav' });
      comp(root, 'nav--mega', { canonical: 'Nav', slug: 'nav', variant: 'mega', title: 'Nav / Same' });
      comp(root, 'nav--compact', { canonical: 'Nav', slug: 'nav', variant: 'compact', title: 'Nav / Same' });
    },
    expect: (f) => f.some((m) => m.includes('has two stories titled "Nav / Same"')),
  },
  {
    // Guards the anchored title regex: a wrong meta title hidden behind an inline
    // args.title before it would slip past an unanchored /title:/ match.
    name: 'wrong meta title caught despite an inline args.title before it',
    build(root) {
      const dir = path.join(root, 'guard');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'C.tsx'), 'export const C = () => null;\n');
      fs.writeFileSync(
        path.join(dir, 'C.stories.tsx'),
        "const meta = {\n  args: { title: 'Guard' },\n  title: 'Wrong',\n  tags: ['maturity:candidate'],\n};\nexport default meta;\n",
      );
      fs.writeFileSync(
        path.join(dir, 'component.json'),
        JSON.stringify(
          {
            canonical: 'Guard',
            slug: 'guard',
            exportName: 'C',
            rendering: 'server',
            slots: ['children'],
            variants: [],
            reuseFingerprint: { slots: ['body'], affordance: 'display', role: 'container' },
            tokens: [],
            provenance: { project: 'x', source: 'y' },
            maturity: 'candidate',
          },
          null,
          2,
        ),
      );
    },
    expect: (f) => f.some((m) => m.includes('story title "Wrong" must equal the canonical "Guard"')),
  },
];

let failed = 0;
for (const c of cases) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'contracts-selftest-'));
  try {
    c.build(path.join(root, 'components'));
    const failures = check({
      componentsDir: path.join(root, 'components'),
      tokenCss: TOKEN_CSS,
      sharedDir: path.join(root, 'src/lib'),
    });
    if (c.expect(failures)) {
      process.stdout.write(`ok   ${c.name}\n`);
    } else {
      failed += 1;
      process.stderr.write(`FAIL ${c.name}\n`);
      process.stderr.write(`     got: ${JSON.stringify(failures, null, 2)}\n`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (failed) {
  process.stderr.write(`FAILED ${failed} of ${cases.length} self-test case(s)\n`);
  process.exit(1);
}
process.stdout.write(`PASS ${cases.length} self-test case(s).\n`);
