import type { EmblaViewportRefType } from 'embla-carousel-react';
import type { ReactNode, RefObject } from 'react';

type CarouselViewportProps = {
  slides: ReactNode[];
  slideClassName?: string;
  trackRef: RefObject<HTMLDivElement | null>;
  viewportRef: EmblaViewportRefType;
};

/** The semantic slide track. Interaction and visibility measurement live above it. */
export function CarouselViewport({ slides, slideClassName, trackRef, viewportRef }: CarouselViewportProps) {
  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div ref={trackRef} className="flex">
        {slides.map((slide, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            className={['min-w-0 shrink-0 grow-0 basis-full', slideClassName].filter(Boolean).join(' ')}
          >
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}
