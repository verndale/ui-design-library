import type { QuoteProps } from '../Quote.types.js';

export function QuoteFrame({ children, className }: QuoteProps) {
  return (
    <blockquote
      data-component="quote"
      className={['my-0 border-s-4 border-solid border-border-accent ps-m pe-s py-2xs', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </blockquote>
  );
}
