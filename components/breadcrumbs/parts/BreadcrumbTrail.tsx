import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline.js';
import type { BreadcrumbItem } from '../Breadcrumbs.types.js';

export function BreadcrumbTrail({
  items,
  currentPageTitle,
  separator,
}: {
  items: BreadcrumbItem[];
  currentPageTitle: string;
  separator: ReactNode;
}) {
  return (
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
      <li aria-current="page" className="inline-flex items-center opacity-70">
        {currentPageTitle}
      </li>
    </ol>
  );
}
