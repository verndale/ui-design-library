import type { ReactNode } from 'react';

import { animatedUnderline } from '../../../src/lib/underline';
import type { LinkSize } from '../Link.types';

function LinkIcon({ children, size, side }: { children: ReactNode; size: LinkSize; side: 'start' | 'end' }) {
  return (
    <span
      aria-hidden
      className={[
        'inline-flex shrink-0 align-middle text-inherit',
        side === 'start' ? 'me-2xs' : 'ms-2xs',
        size === 'small' ? '[&_svg]:size-4' : '[&_svg]:size-5',
      ].join(' ')}
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
}: {
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size: LinkSize;
}) {
  return (
    <>
      {startIcon ? <LinkIcon size={size} side="start">{startIcon}</LinkIcon> : null}
      <span className={animatedUnderline}>{children}</span>
      {endIcon ? <LinkIcon size={size} side="end">{endIcon}</LinkIcon> : null}
    </>
  );
}
