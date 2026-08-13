import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type SectionHeaderClassNames = SlotClassNames<'root' | 'eyebrow' | 'heading' | 'description'>;
export type SectionHeaderHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type SectionHeaderAlignment = 'left' | 'center';

export type SectionHeaderProps = {
  eyebrow?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  alignment?: SectionHeaderAlignment;
  className?: string;
  classNames?: SectionHeaderClassNames;
  headingLevel?: SectionHeaderHeadingLevel;
  as?: 'div' | 'header';
};
