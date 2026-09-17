export type PieChartLabelMode = 'legend' | 'segments' | 'hover' | 'none';

export interface PieChartSegment {
  id?: string;
  label: string;
  value: number;
}

export interface PieChartClassNames {
  root?: string;
  chart?: string;
  legend?: string;
}

export interface PieChartProps {
  segments: readonly PieChartSegment[];
  label: string;
  centerLabel?: string;
  labelMode?: PieChartLabelMode;
  animate?: boolean;
  className?: string;
  classNames?: PieChartClassNames;
}
