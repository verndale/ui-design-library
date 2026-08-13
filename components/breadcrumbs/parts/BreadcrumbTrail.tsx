import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline.js';
import type { BreadcrumbItem, BreadcrumbsClassNames } from '../Breadcrumbs.types.js';

export function BreadcrumbTrail({
  items,
  currentPageTitle,
  separator,
  classNames,
}: {
  items: BreadcrumbItem[];
  currentPageTitle: string;
  separator: ReactNode;
  classNames?: BreadcrumbsClassNames;
}) {
  return (
    <ol className={['m-0 hidden list-none flex-wrap items-center gap-2xs p-0 text-sm xl:flex', classNames?.trail].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item.href} className={['inline-flex items-center gap-2xs', classNames?.item].filter(Boolean).join(' ')}>
          <a
            href={item.href}
            className={['group inline-block no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus', classNames?.link].filter(Boolean).join(' ')}
          >
            <span className={[animatedUnderline, classNames?.label].filter(Boolean).join(' ')}>{item.label}</span>
          </a>
          <span aria-hidden className={['opacity-60', classNames?.separator].filter(Boolean).join(' ')}>
            {separator}
          </span>
        </li>
      ))}
      <li aria-current="page" className={['inline-flex items-center opacity-70', classNames?.currentPage].filter(Boolean).join(' ')}>
        {currentPageTitle}
      </li>
    </ol>
  );
}
