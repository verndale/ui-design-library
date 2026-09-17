import type { PieChartLabelMode } from '../PieChart.types.js';

const STROKE_CLASSES = [
  'stroke-chart-data-1',
  'stroke-chart-data-2',
  'stroke-chart-data-3',
  'stroke-chart-data-4',
  'stroke-chart-data-5',
  'stroke-chart-data-6',
] as const;

interface PieSliceProps {
  animate: boolean;
  colorIndex: number;
  label: string;
  labelMode: PieChartLabelMode;
  offset: number;
  percentage: number;
}

export function PieSlice({ animate, colorIndex, label, labelMode, offset, percentage }: PieSliceProps) {
  const angle = ((offset + percentage / 2) / 100) * Math.PI * 2 - Math.PI / 2;
  const labelX = 50 + Math.cos(angle) * 34;
  const labelY = 50 + Math.sin(angle) * 34;
  const showLabel = labelMode === 'segments' || labelMode === 'hover';
  const hoverClasses = labelMode === 'hover'
    ? 'opacity-100 transition-opacity duration-(--duration-fast) ease-standard motion-reduce:transition-none [@media(min-width:80rem)_and_(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
    : undefined;

  return (
    <g data-pie-segment={label}>
      <circle
        className={[
          'fill-none motion-reduce:animate-none',
          STROKE_CLASSES[colorIndex % STROKE_CLASSES.length],
          animate ? 'animate-chart-draw' : undefined,
        ].filter(Boolean).join(' ')}
        cx={50}
        cy={50}
        pathLength={100}
        r={40}
        strokeDasharray={`${percentage} ${100 - percentage}`}
        strokeDashoffset={-offset}
        strokeWidth={20}
        transform="rotate(-90 50 50)"
      />
      {showLabel && percentage >= 7 ? (
        <text
          className={['fill-text-inverse text-[6px] font-bold', hoverClasses].filter(Boolean).join(' ')}
          data-segment-label
          dominantBaseline="middle"
          textAnchor="middle"
          x={labelX}
          y={labelY}
        >
          {Math.round(percentage)}%
        </text>
      ) : null}
    </g>
  );
}
