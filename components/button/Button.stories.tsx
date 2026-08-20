import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './index';

const ArrowIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" fill="none">
    <path d="m7 4 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const meta = {
  title: 'Button',
  component: Button,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    sourceParityEvidence: {
      "contractVersion": 1,
      "auditComponentKey": "button",
      "auditStatus": "cleared",
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
    realizationEvidence: ['button.keyboard.activation', 'button.focus.visible', 'button.icons.decorative', 'button.icon-only.name'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A native control that performs an in-page action. If it navigates, use **Link** instead — the catalog treats those as different components and assistive technology depends on the distinction. Use the explicit `surface` prop to select the semantic palette. Icon-only buttons require an `aria-label` and use the same semantic appearance and touch-size axes.',
      },
    },
  },
  argTypes: {
    "children": { control: false, description: "Required. Public `children` realization prop." },
    "presentation": { control: 'radio', options: ["label","icon-only"], description: "Optional. Public `presentation` realization prop. Defaults to \"label\"; icon-only requires `aria-label`." },
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


/** A square icon-only control whose native accessible name is required by its TypeScript branch. */
export const IconOnly: Story = {
  tags: ['motion'],
  args: {
    presentation: 'icon-only',
    children: <ArrowIcon />,
    'aria-label': 'Next item',
    onClick: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Next item' });

    await step('button.icon-only.name', async () => {
      await expect(button).toHaveAccessibleName('Next item');
      await expect(button).toHaveAttribute('data-presentation', 'icon-only');
      await expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    await step('uses the governed large square touch target', async () => {
      const { width, height } = button.getBoundingClientRect();
      await expect(Math.round(width)).toBe(48);
      await expect(Math.round(height)).toBe(48);
    });

    await step('retains native activation and focus', async () => {
      button.focus();
      await expect(button).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step('drops its colour transition under reduced motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const { transitionProperty } = getComputedStyle(button);
      if (reduced) await expect(transitionProperty).toBe('none');
      else await expect(transitionProperty).toContain('background-color');
    });
  },
};

/** All governed icon-only combinations. Ghost remains scoped to the dark/imagery surface. */
export const IconOnlyMatrix: Story = {
  args: { presentation: 'icon-only', children: <ArrowIcon />, 'aria-label': 'Next item' },
  render: (args) => (
    <div className="grid gap-l">
      {(['light', 'dark'] as const).map((surface) => (
        <div key={surface} className={surface === 'dark' ? 'grid gap-s bg-surface-inverse p-l' : 'grid gap-s bg-surface-base p-l'}>
          {(['large', 'medium', 'small'] as const).map((size) => (
            <div key={size} className="flex items-center gap-2xs">
              {(surface === 'dark' ? ['primary', 'secondary', 'ghost'] as const : ['primary', 'secondary'] as const).map((variant) => (
                <Button
                  {...args}
                  key={[surface, size, variant].join('-')}
                  aria-label={[variant, size, 'icon button'].join(' ')}
                  size={size}
                  surface={surface}
                  variant={variant}
                />
              ))}
            </div>
          ))}
        </div>
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
