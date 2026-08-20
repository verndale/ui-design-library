import { useCarouselController } from './hooks/useCarouselController.client.js';
import { CarouselControls } from './parts/CarouselControls.client.js';
import { CarouselStatus } from './parts/CarouselStatus.js';
import { CarouselViewport } from './parts/CarouselViewport.js';
import type { CarouselProps } from './Carousel.types.js';

/** A labelled carousel whose off-screen slides are removed from the tab order. */
export function Carousel({
  slides,
  label,
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  loop = false,
  layout = 'single',
  className,
  slideClassName,
  previousIcon,
  nextIcon,
  classNames,
  statusSeparator = '/',
}: CarouselProps) {
  const controller = useCarouselController({ loop, slideCount: slides.length });
  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      data-component="carousel"
      data-layout={layout}
      className={[classNames?.root, className].filter(Boolean).join(' ')}
    >
      <CarouselViewport
        slides={slides}
        layout={layout}
        slideClassName={slideClassName}
        trackRef={controller.trackRef}
        viewportRef={controller.viewportRef}
        classNames={classNames}
      />
      <CarouselControls
        canPrevious={controller.canPrevious}
        canNext={controller.canNext}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        previousIcon={previousIcon}
        nextIcon={nextIcon}
        onPrevious={controller.previous}
        onNext={controller.next}
        classNames={classNames}
      />
      <CarouselStatus selected={controller.selected} slideCount={slides.length} separator={statusSeparator} className={classNames?.status} />
    </section>
  );
}
