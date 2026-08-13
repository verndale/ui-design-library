'use client';

import type { ReactNode } from 'react';
import type { InPageNavigationClassNames, InPageNavigationItem } from '../InPageNavigation.types.js';
import { MobileNavigation } from './MobileNavigation.client.js';
import { NavigationLinks } from './NavigationLinks.js';
import { useActiveSection } from './useActiveSection.client.js';

export function InPageNavigationBranch({
  items,
  activeId,
  classNames,
  collapsedIcon,
  expandedIcon,
}: {
  items: InPageNavigationItem[];
  activeId?: string;
  classNames?: InPageNavigationClassNames;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
}) {
  const active = useActiveSection(items, activeId) ?? items[0]?.id;

  return (
    <>
      <ul className={['mx-auto hidden w-fit list-none items-center gap-2xs rounded-pill border border-border-subtle bg-surface-raised px-2xs py-2xs lg:flex', classNames?.desktopList].filter(Boolean).join(' ')}>
        <NavigationLinks items={items} activeId={active} classNames={classNames} />
      </ul>
      <MobileNavigation items={items} activeId={active} classNames={classNames} collapsedIcon={collapsedIcon} expandedIcon={expandedIcon} />
    </>
  );
}
