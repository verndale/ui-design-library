import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { useRef, useState } from 'react';

import { Modal } from './index';

/**
 * The story file is this component's API contract. `argTypes` is what a
 * consuming agent reads to know the surface, so every prop is described here
 * rather than only in the source.
 */
const meta = {
  title: 'Modal',
  component: Modal,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "modal",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/modal",
      "privateAuditDigest": "8545b0c4df7347af48877b89593474f1911e63527bd015487a5e01aa81c64cba",
      "decisionIds": [
        "sp-modal-001",
        "sp-modal-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['modal.focus.containment', 'modal.focus.restoration', 'modal.keyboard.escape', 'modal.semantics.relationships', 'modal.background.inert'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'An overlay that demands attention — interaction is required before returning to the content beneath. Full-screen below `lg`, a capped centered panel above it.',
      },
      // The dialog portals into document.body and is fixed-position, so an
      // inline Docs story paints over the whole page. Each story gets its own
      // iframe instead, which is where its portal then lands.
      story: { inline: false, height: '520px' },
    },
  },
  argTypes: {
    "open": { control: 'boolean', description: "Required. Public `open` realization prop." },
    "onClose": { control: false, description: "Required. Public `onClose` realization prop." },
    "title": { control: 'text', description: "Required. Public `title` realization prop." },
    "closeLabel": { control: 'text', description: "Optional. Public `closeLabel` realization prop. Defaults to \"Close dialog\"." },
    "eyebrow": { control: false, description: "Optional. Public `eyebrow` realization prop." },
    "description": { control: false, description: "Optional. Public `description` realization prop." },
    "children": { control: false, description: "Optional. Public `children` realization prop." },
    "footer": { control: false, description: "Optional. Public `footer` realization prop." },
    "size": { control: 'radio', options: ["medium","large"], description: "Optional. Public `size` realization prop. Defaults to \"large\"." },
    "returnFocusRef": { control: false, description: "Optional. Public `returnFocusRef` realization prop." },
    "id": { control: 'text', description: "Optional. Public `id` realization prop." },
    "titleHeadingLevel": { control: 'radio', options: [2,3,4,5,6], description: "Optional. Public `titleHeadingLevel` realization prop. Defaults to 2." },
    "closeIcon": { control: false, description: "Optional. Public `closeIcon` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  // Required props belong here so every story satisfies the component's type
  // without repeating them. Stories that need real behaviour override onClose.
  args: { title: 'Delete this component?', size: 'large', open: false, onClose: () => {} },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opened from a trigger, which is how it behaves in a real page. */
export const Default: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse"
        >
          Open dialog
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          <p className="text-text-secondary">
            Opening from a trigger verifies that focus moves into the dialog, remains contained while it is
            open, and returns to this button on close.
          </p>
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open dialog' });

    await step('opens from the trigger', async () => {
      await userEvent.click(trigger);
      await expect(await body.findByRole('dialog')).toBeInTheDocument();
    });

    await step('moves focus into the dialog', async () => {
      const dialog = body.getByRole('dialog');
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    });

    await step('modal.background.inert', async () => {
      const dialog = body.getByRole('dialog');
      await waitFor(() => expect(canvasElement.inert).toBe(true));
      trigger.focus();
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
      await expect(trigger).not.toHaveFocus();
    });

    await step('modal.focus.restoration', async () => {
      await step('modal.keyboard.escape', async () => {
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
        await waitFor(() => expect(trigger).toHaveFocus());
        await expect(canvasElement.inert).toBe(false);
      });

      await userEvent.click(trigger);
      await userEvent.click(await body.findByRole('button', { name: 'Close dialog' }));
      await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());

      await userEvent.click(trigger);
      await body.findByRole('dialog');
      const backdrop = document.querySelector<HTMLElement>('[data-ui-overlay-layer][aria-hidden]');
      await expect(backdrop).toBeTruthy();
      await userEvent.click(backdrop!);
      await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};

/** The close control is a real button with its own accessible name. */
export const ClosesFromButton: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse">
          Open dialog
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          <p className="text-text-secondary">Dismiss with the close control.</p>
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    await body.findByRole('dialog');

    await userEvent.click(body.getByRole('button', { name: 'Close dialog' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

/** Tab cycles within the dialog rather than escaping to the page behind it. */
export const TrapsFocus: Story = {
  args: { open: true, description: 'Tab past the last control and focus wraps.' },
  render: (args) => (
    <Modal
      {...args}
      onClose={() => {}}
      footer={
        <div className="flex justify-end gap-2xs">
          <button type="button" className="cursor-pointer rounded-small px-s py-2xs text-text-primary">
            Cancel
          </button>
          <button type="button" className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse">
            Confirm
          </button>
        </div>
      }
    >
      <p className="text-text-secondary">Three controls: close, Cancel, Confirm.</p>
    </Modal>
  ),
  play: async ({ step }) => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    // Initial focus lands on a rAF, so tabbing before it resolves would test
    // the document's tab order rather than the trap's.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await step('modal.focus.containment', async () => {
      // More stops than the dialog has controls, so the wrap is exercised.
      for (let i = 0; i < 6; i += 1) {
        await userEvent.tab();
        await expect(dialog.contains(document.activeElement)).toBe(true);
      }
    });

    await step('Shift+Tab also stays inside', async () => {
      for (let i = 0; i < 4; i += 1) {
        await userEvent.tab({ shift: true });
        await expect(dialog.contains(document.activeElement)).toBe(true);
      }
    });
  },
};

/** Only the topmost overlay owns Escape, focus containment, and modal semantics. */
export const StackedOverlays: Story = {
  args: { open: true },
  render: function Render(args) {
    const [underlyingOpen, setUnderlyingOpen] = useState(true);
    const [topOpen, setTopOpen] = useState(true);
    return (
      <>
        <Modal
          {...args}
          open={underlyingOpen}
          title="Underlying dialog"
          onClose={() => setUnderlyingOpen(false)}
        >
          <button type="button">Underlying action</button>
        </Modal>
        <Modal {...args} open={topOpen} title="Top dialog" onClose={() => setTopOpen(false)}>
          <button type="button">Top action</button>
        </Modal>
      </>
    );
  },
  play: async ({ step }) => {
    const body = within(document.body);
    const top = await body.findByRole('dialog', { name: 'Top dialog' });
    const underlyingHidden = document.querySelector<HTMLElement>('[data-component="modal"][aria-hidden="true"]');
    if (!underlyingHidden) throw new Error('Expected an underlying hidden dialog');

    await step('only the top overlay is exposed and focusable', async () => {
      await expect(underlyingHidden).toHaveTextContent('Underlying dialog');
      await expect(top).toHaveAttribute('aria-modal', 'true');
      await expect(underlyingHidden).toHaveAttribute('aria-hidden', 'true');
      await expect(underlyingHidden).toHaveAttribute('inert');
      await waitFor(() => expect(top.contains(document.activeElement)).toBe(true));
    });

    await step('one Escape closes only the top overlay', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(body.queryByRole('dialog', { name: 'Top dialog' })).not.toBeInTheDocument());
      const underlying = await body.findByRole('dialog', { name: 'Underlying dialog' });
      await expect(document.body.style.overflow).toBe('hidden');
      await waitFor(() => expect(underlying.contains(document.activeElement)).toBe(true));
    });

    await step('closing the final overlay releases the shared scroll lock', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(document.body.style.overflow).not.toBe('hidden'));
    });
  },
};

/** Focus can be redirected somewhere other than the opener. */
export const ReturnsFocusToRef: Story = {
  args: { open: false },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const landing = useRef<HTMLButtonElement>(null);
    return (
      <div className="flex gap-2xs">
        <button type="button" onClick={() => setOpen(true)} className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse">
          Open dialog
        </button>
        <button ref={landing} type="button" className="cursor-pointer rounded-small border border-border-strong px-s py-2xs text-text-primary">
          Focus lands here
        </button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} returnFocusRef={landing}>
          <p className="text-text-secondary">Closing returns focus to the second button, not the opener.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    await body.findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Focus lands here' })).toHaveFocus());
  },
};

/** Every slot filled, including the pinned footer. */
export const WithAllSlots: Story = {
  tags: ['motion'],
  args: {
    open: true,
    eyebrow: <span className="text-sm tracking-wide text-text-secondary uppercase">Confirmation</span>,
    description: 'This cannot be undone.',
  },
  render: (args) => (
    <Modal
      {...args}
      onClose={() => {}}
      footer={
        <div className="flex justify-end gap-2xs">
          <button type="button" className="cursor-pointer rounded-small px-s py-2xs text-text-primary">
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse"
          >
            Delete
          </button>
        </div>
      }
    >
      <p className="text-text-secondary">Removing this component also removes its stories and contract.</p>
    </Modal>
  ),
  /**
   * `aria-labelledby` and `aria-describedby` must
   * resolve to elements that actually exist — a dangling id reads as no name at
   * all, and nothing in the markup makes that visible.
   */
  play: async ({ step }) => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    await step('is a modal dialog', async () => {
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    await step('modal.semantics.relationships', async () => {
      const labelId = dialog.getAttribute('aria-labelledby');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(labelId).toBeTruthy();
      await expect(document.getElementById(labelId!)).toHaveTextContent('Delete this component?');
    });

    await step('aria-describedby resolves to the description', async () => {
      const describedId = dialog.getAttribute('aria-describedby');
      await expect(describedId).toBeTruthy();
      await expect(document.getElementById(describedId!)).toHaveTextContent('This cannot be undone.');
    });

    await step('the dialog is reachable by its accessible name', async () => {
      await expect(body.getByRole('dialog', { name: 'Delete this component?' })).toBeInTheDocument();
    });

    await step('the entrance animation collapses under reduced motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // The panel and scrim both animate via --animate-*, which is built from
      // --duration-base. Nothing here hard-codes a duration, so the media query
      // is the single switch asserted here.
      await expect(getComputedStyle(dialog).animationDuration).toBe(reduced ? '0s' : '0.3s');
      await expect(getComputedStyle(dialog).animationName).not.toBe('none');
    });
  },
};

/**
 * A click on the scrim dismisses; a click inside the panel must not. The guard
 * is `event.target === event.currentTarget`, which is easy to regress into a
 * dialog that closes whenever anything inside it is clicked.
 */
export const ClosesOnBackdrop: Story = {
  args: { open: true, onClose: fn() },
  render: (args) => (
    <Modal {...args}>
      <p className="text-text-secondary">Clicking this paragraph must not close the dialog.</p>
    </Modal>
  ),
  play: async ({ args, step }) => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    await step('a click inside the panel is ignored', async () => {
      await userEvent.click(body.getByText('Clicking this paragraph must not close the dialog.'));
      await expect(args.onClose).not.toHaveBeenCalled();
    });

    await step('a click on the scrim closes', async () => {
      const scrim = dialog.ownerDocument.querySelector('[aria-hidden].fixed.inset-0');
      await expect(scrim).toBeTruthy();
      await userEvent.click(scrim as HTMLElement);
      await expect(args.onClose).toHaveBeenCalled();
    });
  },
};

/** The narrower panel. Below `lg` both sizes are full-screen. */
export const Medium: Story = {
  args: { open: true, size: 'medium', description: 'A shorter dialog for a single decision.' },
  render: (args) => (
    <Modal {...args} onClose={() => {}}>
      <p className="text-text-secondary">Medium caps at 600px on desktop.</p>
    </Modal>
  ),
};

/** Long content scrolls in the body while the header and footer stay put. */
export const ScrollingBody: Story = {
  args: { open: true, title: 'Terms' },
  render: (args) => (
    <Modal {...args} onClose={() => {}} footer={<p className="text-text-secondary">Footer stays pinned.</p>}>
      <div className="flex flex-col gap-s text-text-secondary">
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i}>Paragraph {i + 1} — the body scrolls independently of the header and footer.</p>
        ))}
      </div>
    </Modal>
  ),
};

const MODAL_INTERACTION_STATES = [
  { id: 'medium', label: 'Open medium', size: 'medium', closeState: 'default' },
  { id: 'large', label: 'Open large', size: 'large', closeState: 'default' },
  { id: 'close-default', label: 'Close default', size: 'medium', closeState: 'default' },
  { id: 'close-hover', label: 'Close hover', size: 'medium', closeState: 'hover' },
  { id: 'close-focus-visible', label: 'Close focus visible', size: 'medium', closeState: 'focus-visible' },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '1900px' } },
    pseudo: {
      rootSelector: 'body',
      hover: '.state-modal-close-hover button[aria-label="Close dialog"]',
      focusVisible: '.state-modal-close-focus-visible button[aria-label="Close dialog"]',
    },
  },
  render: () => (
    <div className="min-h-screen bg-surface-sunken p-l text-sm text-text-secondary">
      Modal state specimens render below as static portal layers for side-by-side design evidence.
      {MODAL_INTERACTION_STATES.map((state) => (
        <Modal
          key={state.id}
          open
          onClose={() => {}}
          title="Delete this component?"
          eyebrow={<span className="text-sm tracking-wide text-text-secondary uppercase">Confirmation</span>}
          description="This cannot be undone."
          size={state.size}
          className={`state-modal-${state.id} !mx-auto !h-[348px] !max-h-none ${state.size === 'medium' ? '!w-[600px] !max-w-[600px]' : '!w-[900px] !max-w-[900px]'}`}
          classNames={{
            backdrop: 'hidden',
            viewport: '!static !inset-auto !z-auto !block !p-0',
            closeButton: state.closeState === 'hover'
              ? '!bg-action-hover'
              : state.closeState === 'focus-visible'
                ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                : undefined,
          }}
          footer={(
            <div className="flex justify-end gap-2xs">
              <button type="button" className="cursor-pointer rounded-small px-s py-2xs text-text-primary">Cancel</button>
              <button type="button" className="cursor-pointer rounded-small bg-action-base px-s py-2xs text-text-inverse">Confirm</button>
            </div>
          )}
        >
          <p className="text-text-secondary">Removing this component also removes its stories and contract.</p>
        </Modal>
      ))}
    </div>
  ),
  play: async ({ step }) => {
    const root = (state: string) => document.body.querySelector<HTMLElement>(`.state-modal-${state}`)!;
    const close = (state: string) => within(root(state)).getByRole('button', { name: 'Close dialog', hidden: true });

    await waitFor(() => expect(document.body.querySelectorAll('[data-component="modal"]')).toHaveLength(5));

    await step('public modal sizes retain their measured desktop widths', async () => {
      await waitFor(() => {
        const mediumWidth = root('medium').getBoundingClientRect().width;
        const largeWidth = root('large').getBoundingClientRect().width;
        if (matchMedia('(min-width: 64rem)').matches) {
          expect(mediumWidth).toBeCloseTo(600, 0);
          expect(largeWidth).toBeCloseTo(900, 0);
        } else {
          expect(mediumWidth).toBeCloseTo(largeWidth, 0);
          expect(largeWidth).toBeLessThanOrEqual(innerWidth);
        }
        expect(root('medium').getBoundingClientRect().height).toBeCloseTo(348, 0);
      });
    });

    await step('forced close hover resolves the semantic action surface', async () => {
      const baseline = close('close-default');
      const hover = close('close-hover');
      await waitFor(() => expect(hover).toHaveClass('pseudo-hover'));
      const probe = document.createElement('span');
      probe.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-action-hover');
      document.body.append(probe);
      const expectedHover = getComputedStyle(probe).backgroundColor;
      probe.remove();
      await expect(getComputedStyle(hover).backgroundColor).toBe(expectedHover);
      if (expectedHover !== getComputedStyle(baseline).backgroundColor) {
        await expect(getComputedStyle(hover).backgroundColor).not.toBe(getComputedStyle(baseline).backgroundColor);
      }
    });

    await step('forced close focus exposes the governed pill focus ring', async () => {
      const focus = close('close-focus-visible');
      await waitFor(() => expect(focus).toHaveClass('pseudo-focus-visible'));
      const style = getComputedStyle(focus);
      await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      await expect(style.outlineStyle).not.toBe('none');
      await expect(style.outlineOffset).toBe('2px');
    });

    await step('modal.close.motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(close('close-default')).transitionDuration).toBe(reduced ? '0s' : '0.15s');
      await expect(getComputedStyle(root('large')).animationDuration).toBe(reduced ? '0s' : '0.3s');
    });
  },
};
