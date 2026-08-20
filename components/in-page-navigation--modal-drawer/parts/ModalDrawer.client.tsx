'use client';

import type { ReactNode, RefObject } from 'react';

import { Modal } from '../../modal/index.js';
import type { InPageNavigationModalDrawerClassNames, InPageNavigationModalDrawerItem } from '../InPageNavigationModalDrawer.types.js';
import { NavigationLinks } from '../../in-page-navigation/parts/NavigationLinks.js';
import { DrawerHandle } from './DrawerHandle.js';
import { useVerticalSwipe } from './useVerticalSwipe.client.js';

export function ModalDrawer({
  open,
  onClose,
  dialogId,
  ariaLabel,
  closeLabel,
  items,
  activeId,
  returnFocusRef,
  icon,
  classNames,
}: {
  open: boolean;
  onClose: () => void;
  dialogId: string;
  ariaLabel: string;
  closeLabel: string;
  items: InPageNavigationModalDrawerItem[];
  activeId?: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  icon?: ReactNode;
  classNames?: InPageNavigationModalDrawerClassNames;
}) {
  const swipe = useVerticalSwipe<HTMLDivElement>('down', onClose);
  const modalClassNames = {
    backdrop: ['in-page-navigation-modal-backdrop', classNames?.backdrop].filter(Boolean).join(' '),
    viewport: ['items-end! justify-center! px-page-margin pb-s lg:hidden', classNames?.viewport].filter(Boolean).join(' '),
    dialog: ['h-auto! max-h-[80dvh]! origin-bottom rounded-medium! border border-border-subtle shadow-overlay', classNames?.dialog].filter(Boolean).join(' '),
    header: classNames?.header,
    title: classNames?.title,
    closeButton: classNames?.closeButton,
    body: ['flex min-h-0 flex-col px-s pb-s', classNames?.panel].filter(Boolean).join(' '),
  };

  return (
    <Modal
      id={dialogId}
      open={open}
      onClose={onClose}
      title={ariaLabel}
      closeLabel={closeLabel}
      returnFocusRef={returnFocusRef}
      size="large"
      classNames={modalClassNames}
    >
      <div
        data-inpage-swipe-handle
        aria-hidden
        {...swipe}
        className={['flex touch-none justify-center py-2xs', classNames?.swipeHandle].filter(Boolean).join(' ')}
      >
        <DrawerHandle icon={icon} />
      </div>
      <nav aria-label={ariaLabel} className="min-h-0 overflow-y-auto" data-inpage-scroll-region>
        <ul className={['flex list-none flex-col gap-2xs', classNames?.mobileList].filter(Boolean).join(' ')}>
          <NavigationLinks items={items} activeId={activeId} onNavigate={onClose} classNames={classNames} />
        </ul>
      </nav>
    </Modal>
  );
}
