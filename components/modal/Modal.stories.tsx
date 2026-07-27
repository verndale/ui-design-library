import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Modal } from './Modal';

/**
 * The story file is this component's API contract. `argTypes` is what a
 * consuming agent reads to know the surface, so every prop is described here
 * rather than only in the source.
 */
const meta = {
  title: 'Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An overlay that demands attention — interaction is required before returning to the content beneath. Full-screen below `lg`, a capped centered panel above it.',
      },
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
};

/** Every slot filled, including the pinned footer. */
export const WithAllSlots: Story = {
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
