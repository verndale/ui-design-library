import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Toggle } from './index';

const meta = {
  title: 'Toggle',
  component: Toggle,
  tags: ['maturity:candidate'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1, auditComponentKey: 'toggle', auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-09-07/components/toggle',
      privateAuditDigest: 'f25ccac72e47177222b35c398a5bd0e24eecbd94dad7c3c72121ed8ef87c184c',
      decisionIds: ['sp-toggle-001'],
      representationDecisions: [{ decisionId: 'sp-toggle-001', implementationKey: 'toggle', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] }],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: ['toggle.semantics.switch', 'toggle.keyboard.activation', 'toggle.description.helper'], layout: 'centered',
  },
  argTypes: {
    'label': { control: false },
    'helperText': { control: false },
    'checked': { control: 'boolean' },
    'defaultChecked': { control: 'boolean' },
    'onChange': { control: false },
    'disabled': { control: 'boolean' },
    'required': { control: 'boolean' },
    'name': { control: 'text' },
    'value': { control: 'text' },
    'id': { control: 'text' },
    'aria-label': { control: 'text' },
    'aria-describedby': { control: 'text' },
    'className': { control: 'text' },
    'classNames': { control: 'object' },
  },
  args: { label: 'Product updates' },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Product updates' });
    await step('toggle.semantics.switch', async () => {
      await expect(toggle).not.toBeChecked();
    });
    await step('toggle.keyboard.activation', async () => {
      toggle.focus();
      await userEvent.keyboard(' ');
      await expect(toggle).toBeChecked();
    });
  },
};

export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };
export const WithHelperText: Story = {
  args: { helperText: 'Receive an email when product updates are available.' },
  play: async ({ canvasElement, step }) => {
    await step('toggle.description.helper', async () => {
      await expect(within(canvasElement).getByRole('switch')).toHaveAccessibleDescription('Receive an email when product updates are available.');
    });
  },
};
export const InteractionStates: Story = {
  render: () => <div className="grid gap-l">
    <Toggle label="Off" />
    <Toggle label="On" defaultChecked />
    <Toggle label="Disabled off" disabled />
    <Toggle label="Disabled on" disabled defaultChecked />
    <Toggle label="Focus visible" classNames={{ track: 'outline-2 outline-solid outline-offset-2 outline-border-focus' }} />
  </div>,
};
