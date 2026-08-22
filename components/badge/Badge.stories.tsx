import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Badge, type BadgeProps } from './index';

type BadgeStoryArgs = BadgeProps;

const meta = {
  title: 'Badge',
  component: Badge,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "badge",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/badge",
      "privateAuditDigest": "abeea6783d3ae6e97b650766bcc962ebcee52b9884e966c92740b8b058b25d61",
      "decisionIds": [
        "sp-badge-001",
        "sp-badge-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
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

const BADGE_INTERACTION_STATES = [
  { id: 'default', label: 'Default', removable: false, disabled: false },
  { id: 'removable', label: 'Removable', removable: true, disabled: false },
  { id: 'disabled', label: 'Disabled', removable: true, disabled: true },
  { id: 'remove-hover', label: 'Remove hover', removable: true, disabled: false },
  { id: 'remove-focus-visible', label: 'Remove focus visible', removable: true, disabled: false },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    pseudo: {
      rootSelector: 'body',
      hover: '.state-badge-remove-hover button',
      focusVisible: '.state-badge-remove-focus-visible button',
    },
    a11y: {
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-start gap-l">
      {BADGE_INTERACTION_STATES.map((state) => (
        <section key={state.id} className={`state-badge-${state.id} grid gap-s`}>
          <span className="text-sm text-text-secondary">{state.label}</span>
          <Badge
            label="Rail freight"
            disabled={state.disabled}
            onRemove={state.removable ? () => {} : undefined}
            classNames={{
              removeButton: state.id === 'remove-hover'
                ? 'opacity-70'
                : state.id === 'remove-focus-visible'
                  ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                  : undefined,
            }}
          />
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const root = (state: string) => canvasElement.querySelector<HTMLElement>(`.state-badge-${state}`)!;

    await step('public removable and disabled states stay semantically distinct', async () => {
      await expect(within(root('default')).queryByRole('button')).not.toBeInTheDocument();
      await expect(within(root('removable')).getByRole('button', { name: 'Remove Rail freight' })).toBeEnabled();
      await expect(within(root('disabled')).getByRole('button', { name: 'Remove Rail freight' })).toBeDisabled();
    });

    await step('forced remove hover changes the code-backed opacity', async () => {
      const baseline = within(root('removable')).getByRole('button', { name: 'Remove Rail freight' });
      const hover = within(root('remove-hover')).getByRole('button', { name: 'Remove Rail freight' });
      await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
      await waitFor(() => expect(parseFloat(getComputedStyle(hover).opacity)).toBeLessThan(parseFloat(getComputedStyle(baseline).opacity)));
    });

    await step('forced remove focus exposes the governed focus ring', async () => {
      const focus = within(root('remove-focus-visible')).getByRole('button', { name: 'Remove Rail freight' });
      await waitFor(() => expect(focus).toHaveClass('pseudo-focus-visible'));
      const style = getComputedStyle(focus);
      await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      await expect(style.outlineStyle).not.toBe('none');
    });

    await step('badge.remove.motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = getComputedStyle(document.documentElement).getPropertyValue('--duration-fast').trim();
      const removeButton = within(root('removable')).getByRole('button', { name: 'Remove Rail freight' });
      await expect(duration).toBe(reduced ? '0ms' : '150ms');
      await expect(getComputedStyle(removeButton).transitionDuration).toBe(reduced ? '0s' : '0.15s');
    });
  },
};
