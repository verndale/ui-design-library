'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

import type { InPageNavigationModalDrawerClassNames, InPageNavigationModalDrawerItem } from '../InPageNavigationModalDrawer.types.js';
import { NavigationLinks } from '../../in-page-navigation/parts/NavigationLinks.js';
import { useActiveSection } from '../../in-page-navigation/parts/useActiveSection.client.js';
import { ModalDrawer } from './ModalDrawer.client.js';
import { ModalDrawerTrigger } from './ModalDrawerTrigger.client.js';

export function InPageNavigationModalDrawerBranch({
  items,
  ariaLabel,
  closeLabel,
  activeId,
  classNames,
  collapsedIcon,
  expandedIcon,
}: {
  items: InPageNavigationModalDrawerItem[];
  ariaLabel: string;
  closeLabel: string;
  activeId?: string;
  classNames?: InPageNavigationModalDrawerClassNames;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const active = useActiveSection(items, activeId) ?? items[0]?.id;
  const activeLabel = items.find((item) => item.id === active)?.label;
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const desktop = matchMedia('(min-width: 64rem)');
    const closeAtDesktop = () => { if (desktop.matches) setOpen(false); };
    closeAtDesktop();
    desktop.addEventListener('change', closeAtDesktop);
    return () => desktop.removeEventListener('change', closeAtDesktop);
  }, []);

  return (
    <>
      <ul className={['mx-auto hidden w-fit list-none items-center gap-2xs rounded-pill border border-border-subtle bg-surface-raised px-2xs py-2xs lg:flex', classNames?.desktopList].filter(Boolean).join(' ')}>
        <NavigationLinks items={items} activeId={active} classNames={classNames} />
      </ul>
      <ModalDrawerTrigger
        ref={triggerRef}
        dialogId={dialogId}
        label={activeLabel}
        open={open}
        onOpen={openDrawer}
        icon={collapsedIcon}
        classNames={classNames}
      />
      <ModalDrawer
        open={open}
        onClose={closeDrawer}
        dialogId={dialogId}
        ariaLabel={ariaLabel}
        closeLabel={closeLabel}
        items={items}
        activeId={active}
        returnFocusRef={triggerRef}
        icon={expandedIcon}
        classNames={classNames}
      />
    </>
  );
}
