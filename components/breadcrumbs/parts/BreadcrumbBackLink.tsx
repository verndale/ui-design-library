import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline.js';
import type { BreadcrumbItem } from '../Breadcrumbs.types.js';

export function BreadcrumbBackLink({
  parent,
  label,
  icon,
}: {
  parent?: BreadcrumbItem;
  label?: string;
  icon?: ReactNode;
}) {
  if (!parent) return null;

  return (
    <a
      href={parent.href}
      className={[
        'group inline-flex items-center gap-2xs text-sm no-underline xl:hidden',
        'min-h-[var(--size-touch-medium)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
      ].join(' ')}
    >
      {icon ? (
        <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className={animatedUnderline}>{label ?? parent.label}</span>
    </a>
  );
}
