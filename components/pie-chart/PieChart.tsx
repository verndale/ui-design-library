import type { PieChartProps, PieChartSegment } from './PieChart.types.js';
import { PieLegend } from './parts/PieLegend.js';
import { PieSlice } from './parts/PieSlice.js';

interface NormalizedSegment extends PieChartSegment {
  percentage: number;
  start: number;
}

function normalizeSegments(segments: readonly PieChartSegment[]): NormalizedSegment[] {
  const safe = segments.map((segment) => ({ ...segment, value: Number.isFinite(segment.value) ? Math.max(0, segment.value) : 0 }));
  const total = safe.reduce((sum, segment) => sum + segment.value, 0);
  let start = 0;

  return safe.map((segment) => {
    const percentage = total > 0 ? (segment.value / total) * 100 : 0;
    const normalized = { ...segment, percentage, start };
    start += percentage;
    return normalized;
  });
}

export function PieChart({
  segments,
  label,
  centerLabel,
  labelMode = 'legend',
  animate = true,
  className,
  classNames,
}: PieChartProps) {
  const normalized = normalizeSegments(segments);

  return (
    <figure
      className={['group m-0 grid w-full max-w-xl gap-s', classNames?.root, className].filter(Boolean).join(' ')}
      data-component="pie-chart"
      data-label-mode={labelMode}
      tabIndex={labelMode === 'hover' ? 0 : undefined}
    >
      <svg
        aria-label={label}
        className={['mx-auto block aspect-square w-full max-w-sm overflow-visible', classNames?.chart].filter(Boolean).join(' ')}
        role="img"
        viewBox="0 0 100 100"
      >
        <title>{label}</title>
        <circle className="fill-none stroke-chart-track" cx={50} cy={50} r={40} strokeWidth={20} />
        {normalized.map((segment, index) => (
          <PieSlice
            animate={animate}
            colorIndex={index}
            key={segment.id ?? `${segment.label}-${index}`}
            label={segment.label}
            labelMode={labelMode}
            offset={segment.start}
            percentage={segment.percentage}
          />
        ))}
        {centerLabel ? (
          <text className="fill-text-primary text-[7px] font-semibold" dominantBaseline="middle" textAnchor="middle" x={50} y={50}>
            {centerLabel}
          </text>
        ) : null}
      </svg>
      <PieLegend className={classNames?.legend} segments={normalized} visuallyHidden={labelMode !== 'legend'} />
    </figure>
  );
}
