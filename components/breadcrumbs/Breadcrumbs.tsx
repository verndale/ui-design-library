import type { ReactNode } from 'react';

import { animatedUnderline } from '../../src/lib/underline';

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type BreadcrumbsProps = {
  /** Ancestor pages, nearest last. The current page is passed separately. */
  items: BreadcrumbItem[];
  /** The current page. Rendered as text, not a link. */
  currentPageTitle: string;
  /** Label for the mobile back link. Defaults to the nearest ancestor's label. */
  backLinkLabel?: string;
  surface?: 'light' | 'dark';
  /** Accessible name for the landmark. Change it when a page has two trails. */
  ariaLabel?: string;
  className?: string;
  /** Separator between items. */
  separator?: ReactNode;
  /** Icon for the mobile back link. */
  backIcon?: ReactNode;
};

/**
 * A trail of ancestor links ending in the current page.
 *
 * Below `xl` it collapses to a single back link to the nearest ancestor, which
 * is the responsive behaviour most breadcrumb implementations skip. The back
 * link keeps a minimum tap target regardless of how short its label is.
 */
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
  const parent = items[items.length - 1];
  const inverse = surface === 'dark';
  const text = inverse ? 'text-text-inverse' : 'text-text-primary';

  return (
    <nav
      aria-label={ariaLabel}
      data-component="breadcrumbs"
      data-surface={surface}
      className={[text, className].filter(Boolean).join(' ')}
    >
      {/* Full trail from xl up. */}
      <ol className="m-0 hidden list-none flex-wrap items-center gap-2xs p-0 text-sm xl:flex">
        {items.map((item) => (
          <li key={item.href} className="inline-flex items-center gap-2xs">
            <a
              href={item.href}
              className="group inline-block no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <span className={animatedUnderline}>{item.label}</span>
            </a>
            <span aria-hidden className="opacity-60">
              {separator}
            </span>
          </li>
        ))}
        {/* aria-current marks the page for assistive technology; it is not a link. */}
        <li aria-current="page" className="inline-flex items-center opacity-70">
          {currentPageTitle}
        </li>
      </ol>

      {/* Collapsed back link below xl. */}
      {parent ? (
        <a
          href={parent.href}
          className={[
            'group inline-flex items-center gap-2xs text-sm no-underline xl:hidden',
            'min-h-[var(--size-touch-medium)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          ].join(' ')}
        >
          {backIcon ? (
            <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
              {backIcon}
            </span>
          ) : null}
          <span className={animatedUnderline}>{backLinkLabel ?? parent.label}</span>
        </a>
      ) : null}
    </nav>
  );
}
