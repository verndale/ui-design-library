import type { InPageNavigationProps } from './InPageNavigation.types';
import { InPageNavigationBranch } from './parts/InPageNavigationBranch.client';

export type { InPageNavigationItem, InPageNavigationProps } from './InPageNavigation.types';

/** A server-renderable landmark enhanced by scroll-spy and mobile disclosure leaves. */
export function InPageNavigation({
  items,
  ariaLabel = 'On this page',
  activeId,
  className,
}: InPageNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav
      data-component="in-page-navigation"
      aria-label={ariaLabel}
      className={['sticky bottom-s z-10', className].filter(Boolean).join(' ')}
    >
      <InPageNavigationBranch items={items} activeId={activeId} />
    </nav>
  );
}
