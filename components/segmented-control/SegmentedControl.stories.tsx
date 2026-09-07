import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { SegmentedControl } from './index';

const options = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }];
const meta = {
  title: 'Segmented control',
  component: SegmentedControl,
  tags: ['maturity:candidate'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1, auditComponentKey: 'segmented-control', auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-09-07/components/segmented-control',
      privateAuditDigest: '0bcfc14a5f169dc405090c004ef169d1488f255393ee8a95ca71fc410db4a92c',
      decisionIds: ['sp-segmented-control-001'],
      representationDecisions: [{ decisionId: 'sp-segmented-control-001', implementationKey: 'segmented-control', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] }],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: ['segmented-control.semantics.radio', 'segmented-control.keyboard.selection', 'segmented-control.state.invalid'],
    layout: 'centered',
  },
  argTypes: {
    'legend': { control: false },
    'options': { control: 'object' },
    'value': { control: 'text' },
    'defaultValue': { control: 'text' },
    'onChange': { control: false },
    'name': { control: 'text' },
    'disabled': { control: 'boolean' },
    'hideLegend': { control: 'boolean' },
    'helperText': { control: false },
    'error': { control: 'boolean' },
    'errorMessage': { control: false },
    'className': { control: 'text' },
    'classNames': { control: 'object' },
  },
  args: { legend: 'Forecast range', options, defaultValue: 'day' },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('segmented-control.semantics.radio', async () => {
      await expect(canvas.getByRole('group', { name: 'Forecast range' })).toBeInTheDocument();
      await expect(canvas.getByRole('radio', { name: 'Day' })).toBeChecked();
    });
    await step('segmented-control.keyboard.selection', async () => {
      const day = canvas.getByRole('radio', { name: 'Day' });
      day.focus();
      await userEvent.keyboard('{ArrowRight}');
      await expect(canvas.getByRole('radio', { name: 'Week' })).toBeChecked();
    });
  },
};

export const NoSelection: Story = { args: { defaultValue: undefined } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
  args: { defaultValue: undefined, error: true, errorMessage: 'Choose a forecast range.' },
  play: async ({ canvasElement, step }) => {
    await step('segmented-control.state.invalid', async () => {
      const canvas = within(canvasElement);
      await expect(canvas.getByRole('alert')).toHaveTextContent('Choose a forecast range.');
      await expect(canvas.getByRole('group')).toHaveAccessibleDescription('Choose a forecast range.');
    });
  },
};
export const InteractionStates: Story = {
  render: () => <div className="grid grid-cols-2 gap-l">
    <SegmentedControl legend="First selected" options={options} defaultValue="day" />
    <SegmentedControl legend="Second selected" options={options} defaultValue="week" />
    <SegmentedControl legend="No selection" options={options} />
    <SegmentedControl legend="Disabled" options={options} defaultValue="day" disabled />
    <SegmentedControl legend="Error" options={options} error errorMessage="Choose one." />
    <SegmentedControl legend="Focus visible" options={options} defaultValue="day" classNames={{ segment: 'outline-2 outline-solid outline-offset-1 outline-border-focus' }} />
  </div>,
};
