import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { PieChart } from './index';

const segments = [
  { id: 'equities', label: 'Equities', value: 45 },
  { id: 'fixed-income', label: 'Fixed income', value: 30 },
  { id: 'cash', label: 'Cash', value: 15 },
  { id: 'alternatives', label: 'Alternatives', value: 10 },
];

const meta = {
  title: 'Pie chart',
  component: PieChart,
  tags: ['maturity:candidate', 'motion'],
  parameters: {
    sourceParityEvidence: {
      contractVersion: 1,
      auditComponentKey: 'pie-chart',
      auditStatus: 'cleared',
      privateAuditRef: 'library-source-parity:2026-09-17/components/pie-chart',
      privateAuditDigest: '87abd33f94ec883c659f6e579eaa06988d8063b3502a0c48bc43d8ab39dbd6b1',
      decisionIds: [
        'sp-pie-chart-001',
        'sp-pie-chart-002',
        'sp-pie-chart-003',
        'sp-pie-chart-004',
        'sp-pie-chart-005',
        'sp-pie-chart-006',
      ],
      representationDecisions: [
        { decisionId: 'sp-pie-chart-001', implementationKey: 'pie-chart', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] },
        { decisionId: 'sp-pie-chart-002', implementationKey: 'pie-chart', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] },
        { decisionId: 'sp-pie-chart-003', implementationKey: 'pie-chart', surfaces: ['ai-registry', 'code', 'figma', 'storybook'] },
        { decisionId: 'sp-pie-chart-004', implementationKey: 'pie-chart', surfaces: ['ai-registry', 'code', 'storybook'] },
        { decisionId: 'sp-pie-chart-005', implementationKey: 'pie-chart', surfaces: ['figma', 'storybook'] },
      ],
      requiredRepresentationSurfaces: ['ai-registry', 'code', 'figma', 'storybook'],
    },
    realizationEvidence: [
      'pie.data.proportions',
      'pie.semantics.text-equivalent',
      'pie.motion.preference',
    ],
    layout: 'centered',
    docs: {
      description: {
        component:
          'A server-rendered part-to-whole chart with ordered semantic colors, explicit label modes, a synchronized text legend, and reduced-motion-safe drawing.',
      },
    },
  },
  argTypes: {
    'segments': { control: 'object', description: 'Required. Ordered labels and non-negative values belonging to one meaningful whole.' },
    'label': { control: 'text', description: 'Required. Accessible name describing the chart and its whole.' },
    'centerLabel': { control: 'text', description: 'Optional. Short summary shown in the donut center.' },
    'labelMode': { control: 'radio', options: ['legend', 'segments', 'hover', 'none'], description: 'Optional. Visible legend, segment percentages, responsive hover/focus labels, or visual labels hidden. Defaults to legend.' },
    'animate': { control: 'boolean', description: 'Optional. Draws slices with semantic motion tokens. Defaults to true.' },
    'className': { control: 'text', description: 'Optional. Additional root class name.' },
    'classNames': { control: 'object', description: 'Optional. Audited root, chart, and legend class slots.' },
  },
  args: {
    segments,
    label: 'Portfolio allocation',
    centerLabel: '100%',
  },
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('pie.data.proportions', async () => {
      await expect(canvasElement.querySelectorAll('[data-pie-segment]')).toHaveLength(4);
      await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
      await expect(canvas.getByText('45')).toBeVisible();
    });

    await step('pie.semantics.text-equivalent', async () => {
      await expect(canvas.getByRole('img', { name: 'Portfolio allocation' })).toBeVisible();
      await expect(canvas.getByText('Equities')).toBeVisible();
      await expect(canvas.getByText('100%')).toBeVisible();
    });

    await step('pie.motion.preference', async () => {
      const slice = canvasElement.querySelector('[data-pie-segment] circle');
      const duration = slice ? getComputedStyle(slice).animationDuration : '';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await expect(duration === '0s' || getComputedStyle(slice as Element).animationName === 'none').toBe(true);
      } else {
        await expect(duration).not.toBe('0s');
      }
    });
  },
};

export const SegmentLabels: Story = {
  args: {
    labelMode: 'segments',
  },
};

export const HoverLabels: Story = {
  args: {
    labelMode: 'hover',
  },
};

export const NoCenterLabel: Story = {
  args: {
    centerLabel: undefined,
  },
};

export const InteractionStates: Story = {
  render: () => (
    <div className="grid w-full max-w-6xl gap-l lg:grid-cols-3">
      <div data-state="pie.labels.visible"><PieChart animate={false} label="Labels visible" labelMode="segments" segments={segments} /></div>
      <div data-state="pie.labels.hidden"><PieChart animate={false} label="Labels hidden" labelMode="none" segments={segments} /></div>
      <div data-state="pie.labels.reveal"><PieChart animate={false} label="Labels on hover or focus" labelMode="hover" segments={segments} /></div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-state="pie.labels.visible"] [data-segment-label]')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-state="pie.labels.hidden"] [data-segment-label]')).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-state="pie.labels.reveal"] [data-segment-label]')).toBeInTheDocument();
  },
};
