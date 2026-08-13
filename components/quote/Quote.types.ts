import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type QuoteClassNames = SlotClassNames<'root'>;

export type QuoteProps = {
  children: ReactNode;
  className?: string;
  classNames?: QuoteClassNames;
  cite?: string;
};
