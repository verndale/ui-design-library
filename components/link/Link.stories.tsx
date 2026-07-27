import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Link } from './Link';

const meta = {
  title: 'Link',
  component: Link,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text link. The underline animates on hover **and on keyboard focus**, and because it is drawn with `background-size` plus `box-decoration-break: clone`, each wrapped line gets its own underline rather than one rule spanning the inline box.',
      },
    },
  },
  argTypes: {
    size: { control: 'radio', options: ['large', 'medium', 'small'] },
    touchTarget: { control: 'boolean', description: 'Adds an invisible hit pad so the tap target meets the minimum height.' },
    disabled: { control: 'boolean' },
    as: { table: { disable: true } },
  },
  args: { children: 'Read the documentation', href: '#top', size: 'large' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Read the documentation' });

    await expect(link.tagName.toLowerCase()).toBe('a');
    await expect(link).toHaveAttribute('href', '#top');
    await expect(link).toHaveAttribute('data-component', 'link');
  },
};

/** Tab to it — the underline draws on focus, not only hover. */
export const KeyboardFocus: Story = {
  args: { children: 'Tab to me and watch the underline' },
};

/** The reason the underline is drawn this way: every line gets its own rule. */
export const WrappingText: Story = {
  render: (args) => (
    <p className="max-w-[24ch]">
      <Link {...args}>A link long enough to wrap onto several lines, each underlined separately</Link>
    </p>
  ),
  /**
   * `box-decoration-break: clone` on an *inline* span is the entire reason the
   * underline lives in src/lib rather than inline. Blockify that span — by
   * flexing it, or hanging the utility on the anchor — and only the last line
   * gets a rule, which is invisible until the text happens to wrap.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    const label = link.querySelector('span');
    await expect(label).toBeTruthy();

    const style = getComputedStyle(label!);
    // WebKit still needs the prefixed property, which is not in lib.dom.
    const clone = style.boxDecorationBreak || style.getPropertyValue('-webkit-box-decoration-break');

    await expect(clone).toBe('clone');
    await expect(style.display).toBe('inline');
    // Actually wrapped, so the assertion above is being exercised.
    await expect(label!.getClientRects().length).toBeGreaterThan(1);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-2xs">
      {(['large', 'medium', 'small'] as const).map((size) => (
        <Link key={size} {...args} size={size}>
          {size}
        </Link>
      ))}
    </div>
  ),
};

/** The hit pad extends the tap target without changing layout height. */
export const WithTouchTarget: Story = {
  args: { touchTarget: true, children: 'Standalone call to action' },
  /**
   * The whole point of the `::before` technique is that the tap target grows to
   * the WCAG 2.5.8 floor while the link's own box does not — a plain `min-h`
   * would satisfy a class-name test and still push the layout around.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Standalone call to action' });

    const pad = getComputedStyle(link, '::before');
    const touchLarge = getComputedStyle(document.documentElement).getPropertyValue('--size-touch-large').trim();

    await expect(pad.content).not.toBe('none');
    await expect(parseFloat(pad.minHeight)).toBeGreaterThanOrEqual(44);
    await expect(touchLarge).toBeTruthy();
    // The layout box itself stays at its natural height.
    await expect(parseFloat(getComputedStyle(link).minHeight || '0')).toBeLessThan(44);
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Unavailable' });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(link).pointerEvents).toBe('none');
  },
};
