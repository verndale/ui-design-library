import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { TextInput } from './index';

const meta = {
  title: 'Text input',
  component: TextInput,
  tags: ['maturity:candidate'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1, auditComponentKey: 'text-input', auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-09-07/components/text-input',
      privateAuditDigest: 'f732aca01c0bb10d27ab1f219abe03ba0348931a73fd80387958c6058d07f109',
      decisionIds: ['sp-text-input-001'],
      representationDecisions: [{ decisionId: 'sp-text-input-001', implementationKey: 'text-input', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] }],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: ['text-input.semantics.name', 'text-input.description.message', 'text-input.state.invalid'],
    layout: 'centered',
  },
  argTypes: {
    'label': { control: false },
    'labelSuffix': { control: false },
    'helperText': { control: false },
    'error': { control: 'boolean' },
    'errorMessage': { control: false },
    'leadingContent': { control: false },
    'trailingContent': { control: false },
    'variant': { control: 'inline-radio', options: ['default', 'borderless'] },
    'inputSize': { control: 'number' },
    'disabled': { control: 'boolean' },
    'readOnly': { control: 'boolean' },
    'required': { control: 'boolean' },
    'value': { control: 'text' },
    'defaultValue': { control: 'text' },
    'placeholder': { control: 'text' },
    'name': { control: 'text' },
    'id': { control: 'text' },
    'onChange': { control: false },
    'aria-label': { control: 'text' },
    'aria-describedby': { control: 'text' },
    'className': { control: 'text' },
    'classNames': { control: 'object' },
  },
  args: { label: 'Email address', placeholder: 'name@example.com' },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('text-input.semantics.name', async () => {
      const input = canvas.getByRole('textbox', { name: 'Email address' });
      await expect(input).toBeInTheDocument();
      await userEvent.type(input, 'hello@example.com');
      await expect(input).toHaveValue('hello@example.com');
    });
  },
};

export const WithHelperText: Story = {
  args: { helperText: 'We will only use this for account updates.' },
  play: async ({ canvasElement, step }) => {
    await step('text-input.description.message', async () => {
      const input = within(canvasElement).getByRole('textbox');
      await expect(input).toHaveAccessibleDescription('We will only use this for account updates.');
    });
  },
};

export const Error: Story = {
  args: { defaultValue: 'not-an-email', error: true, errorMessage: 'Enter a valid email address.' },
  play: async ({ canvasElement, step }) => {
    await step('text-input.state.invalid', async () => {
      const canvas = within(canvasElement);
      await expect(canvas.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
      await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
    });
  },
};

export const Borderless: Story = { args: { defaultValue: 'Embedded value', variant: 'borderless' } };

export const InteractionStates: Story = {
  render: () => <div className="grid w-[720px] grid-cols-2 gap-l">
    <TextInput label="Empty" placeholder="Placeholder" />
    <TextInput label="Filled" defaultValue="Filled value" />
    <TextInput label="Error" defaultValue="Invalid" error errorMessage="Correct this value." />
    <TextInput label="Disabled" defaultValue="Unavailable" disabled />
    <TextInput label="Read only" defaultValue="Read-only value" readOnly />
    <TextInput label="Focus visible" classNames={{ control: 'outline-2 outline-solid outline-offset-2 outline-border-focus' }} />
  </div>,
};
