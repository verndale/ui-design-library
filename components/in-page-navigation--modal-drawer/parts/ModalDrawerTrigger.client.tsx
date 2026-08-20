'use client';

import type { ReactNode, RefObject } from 'react';

import type { InPageNavigationModalDrawerClassNames } from '../InPageNavigationModalDrawer.types.js';
import { DrawerHandle } from './DrawerHandle.js';
import { useVerticalSwipe } from './useVerticalSwipe.client.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function ModalDrawerTrigger({
  ref,
  dialogId,
  label,
  open,
  onOpen,
  icon,
  classNames,
}: {
  ref: RefObject<HTMLButtonElement | null>;
  dialogId: string;
  label: ReactNode;
  open: boolean;
  onOpen: () => void;
  icon?: ReactNode;
  classNames?: InPageNavigationModalDrawerClassNames;
}) {
  const swipe = useVerticalSwipe<HTMLButtonElement>('up', onOpen);

  return (
    <div className={['rounded-medium border border-border-subtle bg-surface-raised lg:hidden', classNames?.mobile].filter(Boolean).join(' ')}>
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-hidden={open ? true : undefined}
        tabIndex={open ? -1 : undefined}
        onClick={onOpen}
        {...swipe}
        className={[
          'flex min-h-xl w-full touch-none cursor-pointer flex-col items-center justify-center gap-2xs px-s py-2xs',
          'text-base text-text-primary',
          open ? 'pointer-events-none opacity-0' : undefined,
          focusRing,
          classNames?.trigger,
        ].filter(Boolean).join(' ')}
      >
        <span aria-hidden className={classNames?.icon}><DrawerHandle icon={icon} /></span>
        <span className={classNames?.label}>{label}</span>
      </button>
    </div>
  );
}
