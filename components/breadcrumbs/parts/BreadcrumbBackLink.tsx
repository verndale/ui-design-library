import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline.js';
import type { BreadcrumbItem, BreadcrumbsClassNames, BreadcrumbsPresentation } from '../Breadcrumbs.types.js';

export function BreadcrumbBackLink({
  parent,
  label,
  icon,
  presentation,
  classNames,
}: {
  parent?: BreadcrumbItem;
  label?: string;
  icon?: ReactNode;
  presentation: BreadcrumbsPresentation;
  classNames?: BreadcrumbsClassNames;
}) {
  if (!parent) return null;

  const visibility = presentation === 'responsive' ? 'inline-flex xl:hidden' : presentation === 'back-link' ? 'inline-flex' : 'hidden';

  return (
    <a
      href={parent.href}
      title={parent.title}
      className={[
        'group items-center gap-2xs text-sm no-underline',
        visibility,
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
