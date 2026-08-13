import type { UseEmblaCarouselType } from 'embla-carousel-react';
import { useEffect, type RefObject } from 'react';

type CarouselApi = UseEmblaCarouselType[1];

/** Keep focusable content in off-screen slides out of the tab order. */
export function useCarouselInert({
  api,
  trackRef,
  slideCount,
}: {
  api: CarouselApi;
  trackRef: RefObject<HTMLDivElement | null>;
  slideCount: number;
}) {
  useEffect(() => {
    const track = trackRef.current;
    const viewport = track?.parentElement;
    if (!track || !viewport) return;

    const apply = () => {
      const bounds = viewport.getBoundingClientRect();
      const measurable = bounds.width > 0;
      for (const node of [...track.children] as HTMLElement[]) {
        const box = node.getBoundingClientRect();
        const visible = !measurable || (box.right > bounds.left + 1 && box.left < bounds.right - 1);
        if (visible) node.removeAttribute('inert');
        else node.setAttribute('inert', '');
      }
    };

    const frame = requestAnimationFrame(apply);
    window.addEventListener('resize', apply);
    api?.on('select', apply).on('reInit', apply).on('settle', apply);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', apply);
      api?.off('select', apply).off('reInit', apply).off('settle', apply);
    };
  }, [api, slideCount, trackRef]);
}
