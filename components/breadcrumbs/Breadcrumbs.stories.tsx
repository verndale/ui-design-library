import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Breadcrumbs } from './index';

const meta = {
  title: 'Breadcrumbs',
  component: Breadcrumbs,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A trail of ancestor links ending in the current page. Below `xl` it collapses to a single back link to the nearest ancestor — the responsive behaviour most breadcrumb implementations skip. Resize the viewport to see the switch.',
      },
    },
  },
  argTypes: {
    surface: { control: 'radio', options: ['light', 'dark'] },
    currentPageTitle: { control: 'text' },
    ariaLabel: { control: 'text', description: 'Change it when a page has more than one trail.' },
  },
  args: {
    items: [
      { label: 'Home', href: '#home' },
      { label: 'Services', href: '#services' },
      { label: 'Rail freight', href: '#rail' },
    ],
    currentPageTitle: 'Intermodal',
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /**
   * Queried through the DOM rather than by role, because one of the two
   * presentations is always `display: none` at any given viewport and role
   * queries skip it. The markup contract holds regardless of which is showing.
   */
  play: async ({ canvasElement, step }) => {
    const nav = canvasElement.querySelector('nav[data-component="breadcrumbs"]') as HTMLElement;
    await expect(nav).toBeTruthy();

    await step('is a labelled navigation landmark', async () => {
      await expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
      await expect(nav.querySelector('ol')).toBeTruthy();
    });

    await step('ancestors are links carrying their href', async () => {
      const trail = nav.querySelector('ol') as HTMLElement;
      const links = [...trail.querySelectorAll('a')];
      await expect(links.map((a) => a.textContent?.trim())).toEqual(['Home', 'Services', 'Rail freight']);
      await expect(links.map((a) => a.getAttribute('href'))).toEqual(['#home', '#services', '#rail']);
    });

    await step('the current page is marked, and is not a link', async () => {
      const current = nav.querySelector('[aria-current="page"]') as HTMLElement;
      await expect(current).toBeTruthy();
      await expect(current).toHaveTextContent('Intermodal');
      await expect(current.tagName.toLowerCase()).not.toBe('a');
      await expect(current.querySelector('a')).toBeNull();
    });

    await step('separators are hidden from assistive technology', async () => {
      const separators = [...nav.querySelectorAll('ol [aria-hidden="true"]')];
      await expect(separators.length).toBeGreaterThan(0);
      await expect(separators.every((s) => s.textContent?.trim() === '/')).toBe(true);
    });

    await step('exactly one presentation is visible at this viewport', async () => {
      const trail = nav.querySelector('ol') as HTMLElement;
      const back = nav.querySelector('a.xl\\:hidden') as HTMLElement;
      const shown = [trail, back].filter((el) => el && getComputedStyle(el).display !== 'none');
      await expect(shown).toHaveLength(1);
    });
  },
};

/** Below xl the trail collapses to a single link back to the nearest ancestor. */
export const CollapsedBackLink: Story = {
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('nav[data-component="breadcrumbs"]') as HTMLElement;
    const back = nav.querySelector('a.xl\\:hidden') as HTMLAnchorElement;

    await expect(back).toBeTruthy();
    // The nearest ancestor, not the root — going back to Home from a deep page
    // is the bug this replaces.
    await expect(back).toHaveAttribute('href', '#rail');
    await expect(back).toHaveTextContent('Rail freight');
    // The tap target comes from the token rather than a hard-coded pixel value,
    // which is what lets a consuming project raise it in one place. Asserted
    // against the token so this tracks the token instead of restating it.
    const token = getComputedStyle(document.documentElement).getPropertyValue('--size-touch-medium').trim();
    await expect(token).toBeTruthy();
    await expect(getComputedStyle(back).minHeight).toBe(token);
    // WCAG 2.5.8 (AA) floor. Note the token is 40px where the captured source
    // hard-coded 44px — see the note in component.json.
    await expect(parseFloat(getComputedStyle(back).minHeight)).toBeGreaterThanOrEqual(24);
  },
};

export const OnDarkSurface: Story = {
  args: { surface: 'dark' },
  render: (args) => (
    <div className="bg-surface-inverse p-l">
      <Breadcrumbs {...args} />
    </div>
  ),
};

/** A single ancestor still collapses correctly below xl. */
export const SingleLevel: Story = {
  args: { items: [{ label: 'Home', href: '#home' }], currentPageTitle: 'About' },
};

/** A deep trail wraps rather than overflowing. */
export const DeepTrail: Story = {
  args: {
    items: [
      { label: 'Home', href: '#home' },
      { label: 'Services', href: '#services' },
      { label: 'Rail freight', href: '#rail' },
      { label: 'North America', href: '#na' },
      { label: 'Terminals', href: '#terminals' },
    ],
    currentPageTitle: 'Intermodal terminal operations and scheduling',
  },
  render: (args) => (
    <div className="max-w-[520px]">
      <Breadcrumbs {...args} />
    </div>
  ),
};

/** No ancestors: the trail shows the page and the back link is omitted. */
export const NoAncestors: Story = {
  args: { items: [], currentPageTitle: 'Home' },
  /** No ancestor means no back link — not a back link pointing nowhere. */
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('nav[data-component="breadcrumbs"]') as HTMLElement;

    await expect(nav.querySelectorAll('a')).toHaveLength(0);
    await expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Home');
  },
};

/** A second trail on the same page needs its own landmark name. */
export const CustomLandmarkLabel: Story = {
  args: { ariaLabel: 'Secondary breadcrumb' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Secondary breadcrumb' })).toBeInTheDocument();
  },
};
