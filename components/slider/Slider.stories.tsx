import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { Slider, type SliderOption, type SliderProps } from './index';

/**
 * Move the thumb by the option index.
 *
 * `user-event` does not implement the browser's native default action for arrow
 * keys on `input[type=range]` — it dispatches the key events and the value never
 * moves — so the story dispatches the resulting change event directly. It is
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

function ControlledNativeForm(props: SliderProps) {
  const [value, setValue] = useState(props.value ?? 'm');

  return (
    <form data-testid="controlled-slider-form">
      <Slider {...props} value={value} onChange={(nextValue) => setValue(nextValue)} />
      <button type="reset">Reset</button>
    </form>
  );
}

/** The range exposes option labels through `aria-valuetext` rather than raw indices. */
const meta = {
  title: 'Slider',
  component: Slider,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "slider",
      "auditStatus": "cleared",
      "privateAuditRef": "library-source-parity:2026-08-19/components/slider",
      "privateAuditDigest": "b1d510639b68d3c8fb448c19e0b43e0f5ab626b965b20eb27ed81b2e8fcc0a62",
      "decisionIds": [
        "sp-slider-001",
        "sp-slider-002"
      ],
      "representationDecisions": [
        {
          "decisionId": "sp-slider-002",
          "implementationKey": "slider",
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
    realizationEvidence: [
      'slider.keyboard.native',
      'slider.value.announced',
      'slider.description.valid',
      'slider.form.native',
      'slider.form.reset',
      'slider.form.controlled',
      'slider.form.disabled',
      'slider.form.empty',
    ],
    layout: 'padded',
    docs: {
      description: {
        component:
          'A slider over a set of named options rather than a numeric range. The native range carries the option index; the API speaks in option values. `aria-valuetext` announces the label ("36 inches") instead of the index ("2"). When `name` is present, one hidden input submits the selected semantic option value.',
      },
    },
  },
  argTypes: {
    "label": { control: false, description: "Required. Public `label` realization prop." },
    "options": { control: 'object', description: "Required. Public `options` realization prop." },
    "value": { control: 'text', description: "Optional. Public `value` realization prop." },
    "defaultValue": { control: 'text', description: "Optional. Public `defaultValue` realization prop." },
    "onChange": { control: false, description: "Optional. Public `onChange` realization prop." },
    "hint": { control: false, description: "Optional. Public `hint` realization prop." },
    "unit": { control: 'text', description: "Optional. Public `unit` realization prop." },
    "name": { control: 'text', description: "Optional. Native form field name for the selected semantic option value." },
    "inputId": { control: 'text', description: "Optional. Public `inputId` realization prop." },
    "showScale": { control: 'boolean', description: "Optional. Public `showScale` realization prop. Defaults to true." },
    "showSelectedValue": { control: 'boolean', description: "Optional. Public `showSelectedValue` realization prop. Defaults to true." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
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

    await step('slider.keyboard.native', async () => {
      await userEvent.tab();
      await expect(input).toHaveFocus();
      await expect(input).toHaveAttribute('type', 'range');
      await expect(input).toHaveAttribute('min', '0');
      await expect(input).toHaveAttribute('max', '3');
      await expect(input).toHaveAttribute('step', '1');
      for (const key of ['ArrowRight', 'ArrowLeft', 'End', 'Home', 'PageUp', 'PageDown']) {
        const keydown = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        await expect(input.dispatchEvent(keydown)).toBe(true);
        await expect(keydown.defaultPrevented).toBe(false);
        await expect(input).toHaveFocus();
      }
    });

    await step('slider.value.announced', async () => {
      moveTo(input, 0);
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

/** `aria-valuetext` composes the option label with its unit. */
export const WithUnit: Story = {
  args: { unit: 'inches', defaultValue: 'l' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Width' }) as HTMLInputElement;

    await expect(input.value).toBe('2');
    await expect(input).toHaveAttribute('aria-valuetext', '36 inches');
  },
};

/** The hint is wired into the control's description, not left as loose text. */
export const WithHint: Story = {
  args: { hint: 'Measured at the widest point' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider', { name: 'Width' });

    await step('slider.description.valid', async () => {
      const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
      const described = ids.map((id) => canvasElement.querySelector(`#${CSS.escape(id)}`)?.textContent);
      await expect(ids).toHaveLength(2);
      await expect(described.join(' ')).toContain('Measured at the widest point');
      await expect(described.join(' ')).toContain('24');
    });
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

/** A named Slider contributes exactly one semantic option value to native form submission. */
export const NativeFormSubmission: Story = {
  args: { name: 'width', defaultValue: 'm' },
  render: (args) => (
    <form data-testid="slider-form">
      <Slider {...args} />
      <button type="reset">Reset</button>
    </form>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId('slider-form') as HTMLFormElement;
    const range = canvas.getByRole('slider', { name: 'Width' }) as HTMLInputElement;
    const output = form.querySelector<HTMLInputElement>('input[type="hidden"][name="width"]');

    await step('slider.form.native', async () => {
      await expect(range).not.toHaveAttribute('name');
      await expect(form.querySelectorAll('[name="width"]')).toHaveLength(1);
      await expect(output).toHaveValue('m');
      await expect(new FormData(form).getAll('width')).toEqual(['m']);

      moveTo(range, 2);
      await expect(output).toHaveValue('l');
      await expect(new FormData(form).getAll('width')).toEqual(['l']);
    });

    await step('slider.form.reset', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
      await waitFor(() => expect(range).toHaveValue('1'));
      await expect(output).toHaveValue('m');
      await expect(new FormData(form).getAll('width')).toEqual(['m']);
    });
  },
};

/** Native reset cannot override a controlled Slider value owned by its parent. */
export const ControlledNativeFormSubmission: Story = {
  args: { name: 'width' },
  render: (args) => <ControlledNativeForm {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId('controlled-slider-form') as HTMLFormElement;
    const range = canvas.getByRole('slider', { name: 'Width' }) as HTMLInputElement;

    await step('slider.form.controlled', async () => {
      moveTo(range, 3);
      await expect(new FormData(form).get('width')).toBe('xl');
      await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
      await waitFor(() => expect(range).toHaveValue('3'));
      await expect(new FormData(form).get('width')).toBe('xl');
    });
  },
};

/** A disabled fieldset excludes the named Slider output through native form semantics. */
export const DisabledFieldset: Story = {
  args: { name: 'width', defaultValue: 'm' },
  render: (args) => (
    <form data-testid="disabled-slider-form">
      <fieldset disabled>
        <Slider {...args} />
      </fieldset>
    </form>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId('disabled-slider-form') as HTMLFormElement;
    const range = canvas.getByRole('slider', { name: 'Width' });

    await step('slider.form.disabled', async () => {
      await expect(range).toBeDisabled();
      await expect(new FormData(form).has('width')).toBe(false);
    });
  },
};

/** An empty option list renders no range or named form output. */
export const EmptyOptions: Story = {
  args: { name: 'width', options: [] },
  render: (args) => (
    <form data-testid="empty-slider-form">
      <Slider {...args} />
    </form>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByTestId('empty-slider-form') as HTMLFormElement;

    await step('slider.form.empty', async () => {
      await expect(canvas.queryByRole('slider')).not.toBeInTheDocument();
      await expect(new FormData(form).has('width')).toBe(false);
    });
  },
};
