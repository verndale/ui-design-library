import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Carousel } from './index';

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
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['carousel.keyboard.controls', 'carousel.state.slides', 'carousel.announcement.status'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'Steps through discrete slides using Embla. Off-screen slides are marked `inert` so Tab skips their links, the arrow controls disable at the ends, and each slide announces its position.',
      },
    },
  },
  argTypes: {
    "slides": { control: 'object', description: "Required. Public `slides` realization prop." },
    "label": { control: 'text', description: "Required. Public `label` realization prop." },
    "previousLabel": { control: 'text', description: "Optional. Public `previousLabel` realization prop. Defaults to \"Previous slide\"." },
    "nextLabel": { control: 'text', description: "Optional. Public `nextLabel` realization prop. Defaults to \"Next slide\"." },
    "loop": { control: 'boolean', description: "Optional. Public `loop` realization prop. Defaults to false." },
    "slideClassName": { control: 'text', description: "Optional. Public `slideClassName` realization prop." },
    "previousIcon": { control: false, description: "Optional. Public `previousIcon` realization prop." },
    "nextIcon": { control: false, description: "Optional. Public `nextIcon` realization prop." },
    "statusSeparator": { control: 'text', description: "Optional. Public `statusSeparator` realization prop. Defaults to \" of \"." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
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

    await step('carousel.state.slides', async () => {
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

    await step('carousel.keyboard.controls', async () => {
      const next = canvas.getByRole('button', { name: 'Next slide' });
      next.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(async () => expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeEnabled());
    });

    await step('carousel.announcement.status', async () => {
      const status = canvasElement.querySelector('[aria-live="polite"]');
      await expect(status).toHaveAttribute('aria-atomic', 'true');
      await expect(status).toHaveTextContent('2 / 5');
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
   * The `inert` gating requires direct verification: the source's own
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

/** An empty data set has no carousel semantics, controls, or impossible `1 / 0` status. */
export const Empty: Story = {
  args: { slides: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('region', { name: 'Featured stories' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByText('1 / 0')).not.toBeInTheDocument();
  },
};
