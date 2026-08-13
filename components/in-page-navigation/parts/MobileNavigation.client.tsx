'use client';

import { useId, useState, type ReactNode } from 'react';

import type { InPageNavigationClassNames, InPageNavigationItem } from '../InPageNavigation.types.js';
import { NavigationChevron } from './NavigationChevron.js';
import { NavigationLinks } from './NavigationLinks.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function MobileNavigation({
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
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const activeLabel = items.find((item) => item.id === activeId)?.label;

  return (
    <div className={['rounded-medium border border-border-subtle bg-surface-raised lg:hidden', classNames?.mobile].filter(Boolean).join(' ')}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((value) => !value)}
        className={[
          'flex w-full cursor-pointer items-center justify-between gap-s px-s py-xs',
          'text-base text-text-primary',
          focusRing,
          classNames?.trigger,
        ].filter(Boolean).join(' ')}
      >
        <span className={classNames?.label}>{activeLabel}</span>
        <span aria-hidden className={classNames?.icon}>{open ? expandedIcon ?? <NavigationChevron open /> : collapsedIcon ?? <NavigationChevron open={false} />}</span>
      </button>
      <div
        data-inpage-motion
        className={[
          'grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-standard',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          classNames?.motion,
        ].filter(Boolean).join(' ')}
      >
        <div className="overflow-hidden">
          <ul
            inert={!open}
            id={drawerId}
            className={['flex list-none flex-col gap-2xs px-2xs pb-2xs', classNames?.mobileList, classNames?.panel].filter(Boolean).join(' ')}
          >
            <NavigationLinks items={items} activeId={activeId} onNavigate={() => setOpen(false)} classNames={classNames} />
          </ul>
        </div>
      </div>
    </div>
  );
}
