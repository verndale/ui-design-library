import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button, ButtonSurfaceProvider } from './Button';

const meta = {
  title: 'Button',
  component: Button,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A control that performs an in-page action. If it navigates, use **Link** instead — the catalog treats those as different components and assistive technology depends on the distinction. Buttons adapt to a dark surface via `ButtonSurfaceProvider`, so a dark section is declared once rather than per button.',
      },
    },
  },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'radio', options: ['large', 'medium', 'small'] },
    surface: { control: 'radio', options: ['light', 'dark'] },
    disabled: { control: 'boolean' },
    as: { table: { disable: true } },
  },
  args: { children: 'Continue', variant: 'primary', size: 'large' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['motion'],
  args: { onClick: fn() },
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

    await step('responds to Space, which a div never would', async () => {
      button.focus();
      await userEvent.keyboard(' ');
      await expect(args.onClick).toHaveBeenCalledTimes(2);
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

/** One provider inverts every button beneath it — no per-button prop. */
export const OnDarkSurface: Story = {
  render: (args) => (
    <ButtonSurfaceProvider value="dark">
      <div className="flex items-center gap-2xs bg-surface-inverse p-l">
        {(['primary', 'secondary', 'ghost'] as const).map((v) => (
          <Button key={v} {...args} variant={v}>
            {v}
          </Button>
        ))}
      </div>
    </ButtonSurfaceProvider>
  ),
  /**
   * One provider inverting a whole subtree is what replaced the client's
   * per-button colour prop, so the context actually reaching the buttons is the
   * contract — and a context that silently stops applying looks identical to
   * one that never did on a light background.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['primary', 'secondary', 'ghost']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute('data-surface', 'dark');
    }
  },
};

/** An explicit prop wins over the surrounding provider. */
export const SurfacePropOverridesProvider: Story = {
  render: (args) => (
    <ButtonSurfaceProvider value="dark">
      <div className="flex items-center gap-2xs bg-surface-inverse p-l">
        <Button {...args}>Inherits dark</Button>
        <Button {...args} surface="light">
          Forced light
        </Button>
      </div>
    </ButtonSurfaceProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Inherits dark' })).toHaveAttribute('data-surface', 'dark');
    await expect(canvas.getByRole('button', { name: 'Forced light' })).toHaveAttribute('data-surface', 'light');
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

/** A navigating control renders an anchor and gets aria-disabled, not the disabled attribute. */
export const AsLink: Story = {
  args: { as: 'a', href: '#top', children: 'Navigates instead' },
  /**
   * The explicit guard added during de-clienting: `type` and `disabled` are
   * button-only attributes, and putting either on an anchor is invalid HTML that
   * assistive technology reads inconsistently.
   */
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Navigates instead' });

    await step('exposes the link role, not button', async () => {
      await expect(link.tagName.toLowerCase()).toBe('a');
      await expect(link).toHaveAttribute('href', '#top');
      await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    });

    await step('carries no button-only attributes', async () => {
      await expect(link).not.toHaveAttribute('type');
      await expect(link).not.toHaveAttribute('disabled');
    });
  },
};

/** A disabled anchor cannot use the disabled attribute, so it uses aria-disabled. */
export const AsDisabledLink: Story = {
  args: { as: 'a', href: '#top', disabled: true, children: 'Unavailable' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Unavailable' });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).not.toHaveAttribute('disabled');
    await expect(getComputedStyle(link).pointerEvents).toBe('none');
  },
};
