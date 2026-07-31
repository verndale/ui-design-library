import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { Alert } from './Alert';

/**
 * The story file is this component's API contract. What is worth proving is the
 * live-region semantics per severity, the dismiss control, and that auto-dismiss
 * actually removes it.
 */
const meta = {
  title: 'Alert',
  component: Alert,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A page-level notification: an icon, a message, and an optional dismiss on a raised surface with a tone accent. `positive` announces politely, `critical` assertively. Kept distinct from Toast, which is transient and bottom-anchored.',
      },
    },
  },
  argTypes: {
    variant: { control: 'radio', options: ['positive', 'critical'], description: 'Severity — drives politeness, icon, and tone.' },
    dismissLabel: { control: 'text', description: 'Accessible label for the dismiss control.' },
    onDismiss: { action: 'dismiss', description: 'Called on dismiss and on auto-dismiss; also renders the dismiss control.' },
  },
  args: { variant: 'positive', children: 'Your changes have been saved.', onDismiss: fn() },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A positive notification that announces politely, with a working dismiss. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');

    await expect(alert).toHaveAttribute('aria-live', 'polite');
    await expect(alert).toHaveTextContent('Your changes have been saved.');

    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

/** The critical variant interrupts: an assertive `alert`, not a polite `status`. */
export const Critical: Story = {
  args: { variant: 'critical', children: 'We could not process your payment. No charge was made.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveAttribute('aria-live', 'assertive');
    await expect(alert).toHaveTextContent('We could not process your payment. No charge was made.');
  },
};

/** Multi-line copy wraps beside the top-aligned icon and accent. */
export const LongMessage: Story = {
  args: {
    children:
      'Your export is ready. It includes every record from the selected range, and the download link stays valid for 24 hours. After that, generate a new export from the reports page.',
  },
};

/**
 * Auto-dismiss removes the alert after `dismissMs` — proven by the alert being
 * gone, not merely by the callback firing.
 */
export const AutoDismiss: Story = {
  args: { dismissMs: 80 },
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return (
      <Alert
        {...args}
        open={open}
        onDismiss={() => {
          setOpen(false);
          args.onDismiss?.();
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument());
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
