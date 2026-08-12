'use client';

import { useId, useState } from 'react';

import type { InPageNavigationItem } from '../InPageNavigation.types';
import { NavigationChevron } from './NavigationChevron';
import { NavigationLinks } from './NavigationLinks';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function MobileNavigation({
  items,
  activeId,
}: {
  items: InPageNavigationItem[];
  activeId?: string;
}) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const activeLabel = items.find((item) => item.id === activeId)?.label;

  return (
    <div className="rounded-medium border border-border-subtle bg-surface-raised lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((value) => !value)}
        className={[
          'flex w-full cursor-pointer items-center justify-between gap-s px-s py-xs',
          'text-base text-text-primary',
          focusRing,
        ].join(' ')}
      >
        <span>{activeLabel}</span>
        <NavigationChevron open={open} />
      </button>
      <div
        data-inpage-motion
        className={[
          'grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-standard',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <ul
            inert={!open}
            id={drawerId}
            className="flex list-none flex-col gap-2xs px-2xs pb-2xs"
          >
            <NavigationLinks items={items} activeId={activeId} onNavigate={() => setOpen(false)} />
          </ul>
        </div>
      </div>
    </div>
  );
}
