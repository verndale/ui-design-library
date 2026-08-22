import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';

import { Alert, type AlertProps } from './index';

type AlertStoryArgs = AlertProps;

/** The stories assert live-region priority, dismissal, and timer behavior. */
const meta = {
  title: 'Alert',
  component: Alert,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "alert",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/alert",
      "privateAuditDigest": "2956e5f44f078e5a94fcc1d4896d101895d1e342e58396fd941dcc907875b3a0",
      "decisionIds": [
        "sp-alert-001",
        "sp-alert-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['alert.announcement.priority', 'alert.dismiss.keyboard', 'alert.timing.opt-out'],
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');

    await step('alert.announcement.priority', async () => {
      await expect(alert).toHaveAttribute('aria-live', 'polite');
      await expect(alert).toHaveTextContent('Your changes have been saved.');
      await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    });
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
  play: async ({ canvasElement, step }) => {
    dismiss.mockClear();
    const canvas = within(canvasElement);
    await step('alert.dismiss.keyboard', async () => {
      const button = canvas.getByRole('button', { name: 'Dismiss' });
      button.focus();
      await userEvent.keyboard('{Enter}');
      await expect(dismiss).toHaveBeenCalledTimes(1);
      await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    });
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

/** Auto-dismiss removes the alert after `dismissMs`. */
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

const persistentDismiss = fn();

/** A zero duration is the explicit persistent opt-out for timed content. */
export const PersistentDismissible: Story = {
  args: { dismissMs: 0, onDismiss: persistentDismiss },
  play: async ({ canvasElement, step }) => {
    persistentDismiss.mockClear();
    const canvas = within(canvasElement);
    await step('alert.timing.opt-out', async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      await expect(persistentDismiss).not.toHaveBeenCalled();
      await expect(canvas.getByRole('status')).toBeInTheDocument();
    });
  },
};

const ALERT_INTERACTION_STATES = [
  { id: 'positive', label: 'Positive', variant: 'positive', dismissible: false },
  { id: 'critical', label: 'Critical', variant: 'critical', dismissible: false },
  { id: 'dismiss-default', label: 'Dismiss default', variant: 'positive', dismissible: true },
  { id: 'dismiss-hover', label: 'Dismiss hover', variant: 'positive', dismissible: true },
  { id: 'dismiss-focus-visible', label: 'Dismiss focus visible', variant: 'positive', dismissible: true },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    pseudo: {
      rootSelector: 'body',
      hover: '.state-alert-dismiss-hover button',
      focusVisible: '.state-alert-dismiss-focus-visible button',
    },
  },
  render: () => (
    <div className="grid w-[720px] gap-l">
      {ALERT_INTERACTION_STATES.map((state) => (
        <section key={state.id} className="grid gap-s">
          <span className="text-sm text-text-secondary">{state.label}</span>
          <Alert
            variant={state.variant}
            onDismiss={state.dismissible ? () => {} : undefined}
            className={`state-alert-${state.id}`}
            classNames={{
              dismiss: state.id === 'dismiss-hover'
                ? 'bg-surface-sunken'
                : state.id === 'dismiss-focus-visible'
                  ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                  : undefined,
            }}
          >
            {state.variant === 'critical' ? 'We could not process your payment.' : 'Your changes have been saved.'}
          </Alert>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const root = (state: string) => canvasElement.querySelector<HTMLElement>(`.state-alert-${state}`)!;

    await step('public tone and dismissible states stay visibly and semantically distinct', async () => {
      await expect(root('positive')).toHaveAttribute('role', 'status');
      await expect(root('critical')).toHaveAttribute('role', 'alert');
      await expect(within(root('positive')).queryByRole('button')).not.toBeInTheDocument();
      await expect(within(root('dismiss-default')).getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    await step('forced dismiss hover resolves the semantic hover surface', async () => {
      const baseline = within(root('dismiss-default')).getByRole('button', { name: 'Dismiss' });
      const hover = within(root('dismiss-hover')).getByRole('button', { name: 'Dismiss' });
      await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
      await waitFor(() => expect(getComputedStyle(hover).backgroundColor).not.toBe(getComputedStyle(baseline).backgroundColor));
    });

    await step('forced dismiss focus exposes the governed focus ring', async () => {
      const focus = within(root('dismiss-focus-visible')).getByRole('button', { name: 'Dismiss' });
      await waitFor(() => expect(focus).toHaveClass('pseudo-focus-visible'));
      const style = getComputedStyle(focus);
      await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      await expect(style.outlineStyle).not.toBe('none');
    });

    await step('alert.dismiss.motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = getComputedStyle(document.documentElement).getPropertyValue('--duration-fast').trim();
      const dismiss = within(root('dismiss-default')).getByRole('button', { name: 'Dismiss' });
      await expect(duration).toBe(reduced ? '0ms' : '150ms');
      await expect(getComputedStyle(dismiss).transitionDuration).toBe(reduced ? '0s' : '0.15s');
    });
  },
};
