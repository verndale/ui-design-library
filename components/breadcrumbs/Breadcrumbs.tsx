import type { BreadcrumbsProps } from './Breadcrumbs.types';
import { BreadcrumbBackLink } from './parts/BreadcrumbBackLink';
import { BreadcrumbTrail } from './parts/BreadcrumbTrail';

export type { BreadcrumbItem, BreadcrumbsProps } from './Breadcrumbs.types';

/** A responsive trail of ancestor links ending in the current page. */
export function Breadcrumbs({
  items,
  currentPageTitle,
  backLinkLabel,
  surface = 'light',
  ariaLabel = 'Breadcrumb',
  className,
  separator = '/',
  backIcon,
}: BreadcrumbsProps) {
  const text = surface === 'dark' ? 'text-text-inverse' : 'text-text-primary';

  return (
    <nav
      aria-label={ariaLabel}
      data-component="breadcrumbs"
      data-surface={surface}
      className={[text, className].filter(Boolean).join(' ')}
    >
      <BreadcrumbTrail items={items} currentPageTitle={currentPageTitle} separator={separator} />
      <BreadcrumbBackLink parent={items[items.length - 1]} label={backLinkLabel} icon={backIcon} />
    </nav>
  );
}
