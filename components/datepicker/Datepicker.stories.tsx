import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Datepicker, type DatepickerProps, type DatepickerRange } from './index';

const meta = {
  title: 'Datepicker',
  component: Datepicker,
  tags: ['maturity:candidate'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1, auditComponentKey: 'datepicker', auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-09-07/components/datepicker',
      privateAuditDigest: '05b97a2b8b7f5691e1482686e6b734144b318df45452ea6b1a6f53e48a33c0b4',
      decisionIds: ['sp-datepicker-001'],
      representationDecisions: [{ decisionId: 'sp-datepicker-001', implementationKey: 'datepicker', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] }],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: ['datepicker.semantics.dialog', 'datepicker.keyboard.open-close', 'datepicker.range.selection'],
    layout: 'centered',
  },
  argTypes: {
    'mode': { control: 'inline-radio', options: ['single', 'range'] },
    'variant': { control: 'inline-radio', options: ['default', 'compact'] },
    'value': { control: false },
    'onChange': { control: false },
    'label': { control: false },
    'helperText': { control: false },
    'error': { control: 'boolean' },
    'errorMessage': { control: false },
    'min': { control: false },
    'max': { control: false },
    'disabled': { control: 'boolean' },
    'readOnly': { control: 'boolean' },
    'required': { control: 'boolean' },
    'placeholder': { control: 'text' },
    'onOpenChange': { control: false },
    'name': { control: 'text' },
    'startLabel': { control: false },
    'endLabel': { control: false },
    'startName': { control: 'text' },
    'endName': { control: 'text' },
    'className': { control: 'text' },
    'classNames': { control: 'object' },
  },
  args: { mode: 'single', value: null, onChange: () => undefined, label: 'Arrival date' },
} satisfies Meta<typeof Datepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: DatepickerProps) {
  const [single, setSingle] = useState<Date | null>(props.mode === 'range' ? null : props.value);
  const [range, setRange] = useState<DatepickerRange>(props.mode === 'range' ? props.value : { start: null, end: null });
  return props.mode === 'range'
    ? <Datepicker {...props} value={range} onChange={setRange} />
    : <Datepicker {...props} value={single} onChange={setSingle} />;
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Choose date' });
    await step('datepicker.keyboard.open-close', async () => {
      trigger.focus();
      await userEvent.keyboard('{Enter}');
    });
    await step('datepicker.semantics.dialog', async () => {
      await expect(canvas.getByRole('dialog', { name: 'Choose date' })).toBeInTheDocument();
      await expect(canvas.getByRole('grid')).toHaveAccessibleName(/\w+ \d{4}/);
      await expect(canvas.getAllByRole('row')).toHaveLength(7);
      await expect(canvas.getAllByRole('columnheader')).toHaveLength(7);
      await expect(canvas.getByText(/\w+ \d{4}/)).toHaveAttribute('aria-atomic', 'true');
    });
    await step('datepicker.keyboard.open-close', async () => {
      await userEvent.keyboard('{Escape}');
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
      await expect(trigger).toHaveFocus();
    });
  },
};

export const Selected: Story = { args: { value: new Date(2026, 0, 15) } };
export const Range: Story = { args: { mode: 'range', value: { start: new Date(2026, 0, 12), end: new Date(2026, 0, 16) }, onChange: () => undefined } };
export const CompactRange: Story = { args: { ...Range.args, variant: 'compact' } };

export const RangeSelection: Story = {
  args: { mode: 'range', value: { start: null, end: null }, onChange: () => undefined },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button', { name: 'Choose date' })[0]!);
    const days = canvas.getAllByRole('gridcell').filter((day) => !(day as HTMLButtonElement).disabled);
    await step('datepicker.range.selection', async () => {
      await userEvent.click(days[10]!);
      await userEvent.click(days[13]!);
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const InteractionStates: Story = {
  render: () => <div className="grid w-[760px] grid-cols-2 items-start gap-l">
    <Datepicker label="Empty" value={null} onChange={() => undefined} />
    <Datepicker label="Filled" value={new Date(2026, 0, 15)} onChange={() => undefined} />
    <Datepicker label="Error" value={null} onChange={() => undefined} error errorMessage="Choose a date." />
    <Datepicker label="Disabled" value={null} onChange={() => undefined} disabled />
    <Datepicker mode="range" value={{ start: new Date(2026, 0, 12), end: new Date(2026, 0, 16) }} onChange={() => undefined} />
    <Datepicker mode="range" variant="compact" value={{ start: new Date(2026, 0, 12), end: null }} onChange={() => undefined} />
    <div className="col-span-2"><Datepicker label="Open calendar" value={new Date(2026, 0, 15)} onChange={() => undefined} /></div>
  </div>,
  play: async ({ canvasElement }) => {
    const triggers = within(canvasElement).getAllByRole('button', { name: 'Choose date' });
    await userEvent.click(triggers.at(-1)!);
  },
};
