import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Badge, type BadgeProps } from './index';

type BadgeStoryArgs = BadgeProps;

const meta = {
  title: 'Badge',
  component: Badge,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['badge.semantics.name', 'badge.remove.keyboard'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A short label for status or categorisation. Supplying `onRemove` adds the client-side, keyboard-operable remove control.',
      },
    },
  },
  argTypes: {
    "label": { control: 'text', description: "Required. Public `label` realization prop." },
    "disabled": { control: 'boolean', description: "Optional. Public `disabled` realization prop. Defaults to false." },
    "surface": { control: 'radio', options: ["light","dark"], description: "Optional. Public `surface` realization prop. Defaults to \"light\"." },
    "startIcon": { control: false, description: "Optional. Public `startIcon` realization prop." },
    "endIcon": { control: false, description: "Optional. Public `endIcon` realization prop." },
    "onRemove": { control: false, description: "Optional. Public `onRemove` realization prop." },
    "removeLabel": { control: 'text', description: "Optional. Public `removeLabel` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { label: 'Rail freight' },
} satisfies Meta<BadgeStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** The server-safe badge never introduces an interactive control. */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('badge.semantics.name', async () => {
      await expect(canvas.getByText('Rail freight')).toBeInTheDocument();
      await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    });
  },
};

const remove = fn();

/** The filter-chip case. The dismiss button is keyboard operable and self-labelling. */
export const Dismissible: Story = {
  render: (args) => <Badge {...args} onRemove={remove} />,
  /** The dismiss control includes the badge label in its accessible name. */
  play: async ({ canvasElement, step }) => {
    remove.mockClear();
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Remove Rail freight' });

    await step('activates by click', async () => {
      await userEvent.click(dismiss);
      await expect(remove).toHaveBeenCalledTimes(1);
    });

    await step('badge.remove.keyboard', async () => {
      dismiss.focus();
      await expect(dismiss).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(remove).toHaveBeenCalledTimes(2);
    });
  },
};

/** When the label alone reads oddly, the accessible name can be overridden. */
export const CustomRemoveLabel: Story = {
  args: { label: '2024' },
  render: (args) => (
    <Badge {...args} removeLabel="Remove the 2024 filter" onRemove={() => {}} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Remove the 2024 filter' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Remove 2024' })).not.toBeInTheDocument();
  },
};

export const OnDarkSurface: Story = {
  args: { surface: 'dark' },
  render: (args) => (
    <div className="bg-surface-inverse p-l">
      <Badge {...args} />
    </div>
  ),
};

const disabledRemove = fn();

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Badge {...args} onRemove={disabledRemove} />,
  parameters: {
    a11y: {
      // WCAG 1.4.3 exempts inactive components from the contrast minimum, and
      // the dimming *is* the disabled affordance. axe cannot tell a disabled
      // control from low-contrast body text, so the rule is scoped off here
      // rather than the design being changed to satisfy it.
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
  },
  /** Disabled must actually block the callback, not just dim the chip. */
  play: async ({ canvasElement }) => {
    disabledRemove.mockClear();
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Remove Rail freight' });

    await expect(dismiss).toBeDisabled();
    // Ignore CSS pointer blocking here so the disabled attribute is exercised directly.
    await userEvent.setup({ pointerEventsCheck: 0 }).click(dismiss);
    await expect(disabledRemove).not.toHaveBeenCalled();
  },
};

/** A set of filters, which is how these usually appear. */
export const Group: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2xs">
      {['Rail freight', 'Intermodal', 'Supply chain', 'Sustainability'].map((label) => (
        <Badge key={label} {...args} label={label} onRemove={() => {}} />
      ))}
    </div>
  ),
};
