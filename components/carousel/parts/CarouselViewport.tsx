import type { EmblaViewportRefType } from 'embla-carousel-react';
import type { ReactNode, RefObject } from 'react';

import type { CarouselClassNames, CarouselLayout } from '../Carousel.types.js';

type CarouselViewportProps = {
  slides: ReactNode[];
  layout: CarouselLayout;
  slideClassName?: string;
  trackRef: RefObject<HTMLDivElement | null>;
  viewportRef: EmblaViewportRefType;
  classNames?: CarouselClassNames;
};

/** The semantic slide track. Interaction and visibility measurement live above it. */
export function CarouselViewport({ slides, layout, slideClassName, trackRef, viewportRef, classNames }: CarouselViewportProps) {
  const isMultiCardPeek = layout === 'multi-card-peek';

  return (
    <div ref={viewportRef} className={['overflow-hidden', classNames?.viewport].filter(Boolean).join(' ')}>
      <div
        ref={trackRef}
        className={['flex', isMultiCardPeek && 'gap-(--spacing-carousel-gap)', classNames?.track].filter(Boolean).join(' ')}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            className={[
              'min-w-0 shrink-0 grow-0',
              isMultiCardPeek ? 'basis-(--spacing-carousel-slide-peek)' : 'basis-full',
              classNames?.slide,
              slideClassName,
            ].filter(Boolean).join(' ')}
          >
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}
