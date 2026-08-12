import type { ReactNode } from 'react';

export type RichTextListStyle = 'default' | 'checkmark';

export type RichTextProps = {
  children: ReactNode;
  listStyle?: RichTextListStyle;
  className?: string;
};
