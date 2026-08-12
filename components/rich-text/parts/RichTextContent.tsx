import type { ReactNode } from 'react';

export function RichTextContent({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div data-component="rich-text" className={className}>
      {children}
    </div>
  );
}
