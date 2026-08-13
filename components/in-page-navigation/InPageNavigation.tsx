import type { InPageNavigationProps } from './InPageNavigation.types.js';
import { InPageNavigationBranch } from './parts/InPageNavigationBranch.client.js';

export type { InPageNavigationItem, InPageNavigationProps } from './InPageNavigation.types.js';

/** A server-renderable landmark enhanced by scroll-spy and mobile disclosure leaves. */
export function InPageNavigation({
  items,
  ariaLabel = 'On this page',
  activeId,
  className,
  classNames,
  collapsedIcon,
  expandedIcon,
}: InPageNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav
      data-component="in-page-navigation"
      aria-label={ariaLabel}
      className={['sticky bottom-s z-10', classNames?.root, className].filter(Boolean).join(' ')}
    >
      <InPageNavigationBranch items={items} activeId={activeId} classNames={classNames} collapsedIcon={collapsedIcon} expandedIcon={expandedIcon} />
    </nav>
  );
}
