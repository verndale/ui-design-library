import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Card, CardMedia } from './Card';

const meta = {
  title: 'Card',
  component: Card,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An elevated surface for card layouts. `CardMedia` adds a clipped media slot whose child scales on hover and on keyboard focus — wrap the card in an element carrying `group` for that to fire.',
      },
    },
  },
  argTypes: {
    unsetBackground: { control: 'boolean', description: "Drop the default surface so a caller's own background applies." },
    className: { control: 'text', description: 'Layout, radius, and width belong to the caller.' },
  },
  // render() supplies children; this satisfies the required prop for the type.
  args: { className: 'w-[320px] rounded-medium', children: null },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const Swatch = () => <div className="h-40 w-full bg-surface-sunken" />;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <div className="p-s">
        <h3 className="m-0 text-lg font-semibold text-text-primary">Card title</h3>
        <p className="mt-2xs text-text-secondary">Body content sits inside the surface.</p>
      </div>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector('[data-component="card"]');

    await expect(card).toBeTruthy();
    await expect(canvas.getByText('Body content sits inside the surface.')).toBeInTheDocument();
    // The fixed data-component hook is what makes this a reliable test and
    // analytics selector; the source let callers override it.
    await expect(getComputedStyle(card as HTMLElement).overflow).toBe('hidden');
  },
};

/** The zoom fires on focus as well as hover, which is the reason to use this over a plain div. */
export const WithMedia: Story = {
  tags: ['motion'],
  render: (args) => (
    <a href="#top" className="group block focus-visible:outline-2 focus-visible:outline-border-focus">
      <Card {...args}>
        <CardMedia className="aspect-[3/2]">
          <Swatch />
        </CardMedia>
        <div className="p-s">
          <h3 className="m-0 text-lg font-semibold text-text-primary">Tab to me</h3>
          <p className="mt-2xs text-text-secondary">Focus the card and the media scales, same as hover.</p>
        </div>
      </Card>
    </a>
  ),
  /**
   * Guards the defect recorded in component.json: the source wrote the variants
   * as `*:group-hover:scale-[1.05]`, which compiles to no CSS at all in Tailwind
   * v4, so the zoom silently never fired. Asserting the computed transform
   * rather than the class string is the only way to catch that — the wrong
   * order still *looks* right in the markup.
   */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    const media = link.querySelector('.aspect-\\[3\\/2\\]');
    await expect(media).toBeTruthy();
    const child = media!.firstElementChild as HTMLElement;
    // Tailwind v4 compiles scale-* to the standalone `scale` property, so
    // `transform` stays "none" however the zoom behaves — asserting on it would
    // pass forever regardless.
    // `scale` computes to the keyword "none" at rest and to a number once set,
    // so both forms have to be normalised before comparing.
    const scaleOf = (el: HTMLElement) => {
      const raw = getComputedStyle(el).scale;
      return raw === 'none' ? 1 : parseFloat(raw);
    };

    // Run under both preferences by the storybook-reduced-motion project, where
    // the correct outcome is the opposite one.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    await step('sits unscaled at rest', async () => {
      await expect(scaleOf(child)).toBe(1);
    });

    await step('scales on keyboard focus, not only hover', async () => {
      // Tab rather than .focus(): :focus-visible deliberately does not match a
      // programmatic focus, so calling focus() would test nothing.
      await userEvent.tab();
      await expect(link).toHaveFocus();
      if (reduced) await expect(scaleOf(child)).toBe(1);
      else await waitFor(async () => expect(scaleOf(child)).toBeCloseTo(1.05, 2));
    });

    await step('scales on hover too', async () => {
      await userEvent.hover(media as HTMLElement);
      if (reduced) await expect(scaleOf(child)).toBe(1);
      else await waitFor(async () => expect(scaleOf(child)).toBeCloseTo(1.05, 2));
    });

    await step('the duration tokens collapse under reduced motion', async () => {
      const duration = getComputedStyle(document.documentElement)
        .getPropertyValue('--duration-base')
        .trim();
      await expect(duration).toBe(reduced ? '0ms' : '300ms');
      // The transition itself is never removed — only its duration changes, so
      // one media query switches motion off everywhere.
      await expect(getComputedStyle(child).transitionDuration).toBe(reduced ? '0s' : '0.3s');
    });
  },
};

/** For a caller that owns the background. */
export const UnsetBackground: Story = {
  args: { unsetBackground: true, className: 'w-[320px] rounded-medium bg-surface-sunken', children: null },
  render: (args) => (
    <Card {...args}>
      <p className="p-s text-text-secondary">The caller's surface shows through.</p>
    </Card>
  ),
  /** The default surface is dropped, so the caller's own background wins. */
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('[data-component="card"]') as HTMLElement;
    const raised = getComputedStyle(document.documentElement).getPropertyValue('--color-surface-raised').trim();

    await expect(card).toBeTruthy();
    await expect(raised).toBeTruthy();
    await expect(card.className).not.toContain('bg-surface-raised');
  },
};
