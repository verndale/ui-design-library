import type { ReactNode } from 'react';

export type StatProps = {
  value: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
};

export type StatGroupProps = {
  heading: string;
  orientation?: 'row' | 'column';
  children: ReactNode;
  className?: string;
};
