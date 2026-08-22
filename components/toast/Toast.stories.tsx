import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { Toast } from './index';

/** The stories assert live-region priority, timer behavior, and reduced motion. */
const meta = {
  title: 'Toast',
  component: Toast,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "toast",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/toast",
      "privateAuditDigest": "388b599954110a19a0ce3bbba13d7d7271bce3344508e65d4e122ad0f17532f0",
      "decisionIds": [
        "sp-toast-001",
        "sp-toast-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['toast.announcement.priority', 'toast.icon.decorative', 'toast.timing.opt-out'],
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
  play: async ({ step }) => {
    const body = within(document.body);
    const toast = await body.findByRole('status');
    await step('toast.announcement.priority', async () => {
      await expect(toast).toHaveAttribute('aria-live', 'polite');
      await expect(toast).toHaveAttribute('aria-atomic', 'true');
      await expect(toast).toHaveTextContent('Link copied');
    });
    await step('toast.icon.decorative', async () => {
      const icon = toast.querySelector('[aria-hidden="true"]');
      await expect(icon).toBeInTheDocument();
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
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

/** Auto-dismiss removes the toast after `dismissMs`. */
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

const persistentDismiss = fn();

/** A zero duration is the explicit persistent opt-out for timed content. */
export const Persistent: Story = {
  args: { dismissMs: 0, onDismiss: persistentDismiss },
  play: async ({ step }) => {
    persistentDismiss.mockClear();
    const body = within(document.body);
    await step('toast.timing.opt-out', async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      await expect(persistentDismiss).not.toHaveBeenCalled();
      await expect(await body.findByRole('status')).toBeInTheDocument();
    });
  },
};

const TOAST_INTERACTION_STATES = [
  { id: 'top-start', label: 'Neutral top start', variant: 'neutral', position: 'top-start' },
  { id: 'top-center', label: 'Neutral top center', variant: 'neutral', position: 'top-center' },
  { id: 'top-end', label: 'Neutral top end', variant: 'neutral', position: 'top-end' },
  { id: 'bottom-start', label: 'Neutral bottom start', variant: 'neutral', position: 'bottom-start' },
  { id: 'bottom-center-critical', label: 'Critical bottom center', variant: 'critical', position: 'bottom-center' },
  { id: 'bottom-end', label: 'Neutral bottom end', variant: 'neutral', position: 'bottom-end' },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '760px' } },
  },
  render: () => (
    <div className="min-h-[720px] bg-surface-sunken p-l">
      <p className="m-0 max-w-md text-sm text-text-secondary">
        The six public viewport positions are shown simultaneously; bottom center carries the critical tone.
      </p>
      {TOAST_INTERACTION_STATES.map((state) => (
        <Toast
          key={state.id}
          open
          dismissMs={0}
          variant={state.variant}
          position={state.position}
          className={`state-toast-${state.id} w-[380px]`}
        >
          {state.label}
        </Toast>
      ))}
    </div>
  ),
  play: async ({ step }) => {
    const body = within(document.body);
    const toast = async (label: string) => (await body.findByText(label)).closest<HTMLElement>('[data-component="toast"]')!;

    await step('public positions resolve to all six viewport anchors', async () => {
      for (const [label, verticalClass, alignmentClass] of [
        ['Neutral top start', 'top-l', 'justify-start'],
        ['Neutral top center', 'top-l', 'justify-center'],
        ['Neutral top end', 'top-l', 'justify-end'],
        ['Neutral bottom start', 'bottom-l', 'justify-start'],
        ['Critical bottom center', 'bottom-l', 'justify-center'],
        ['Neutral bottom end', 'bottom-l', 'justify-end'],
      ] as const) {
        const portal = (await toast(label)).parentElement!;
        await expect(portal).toHaveClass(verticalClass);
        await expect(portal).toHaveClass(alignmentClass);
      }
    });

    await step('neutral and critical visual tones retain their live-region semantics', async () => {
      await expect(await toast('Neutral top start')).toHaveAttribute('role', 'status');
      await expect(await toast('Critical bottom center')).toHaveAttribute('role', 'alert');
      await expect(await toast('Critical bottom center')).toHaveAttribute('aria-live', 'assertive');
    });

    await step('toast.entrance.motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = getComputedStyle(document.documentElement).getPropertyValue('--duration-base').trim();
      const specimen = await toast('Neutral top start');
      await expect(duration).toBe(reduced ? '0ms' : '300ms');
      await expect(getComputedStyle(specimen).animationDuration).toBe(reduced ? '0s' : '0.3s');
    });
  },
};
