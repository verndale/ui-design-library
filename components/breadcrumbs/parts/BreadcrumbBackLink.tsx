import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline.js';
import type { BreadcrumbItem, BreadcrumbsClassNames } from '../Breadcrumbs.types.js';

export function BreadcrumbBackLink({
  parent,
  label,
  icon,
  classNames,
}: {
  parent?: BreadcrumbItem;
  label?: string;
  icon?: ReactNode;
  classNames?: BreadcrumbsClassNames;
}) {
  if (!parent) return null;

  return (
    <a
      href={parent.href}
      className={[
        'group inline-flex items-center gap-2xs text-sm no-underline xl:hidden',
        'min-h-(--size-touch-medium)',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        classNames?.backLink,
      ].filter(Boolean).join(' ')}
    >
      {icon ? (
        <span aria-hidden className={['inline-flex shrink-0 [&_svg]:size-4', classNames?.backIcon].filter(Boolean).join(' ')}>
          {icon}
        </span>
      ) : null}
      <span className={[animatedUnderline, classNames?.label].filter(Boolean).join(' ')}>{label ?? parent.label}</span>
    </a>
  );
}
