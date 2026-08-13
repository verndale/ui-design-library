#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  check,
  checkSharedClientModules,
  physicalLines,
} = require('./check-component-architecture.cjs');

function write(root, file, source) {
  const target = path.join(root, 'components', 'example', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, source);
}

function valid(root) {
  write(root, 'index.ts', "export { Example } from './Example';\nexport type { ExampleProps } from './Example.types';\n");
  write(root, 'Example.types.ts', 'export interface ExampleProps { label?: string }\n');
  write(root, 'Example.tsx', "import { ExampleLabel } from './parts/ExampleLabel';\nexport const Example = () => <ExampleLabel />;\n");
  write(root, 'parts/ExampleLabel.tsx', 'export const ExampleLabel = () => <span>Example</span>;\n');
  write(root, 'Example.stories.tsx', "import { Example } from './index';\nexport default { component: Example };\n");
  write(root, 'component.json', '{"exportName":"Example","rendering":"server"}\n');
}

const cases = [
  {
    name: 'valid server tree passes',
    mutate() {},
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'primary export rendering is derived as hybrid',
    mutate(root) {
      write(root, 'component.json', '{"exportName":"Example","rendering":"hybrid"}\n');
      write(
        root,
        'Example.tsx',
        "import { ExampleClient } from './parts/ExampleClient.client';\nexport const Example = () => <ExampleClient />;\n",
      );
      write(
        root,
        'parts/ExampleClient.client.tsx',
        "'use client';\nexport const ExampleClient = () => <span />;\n",
      );
    },
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'side-effect client imports widen the primary graph',
    mutate(root) {
      write(root, 'Example.tsx', "import './parts/ExampleClient.client.js';\nexport const Example = () => <span />;\n");
      write(
        root,
        'parts/ExampleClient.client.tsx',
        "'use client';\nexport const ExampleClient = () => <span />;\n",
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('derives as "hybrid"')),
  },
  {
    name: 'static dynamic client imports widen the primary graph',
    mutate(root) {
      write(root, 'Example.tsx', "export const Example = () => <span />;\nexport const loadClient = () => import('./parts/ExampleClient.client.js');\n");
      write(
        root,
        'parts/ExampleClient.client.tsx',
        "'use client';\nexport const ExampleClient = () => <span />;\n",
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('derives as "hybrid"')),
  },
  {
    name: 'secondary client export does not widen the server primary classification',
    mutate(root) {
      write(
        root,
        'index.ts',
        "export { Example } from './Example';\nexport { Secondary } from './Secondary.client';\nexport type { ExampleProps } from './Example.types';\n",
      );
      write(root, 'Secondary.client.tsx', "'use client';\nexport const Secondary = () => <span />;\n");
    },
    expect: (failures) => failures.length === 0,
  },
  {
    name: 'secondary export prop literals cannot masquerade as primary variants',
    mutate(root) {
      write(
        root,
        'index.ts',
        "export { Example } from './Example';\nexport { ExampleGroup } from './parts/ExampleGroup';\nexport type { ExampleGroupProps, ExampleProps } from './Example.types';\n",
      );
      write(
        root,
        'Example.types.ts',
        "export interface ExampleProps { tone?: 'quiet' | 'loud' }\nexport interface ExampleGroupProps { orientation?: 'row' | 'column' }\n",
      );
      write(root, 'parts/ExampleGroup.tsx', 'export const ExampleGroup = () => <div />;\n');
      write(root, 'component.json', '{"exportName":"Example","rendering":"server","variants":["row"]}\n');
    },
    expect: (failures) =>
      failures.some((failure) => failure.includes('primary variant "row"') && failure.includes('secondary export ExampleGroup')),
  },
  {
    name: 'declared primary rendering must match the derived graph',
    mutate(root) {
      write(root, 'component.json', '{"exportName":"Example","rendering":"client"}\n');
    },
    expect: (failures) => failures.some((failure) => failure.includes('derives as "server"')),
  },
  {
    name: 'primary export must be explicit and named by the manifest',
    mutate(root) {
      write(root, 'component.json', '{"exportName":"Missing","rendering":"server"}\n');
    },
    expect: (failures) => failures.some((failure) => failure.includes('must explicitly export Missing exactly once')),
  },
  {
    name: '120 physical client lines pass',
    mutate(root) {
      write(root, 'index.ts', "'use client';\nexport { Example } from './Example.client';\n");
      write(root, 'Example.client.tsx', ["'use client';", 'export const Example = () => <span />;', ...Array(118).fill('// pad')].join('\n'));
    },
    expect: (failures) => !failures.some((failure) => failure.includes('[size]')),
  },
  {
    name: '121 physical client lines fail',
    mutate(root) {
      write(root, 'index.ts', "'use client';\nexport { Example } from './Example.client';\n");
      write(root, 'Example.client.tsx', ["'use client';", 'export const Example = () => <span />;', ...Array(119).fill('// pad')].join('\n'));
    },
    expect: (failures) => failures.some((failure) => failure.includes('has 121 physical lines')),
  },
  {
    name: 'neutral client hook fails',
    mutate(root) {
      write(root, 'Example.tsx', "import { useState } from 'react';\nexport const Example = () => { useState(0); return <span />; };\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes('uses client hook useState')),
  },
  {
    name: 'neutral browser global fails',
    mutate(root) {
      write(root, 'Example.tsx', 'export const Example = () => <span>{window.location.host}</span>;\n');
    },
    expect: (failures) => failures.some((failure) => failure.includes('uses browser global window')),
  },
  {
    name: 'client render helper cannot hide a browser global',
    mutate(root) {
      write(root, 'index.ts', "'use client';\nexport { Example } from './Example.client';\n");
      write(
        root,
        'Example.client.tsx',
        "const readTitle = () => document.title;\nexport const Example = () => <span>{readTitle()}</span>;\n",
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('document at module or render time')),
  },
  {
    name: 'neutral module cannot call an imported client hook',
    mutate(root) {
      write(
        root,
        'Example.tsx',
        "import { useExample } from './hooks/useExample.client';\nexport const Example = () => { useExample(); return <span />; };\n",
      );
      write(
        root,
        'hooks/useExample.client.ts',
        "'use client';\nimport { useState } from 'react';\nexport const useExample = () => useState(0);\n",
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes('calls client hook useExample')),
  },
  {
    name: 'neutral component cannot call a shared client hook',
    mutate(root) {
      write(
        root,
        'Example.tsx',
        "import { useShared } from '../../src/lib/useShared.client';\nexport const Example = () => { useShared(); return <span />; };\n",
      );
      const file = path.join(root, 'src/lib/useShared.client.ts');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, "'use client';\nimport { useState } from 'react';\nexport const useShared = () => useState(0);\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes('calls client hook useShared')),
  },
  {
    name: 'shared helper cannot hide a client render browser global',
    mutate(root) {
      write(root, 'index.ts', "'use client';\nexport { Example } from './Example.client';\n");
      write(
        root,
        'Example.client.tsx',
        "import { readTitle } from '../../src/lib/readTitle.client';\nexport const Example = () => <span>{readTitle()}</span>;\n",
      );
      const file = path.join(root, 'src/lib/readTitle.client.ts');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, 'export const readTitle = () => document.title;\n');
    },
    expect: (failures) => failures.some((failure) => failure.includes('document at module or render time')),
  },
  {
    name: 'server import requires a directive on its client island',
    mutate(root) {
      write(
        root,
        'Example.tsx',
        "import { ExampleClient } from './parts/ExampleClient.client';\nexport const Example = () => <ExampleClient />;\n",
      );
      write(
        root,
        'parts/ExampleClient.client.tsx',
        "import { useState } from 'react';\nexport const ExampleClient = () => { const [value] = useState(0); return <span>{value}</span>; };\n",
      );
    },
    expect: (failures) => failures.some((failure) => failure.includes("without a 'use client' boundary")),
  },
  {
    name: 'shared client module cannot access the DOM at module scope',
    mutate(root) {
      const file = path.join(root, 'src/lib/dom.client.ts');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, "'use client';\nexport const portalRoot = document.body;\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes('src/lib/dom.client.ts accesses browser global document')),
  },
  {
    name: 'one implementation TSX fails',
    mutate(root) {
      fs.rmSync(path.join(root, 'components/example/parts/ExampleLabel.tsx'));
      write(root, 'Example.tsx', 'export const Example = () => <span />;\n');
    },
    expect: (failures) => failures.some((failure) => failure.includes('at least two')),
  },
  {
    name: 'directive in neutral implementation fails',
    mutate(root) {
      write(root, 'Example.tsx', "'use client';\nexport const Example = () => <span />;\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes('not named *.client')),
  },
  {
    name: 'client directive after an export fails placement',
    mutate(root) {
      write(root, 'index.ts', "export { Example } from './Example.client';\n'use client';\n");
      write(root, 'Example.client.tsx', "'use client';\nexport const Example = () => <span />;\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes("must place 'use client' as its first statement")),
  },
  {
    name: 'unstable facade implementation fails',
    mutate(root) {
      write(root, 'index.ts', "export const hidden = true;\nexport { Example } from './Example';\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes('may contain only exports')),
  },
  {
    name: 'story bypassing facade fails',
    mutate(root) {
      write(root, 'Example.stories.tsx', "import { Example } from './Example';\nexport default { component: Example };\n");
    },
    expect: (failures) => failures.some((failure) => failure.includes("only from './index'")),
  },
];

let failed = 0;
for (const testCase of cases) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-selftest-'));
  try {
    valid(root);
    testCase.mutate(root);
    const failures = [
      ...check({ componentsDir: path.join(root, 'components') }),
      ...checkSharedClientModules({ root }),
    ];
    if (testCase.expect(failures)) process.stdout.write(`ok   ${testCase.name}\n`);
    else {
      failed += 1;
      process.stderr.write(`FAIL ${testCase.name}\n     got: ${JSON.stringify(failures, null, 2)}\n`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (physicalLines('one\n') !== 1 || physicalLines('one\ntwo') !== 2) {
  failed += 1;
  process.stderr.write('FAIL physical line normalization\n');
}
if (failed > 0) process.exit(1);
process.stdout.write(`PASS ${cases.length} architecture self-test case(s).\n`);
