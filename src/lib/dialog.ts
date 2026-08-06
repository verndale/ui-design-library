import { useEffect, useRef, useState, type RefObject } from 'react';

import { useFocusTrap, useScrollLock } from './focus';

/**
 * The shared dialog-overlay contract: an SSR-safe portal gate, a focus trap and
 * scroll lock while open, Escape-to-close, and focus restoration to the opener
 * (or a caller-provided element) on close.
 *
 * Initial focus is intentionally left to the caller via `onOpenFocus`, because
 * where focus should land differs per overlay — the first focusable control for
 * a generic dialog, the search field for a search overlay. Everything else is
 * identical, which is why it lives here rather than being re-implemented per
 * overlay (Modal and Search overlay both consume it).
 */
export function useDialog({
  open,
  onClose,
  containerRef,
  returnFocusRef,
  onOpenFocus,
}: {
  /** Whether the overlay is open. The consumer owns this state. */
  open: boolean;
  /** Called on Escape (and by the component on backdrop click / close control). */
  onClose: () => void;
  /** The dialog container the trap keeps focus within. */
  containerRef: RefObject<HTMLElement | null>;
  /** Focus returns here on close; defaults to whatever was focused on open. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Called once on open (after paint) to place initial focus inside `container`. */
  onOpenFocus?: (container: HTMLElement) => void;
}): { mounted: boolean } {
  // Portals need a DOM target, which does not exist during SSR.
  const [mounted, setMounted] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  // Held in a ref so a fresh closure each render is not a dependency of the open
  // effect, which must run only on the open transition.
  const onOpenFocusRef = useRef(onOpenFocus);
  onOpenFocusRef.current = onOpenFocus;

  useEffect(() => setMounted(true), []);

  // `open && mounted` gates the trap: the portal — and therefore the container
  // ref — does not exist until mounted, so without it the effect runs once
  // against a null ref and never re-runs, leaving no trap at all.
  useFocusTrap({ containerRef, enabled: open && mounted });
  useScrollLock(open);

  // Remember the opener before focus moves, apply the caller's initial focus on
  // the next frame, and restore focus on close so keyboard users land back where
  // they were rather than at the top of the document.
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    const frame = requestAnimationFrame(() => {
      const root = containerRef.current;
      if (root) onOpenFocusRef.current?.(root);
    });
    return () => {
      cancelAnimationFrame(frame);
      const target = returnFocusRef?.current ?? openerRef.current;
      target?.focus?.();
    };
  }, [open, containerRef, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  return { mounted };
}
