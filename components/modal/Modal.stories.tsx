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
    open: { control: 'boolean', description: 'Whether the dialog is open. The consumer owns this state.' },
    title: { control: 'text', description: 'Accessible name for the dialog. Required.' },
    closeLabel: { control: 'text', description: 'Accessible label for the close control.' },
    description: { control: 'text', description: 'Supporting copy; also becomes the dialog description.' },
    size: { control: 'radio', options: ['medium', 'large'], description: 'Panel width at desktop.' },
    onClose: { action: 'close', description: 'Called on Escape, backdrop click, and the close button.' },
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
            Opening from a trigger is the case worth testing: focus moves into the dialog, is trapped while it is
            open, and returns to this button on close.
          </p>
        </Modal>
      </>
    );
  },
  /**
   * The full round trip, which is the only way the focus contract is provable:
   * a dialog that takes focus but never gives it back strands keyboard users at
   * the top of the document.
   */
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

    await step('closes on Escape and returns focus to the trigger', async () => {
      await userEvent.keyboard('{Escape}');
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

/**
 * Tab cycles within the dialog rather than escaping to the page behind it. The
 * trap is the reason this component exists rather than a positioned div.
 */
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

    await step('every Tab stop stays inside the dialog', async () => {
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
   * `aria-labelledby` and `aria-describedby` are only worth anything if they
   * resolve to elements that actually exist — a dangling id reads as no name at
   * all, and nothing in the markup makes that visible.
   */
  play: async ({ step }) => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    await step('is a modal dialog', async () => {
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    await step('aria-labelledby resolves to the title', async () => {
      const labelId = dialog.getAttribute('aria-labelledby');
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
      // is the single switch — that is the property worth pinning.
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
