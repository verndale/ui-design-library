import type { UseEmblaCarouselType } from 'embla-carousel-react';
import { useEffect, type RefObject } from 'react';

type CarouselApi = UseEmblaCarouselType[1];
export type CarouselInertVisibility = 'intersecting' | 'fully-visible';

const CLIP_EDGE_EPSILON_PX = 1;

/** Keep focusable content outside the layout's usable visibility threshold out of the tab order. */
export function useCarouselInert({
  api,
  trackRef,
  slideCount,
  visibility,
}: {
  api: CarouselApi;
  trackRef: RefObject<HTMLDivElement | null>;
  slideCount: number;
  visibility: CarouselInertVisibility;
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
        const intersects = box.right > bounds.left + CLIP_EDGE_EPSILON_PX && box.left < bounds.right - CLIP_EDGE_EPSILON_PX;
        const fullyVisible =
          box.left >= bounds.left - CLIP_EDGE_EPSILON_PX &&
          box.right <= bounds.right + CLIP_EDGE_EPSILON_PX &&
          box.top >= bounds.top - CLIP_EDGE_EPSILON_PX &&
          box.bottom <= bounds.bottom + CLIP_EDGE_EPSILON_PX;
        const visible = !measurable || (visibility === 'fully-visible' ? fullyVisible : intersects);
        if (visible) node.removeAttribute('inert');
        else node.setAttribute('inert', '');
      }
    };

    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        apply();
      });
    };

    schedule();
    window.addEventListener('resize', schedule);
    api?.on('scroll', schedule).on('select', schedule).on('reInit', schedule).on('settle', schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      api?.off('scroll', schedule).off('select', schedule).off('reInit', schedule).off('settle', schedule);
    };
  }, [api, slideCount, trackRef, visibility]);
}
