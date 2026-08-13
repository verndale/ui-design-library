import type { ReactNode } from 'react';

export type SectionHeaderAlignment = 'left' | 'center';

export type SectionHeaderProps = {
  eyebrow?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  alignment?: SectionHeaderAlignment;
  className?: string;
};
