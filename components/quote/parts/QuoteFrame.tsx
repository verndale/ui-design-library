import type { QuoteProps } from '../Quote.types.js';

export function QuoteFrame({ children, className, classNames, cite }: QuoteProps) {
  return (
    <blockquote
      data-component="quote"
      cite={cite}
      className={['my-0 border-s-4 border-solid border-border-accent ps-m pe-s py-2xs', classNames?.root, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </blockquote>
  );
}
