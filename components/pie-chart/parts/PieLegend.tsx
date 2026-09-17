import type { PieChartSegment } from '../PieChart.types.js';

const SWATCH_CLASSES = [
  'bg-chart-data-1',
  'bg-chart-data-2',
  'bg-chart-data-3',
  'bg-chart-data-4',
  'bg-chart-data-5',
  'bg-chart-data-6',
] as const;

interface PieLegendProps {
  className?: string;
  segments: readonly PieChartSegment[];
  visuallyHidden: boolean;
}

export function PieLegend({ className, segments, visuallyHidden }: PieLegendProps) {
  return (
    <figcaption className={[visuallyHidden ? 'sr-only' : undefined, className].filter(Boolean).join(' ')}>
      <ul className="m-0 grid list-none gap-xs p-0 sm:grid-cols-2">
        {segments.map((segment, index) => (
          <li className="flex items-center gap-2xs text-sm text-text-primary" key={segment.id ?? `${segment.label}-${index}`}>
            <span aria-hidden className={['size-3 shrink-0 rounded-(--radius-small)', SWATCH_CLASSES[index % SWATCH_CLASSES.length]].join(' ')} />
            <span className="min-w-0 flex-1">{segment.label}</span>
            <span className="font-semibold tabular-nums">{segment.value}</span>
          </li>
        ))}
      </ul>
    </figcaption>
  );
}
