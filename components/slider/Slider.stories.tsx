import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';

import { Slider, type SliderOption } from './Slider';

/**
 * Move the thumb by the option index.
 *
 * `user-event` does not implement the browser's native default action for arrow
 * keys on `input[type=range]` — it dispatches the key events and the value never
 * moves — so a change event is the honest way to drive this control here. It is
 * the same event a real drag or keypress delivers to React; the assertions stay
 * on the effect (`aria-valuetext`, the rendered description).
 */
const moveTo = (input: HTMLElement, index: number) =>
  fireEvent.change(input, { target: { value: String(index) } });

const sizes: SliderOption[] = [
  { value: 's', label: '24' },
  { value: 'm', label: '30' },
  { value: 'l', label: '36' },
  { value: 'xl', label: '42' },
];

/**
 * The story file is this component's API contract. The behaviour worth proving is
 * the announced value: a range input reports its raw numeric value, so the whole
 * point of this component is that assistive tech hears the option label instead of
 * the index.
 */
const meta = {
  title: 'Slider',
  component: Slider,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A slider over a set of named options rather than a numeric range. The native input carries the option index; the API speaks in option values. `aria-valuetext` makes it announce the label ("36 inches") instead of the index ("2"), and every decorative part is `aria-hidden`.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: "The control's visible label. Required." },
    unit: { control: 'text', description: 'Appended to the announced and displayed value.' },
    hint: { control: 'text', description: 'Guidance, associated via `aria-describedby`.' },
  },
  args: { label: 'Width', options: sizes },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Moving the thumb selects the next option and updates the announced value. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Width' });

    await step('the control is reachable by keyboard', async () => {
      await userEvent.tab();
      await expect(input).toHaveFocus();
    });

    await step('the announced value tracks the selected option', async () => {
      await expect(input).toHaveAttribute('aria-valuetext', '24');
      moveTo(input, 1);
      await expect(input).toHaveAttribute('aria-valuetext', '30');
      moveTo(input, 2);
      await expect(input).toHaveAttribute('aria-valuetext', '36');
      moveTo(input, 1);
      await expect(input).toHaveAttribute('aria-valuetext', '30');
    });
  },
};

/**
 * The reason the component exists. `aria-valuetext` composes the option label with
 * the unit, so the control announces "36 inches" where its raw `value` is "2".
 */
export const WithUnit: Story = {
  args: { unit: 'inches', defaultValue: 'l' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Width' }) as HTMLInputElement;

    await expect(input.value).toBe('2');
    await expect(input).toHaveAttribute('aria-valuetext', '36 inches');
  },
};

/** The hint is wired into the control's description, not left as loose text. */
export const WithHint: Story = {
  args: { hint: 'Measured at the widest point' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Width' });

    // Assert the reference resolves, not merely that the attribute is present.
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
    const described = ids.map((id) => canvasElement.querySelector(`#${CSS.escape(id)}`)?.textContent);
    await expect(described.join(' ')).toContain('Measured at the widest point');
    await expect(described.join(' ')).toContain('24');
  },
};

/** A per-option description swaps as the selection moves. */
export const WithDescription: Story = {
  args: {
    label: 'Plan',
    options: [
      { value: 'starter', label: 'Starter', description: 'For a single project.' },
      { value: 'team', label: 'Team', description: 'Up to ten collaborators.' },
      { value: 'scale', label: 'Scale', description: 'Unlimited collaborators and SSO.' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Plan' });

    await expect(canvas.getByText('For a single project.')).toBeInTheDocument();
    moveTo(input, 1);
    await expect(canvas.getByText('Up to ten collaborators.')).toBeInTheDocument();
    await expect(canvas.queryByText('For a single project.')).not.toBeInTheDocument();
  },
};

/**
 * The degenerate scale. One option means no range to traverse — the progress
 * branch that divides by `lastIndex` must not produce NaN, and the max/min row
 * collapses to a single label.
 */
export const SingleOption: Story = {
  args: { options: [{ value: 'only', label: 'One size' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Width' }) as HTMLInputElement;

    await expect(input.max).toBe('0');
    await expect(input).toHaveAttribute('aria-valuetext', 'One size');
  },
};

/** Long labels must not force the min/max scale row to overflow its container. */
export const LongLabels: Story = {
  args: {
    label: 'Delivery window',
    options: [
      { value: 'next', label: 'Next business day' },
      { value: 'week', label: 'Within five business days' },
      { value: 'month', label: 'Within one calendar month' },
    ],
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-component="slider"]') as HTMLElement;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  },
};
