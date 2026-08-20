import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './index';

const meta = {
  title: 'Button',
  component: Button,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "button",
      "auditStatus": "remediation-pending",
      "privateAuditRef": "library-source-parity:2026-08-19/components/button",
      "privateAuditDigest": "342ee614589966d4979626cfd97cbd12023e3f16766fc113be9ea5063cc34e08",
      "decisionIds": [
        "sp-button-001",
        "sp-button-002"
      ],
      "representationDecisions": [
        {
          "decisionId": "sp-button-002",
          "implementationKey": "button",
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
    realizationEvidence: ['button.keyboard.activation', 'button.focus.visible', 'button.icons.decorative'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native control that performs an in-page action. If it navigates, use **Link** instead — the catalog treats those as different components and assistive technology depends on the distinction. Use the explicit `surface` prop to select the semantic palette.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "variant": { control: 'radio', options: ["primary","secondary","ghost"], description: "Optional. Public `variant` realization prop. Defaults to \"primary\"." },
    "size": { control: 'radio', options: ["large","medium","small"], description: "Optional. Public `size` realization prop. Defaults to \"large\"." },
    "surface": { control: 'radio', options: ["light","dark"], description: "Optional. Public `surface` realization prop. Defaults to \"light\"." },
    "startIcon": { control: false, description: "Optional. Public `startIcon` realization prop." },
    "endIcon": { control: false, description: "Optional. Public `endIcon` realization prop." },
    "type": { control: 'radio', options: ["button","submit","reset"], description: "Optional. Native button type. Defaults to \"button\"." },
    "disabled": { control: 'boolean', description: "Optional. Native disabled state. Defaults to false." },
    "onClick": { control: false, description: "Optional. Native activation callback." },
    "aria-label": { control: 'text', description: "Optional. Native accessible-name override." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
  },
  args: { children: 'Continue', variant: 'primary', size: 'large' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['motion'],
  args: { onClick: fn(), startIcon: <span>Start</span>, endIcon: <span>End</span> },
  /** A native button: correct role, an explicit type, and operable by keyboard. */
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });

    await step('is a real button with an explicit type', async () => {
      await expect(button.tagName.toLowerCase()).toBe('button');
      await expect(button).toHaveAttribute('type', 'button');
    });

    await step('responds to click', async () => {
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step('button.keyboard.activation', async () => {
      button.focus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onClick).toHaveBeenCalledTimes(2);
      await userEvent.keyboard(' ');
      await expect(args.onClick).toHaveBeenCalledTimes(3);
    });

    await step('button.focus.visible', async () => {
      await expect(button).toHaveFocus();
      const style = getComputedStyle(button);
      await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(1);
      await expect(style.outlineStyle).not.toBe('none');
    });

    await step('button.icons.decorative', async () => {
      const icons = button.querySelectorAll('[aria-hidden="true"]');
      await expect(icons).toHaveLength(2);
      await expect(button).toHaveAccessibleName('Continue');
    });

    await step('drops its colour transition under reduced motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Button uses `motion-reduce:transition-none` — a different mechanism from
      // the token collapse Card relies on, so it needs its own coverage.
      const { transitionProperty } = getComputedStyle(button);
      if (reduced) await expect(transitionProperty).toBe('none');
      else await expect(transitionProperty).toContain('background-color');
    });
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-2xs">
      {(['primary', 'secondary'] as const).map((v) => (
        <Button key={v} {...args} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2xs">
      {(['large', 'medium', 'small'] as const).map((s) => (
        <Button key={s} {...args} size={s}>
          {s}
        </Button>
      ))}
    </div>
  ),
};

/** The explicit surface selects the inverse semantic palette without client context. */
export const OnDarkSurface: Story = {
  args: { surface: 'dark' },
  render: (args) => (
    <div className="flex items-center gap-2xs bg-surface-inverse p-l">
      {(['primary', 'secondary', 'ghost'] as const).map((v) => (
        <Button key={v} {...args} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['primary', 'secondary', 'ghost']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute('data-surface', 'dark');
    }
  },
};

export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });

    await expect(button).toBeDisabled();
    await userEvent.setup({ pointerEventsCheck: 0 }).click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
