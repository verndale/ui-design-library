import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { GaugeChart } from './index';

const meta = {
  title: 'Gauge chart',
  component: GaugeChart,
  tags: ['maturity:candidate', 'motion'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1,
      auditComponentKey: 'gauge-chart',
      auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-09-17/components/gauge-chart',
      privateAuditDigest: 'b6f996f0bd58b1f196cdeec6a6f59b1b980799effc238a207794bdaccd959f7a',
      decisionIds: [
        'sp-gauge-chart-001',
        'sp-gauge-chart-002',
        'sp-gauge-chart-003',
        'sp-gauge-chart-004',
        'sp-gauge-chart-005',
      ],
      representationDecisions: [
        { decisionId: 'sp-gauge-chart-001', implementationKey: 'gauge-chart', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] },
        { decisionId: 'sp-gauge-chart-002', implementationKey: 'gauge-chart', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] },
        { decisionId: 'sp-gauge-chart-003', implementationKey: 'gauge-chart', surfaces: ['ai-registry', 'code', 'storybook'] },
        { decisionId: 'sp-gauge-chart-004', implementationKey: 'gauge-chart', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] },
      ],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: [
      'gauge.value.bounds',
      'gauge.semantics.text-equivalent',
      'gauge.motion.preference',
    ],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A server-rendered semicircular value chart with explicit bounds, visible text equivalence, semantic data colors, and reduced-motion-safe drawing.',
      },
    },
  },
  argTypes: {
    'value': { control: 'number', description: 'Required. Exact current value; the visual arc clamps to min and max.' },
    'label': { control: 'text', description: 'Required. Human-readable name for the measured value.' },
    'min': { control: 'number', description: 'Optional. Lower scale bound. Defaults to 0.' },
    'max': { control: 'number', description: 'Optional. Upper scale bound. Defaults to 100.' },
    'displayValue': { control: 'text', description: 'Optional. Visible formatted value; the numeric value still drives the arc.' },
    'unit': { control: 'text', description: 'Optional. Unit shown with the value and scale.' },
    'fill': { control: 'radio', options: ['solid', 'gradient'], description: 'Optional. Solid or adjacent-token gradient arc. Defaults to solid.' },
    'color': { control: 'select', options: ['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6'], description: 'Optional. Ordered semantic chart color. Defaults to data-1.' },
    'animate': { control: 'boolean', description: 'Optional. Draws the value arc with semantic motion tokens. Defaults to true.' },
    'className': { control: 'text', description: 'Optional. Additional root class name.' },
    'classNames': { control: 'object', description: 'Optional. Audited root, chart, value, and label class slots.' },
  },
  args: {
    value: 72,
    label: 'Completion',
    displayValue: '72%',
  },
} satisfies Meta<typeof GaugeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('gauge.value.bounds', async () => {
      const arc = canvasElement.querySelector('[data-gauge-value-arc]');
      await expect(arc).toHaveAttribute('stroke-dasharray', '72 28');
      await expect(canvas.getByText('Scale: 0 to 100.')).toBeInTheDocument();
    });

    await step('gauge.semantics.text-equivalent', async () => {
      await expect(canvas.getByRole('img', { name: 'Completion: 72%. Scale 0 to 100.' })).toBeVisible();
      await expect(canvas.getByText('72%')).toBeVisible();
      await expect(canvas.getByText('Completion')).toBeVisible();
    });

    await step('gauge.motion.preference', async () => {
      const arc = canvasElement.querySelector('[data-gauge-value-arc]');
      const duration = arc ? getComputedStyle(arc).animationDuration : '';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await expect(duration === '0s' || getComputedStyle(arc as Element).animationName === 'none').toBe(true);
      } else {
        await expect(duration).not.toBe('0s');
      }
    });
  },
};

export const Gradient: Story = {
  args: {
    value: 84,
    label: 'Readiness',
    displayValue: '84%',
    fill: 'gradient',
    color: 'data-4',
  },
};

export const CustomScale: Story = {
  args: {
    value: 68,
    min: 32,
    max: 104,
    displayValue: '68',
    unit: 'ms',
    label: 'Response time',
    color: 'data-2',
  },
};

export const BoundaryValues: Story = {
  render: () => (
    <div className="grid w-full max-w-5xl gap-l md:grid-cols-3">
      <GaugeChart animate={false} displayValue="−12%" label="Below minimum" value={-12} />
      <GaugeChart animate={false} color="data-3" displayValue="50%" label="Midpoint" value={50} />
      <GaugeChart animate={false} color="data-5" displayValue="126%" label="Above maximum" value={126} />
    </div>
  ),
};

export const InteractionStates: Story = {
  render: () => (
    <div className="grid w-full max-w-5xl gap-l md:grid-cols-3">
      <div data-state="gauge.value.empty"><GaugeChart animate={false} displayValue="0%" label="Minimum" value={0} /></div>
      <div data-state="gauge.value.partial"><GaugeChart animate={false} color="data-3" displayValue="50%" label="Partial" value={50} /></div>
      <div data-state="gauge.value.complete"><GaugeChart animate={false} color="data-2" displayValue="100%" label="Maximum" value={100} /></div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const arcs = [...canvasElement.querySelectorAll('[data-gauge-value-arc]')];
    await expect(arcs.map((arc) => arc.getAttribute('stroke-dasharray'))).toEqual(['0 100', '50 50', '100 0']);
  },
};
