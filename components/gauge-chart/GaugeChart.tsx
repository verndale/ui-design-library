import type { GaugeChartProps } from './GaugeChart.types.js';
import { GaugeArc } from './parts/GaugeArc.js';
import { GaugeCaption } from './parts/GaugeCaption.js';

function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

export function GaugeChart({
  value,
  label,
  min = 0,
  max = 100,
  displayValue,
  unit,
  fill = 'solid',
  color = 'data-1',
  animate = true,
  className,
  classNames,
}: GaugeChartProps) {
  const safeMin = finite(min, 0);
  const requestedMax = finite(max, safeMin + 100);
  const safeMax = requestedMax > safeMin ? requestedMax : safeMin + 1;
  const exactValue = finite(value, safeMin);
  const clampedValue = Math.min(safeMax, Math.max(safeMin, exactValue));
  const percentage = ((clampedValue - safeMin) / (safeMax - safeMin)) * 100;
  const visibleValue = displayValue ?? String(exactValue);
  const accessibleTitle = `${label}: ${visibleValue}${unit ? ` ${unit}` : ''}. Scale ${safeMin} to ${safeMax}${unit ? ` ${unit}` : ''}.`;

  return (
    <figure
      className={['relative m-0 w-full max-w-md pb-l', classNames?.root, className].filter(Boolean).join(' ')}
      data-component="gauge-chart"
      data-fill={fill}
    >
      <GaugeArc
        animate={animate}
        className={classNames?.chart}
        color={color}
        fill={fill}
        percentage={percentage}
        title={accessibleTitle}
      />
      <GaugeCaption
        classNames={{ label: classNames?.label, value: classNames?.value }}
        displayValue={visibleValue}
        label={label}
        max={safeMax}
        min={safeMin}
        unit={unit}
      />
    </figure>
  );
}
