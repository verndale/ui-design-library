import type { ReactNode } from 'react';

export type CarouselProps = {
  /** One node per slide. */
  slides: ReactNode[];
  /** Accessible name for the carousel region. */
  label: string;
  /** Labels for the previous/next controls. */
  previousLabel?: string;
  nextLabel?: string;
  loop?: boolean;
  className?: string;
  slideClassName?: string;
  /** Decorative content for the previous control. */
  previousIcon?: ReactNode;
  /** Decorative content for the next control. */
  nextIcon?: ReactNode;
};
