import { useEffect, type RefObject } from 'react';

/**
 * Focus utilities for overlay components.
 *
 * Library-owned and dependency-free on purpose: the implementation this was
 * captured from imported its trap from a navigation component deep inside one
 * project, which is exactly the coupling that stops a component being reusable.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Tabbable descendants in DOM order, excluding anything hidden. */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Keep Tab focus inside `containerRef` while `enabled`.
 *
 * Wraps in both directions and pulls focus back if it escapes — a trap that only
 * handles Tab still leaks when focus is moved programmatically.
 */
export function useFocusTrap({
  containerRef,
  enabled,
}: {
  containerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}): void {
  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(root);
      if (focusable.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault();
        last.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (root.contains(event.target as Node)) return;
      const focusable = getFocusableElements(root);
      (focusable[0] ?? root).focus();
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
    };
  }, [containerRef, enabled]);
}

/** Lock document scroll while `enabled`, restoring the previous values after. */
export function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const { documentElement, body } = document;
    const previous = { html: documentElement.style.overflow, body: body.style.overflow };
    documentElement.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      documentElement.style.overflow = previous.html;
      body.style.overflow = previous.body;
    };
  }, [enabled]);
}
