'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { useFocusTrap } from './focus.client';
import {
  getTopOverlay,
  useDocumentScrollLock,
  useOverlayStack,
} from './overlayStack.client';
import { usePortalRoot } from './usePortalRoot.client';

type UseDialogOptions = {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onOpenFocus?: (container: HTMLElement) => void;
};

/** Shared portal, focus, scroll-lock, Escape, and focus-restoration behavior. */
export function useDialog({
  open,
  onClose,
  containerRef,
  returnFocusRef,
  onOpenFocus,
}: UseDialogOptions): { portalRoot: HTMLElement | null; isTopmost: boolean } {
  const portalRoot = usePortalRoot();
  const overlay = useOverlayStack(open && portalRoot !== null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onOpenFocusRef = useRef(onOpenFocus);
  const focusedRef = useRef(false);

  useEffect(() => {
    onOpenFocusRef.current = onOpenFocus;
  }, [onOpenFocus]);

  useFocusTrap({ containerRef, enabled: open && portalRoot !== null && overlay.isTopmost });
  useDocumentScrollLock(open && portalRoot !== null);

  useEffect(() => {
    if (!open || !portalRoot) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    const explicitReturnTarget = returnFocusRef?.current;
    return () => {
      focusedRef.current = false;
      const target = explicitReturnTarget ?? openerRef.current;
      target?.focus?.();
    };
  }, [open, portalRoot, containerRef, returnFocusRef]);

  useEffect(() => {
    if (!open || !portalRoot || !overlay.isTopmost || focusedRef.current) return;
    focusedRef.current = true;
    const frame = requestAnimationFrame(() => {
      const root = containerRef.current;
      if (root) onOpenFocusRef.current?.(root);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, portalRoot, overlay.isTopmost, containerRef]);

  useEffect(() => {
    if (!open || !portalRoot) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || getTopOverlay() !== overlay.id) return;
      event.stopImmediatePropagation();
      onClose();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose, overlay.id, portalRoot]);

  return { portalRoot, isTopmost: overlay.isTopmost };
}
