import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchInput } from './SearchInput';

const meta = {
  title: 'Search input',
  component: SearchInput,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:candidate'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text field for entering a search query, with an inline submit control, a clear affordance that appears once there is a query, and an optional live results region. Controlled or uncontrolled.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Accessible name and placeholder for the field.' },
    autoFocus: { control: 'boolean', description: 'Focus the input on mount.' },
    results: { table: { disable: true } },
  },
  args: { placeholder: 'Search' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** The baseline: a search landmark, a labelled field, a submit control, and no clear button until there is a query. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-component="search-input"]');

    await expect(root).toBeTruthy();
    // A search landmark, not a bare form — the reason this is a Search input.
    await expect(canvasElement.querySelector('form[role="search"]')).toBeTruthy();
    // The field's accessible name comes from the visually-hidden label, not the placeholder alone.
    await expect(canvas.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Submit search' })).toBeInTheDocument();
    // Clear is absent while the field is empty.
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  },
};

export const Interactive: Story = {
  tags: ['motion'],
  args: { onSearch: fn() },
  /** Typing reveals the clear button; submit fires with a trimmed query; clear empties and refocuses. */
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });

    await step('clear appears once there is a query', async () => {
      await userEvent.type(input, '  freight rail  ');
      await expect(canvas.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    });

    await step('submit fires onSearch with the trimmed query', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Submit search' }));
      await expect(args.onSearch).toHaveBeenCalledTimes(1);
      await expect(args.onSearch).toHaveBeenLastCalledWith('freight rail');
    });

    await step('clear empties the field and returns focus to it', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
      await expect(input).toHaveValue('');
      await expect(input).toHaveFocus();
      await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    });

    await step('drops its colour transition under reduced motion', async () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const submit = canvas.getByRole('button', { name: 'Submit search' });
      const { transitionProperty } = getComputedStyle(submit);
      if (reduced) await expect(transitionProperty).toBe('none');
      else await expect(transitionProperty).toContain('background-color');
    });
  },
};

export const WithResults: Story = {
  args: {
    results: (
      <>
        <a href="#a" className="shrink-0 rounded-medium bg-surface-sunken p-s text-text-primary">
          Network map
        </a>
        <a href="#b" className="shrink-0 rounded-medium bg-surface-sunken p-s text-text-primary">
          Shipping tools
        </a>
      </>
    ),
  },
  /** The results slot renders inside a polite live region so a screen reader announces changes. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Search results' });

    await expect(region).toBeInTheDocument();
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(within(region).getByRole('link', { name: 'Network map' })).toBeInTheDocument();
  },
};

export const AutoFocus: Story = {
  args: { autoFocus: true },
  /** Mounts focused — the search-panel-open case. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Search' })).toHaveFocus();
  },
};
