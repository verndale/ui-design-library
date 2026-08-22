import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Carousel } from './index';

const Slide = ({ n }: { n: number }) => (
  <div className="flex h-48 flex-col justify-between rounded-medium bg-surface-sunken p-s">
    <p className="m-0 text-lg font-semibold text-text-primary">Slide {n}</p>
    <a href="#top" className="text-link underline">
      A focusable link inside slide {n}
    </a>
  </div>
);

const InteractionSlide = () => (
  <div className="flex h-48 flex-col justify-between rounded-medium bg-surface-sunken p-s">
    <div className="grid gap-2xs">
      <p className="m-0 text-xs font-semibold uppercase text-text-secondary">Featured</p>
      <p className="m-0 text-lg font-semibold text-text-primary">Build calmer, clearer interfaces</p>
    </div>
    <a href="#top" className="text-link underline">
      Read the story →
    </a>
  </div>
);

const multiCardSlides = Array.from({ length: 6 }, (_, index) => <Slide key={index} n={index + 1} />);

async function verifyMultiCardLayout(canvasElement: HTMLElement, expectedSlideWidth: number, expectedGap: number) {
  const canvas = within(canvasElement);
  const region = canvas.getByRole('region', { name: 'Featured stories' });
  const slides = within(region).getAllByRole('group');
  const track = slides[0]!.parentElement;
  const viewport = track?.parentElement;

  await waitFor(async () => {
    await expect(region).toHaveAttribute('data-layout', 'multi-card-peek');
    await expect(viewport).not.toBeNull();
    await expect(track).not.toBeNull();
    await expect(slides[0]!.getBoundingClientRect().width).toBeCloseTo(expectedSlideWidth, 0);
    await expect(Number.parseFloat(getComputedStyle(track!).columnGap)).toBe(expectedGap);
  });

  const viewportRight = viewport!.getBoundingClientRect().right;
  const partialSlide = slides.find((slide) => {
    const bounds = slide.getBoundingClientRect();
    return bounds.left < viewportRight && bounds.right > viewportRight;
  });
  await expect(partialSlide).toBeDefined();
  await expect(slides[0]).not.toHaveAttribute('inert');
  await waitFor(async () => expect(partialSlide!).toHaveAttribute('inert'));
  await waitFor(async () => expect(slides.at(-1)!).toHaveAttribute('inert'));
}

const meta = {
  title: 'Carousel',
  component: Carousel,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "carousel",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/carousel",
      "privateAuditDigest": "bf4b666fa58b427629052347b87f097caccc676d64d9219c38988b67b627fab4",
      "decisionIds": [
        "sp-carousel-001",
        "sp-carousel-002",
        "sp-carousel-003"
      ],
      "representationDecisions": [
        {
          "decisionId": "sp-carousel-002",
          "implementationKey": "carousel",
          "surfaces": [
            "ai-registry",
            "code",
            "figma",
            "storybook"
          ]
        }
      ],
      "requiredRepresentationSurfaces": [
        "ai-registry",
        "code",
        "figma",
        "storybook"
      ]
    },
    realizationEvidence: ['carousel.keyboard.controls', 'carousel.state.slides', 'carousel.announcement.status'],
    layout: 'padded',
    docs: {
      description: {
        component:
          'Steps through discrete slides using Embla. Slides outside the active layout visibility threshold are marked `inert` so Tab skips clipped links, the arrow controls disable at the ends, and each slide announces its position.',
      },
    },
  },
  argTypes: {
    "slides": { control: 'object', description: "Required. Public `slides` realization prop." },
    "label": { control: 'text', description: "Required. Public `label` realization prop." },
    "previousLabel": { control: 'text', description: "Optional. Public `previousLabel` realization prop. Defaults to \"Previous slide\"." },
    "nextLabel": { control: 'text', description: "Optional. Public `nextLabel` realization prop. Defaults to \"Next slide\"." },
    "loop": { control: 'boolean', description: "Optional. Public `loop` realization prop. Defaults to false." },
    "layout": { control: 'inline-radio', options: ['single', 'multi-card-peek'], description: "Optional. Public `layout` realization prop. Defaults to \"single\"." },
    "slideClassName": { control: 'text', description: "Optional. Public `slideClassName` realization prop." },
    "previousIcon": { control: false, description: "Optional. Public `previousIcon` realization prop." },
    "nextIcon": { control: false, description: "Optional. Public `nextIcon` realization prop." },
    "statusSeparator": { control: 'text', description: "Optional. Public `statusSeparator` realization prop. Defaults to \"/\"." },
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
      await expect(region).toHaveAttribute('data-layout', 'single');
    });

    await step('keeps the backward-compatible full-width slide default', async () => {
      const firstSlide = within(region).getAllByRole('group')[0]!;
      const viewport = firstSlide.parentElement?.parentElement;
      await expect(viewport).not.toBeNull();
      await waitFor(async () => {
        await expect(firstSlide.getBoundingClientRect().width).toBeCloseTo(viewport!.getBoundingClientRect().width, 0);
      });
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

/** Reusable card-peek layout: exact source-derived width and gap, with one-snap navigation. */
export const MultiCardPeek: Story = {
  args: { layout: 'multi-card-peek', slides: multiCardSlides },
  globals: { viewport: { value: 'sourceParity1440', isRotated: false } },
  play: async ({ canvasElement, step }) => {
    await step('uses the desktop source-parity layout contract', async () => {
      await verifyMultiCardLayout(canvasElement, 284, 12);
    });

    await step('advances exactly one slide and announces the new position', async () => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
      await waitFor(async () => expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('2 / 6'));
    });
  },
};

/** Source-parity specimen at the 1024px desktop breakpoint. */
export const MultiCardPeek1024: Story = {
  args: { layout: 'multi-card-peek', slides: multiCardSlides },
  globals: { viewport: { value: 'lgBoundary', isRotated: false } },
  play: async ({ canvasElement }) => verifyMultiCardLayout(canvasElement, 284, 12),
};

/** Source-parity specimen at 768px: mobile card width with the wider gap. */
export const MultiCardPeek768: Story = {
  args: { layout: 'multi-card-peek', slides: multiCardSlides },
  globals: { viewport: { value: 'sourceParity768', isRotated: false } },
  play: async ({ canvasElement }) => verifyMultiCardLayout(canvasElement, 299, 12),
};

/** Source-parity specimen at 390px: mobile card width and base gap. */
export const MultiCardPeek390: Story = {
  args: { layout: 'multi-card-peek', slides: multiCardSlides },
  globals: { viewport: { value: 'sourceParity390', isRotated: false } },
  play: async ({ canvasElement }) => verifyMultiCardLayout(canvasElement, 299, 8),
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

const CAROUSEL_INTERACTION_STATES = [
  { id: 'single-start', label: 'Single · Start', layout: 'single', loop: false, slideCount: 5 },
  { id: 'single-next-focus-visible', label: 'Single · Next focus visible', layout: 'single', loop: false, slideCount: 5 },
  { id: 'single-advanced', label: 'Single · Advanced', layout: 'single', loop: false, slideCount: 5 },
  { id: 'single-loop', label: 'Single · Loop enabled', layout: 'single', loop: true, slideCount: 5 },
  { id: 'single-slide', label: 'Single · One slide', layout: 'single', loop: false, slideCount: 1 },
  { id: 'multi-start', label: 'Multi-card peek · Start', layout: 'multi-card-peek', loop: false, slideCount: 6 },
  { id: 'multi-next-focus-visible', label: 'Multi-card peek · Next focus visible', layout: 'multi-card-peek', loop: false, slideCount: 6 },
  { id: 'multi-advanced', label: 'Multi-card peek · Advanced', layout: 'multi-card-peek', loop: false, slideCount: 6 },
] as const;

/** Code-backed specimens used to govern the Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, height: '2400px' } },
    pseudo: {
      rootSelector: 'body',
      focusVisible: [
        '.state-carousel-single-next-focus-visible button[aria-label="Next slide"]',
        '.state-carousel-multi-next-focus-visible button[aria-label="Next slide"]',
      ],
    },
  },
  render: () => (
    <div className="grid min-h-screen grid-cols-1 gap-l bg-surface-raised p-l text-sm text-text-secondary 2xl:grid-cols-2">
      {CAROUSEL_INTERACTION_STATES.map((state) => {
        const slides = Array.from({ length: state.slideCount }, (_, index) => <InteractionSlide key={index} />);
        const focusVisible = state.id.endsWith('focus-visible');

        return (
          <section key={state.id} className={`state-carousel-${state.id} min-w-0 rounded-medium bg-surface-sunken p-m`}>
            <p className="mb-s font-semibold uppercase tracking-wide">{state.label}</p>
            <Carousel
              label={state.label}
              slides={slides}
              layout={state.layout}
              loop={state.loop}
              className="w-full max-w-[760px]"
              classNames={{
                nextButton: focusVisible
                  ? 'outline-2 outline-solid outline-offset-2 outline-border-focus'
                  : undefined,
              }}
            />
          </section>
        );
      })}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const root = (state: string) => canvasElement.querySelector<HTMLElement>(`.state-carousel-${state}`)!;
    const controls = (state: string) => {
      const canvas = within(root(state));
      return {
        previous: canvas.getByRole('button', { name: 'Previous slide' }),
        next: canvas.getByRole('button', { name: 'Next slide' }),
      };
    };

    await step('start, loop, and one-slide controls expose their code-backed disabled states', async () => {
      for (const state of ['single-start', 'multi-start'] as const) {
        const { previous, next } = controls(state);
        await waitFor(() => expect(previous).toBeDisabled());
        await expect(next).toBeEnabled();
      }
      await waitFor(() => expect(controls('single-loop').previous).toBeEnabled());
      await expect(controls('single-loop').next).toBeEnabled();
      await waitFor(() => expect(controls('single-slide').previous).toBeDisabled());
      await expect(controls('single-slide').next).toBeDisabled();
    });

    await step('forced next-control focus exposes the governed focus ring', async () => {
      for (const state of ['single-next-focus-visible', 'multi-next-focus-visible'] as const) {
        const next = controls(state).next;
        await waitFor(() => expect(next).toHaveClass('pseudo-focus-visible'));
        const style = getComputedStyle(next);
        await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
        await expect(style.outlineStyle).not.toBe('none');
        await expect(style.outlineOffset).toBe('2px');
      }
    });

    await step('advanced specimens move one snap, enable previous, and expose the new visual status', async () => {
      for (const [state, count] of [['single-advanced', 5], ['multi-advanced', 6]] as const) {
        const { previous, next } = controls(state);
        await userEvent.click(next);
        await waitFor(() => expect(previous).toBeEnabled());
        await expect(root(state).querySelector('[aria-live="polite"]')).toHaveTextContent(`2 / ${count}`);
      }
    });

    await step('default controls use the exact source SVG geometry', async () => {
      const icons = root('single-start').querySelectorAll('button svg');
      await expect(icons).toHaveLength(2);
      await expect(icons[0]!).toHaveAttribute('viewBox', '0 0 20 20');
      await expect(icons[0]!.querySelector('path')).toHaveAttribute('d', 'M12.5 15.5 7 10l5.5-5.5 1.4 1.4L9.8 10l4.1 4.1-1.4 1.4Z');
      await expect(icons[1]!.querySelector('path')).toHaveAttribute('d', 'M7.5 4.5 13 10l-5.5 5.5-1.4-1.4L10.2 10 6.1 5.9l1.4-1.4Z');
    });

    await step('carousel interaction-state motion collapses under reduced motion', async () => {
      const next = controls('single-start').next;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(next).transitionDuration).toBe(reduced ? '0s' : '0.15s');
    });
  },
};
