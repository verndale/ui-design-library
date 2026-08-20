import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Stat, StatGroup } from './index';

const meta = {
  title: 'Stat',
  component: Stat,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "stat",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/stat",
      "privateAuditDigest": "1cadbc6a795c707f87dcae84c61f32b91c938722dd3ec0d36374f38ab6437682",
      "decisionIds": [
        "sp-stat-001",
        "sp-stat-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['stat.reading.order'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single statistic: a prominent value paired with a describing label, value-then-label in reading order. The surface is the caller’s — wrap in a Card for the boxed treatment. Group several with StatGroup, which names a native list with a visually-hidden heading.',
      },
    },
  },
  argTypes: {
    "value": { control: false, description: "Required. Public `value` realization prop." },
    "label": { control: false, description: "Required. Public `label` realization prop." },
    "description": { control: false, description: "Optional. Public `description` realization prop." },
    "contentOrder": { control: 'radio', options: ["value-first","label-first"], description: "Optional. Public `contentOrder` realization prop. Defaults to \"value-first\"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { value: '98%', label: 'customer satisfaction' },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** The value leads, the label follows — both are plain content, no role. */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('stat.reading.order', async () => {
      const root = canvasElement.querySelector('[data-component="stat"]');
      await expect(canvas.getByText('98%')).toBeVisible();
      await expect(canvas.getByText('customer satisfaction')).toBeVisible();
      await expect(root?.textContent).toMatch(/^98%customer satisfaction/);
    });
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

    await expect(list).toHaveAccessibleName('By the numbers');
    await expect(canvas.getByRole('heading', { level: 2, name: 'By the numbers' })).toBeInTheDocument();

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

    await expect(list).toHaveAccessibleName('Highlights');
    await expect(canvas.getByRole('heading', { level: 2, name: 'Highlights' })).toBeInTheDocument();

    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(list.className).not.toContain('md:flex-row');
  },
};
