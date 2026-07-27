'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

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
  /** Render the arrow controls. Defaults to text glyphs. */
  renderPrevious?: (props: { disabled: boolean }) => ReactNode;
  renderNext?: (props: { disabled: boolean }) => ReactNode;
};

/**
 * A carousel that steps through discrete slides.
 *
 * The accessibility behaviour is the point of this component, not the sliding:
 * off-screen slides are marked `inert` so their focusable content is skipped by
 * Tab, the arrow controls disable at the ends rather than silently doing
 * nothing, and the region is labelled and announces slide position.
 */
export function Carousel({
  slides,
  label,
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  loop = false,
  className,
  slideClassName,
  renderPrevious,
  renderNext,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: 'start' });
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selected, setSelected] = useState(0);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setCanPrevious(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on('select', sync).on('reInit', sync);
    return () => {
      emblaApi.off('select', sync).off('reInit', sync);
    };
  }, [emblaApi, sync]);

  /**
   * Mark slides that are not in view `inert`, so Tab skips their links.
   *
   * Visibility is computed from geometry — each slide's box against the
   * viewport's — rather than delegated. IntersectionObserver was the obvious
   * choice and is the wrong one here: it only delivers while the page is being
   * painted, so the state is undefined in a background tab and untestable in a
   * headless one. The carousel engine's own in-view reporting is unavailable
   * until it has measured. Geometry is true whenever it is asked.
   */
  useEffect(() => {
    const container = trackRef.current;
    const viewport = container?.parentElement;
    if (!container || !viewport) return;

    const apply = () => {
      const bounds = viewport.getBoundingClientRect();
      // A zero-width viewport means layout has not happened. Fail open —
      // trapping keyboard users inside an unreachable carousel is worse than an
      // extra tab stop.
      const measurable = bounds.width > 0;
      for (const node of [...container.children] as HTMLElement[]) {
        const box = node.getBoundingClientRect();
        const visible =
          !measurable || (box.right > bounds.left + 1 && box.left < bounds.right - 1);
        if (visible) node.removeAttribute('inert');
        else node.setAttribute('inert', '');
      }
    };

    const frame = requestAnimationFrame(apply);
    window.addEventListener('resize', apply);
    emblaApi?.on('select', apply).on('reInit', apply).on('settle', apply);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', apply);
      emblaApi?.off('select', apply).off('reInit', apply).off('settle', apply);
    };
  }, [emblaApi, slides.length]);

  const control =
    'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-solid border-border-strong ' +
    'text-text-primary transition-opacity duration-[var(--duration-fast)] ease-standard motion-reduce:transition-none ' +
    'disabled:pointer-events-none disabled:opacity-30 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

  return (
    <section aria-roledescription="carousel" aria-label={label} data-component="carousel" className={className}>
      <div ref={emblaRef} className="overflow-hidden">
        <div ref={trackRef} className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              // Each slide is a labelled group so screen readers announce position.
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

      <div className="mt-s flex items-center gap-2xs">
        <button
          type="button"
          aria-label={previousLabel}
          disabled={!canPrevious}
          onClick={() => emblaApi?.scrollPrev()}
          className={control}
        >
          {renderPrevious ? renderPrevious({ disabled: !canPrevious }) : <span aria-hidden>‹</span>}
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          disabled={!canNext}
          onClick={() => emblaApi?.scrollNext()}
          className={control}
        >
          {renderNext ? renderNext({ disabled: !canNext }) : <span aria-hidden>›</span>}
        </button>
        <p aria-live="polite" className="ms-2xs text-sm text-text-secondary">
          {selected + 1} / {slides.length}
        </p>
      </div>
    </section>
  );
}
