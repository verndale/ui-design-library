import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline.js';
import type { LinkClassNames, LinkSize } from '../Link.types.js';

function LinkIcon({ children, size, side, className }: { children: ReactNode; size: LinkSize; side: 'start' | 'end'; className?: string }) {
  return (
    <span
      aria-hidden
      className={[
        'inline-flex shrink-0 align-middle text-inherit',
        side === 'start' ? 'me-2xs' : 'ms-2xs',
        size === 'small' ? '[&_svg]:size-4' : '[&_svg]:size-5',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}

export function LinkContent({
  children,
  startIcon,
  endIcon,
  size,
  classNames,
}: {
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size: LinkSize;
  classNames?: LinkClassNames;
}) {
  return (
    <>
      {startIcon ? <LinkIcon size={size} side="start" className={classNames?.startIcon}>{startIcon}</LinkIcon> : null}
      <span className={[animatedUnderline, classNames?.content].filter(Boolean).join(' ')}>{children}</span>
      {endIcon ? <LinkIcon size={size} side="end" className={classNames?.endIcon}>{endIcon}</LinkIcon> : null}
    </>
  );
}
