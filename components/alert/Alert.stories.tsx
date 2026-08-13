import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { Alert, type AlertProps } from './index';

type AlertStoryArgs = AlertProps;

/**
 * The story file is this component's API contract. What is worth proving is the
 * live-region semantics per severity, the dismiss control, and that auto-dismiss
 * actually removes it.
 */
const meta = {
  title: 'Alert',
  component: Alert,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['alert.announcement.priority', 'alert.dismiss.keyboard'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A page-level notification on a raised surface with a tone accent. `positive` announces politely and `critical` assertively. Supplying `onDismiss` adds the client-side dismiss control and optional timer.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "variant": { control: 'radio', options: ["positive","critical"], description: "Optional. Public `variant` realization prop. Defaults to \"positive\"." },
    "open": { control: 'boolean', description: "Optional. Public `open` realization prop. Defaults to true." },
    "icon": { control: false, description: "Optional. Public `icon` realization prop." },
    "showAccent": { control: 'boolean', description: "Optional. Public `showAccent` realization prop. Defaults to true." },
    "onDismiss": { control: false, description: "Optional. Public `onDismiss` realization prop." },
    "dismissLabel": { control: 'text', description: "Optional. Public `dismissLabel` realization prop. Defaults to \"Dismiss\"." },
    "dismissMs": { control: 'number', description: "Optional. Public `dismissMs` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { variant: 'positive', children: 'Your changes have been saved.', open: true },
} satisfies Meta<AlertStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A positive notification is server-renderable and announces politely. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');

    await expect(alert).toHaveAttribute('aria-live', 'polite');
    await expect(alert).toHaveTextContent('Your changes have been saved.');

    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

const dismiss = fn();

/** Interactive dismissal is isolated in the explicitly client-side variant. */
export const Dismissible: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return (
      <Alert
        {...args}
        open={open}
        onDismiss={() => {
          dismiss();
          setOpen(false);
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    dismiss.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(dismiss).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
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
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return (
      <Alert
        {...args}
        open={open}
        dismissMs={80}
        onDismiss={() => setOpen(false)}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument());
  },
};
