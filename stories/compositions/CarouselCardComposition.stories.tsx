import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Card, CardMedia } from '../../components/card/index';
import { Carousel } from '../../components/carousel/index';

const profiles = [
  ['Alex Morgan', 'Design systems lead'],
  ['Jordan Lee', 'Experience designer'],
  ['Sam Rivera', 'Frontend architect'],
  ['Taylor Kim', 'Accessibility specialist'],
  ['Casey Brown', 'Content strategist'],
  ['Riley Chen', 'Product designer'],
] as const;

const profileSlides = profiles.map(([name, role]) => (
  <a
    key={name}
    href={`#${name.toLowerCase().replaceAll(' ', '-')}`}
    className="group block h-full rounded-medium focus-visible:outline-2 focus-visible:outline-border-focus"
  >
    <Card as="article" className="h-full rounded-medium">
      <CardMedia className="aspect-square">
        <div aria-hidden="true" className="size-full bg-surface-sunken" />
      </CardMedia>
      <div className="p-s">
        <h3 className="m-0 text-lg font-semibold text-text-primary">{name}</h3>
        <p className="mt-2xs text-text-secondary">{role}</p>
      </div>
    </Card>
  </a>
));

const meta = {
  title: 'Compositions/Carousel with Cards',
  component: Carousel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Carousel accepts arbitrary React nodes as slides. This specimen composes the governed Card and CardMedia facades without making card presentation part of the Carousel API.',
      },
    },
  },
  globals: { viewport: { value: 'sourceParity1440', isRotated: false } },
  args: {
    label: 'Featured people',
    layout: 'multi-card-peek',
    slides: profileSlides,
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardSlides: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Featured people' });
    const slides = within(region).getAllByRole('group');

    await step('composes one governed Card per slide', async () => {
      await expect(region.querySelectorAll('[data-component="card"]')).toHaveLength(profiles.length);
      await expect(slides).toHaveLength(profiles.length);
    });

    const viewport = slides[0]!.parentElement?.parentElement;
    await expect(viewport).not.toBeNull();
    const viewportRight = viewport!.getBoundingClientRect().right;
    const partialIndex = slides.findIndex((slide) => {
      const bounds = slide.getBoundingClientRect();
      return bounds.left < viewportRight && bounds.right > viewportRight;
    });
    await expect(partialIndex).toBeGreaterThan(0);
    const partialSlide = slides[partialIndex]!;

    await step('keeps the partially clipped Card link out of the tab order', async () => {
      await waitFor(async () => expect(partialSlide).toHaveAttribute('inert'));
      const partialLink = within(partialSlide).getByRole('link');
      await expect(partialLink.closest('[inert]')).toBe(partialSlide);
      await expect(slides[0]).not.toHaveAttribute('inert');
    });

    await step('reveals the next Card after one-slide navigation', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
      await waitFor(async () => {
        await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('2 / 6');
        await expect(partialSlide).not.toHaveAttribute('inert');
      });
    });
  },
};
