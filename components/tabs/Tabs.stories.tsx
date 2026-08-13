import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tabs, type TabItem } from './index';

const three: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specs' },
  { id: 'reviews', label: 'Reviews' },
];

/**
 * The story file is this component's API contract. The behaviour worth proving
 * is the tablist semantics — `aria-selected`, the roving tab order, and that
 * ArrowLeft/ArrowRight move selection and focus with wraparound. Rendered
 * uncontrolled (`defaultActiveId`); a real consumer may drive it with
 * `activeId` + `onSelect`.
 */
const meta = {
  title: 'Tabs',
  component: Tabs,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['tabs.keyboard.roving', 'tabs.state.selection'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A pill tablist of mutually exclusive tabs. The selected tab carries `aria-selected` and is the only one in the tab order; ArrowLeft/ArrowRight move selection and focus with wraparound. Presentation only — the caller owns the panels.',
      },
    },
  },
  argTypes: {
    "items": { control: 'object', description: "Required. Public `items` realization prop." },
    "ariaLabel": { control: 'text', description: "Required. Public `ariaLabel` realization prop." },
    "activeId": { control: 'text', description: "Optional. Public `activeId` realization prop." },
    "defaultActiveId": { control: 'text', description: "Optional. Public `defaultActiveId` realization prop." },
    "onSelect": { control: false, description: "Optional. Public `onSelect` realization prop." },
    "tabIdPrefix": { control: 'text', description: "Optional. Public `tabIdPrefix` realization prop. Defaults to \"tab\"." },
    "orientation": { control: 'radio', options: ["horizontal","vertical"], description: "Optional. Public `orientation` realization prop. Defaults to \"horizontal\"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { items: three, ariaLabel: 'Product sections' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The pill variant (the default rendering): one filled segment on an inverse surface. */
export const Default: Story = {
  args: { defaultActiveId: 'overview' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const specs = canvas.getByRole('tab', { name: 'Specs' });

    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('tabindex', '0');
    // Only the selected tab is in the tab order.
    await expect(specs).toHaveAttribute('tabindex', '-1');

    // Selection follows a pointer click.
    await userEvent.click(specs);
    await expect(specs).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('aria-selected', 'false');
  },
};

/** ArrowRight/ArrowLeft move selection and focus, wrapping at each end. */
export const KeyboardWraparound: Story = {
  args: { defaultActiveId: 'overview' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const reviews = canvas.getByRole('tab', { name: 'Reviews' });

    overview.focus();
    await expect(overview).toHaveFocus();

    // ArrowLeft from the first tab wraps to the last, moving focus with it.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(reviews).toHaveAttribute('aria-selected', 'true');
    await expect(reviews).toHaveFocus();

    // ArrowRight from the last tab wraps back to the first.
    await userEvent.keyboard('{ArrowRight}');
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveFocus();
  },
};

/** Two tabs is the minimum that keeps keyboard navigation active. */
export const TwoTabs: Story = {
  args: {
    defaultActiveId: 'grid',
    items: [
      { id: 'grid', label: 'Grid' },
      { id: 'list', label: 'List' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('tab', { name: 'Grid' });
    const list = canvas.getByRole('tab', { name: 'List' });
    grid.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(list).toHaveAttribute('aria-selected', 'true');
  },
};

/** Enough tabs to wrap onto a second row — layout stays centred and the wraparound still holds. */
export const ManyTabs: Story = {
  args: {
    defaultActiveId: 't0',
    items: Array.from({ length: 8 }, (_, i) => ({ id: `t${i}`, label: `Section ${i + 1}` })),
  },
};

/**
 * The colour transition is driven by `--duration-base`, so the reduced-motion
 * media query is the single switch. Re-run under emulated reduced motion by
 * `pnpm test:motion`, where the same assertion flips to `0s`.
 */
export const ReducedMotion: Story = {
  tags: ['motion'],
  args: { defaultActiveId: 'overview' },
  play: async ({ canvasElement }) => {
    const tab = within(canvasElement).getByRole('tab', { name: 'Overview' });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(tab).transitionDuration).toBe(reduced ? '0s' : '0.3s');
  },
};
