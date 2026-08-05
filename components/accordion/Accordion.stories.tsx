import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Accordion, type AccordionItem } from './Accordion';

const faq: AccordionItem[] = [
  { label: 'What is your return policy?', children: 'Returns are accepted within 30 days of delivery.' },
  { label: 'How long does shipping take?', children: 'Standard shipping arrives in three to five business days.' },
  { label: 'Do you ship internationally?', children: 'Yes — to most countries, with duties calculated at checkout.' },
];

/**
 * The story file is this component's API contract. The behaviour worth proving
 * is the disclosure semantics — `aria-expanded`, that collapsed panels are
 * skipped by Tab, and that motion collapses under `prefers-reduced-motion`.
 */
const meta = {
  title: 'Accordion',
  component: Accordion,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A set of independently-expandable disclosure items. Each header is a real button in an `h3`; collapsed panels are `inert` so Tab skips them; the reveal animation is gated on reduced motion. An optional show-more reveal collapses a long list.',
      },
    },
  },
  argTypes: {
    heading: { control: 'text', description: 'Optional section heading rendered above the items (an `h2`).' },
    standalone: { control: 'boolean', description: 'Boxed treatment — bordered, rounded, padded. Purely visual.' },
    initialItemCount: { control: 'number', description: 'When set and exceeded, collapses the list behind "See more".' },
  },
  args: { items: faq },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Items open and close independently; opening one leaves the others closed. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'What is your return policy?' });

    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'false');

    const second = canvas.getByRole('button', { name: 'How long does shipping take?' });
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  },
};

/** The boxed visual variant — a bordered, rounded container. */
export const Standalone: Story = {
  args: { standalone: true, heading: 'Frequently asked' },
};

/**
 * A link inside a collapsed panel must be out of the tab order — the reason the
 * panel is `inert` rather than merely visually clipped. Proven two ways: real
 * Tab traversal never lands inside an `inert` subtree, and `inert` blocks even a
 * programmatic `focus()` while closed, then releases it once open.
 */
export const FocusGating: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-s">
      <a href="#top" className="text-link underline">
        Focus starts here — Tab forward
      </a>
      <Accordion {...args} />
    </div>
  ),
  args: {
    items: [
      {
        label: 'Shipping',
        children: (
          <p>
            See our <a href="#rates">shipping rates</a> for details.
          </p>
        ),
      },
      { label: 'Returns', children: 'Returns are accepted within 30 days.' },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByRole('link', { name: /Focus starts here/ });
    const shipping = canvas.getByRole('button', { name: 'Shipping' });
    // Queried from the DOM, not the a11y tree, so it resolves while inert too.
    const link = canvasElement.querySelector('a[href="#rates"]') as HTMLAnchorElement;

    await step('the collapsed panel gates its link out of the tab order', async () => {
      await expect(link.closest('[inert]')).not.toBeNull();
      // inert blocks a programmatic focus too, so this is a real no-op.
      link.focus();
      await expect(link).not.toHaveFocus();
    });

    await step('Tab never enters an inert subtree', async () => {
      start.focus();
      for (let i = 0; i < 4; i += 1) {
        await userEvent.tab();
        await expect((document.activeElement as HTMLElement).closest('[inert]')).toBeNull();
      }
    });

    await step('opening the panel returns its link to the tab order', async () => {
      await userEvent.click(shipping);
      await expect(link.closest('[inert]')).toBeNull();
      link.focus();
      await expect(link).toHaveFocus();
    });
  },
};

/** More items than `initialItemCount`, collapsed behind a single reveal control. */
export const ShowMore: Story = {
  args: {
    initialItemCount: 2,
    items: [
      ...faq,
      { label: 'Can I track my order?', children: 'A tracking link is emailed when the order ships.' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2);

    await userEvent.click(canvas.getByRole('button', { name: 'See more' }));
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(4);
    await expect(canvas.getByRole('button', { name: 'See less' })).toBeInTheDocument();
  },
};

/**
 * The reveal animation is one property driven by `--duration-base`, so the
 * reduced-motion media query is the single switch. Re-run under emulated
 * reduced motion by `pnpm test:motion`, where the same assertion flips to `0s`.
 */
export const ReducedMotion: Story = {
  tags: ['motion'],
  args: { items: [faq[0]!] },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-accordion-motion]');
    await expect(panel).toBeTruthy();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel as Element).transitionDuration).toBe(reduced ? '0s' : '0.3s');
  },
};
