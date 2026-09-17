export type GaugeChartFill = 'solid' | 'gradient';

export type GaugeChartColor =
  | 'data-1'
  | 'data-2'
  | 'data-3'
  | 'data-4'
  | 'data-5'
  | 'data-6';

export interface GaugeChartClassNames {
  root?: string;
  chart?: string;
  value?: string;
  label?: string;
}

export interface GaugeChartProps {
  value: number;
  label: string;
  min?: number;
  max?: number;
  displayValue?: string;
  unit?: string;
  fill?: GaugeChartFill;
  color?: GaugeChartColor;
  animate?: boolean;
  className?: string;
  classNames?: GaugeChartClassNames;
}
