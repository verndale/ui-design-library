import type { ReactNode } from 'react';

export type QuoteProps = {
  children: ReactNode;
  className?: string;
};

/** A pull quote: accent rule plus display-scale typography. */
export function Quote({ children, className }: QuoteProps) {
  return (
    <blockquote
      data-component="quote"
      className={['my-0 border-l-4 border-solid border-border-accent ps-m pe-s py-2xs', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </blockquote>
  );
}
