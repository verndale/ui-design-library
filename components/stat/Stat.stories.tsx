import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Stat, StatGroup } from './Stat';

const meta = {
  title: 'Stat',
  component: Stat,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single statistic: a prominent value paired with a describing label, value-then-label in reading order. The surface is the caller’s — wrap in a Card for the boxed treatment. Group several with StatGroup, which names a native list with a visually-hidden heading.',
      },
    },
  },
  args: { value: '98%', label: 'customer satisfaction' },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** The value leads, the label follows — both are plain content, no role. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('98%')).toBeVisible();
    await expect(canvas.getByText('customer satisfaction')).toBeVisible();
  },
};

/** The optional description sits beneath the pair. */
export const WithDescription: Story = {
  args: {
    value: '10×',
    label: 'faster onboarding',
    description: 'Teams reach full productivity in a fraction of the time they used to.',
  },
};

/** A row group: the visually-hidden heading names the list, and the stats sit side by side at md+. */
export const GroupRow: Story = {
  render: () => (
    <StatGroup heading="By the numbers" orientation="row">
      <Stat value="98%" label="customer satisfaction" />
      <Stat value="10×" label="faster onboarding" />
      <Stat value="24/7" label="support" />
    </StatGroup>
  ),
  /** The reason to reach for StatGroup: the list carries the group's accessible name. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');

    // aria-labelledby resolves to the visually-hidden heading — the accessible name.
    const labelId = list.getAttribute('aria-labelledby');
    await expect(labelId).toBeTruthy();
    const heading = canvasElement.querySelector(`[id="${labelId}"]`);
    await expect(heading).toHaveTextContent('By the numbers');

    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    // Row lays the stats out horizontally at md+ (asserted on the class so it holds
    // regardless of the render viewport).
    await expect(list.className).toContain('md:flex-row');
  },
};

/** A column group: same accessible-name contract, stacked. */
export const GroupColumn: Story = {
  render: () => (
    <StatGroup heading="Highlights" orientation="column">
      <Stat value="#1" label="rated by customers" />
      <Stat value="500M+" label="requests served daily" />
    </StatGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');

    const labelId = list.getAttribute('aria-labelledby');
    const heading = canvasElement.querySelector(`[id="${labelId}"]`);
    await expect(heading).toHaveTextContent('Highlights');

    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(list.className).not.toContain('md:flex-row');
  },
};
