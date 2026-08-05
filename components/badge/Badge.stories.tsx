import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Badge } from './Badge';

const meta = {
  title: 'Badge',
  component: Badge,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A short label, optionally dismissible — covers both the plain status tag and the filter chip. When `onRemove` is supplied the dismiss control is a real button with its own accessible name, defaulting to `Remove {label}`.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    surface: { control: 'radio', options: ['light', 'dark'] },
    disabled: { control: 'boolean' },
    onRemove: { action: 'remove' },
  },
  args: { label: 'Rail freight' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The `onRemove` action argType injects a spy into every story, so the plain
  // tag has to opt out explicitly rather than by omission.
  args: { onRemove: undefined },
  /** No dismiss control unless `onRemove` is supplied — a plain status tag. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Rail freight')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

/** The filter-chip case. The dismiss button is keyboard operable and self-labelling. */
export const Dismissible: Story = {
  args: { onRemove: fn() },
  /**
   * The dismiss control deriving its own name from the label is the part of the
   * capture worth keeping: a row of chips all labelled "Remove" is unusable by
   * screen reader, and nothing visual reveals that.
   */
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Remove Rail freight' });

    await step('activates by click', async () => {
      await userEvent.click(dismiss);
      await expect(args.onRemove).toHaveBeenCalledTimes(1);
    });

    await step('activates by keyboard', async () => {
      dismiss.focus();
      await expect(dismiss).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onRemove).toHaveBeenCalledTimes(2);
    });
  },
};

/** When the label alone reads oddly, the accessible name can be overridden. */
export const CustomRemoveLabel: Story = {
  args: { label: '2024', removeLabel: 'Remove the 2024 filter', onRemove: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Remove the 2024 filter' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Remove 2024' })).not.toBeInTheDocument();
  },
};

export const OnDarkSurface: Story = {
  args: { surface: 'dark', onRemove: () => {} },
  render: (args) => (
    <div className="bg-surface-inverse p-l">
      <Badge {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, onRemove: fn() },
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Remove Rail freight' });

    await expect(dismiss).toBeDisabled();
    // pointerEventsCheck is off deliberately: the CSS already blocks the click,
    // and letting it through proves the `disabled` attribute is what stops the
    // callback rather than the styling alone.
    await userEvent.setup({ pointerEventsCheck: 0 }).click(dismiss);
    await expect(args.onRemove).not.toHaveBeenCalled();
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
