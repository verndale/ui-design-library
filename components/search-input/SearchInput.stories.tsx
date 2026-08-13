import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchInput } from './index';

const meta = {
  title: 'Search input',
  component: SearchInput,
  // Mirrors component.json; `pnpm contracts` fails if the two disagree.
  tags: ['maturity:supported'],
  parameters: {
    realizationEvidence: ['search-input.keyboard.submit', 'search-input.semantics.label', 'search-input.announcement.results'],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text field for entering a search query, with an inline submit control, a clear affordance that appears once there is a query, and an optional live results region. Controlled or uncontrolled.',
      },
    },
  },
  argTypes: {
    "placeholder": { control: 'text', description: "Optional. Public `placeholder` realization prop. Defaults to \"Search\"." },
    "label": { control: 'text', description: "Optional. Public `label` realization prop. Defaults to \"Search\"." },
    "onSearch": { control: false, description: "Optional. Public `onSearch` realization prop." },
    "value": { control: 'text', description: "Optional. Public `value` realization prop." },
    "onChange": { control: false, description: "Optional. Public `onChange` realization prop." },
    "autoFocus": { control: 'boolean', description: "Optional. Public `autoFocus` realization prop. Defaults to false." },
    "results": { control: false, description: "Optional. Public `results` realization prop." },
    "inputId": { control: 'text', description: "Optional. Public `inputId` realization prop." },
    "clearLabel": { control: 'text', description: "Optional. Public `clearLabel` realization prop. Defaults to \"Clear search\"." },
    "submitLabel": { control: 'text', description: "Optional. Public `submitLabel` realization prop. Defaults to \"Submit search\"." },
    "resultsLabel": { control: 'text', description: "Optional. Public `resultsLabel` realization prop. Defaults to \"Search results\"." },
    "clearIcon": { control: false, description: "Optional. Public `clearIcon` realization prop." },
    "submitIcon": { control: false, description: "Optional. Public `submitIcon` realization prop." },
    "showClearButton": { control: 'boolean', description: "Optional. Public `showClearButton` realization prop. Defaults to true." },
    "showSubmitButton": { control: 'boolean', description: "Optional. Public `showSubmitButton` realization prop. Defaults to true." },
    "className": { control: 'text', description: "Optional. Public `className` realization prop." },
    "classNames": { control: 'object', description: "Optional. Public `classNames` realization prop." },
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-component="search-input"]');

    await step('search-input.semantics.label', async () => {
      await expect(root).toBeTruthy();
      await expect(canvasElement.querySelector('form[role="search"]')).toBeTruthy();
      const input = canvas.getByRole('textbox', { name: 'Search' });
      const label = canvas.getByText('Search');
      await expect(input).toBeInTheDocument();
      await expect(label).toHaveAttribute('for', input.id);
      await expect(canvas.getByRole('button', { name: 'Submit search' })).toBeInTheDocument();
      await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    });
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

    await step('search-input.keyboard.submit', async () => {
      input.focus();
      await userEvent.keyboard('{Enter}');
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Search results' });

    await step('search-input.announcement.results', async () => {
      await expect(region).toBeInTheDocument();
      await expect(region).toHaveAttribute('aria-live', 'polite');
      await expect(region).toHaveAttribute('aria-atomic', 'true');
      await expect(within(region).getByRole('link', { name: 'Network map' })).toBeInTheDocument();
    });
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
