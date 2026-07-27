import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Carousel } from './Carousel';

const Slide = ({ n }: { n: number }) => (
  <div className="me-s flex h-48 flex-col justify-between rounded-medium bg-surface-sunken p-s">
    <p className="m-0 text-lg font-semibold text-text-primary">Slide {n}</p>
    <a href="#top" className="text-link underline">
      A focusable link inside slide {n}
    </a>
  </div>
);

const meta = {
  title: 'Carousel',
  component: Carousel,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Steps through discrete slides using Embla. The accessibility behaviour is the point: off-screen slides are marked `inert` so Tab skips their links, the arrow controls disable at the ends instead of silently doing nothing, and each slide announces its position.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Accessible name for the carousel region.' },
    loop: { control: 'boolean' },
  },
  args: {
    label: 'Featured stories',
    slides: Array.from({ length: 5 }, (_, i) => <Slide key={i} n={i + 1} />),
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Featured stories' });

    await step('is a labelled carousel region', async () => {
      await expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    });

    await step('every slide announces its position', async () => {
      const slides = within(region).getAllByRole('group');
      await expect(slides).toHaveLength(5);
      await expect(slides.map((s) => s.getAttribute('aria-label'))).toEqual([
        '1 of 5',
        '2 of 5',
        '3 of 5',
        '4 of 5',
        '5 of 5',
      ]);
      await expect(slides.every((s) => s.getAttribute('aria-roledescription') === 'slide')).toBe(true);
    });

    await step('controls disable at the start rather than doing nothing', async () => {
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
        await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeEnabled();
      });
    });

    await step('advancing re-enables the previous control', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
      await waitFor(async () => expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeEnabled());
    });
  },
};

/** Tab through: focus should skip the links in slides that are off-screen. */
export const KeyboardTraversal: Story = {
  render: (args) => (
    <div className="flex flex-col gap-s">
      <a href="#top" className="text-link underline">
        Focus starts here — Tab forward
      </a>
      <Carousel {...args} />
    </div>
  ),
  /**
   * The `inert` gating is the highest-risk part of the rewrite: the source's own
   * in-view reporting returned empty before the engine measured, which marked
   * every slide inert and made the whole carousel unreachable by keyboard. The
   * assertion that matters is therefore that the *first* slide is never inert —
   * failing open is the safe direction.
   */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Featured stories' });
    const slides = within(region).getAllByRole('group');
    const first = slides[0]!;
    const last = slides[slides.length - 1]!;

    await step('the visible slide is reachable', async () => {
      await waitFor(async () => expect(first).not.toHaveAttribute('inert'));
    });

    await step('off-screen slides are skipped by Tab', async () => {
      await waitFor(async () => expect(last).toHaveAttribute('inert'));
    });

    await step('Tab reaches the first slide link but not an inert one', async () => {
      canvas.getByRole('link', { name: /Focus starts here/ }).focus();
      await userEvent.tab();
      const active = document.activeElement as HTMLElement;

      await expect(first.contains(active)).toBe(true);
      await expect(active.closest('[inert]')).toBeNull();
    });
  },
};

/** With loop on, neither control ever disables — including at the ends. */
export const Looping: Story = {
  args: { loop: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
      await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    });
  },
};

/** A single slide: both controls are disabled, which is the honest state. */
export const SingleSlide: Story = {
  args: { slides: [<Slide key={0} n={1} />] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
      await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    });
    // The only slide must stay reachable — a lone inert slide is the failure
    // mode that made this carousel unusable by keyboard in the source.
    await expect(within(canvas.getByRole('region')).getByRole('group')).not.toHaveAttribute('inert');
  },
};
