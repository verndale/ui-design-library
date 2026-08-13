import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type RichTextClassNames = SlotClassNames<'root'>;

export type RichTextListStyle = 'default' | 'checkmark';

export type RichTextProps = {
  children: ReactNode;
  listStyle?: RichTextListStyle;
  className?: string;
  classNames?: RichTextClassNames;
  as?: 'div' | 'article';
};
