'use client';

import type { InPageNavigationItem } from '../InPageNavigation.types.js';
import { MobileNavigation } from './MobileNavigation.client.js';
import { NavigationLinks } from './NavigationLinks.js';
import { useActiveSection } from './useActiveSection.client.js';

export function InPageNavigationBranch({
  items,
  activeId,
}: {
  items: InPageNavigationItem[];
  activeId?: string;
}) {
  const active = useActiveSection(items, activeId) ?? items[0]?.id;

  return (
    <>
      <ul className="mx-auto hidden w-fit list-none items-center gap-2xs rounded-pill border border-border-subtle bg-surface-raised px-2xs py-2xs lg:flex">
        <NavigationLinks items={items} activeId={active} />
      </ul>
      <MobileNavigation items={items} activeId={active} />
    </>
  );
}
