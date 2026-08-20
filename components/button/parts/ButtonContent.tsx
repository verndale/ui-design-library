import type { ReactNode } from 'react';

import type { ButtonClassNames, ButtonPresentation, ButtonSize } from '../Button.types.js';

function ButtonIcon({ children, size, className }: { children: ReactNode; size: ButtonSize; className?: string }) {
  return (
    <span aria-hidden className={['inline-flex shrink-0', size === 'small' ? '[&_svg]:size-4' : '[&_svg]:size-5', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

export function ButtonContent({
  children,
  startIcon,
  endIcon,
  presentation,
  size,
  classNames,
}: {
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  presentation: ButtonPresentation;
  size: ButtonSize;
  classNames?: ButtonClassNames;
}) {
  if (presentation === 'icon-only') {
    return <ButtonIcon size={size} className={classNames?.content}>{children}</ButtonIcon>;
  }

  return (
    <>
      {startIcon ? <ButtonIcon size={size} className={classNames?.startIcon}>{startIcon}</ButtonIcon> : null}
      <span className={classNames?.content}>{children}</span>
      {endIcon ? <ButtonIcon size={size} className={classNames?.endIcon}>{endIcon}</ButtonIcon> : null}
    </>
  );
}
