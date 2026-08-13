import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Badge,
  DismissibleBadge,
  type BadgeProps,
  type DismissibleBadgeProps,
} from './index';

type BadgeStoryArgs = BadgeProps &
  Partial<Pick<DismissibleBadgeProps, 'onRemove' | 'removeLabel'>>;

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
          'A server-safe short label for status or categorisation. Use `DismissibleBadge` for an interactive filter chip with a keyboard-operable remove control.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'The short badge label.' },
    surface: {
      control: 'radio',
      options: ['light', 'dark'],
      description: 'The surface palette beneath the badge.',
    },
    disabled: { control: 'boolean', description: 'Dims the badge and disables its remove control.' },
    className: { control: 'text', description: 'Optional class names for the badge frame.' },
    startIcon: { control: false, description: 'Optional decorative leading icon.' },
    onRemove: {
      control: false,
      description: 'DismissibleBadge only: called when the remove control is activated.',
    },
    removeLabel: {
      control: 'text',
      description: 'DismissibleBadge only: accessible label for the remove control.',
    },
  },
  args: { label: 'Rail freight' },
} satisfies Meta<BadgeStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** The server-safe badge never introduces an interactive control. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Rail freight')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

const remove = fn();

/** The filter-chip case. The dismiss button is keyboard operable and self-labelling. */
export const Dismissible: Story = {
  render: (args) => <DismissibleBadge {...args} onRemove={remove} />,
  /**
   * The dismiss control deriving its own name from the label is the part of the
   * capture worth keeping: a row of chips all labelled "Remove" is unusable by
   * screen reader, and nothing visual reveals that.
   */
  play: async ({ canvasElement, step }) => {
    remove.mockClear();
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Remove Rail freight' });

    await step('activates by click', async () => {
      await userEvent.click(dismiss);
      await expect(remove).toHaveBeenCalledTimes(1);
    });

    await step('activates by keyboard', async () => {
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
    <DismissibleBadge {...args} removeLabel="Remove the 2024 filter" onRemove={() => {}} />
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
  render: (args) => <DismissibleBadge {...args} onRemove={disabledRemove} />,
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
    // pointerEventsCheck is off deliberately: the CSS already blocks the click,
    // and letting it through proves the `disabled` attribute is what stops the
    // callback rather than the styling alone.
    await userEvent.setup({ pointerEventsCheck: 0 }).click(dismiss);
    await expect(disabledRemove).not.toHaveBeenCalled();
  },
};

/** A set of filters, which is how these usually appear. */
export const Group: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2xs">
      {['Rail freight', 'Intermodal', 'Supply chain', 'Sustainability'].map((label) => (
        <DismissibleBadge key={label} {...args} label={label} onRemove={() => {}} />
      ))}
    </div>
  ),
};
