import type { GaugeChartColor, GaugeChartFill } from '../GaugeChart.types.js';

const STROKE_CLASSES: Record<GaugeChartColor, string> = {
  'data-1': 'stroke-chart-data-1',
  'data-2': 'stroke-chart-data-2',
  'data-3': 'stroke-chart-data-3',
  'data-4': 'stroke-chart-data-4',
  'data-5': 'stroke-chart-data-5',
  'data-6': 'stroke-chart-data-6',
};

const STOP_CLASSES: Record<GaugeChartColor, string> = {
  'data-1': 'stop-chart-data-1',
  'data-2': 'stop-chart-data-2',
  'data-3': 'stop-chart-data-3',
  'data-4': 'stop-chart-data-4',
  'data-5': 'stop-chart-data-5',
  'data-6': 'stop-chart-data-6',
};

const NEXT_COLOR: Record<GaugeChartColor, GaugeChartColor> = {
  'data-1': 'data-2',
  'data-2': 'data-3',
  'data-3': 'data-4',
  'data-4': 'data-5',
  'data-5': 'data-6',
  'data-6': 'data-1',
};

interface GaugeArcProps {
  animate: boolean;
  className?: string;
  color: GaugeChartColor;
  fill: GaugeChartFill;
  percentage: number;
  title: string;
}

const ARC_PATH = 'M 20 100 A 80 80 0 0 1 180 100';

export function GaugeArc({ animate, className, color, fill, percentage, title }: GaugeArcProps) {
  const gradientId = `gauge-chart-${color}-gradient`;

  return (
    <svg
      aria-label={title}
      className={['block aspect-2/1 w-full overflow-visible', className].filter(Boolean).join(' ')}
      data-gauge-chart
      role="img"
      viewBox="0 0 200 110"
    >
      <title>{title}</title>
      {fill === 'gradient' ? (
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop className={STOP_CLASSES[color]} offset="0%" />
            <stop className={STOP_CLASSES[NEXT_COLOR[color]]} offset="100%" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        className="fill-none stroke-chart-track"
        d={ARC_PATH}
        pathLength={100}
        strokeLinecap="round"
        strokeWidth={20}
      />
      <path
        className={[
          'fill-none motion-reduce:animate-none',
          fill === 'solid' ? STROKE_CLASSES[color] : undefined,
          animate ? 'animate-chart-draw' : undefined,
        ].filter(Boolean).join(' ')}
        d={ARC_PATH}
        data-gauge-value-arc
        pathLength={100}
        stroke={fill === 'gradient' ? `url(#${gradientId})` : undefined}
        strokeDasharray={`${percentage} ${100 - percentage}`}
        strokeLinecap="round"
        strokeWidth={20}
      />
    </svg>
  );
}
