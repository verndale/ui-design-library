import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Card, CardMedia } from './index';

const meta = {
  title: 'Card',
  component: Card,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "card",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/card",
      "privateAuditDigest": "9b9123adeef6dc98341a03651dc5aa29318ab4a5c62b74b15074e960ad91d13f",
      "decisionIds": [
        "sp-card-001",
        "sp-card-002"
      ],
      "representationDecisions": [],
      "requiredRepresentationSurfaces": []
    },
    realizationEvidence: ['card.semantics.root'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'An elevated surface for card layouts. `CardMedia` adds a clipped media slot whose child scales on hover and on keyboard focus — wrap the card in an element carrying `group` for that to fire.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "unsetBackground": { control: 'boolean', description: "Optional. Public `unsetBackground` realization prop. Defaults to false." },
    "as": { control: 'radio', options: ["div","article","section"], description: "Optional. Public `as` realization prop. Defaults to \"div\"." },
    "ariaLabel": { control: 'text', description: "Optional. Public `ariaLabel` realization prop." },
    "ariaLabelledBy": { control: 'text', description: "Optional. Public `ariaLabelledBy` realization prop." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector('[data-component="card"]');

    await step('card.semantics.root', async () => {
      await expect(card).toBeTruthy();
      await expect(card?.tagName).toBe('DIV');
      await expect(card).not.toHaveAttribute('role');
      await expect(canvas.getByText('Body content sits inside the surface.')).toBeInTheDocument();
      await expect(getComputedStyle(card as HTMLElement).overflow).toBe('hidden');
    });
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

const StateMedia = ({ active = false }: { active?: boolean }) => (
  <div className={[
    'grid size-full place-items-center bg-surface-sunken',
    active ? 'scale-[1.05] motion-reduce:scale-100' : undefined,
  ].filter(Boolean).join(' ')}>
    <span className="grid size-32 place-items-center rounded-pill border border-border-strong bg-surface-raised text-sm text-text-primary">Media</span>
  </div>
);

/** Code-backed specimens used to govern the CardMedia Figma interaction-state presentation. */
export const InteractionStates: Story = {
  tags: ['motion'],
  parameters: {
    pseudo: {
      rootSelector: 'body',
      hover: '.state-card-media-hover',
      focusVisible: '.state-card-media-focus-visible',
    },
  },
  render: () => (
    <div className="grid grid-cols-3 items-start gap-xl">
      {(['rest', 'hover', 'focus-visible'] as const).map((state) => (
        <section key={state} className="grid gap-s">
          <span className="text-sm text-text-secondary">Group {state}</span>
          <a
            href="#card-media-states"
            aria-label={`Card media ${state}`}
            className={`state-card-media-${state} group block focus-visible:outline-2 focus-visible:outline-border-focus`}
          >
            <Card className="w-[280px] rounded-medium">
              <CardMedia className="aspect-[3/2]">
                <StateMedia active={state !== 'rest'} />
              </CardMedia>
            </Card>
          </a>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const group = (state: string) => canvasElement.querySelector<HTMLElement>(`.state-card-media-${state}`)!;
    const mediaChild = (state: string) => group(state).querySelector<HTMLElement>('[data-component="card"] > div > div')!;
    const scaleOf = (element: HTMLElement) => {
      const scale = getComputedStyle(element).scale;
      return scale === 'none' ? 1 : parseFloat(scale);
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    await step('CardMedia rests unscaled', async () => {
      await expect(scaleOf(mediaChild('rest'))).toBe(1);
    });

    await step('forced group hover exposes the code-backed media scale', async () => {
      await waitFor(() => expect(group('hover')).toHaveClass('pseudo-hover'));
      if (reduced) await expect(scaleOf(mediaChild('hover'))).toBe(1);
      else await waitFor(() => expect(scaleOf(mediaChild('hover'))).toBeCloseTo(1.05, 2));
    });

    await step('forced group focus-visible exposes the matching media scale', async () => {
      await waitFor(() => expect(group('focus-visible')).toHaveClass('pseudo-focus-visible'));
      if (reduced) await expect(scaleOf(mediaChild('focus-visible'))).toBe(1);
      else await waitFor(() => expect(scaleOf(mediaChild('focus-visible'))).toBeCloseTo(1.05, 2));
    });

    await step('card-media.motion.reduced', async () => {
      const duration = getComputedStyle(document.documentElement).getPropertyValue('--duration-base').trim();
      await expect(duration).toBe(reduced ? '0ms' : '300ms');
      await expect(getComputedStyle(mediaChild('rest')).transitionDuration).toBe(reduced ? '0s' : '0.3s');
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
