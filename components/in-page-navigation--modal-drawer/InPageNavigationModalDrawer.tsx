import type { InPageNavigationModalDrawerProps } from './InPageNavigationModalDrawer.types.js';
import { InPageNavigationModalDrawerBranch } from './parts/InPageNavigationModalDrawerBranch.client.js';

export type {
  InPageNavigationModalDrawerClassNames,
  InPageNavigationModalDrawerItem,
  InPageNavigationModalDrawerProps,
} from './InPageNavigationModalDrawer.types.js';

/** The governed modal-drawer alternate for the In-page navigation family. */
export function InPageNavigationModalDrawer({
  items,
  ariaLabel = 'On this page',
  closeLabel = 'Close navigation',
  activeId,
  className,
  classNames,
  collapsedIcon,
  expandedIcon,
}: InPageNavigationModalDrawerProps) {
  if (items.length === 0) return null;

  return (
    <nav
      data-component="in-page-navigation-modal-drawer"
      aria-label={ariaLabel}
      className={['sticky bottom-s z-10', classNames?.root, className].filter(Boolean).join(' ')}
    >
      <InPageNavigationModalDrawerBranch
        items={items}
        ariaLabel={ariaLabel}
        closeLabel={closeLabel}
        activeId={activeId}
        classNames={classNames}
        collapsedIcon={collapsedIcon}
        expandedIcon={expandedIcon}
      />
    </nav>
  );
}
