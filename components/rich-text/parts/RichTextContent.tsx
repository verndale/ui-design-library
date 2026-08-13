import type { ReactNode } from 'react';

export function RichTextContent({ children, className, as: Element = 'div' }: { children: ReactNode; className: string; as?: 'div' | 'article' }) {
  return (
    <Element data-component="rich-text" className={className}>
      {children}
    </Element>
  );
}
