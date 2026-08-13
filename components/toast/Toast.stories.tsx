import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { Toast } from './index';

/**
 * The story file is this component's API contract. What is worth proving is the
 * live-region semantics per severity, that auto-dismiss actually removes it, and
 * that the entrance collapses under reduced motion.
 */
const meta = {
  title: 'Toast',
  component: Toast,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['toast.announcement.priority', 'toast.icon.decorative'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A transient, bottom-anchored confirmation. `neutral` announces politely, `critical` assertively. It portals to the document body and auto-dismisses. Kept distinct from Alert, which is page-level and persistent.',
      },
      // Fixed-position and portaled to body, so an inline Docs story paints over
      // the page; each story gets its own iframe instead.
      story: { inline: false, height: '160px' },
    },
  },
  argTypes: {
    "open": { control: 'boolean', description: "Required. Public `open` realization prop." },
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "variant": { control: 'radio', options: ["neutral","critical"], description: "Optional. Public `variant` realization prop. Defaults to \"neutral\"." },
    "dismissMs": { control: 'number', description: "Optional. Public `dismissMs` realization prop." },
    "onDismiss": { control: false, description: "Optional. Public `onDismiss` realization prop." },
    "icon": { control: false, description: "Optional. Public `icon` realization prop." },
    "position": { control: 'radio', options: ["top-start","top-center","top-end","bottom-start","bottom-center","bottom-end"], description: "Optional. Public `position` realization prop. Defaults to \"bottom-center\"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { open: true, variant: 'neutral', children: 'Link copied' },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A neutral confirmation that announces politely. Persists (no onDismiss armed). */
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    const toast = await body.findByRole('status');
    await expect(toast).toHaveAttribute('aria-live', 'polite');
    await expect(toast).toHaveTextContent('Link copied');
  },
};

/**
 * The critical variant interrupts: an assertive `alert`. Also the reduced-motion
 * check — the entrance is one animation driven by `--duration-base`, so the
 * media query is the single switch and `pnpm test:motion` flips it to `0s`.
 */
export const Critical: Story = {
  tags: ['motion'],
  args: { variant: 'critical', children: 'Could not copy link' },
  play: async () => {
    const body = within(document.body);
    const toast = await body.findByRole('alert');
    await expect(toast).toHaveAttribute('aria-live', 'assertive');

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(toast).animationDuration).toBe(reduced ? '0s' : '0.3s');
    await expect(getComputedStyle(toast).animationName).not.toBe('none');
  },
};

/** Auto-dismiss removes the toast after `dismissMs` — proven by it being gone. */
export const AutoDismiss: Story = {
  args: { dismissMs: 80, onDismiss: fn() },
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return (
      <Toast
        {...args}
        open={open}
        onDismiss={() => {
          setOpen(false);
          args.onDismiss?.();
        }}
      />
    );
  },
  play: async ({ args }) => {
    const body = within(document.body);
    await expect(await body.findByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(body.queryByRole('status')).not.toBeInTheDocument());
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
