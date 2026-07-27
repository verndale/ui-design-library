'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { getFocusableElements, useFocusTrap, useScrollLock } from '../../src/lib/focus';

export type ModalProps = {
  /** Whether the dialog is open. The consumer owns this state. */
  open: boolean;
  /** Called on Escape, backdrop click, and the close button. */
  onClose: () => void;
  /** Accessible name for the dialog. Required — a dialog without one is unusable. */
  title: string;
  /** Accessible label for the close control. */
  closeLabel?: string;
  /** Optional short line above the title. */
  eyebrow?: ReactNode;
  /** Optional supporting copy below the title; also becomes the dialog description. */
  description?: ReactNode;
  /** Dialog body. */
  children?: ReactNode;
  /** Optional actions pinned below the scrolling body. */
  footer?: ReactNode;
  /** Panel width at desktop. Full-screen below `lg` regardless. */
  size?: 'medium' | 'large';
  /** Focus returns here after close. Defaults to whatever was focused on open. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const PANEL_SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  medium: 'lg:max-w-[600px]',
  large: 'lg:max-w-[900px]',
};

export function Modal({
  open,
  onClose,
  title,
  closeLabel = 'Close dialog',
  eyebrow,
  description,
  children,
  footer,
  size = 'large',
  returnFocusRef,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  // Portals need a DOM target, which does not exist during SSR.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useFocusTrap({ containerRef: dialogRef, enabled: open });
  useScrollLock(open);

  // Remember the opener before focus moves, and restore it on close so keyboard
  // users land back where they were rather than at the top of the document.
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    const frame = requestAnimationFrame(() => {
      const root = dialogRef.current;
      if (root) (getFocusableElements(root)[0] ?? root).focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      const target = returnFocusRef?.current ?? openerRef.current;
      target?.focus?.();
    };
  }, [open, returnFocusRef]);

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

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        aria-hidden
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        className="fixed inset-0 z-100 bg-surface-scrim animate-fade-in"
      />
      <div className="pointer-events-none fixed inset-0 z-100 flex items-stretch justify-stretch lg:items-center lg:justify-center lg:p-page-margin">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          data-component="modal"
          className={[
            'pointer-events-auto relative flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden',
            'bg-surface-raised text-text-primary',
            'lg:h-auto lg:max-h-[90vh] lg:rounded-medium lg:border lg:border-border-subtle lg:shadow-overlay',
            PANEL_SIZES[size],
            'animate-scale-in',
          ].join(' ')}
        >
          <header className="relative shrink-0 px-page-margin pt-l pb-m">
            <div className="flex flex-col gap-3xs pe-xl">
              {eyebrow}
              <h2 id={titleId} className="m-0 text-2xl font-semibold text-text-primary">
                {title}
              </h2>
              {description ? (
                <div id={descriptionId} className="text-text-secondary">
                  {description}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className={[
                'absolute end-s top-s inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill',
                'bg-surface-inverse text-text-inverse',
                'transition-colors duration-[var(--duration-fast)] ease-standard',
                'hover:bg-action-hover',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
              ].join(' ')}
            >
              <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-page-margin pb-l">{children}</div>

          {footer ? (
            <footer className="shrink-0 border-t border-border-subtle px-page-margin py-m">{footer}</footer>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
