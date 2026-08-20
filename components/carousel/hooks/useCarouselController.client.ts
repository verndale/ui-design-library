import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCarouselInert, type CarouselInertVisibility } from './useCarouselInert.client.js';

/** Own Embla state and expose a small rendering contract to the carousel tree. */
export function useCarouselController({
  loop,
  slideCount,
  inertVisibility,
}: {
  loop: boolean;
  slideCount: number;
  inertVisibility: CarouselInertVisibility;
}) {
  const [viewportRef, api] = useEmblaCarousel({ loop, align: 'start' });
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selected, setSelected] = useState(0);

  const sync = useCallback(() => {
    if (!api) return;
    setCanPrevious(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    setSelected(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const frame = requestAnimationFrame(sync);
    api.on('select', sync).on('reInit', sync);
    return () => {
      cancelAnimationFrame(frame);
      api.off('select', sync).off('reInit', sync);
    };
  }, [api, sync]);

  useCarouselInert({ api, trackRef, slideCount, visibility: inertVisibility });

  return {
    viewportRef,
    trackRef,
    canPrevious,
    canNext,
    selected,
    previous: () => api?.scrollPrev(),
    next: () => api?.scrollNext(),
  };
}
