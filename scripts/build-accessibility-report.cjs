#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { listComponentDirs } = require('./lib/component-files.cjs');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const OUTPUT = path.join(ROOT, 'ACCESSIBILITY.md');

const RESPONSIBILITY_COPY = {
  'accessible-copy': 'Supply meaningful labels and visible copy in context.',
  'text-alternatives': 'Supply meaningful text alternatives, using empty alternatives only for decorative images.',
  'heading-context': 'Choose heading levels that preserve the complete page hierarchy.',
  'landmark-context': 'Keep landmark names unique and meaningful on the complete page.',
  'dynamic-content': 'Supply accessible dynamic content and avoid duplicate announcement paths.',
  'timed-content': 'When enabling auto-dismiss, provide a persistent equivalent or applicable user control over the time limit.',
  'token-contrast': 'Preserve WCAG 2.2 AA contrast when overriding semantic tokens.',
  'safe-class-overrides': 'Do not use classNames to hide labels or required nodes, suppress focus, or disable pointer or keyboard access.',
  'complete-page-assistive-technology-testing': 'Test complete consuming pages with supported assistive technologies, including VoiceOver where required.',
};

function renderReport(componentsDir = COMPONENTS) {
  const contracts = listComponentDirs(componentsDir)
    .map((dir) => JSON.parse(fs.readFileSync(path.join(componentsDir, dir, 'component.json'), 'utf8')))
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
  const responsibilities = [...new Set(contracts.flatMap((contract) => contract.realization.accessibility.consumerResponsibilities))].sort();
  const lines = [
    '# Accessibility contract',
    '',
    '> Generated from `components/*/component.json` by `pnpm accessibility:report`. Do not edit by hand.',
    '',
    'Reference fixtures run the configured WCAG 2.x A/AA axe rules and keyed Storybook assertions in Chromium and WebKit. Manifests cite the WCAG 2.2 criteria and APG patterns associated with each owned behavior. These automated checks cover only part of WCAG, so this report is not a whole-page conformance claim and is not a VoiceOver certification.',
    '',
    'WebKit coverage is a Safari-engine regression proxy. Human assistive-technology testing remains a consuming-project responsibility.',
    '',
    '## Consumer responsibilities',
    '',
    ...responsibilities.map((id) => `- \`${id}\`: ${RESPONSIBILITY_COPY[id]}`),
    '',
    '## Component-owned guarantees',
    '',
    '| Component | Rendering | APG pattern | Owned evidence | Consumer responsibilities |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const contract of contracts) {
    const realization = contract.realization;
    const evidence = realization.behaviors.map((behavior) => `\`${behavior.id}\` (${behavior.wcag.join(', ')})`).join('<br>');
    const pattern = realization.accessibility.apgPattern ? `\`${realization.accessibility.apgPattern}\`` : 'Native semantics';
    const consumers = realization.accessibility.consumerResponsibilities.map((id) => `\`${id}\``).join('<br>');
    lines.push(`| ${contract.canonical} | \`${contract.rendering}\` | ${pattern} | ${evidence} | ${consumers} |`);
  }
  lines.push('', 'The exact package-owned DOM nodes, safe attributes, IDREF relationships, protected styling properties, and public prop types are authoritative in each component manifest.', '');
  return lines.join('\n');
}

if (require.main === module) {
  const expected = renderReport();
  if (process.argv.includes('--write')) {
    fs.writeFileSync(OUTPUT, expected);
    process.stdout.write(`Wrote ${path.relative(ROOT, OUTPUT)}\n`);
  } else if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT, 'utf8') !== expected) {
    process.stderr.write('ACCESSIBILITY.md is stale; run pnpm accessibility:report --write\n');
    process.exit(1);
  } else {
    process.stdout.write('PASS ACCESSIBILITY.md matches component realization manifests.\n');
  }
}

module.exports = { renderReport };
