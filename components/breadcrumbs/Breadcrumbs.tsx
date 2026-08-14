import type { BreadcrumbsProps } from './Breadcrumbs.types.js';
import { BreadcrumbBackLink } from './parts/BreadcrumbBackLink.js';
import { BreadcrumbTrail } from './parts/BreadcrumbTrail.js';

export type { BreadcrumbItem, BreadcrumbsPresentation, BreadcrumbsProps } from './Breadcrumbs.types.js';

/** A responsive trail of ancestor links ending in the current page. */
export function Breadcrumbs({
  items,
  currentPageTitle,
  backLinkLabel,
  leadingItem,
  presentation = 'responsive',
  surface = 'light',
  ariaLabel = 'Breadcrumb',
  className,
  separator = '/',
  backIcon,
  classNames,
}: BreadcrumbsProps) {
  const text = surface === 'dark' ? 'text-text-inverse' : 'text-text-primary';
  const resolvedPresentation = presentation === 'back-link' && items.length === 0 ? 'trail' : presentation;

  return (
    <nav
      aria-label={ariaLabel}
      data-component="breadcrumbs"
      data-surface={surface}
      className={[text, classNames?.root, className].filter(Boolean).join(' ')}
    >
      <BreadcrumbTrail
        items={items}
        currentPageTitle={currentPageTitle}
        leadingItem={leadingItem}
        separator={separator}
        presentation={resolvedPresentation}
        classNames={classNames}
      />
      <BreadcrumbBackLink
        parent={items[items.length - 1]}
        label={backLinkLabel}
        icon={backIcon}
        presentation={resolvedPresentation}
        classNames={classNames}
      />
    </nav>
  );
}
