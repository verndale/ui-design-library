import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, within } from 'storybook/test';

import { InPageNavigation, type InPageNavigationItem } from './index';

const sections: InPageNavigationItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

/**
 * The story file is this component's API contract. The behaviour worth proving
 * is the landmark and the active-section contract — a labelled `<nav>`, real
 * anchor links, and `aria-current="true"` on exactly one link — plus the mobile
 * drawer's disclosure. The scroll-spy itself is exercised through the
 * `activeId` override, since a non-scrolling story cannot drive the observer.
 */
const meta = {
  title: 'In-page navigation',
  component: InPageNavigation,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['in-page-navigation.disclosure.keyboard', 'in-page-navigation.disclosure.state', 'in-page-navigation.responsive.hidden'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A sticky "on this page" bar of anchor links that jump to sections within the current page and track which is in view. A `<nav>` landmark whose active link carries `aria-current`; a horizontal pill bar on wide viewports, collapsing to a trigger + drawer below `lg`.',
      },
    },
  },
  argTypes: {
    "items": { control: 'object', description: "Required. Public `items` realization prop." },
    "ariaLabel": { control: 'text', description: "Optional. Public `ariaLabel` realization prop. Defaults to \"On this page\"." },
    "activeId": { control: 'text', description: "Optional. Public `activeId` realization prop." },
    "collapsedIcon": { control: false, description: "Optional. Public `collapsedIcon` realization prop." },
    "expandedIcon": { control: false, description: "Optional. Public `expandedIcon` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { items: sections },
} satisfies Meta<typeof InPageNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The wide-viewport pill bar. With no scroll context, the first section is active. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByRole('navigation', { name: 'On this page' });
    await expect(nav).toBeInTheDocument();

    // Only the visible desktop list is in the a11y tree (the mobile drawer is
    // display:none + inert at this viewport), so exactly the four links show.
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(4);
    await expect(links[0]).toHaveAttribute('href', '#overview');

    // Exactly one link is current, and it is the first by default.
    const current = links.filter((link) => link.getAttribute('aria-current') === 'true');
    await expect(current).toHaveLength(1);
    await expect(current[0]).toHaveAccessibleName('Overview');
  },
};

/** Driving `activeId` moves `aria-current` — the controlled path the scroll-spy uses internally. */
export const ActiveSection: Story = {
  args: { activeId: 'pricing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'true');
    await expect(current).toHaveLength(1);
    await expect(current[0]).toHaveAccessibleName('Pricing');
  },
};

/**
 * The mobile drawer discloses the section list. Its trigger lives in the
 * `lg:hidden` subtree, which is `display:none` at this desktop test viewport, so
 * it is driven with `fireEvent` (which ignores visibility) to prove the
 * `aria-expanded` + `inert` contract independent of breakpoint.
 */
export const MobileDrawer: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('button[aria-controls]') as HTMLButtonElement;
    const drawerId = trigger.getAttribute('aria-controls')!;
    const drawer = canvasElement.querySelector(`#${drawerId}`) as HTMLElement;

    // Collapsed: expanded is false and the drawer links are inert.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(drawer.hasAttribute('inert')).toBe(true);

    fireEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer.hasAttribute('inert')).toBe(false);

    fireEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(drawer.hasAttribute('inert')).toBe(true);
  },
};

/**
 * The drawer reveal is one property driven by `--duration-base`, so the
 * reduced-motion media query is the single switch. Re-run under emulated reduced
 * motion by `pnpm test:motion`, where the same assertion flips to `0s`.
 */
export const ReducedMotion: Story = {
  tags: ['motion'],
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-inpage-motion]');
    await expect(panel).toBeTruthy();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel as Element).transitionDuration).toBe(reduced ? '0s' : '0.3s');
  },
};
