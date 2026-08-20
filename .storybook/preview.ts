import type { Preview } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

import '../src/tokens/index.css';
import { withDirection } from './withDirection';
import { withA11yModes } from './withA11yModes';

const preview: Preview = {
  // Generate a Docs page for every component. Without this, addon-docs is
  // installed but produces nothing.
  tags: ['autodocs'],
  decorators: [withA11yModes, withDirection],
  globalTypes: {
    // Every component uses logical properties (ps/pe, ms/me, border-s) so that
    // it works in both directions. That only holds if somebody can actually see
    // the other direction — an incomplete conversion reads as correct in LTR.
    direction: {
      description: 'Writing direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    direction: 'ltr',
    backgrounds: { value: undefined },
  },
  parameters: {
    controls: { expanded: true },
    a11y: {
      // A violation fails the story test. This is only honest because there is
      // a runner behind it now — `pnpm test:stories` runs axe against every
      // story in a real browser. See vitest.config.ts.
      test: 'error',
      config: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
        },
      },
    },
    viewport: {
      // Breadcrumbs collapses to a single back link below `xl`, and Modal goes
      // full-screen below `lg`. Both switches are otherwise only checkable by
      // dragging the window. The two library breakpoints are listed explicitly
      // alongside the device presets.
      options: {
        ...INITIAL_VIEWPORTS,
        lgBoundary: { name: 'Breakpoint — lg (1024px)', styles: { width: '1024px', height: '900px' }, type: 'desktop' },
        xlBoundary: { name: 'Breakpoint — xl (1280px)', styles: { width: '1280px', height: '900px' }, type: 'desktop' },
        belowXl: { name: 'Below xl (1279px)', styles: { width: '1279px', height: '900px' }, type: 'desktop' },
        sourceParity1440: { name: 'Source parity — 1440px', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
        sourceParity768: { name: 'Source parity — 768px', styles: { width: '768px', height: '900px' }, type: 'tablet' },
        sourceParity390: { name: 'Source parity — 390px', styles: { width: '390px', height: '844px' }, type: 'mobile' },
      },
    },
    backgrounds: {
      // Named for the semantic tokens rather than the colours, so a project
      // overriding a token sees the override here too.
      options: {
        base: { name: 'surface-base', value: 'var(--color-surface-base)' },
        sunken: { name: 'surface-sunken', value: 'var(--color-surface-sunken)' },
        raised: { name: 'surface-raised', value: 'var(--color-surface-raised)' },
        inverse: { name: 'surface-inverse', value: 'var(--color-surface-inverse)' },
      },
    },
  },
};

export default preview;
