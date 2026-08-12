import type { ReactNode } from 'react';

import type { ButtonSize } from '../Button.types';

function ButtonIcon({ children, size }: { children: ReactNode; size: ButtonSize }) {
  return (
    <span aria-hidden className={['inline-flex shrink-0', size === 'small' ? '[&_svg]:size-4' : '[&_svg]:size-5'].join(' ')}>
      {children}
    </span>
  );
}

export function ButtonContent({
  children,
  startIcon,
  endIcon,
  size,
}: {
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size: ButtonSize;
}) {
  return (
    <>
      {startIcon ? <ButtonIcon size={size}>{startIcon}</ButtonIcon> : null}
      {children}
      {endIcon ? <ButtonIcon size={size}>{endIcon}</ButtonIcon> : null}
    </>
  );
}
