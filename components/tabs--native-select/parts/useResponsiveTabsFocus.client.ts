import { useEffect, type RefObject } from 'react';

const LG_MEDIA_QUERY = '(min-width: 64rem)';

type ResponsiveTabsFocusOptions = {
  activeIndex: number;
  desktopRef: RefObject<HTMLDivElement | null>;
  selectRef: RefObject<HTMLSelectElement | null>;
  tabRefs: RefObject<Map<number, HTMLButtonElement>>;
};

/** Moves focus out of the copy that becomes display-hidden at the governed lg boundary. */
export function useResponsiveTabsFocus({
  activeIndex,
  desktopRef,
  selectRef,
  tabRefs,
}: ResponsiveTabsFocusOptions) {
  useEffect(() => {
    const media = window.matchMedia(LG_MEDIA_QUERY);
    const moveFocus = (event: MediaQueryListEvent) => {
      const focused = document.activeElement;
      if (event.matches && focused === selectRef.current) {
        tabRefs.current.get(activeIndex)?.focus();
      } else if (!event.matches && focused && desktopRef.current?.contains(focused)) {
        selectRef.current?.focus();
      }
    };

    media.addEventListener('change', moveFocus);
    return () => media.removeEventListener('change', moveFocus);
  }, [activeIndex, desktopRef, selectRef, tabRefs]);
}
