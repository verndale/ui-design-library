import type { ReactNode } from 'react';

import type { BadgeProps } from '../Badge.types.js';

export function BadgeFrame({
  label,
  disabled = false,
  surface = 'light',
  className,
  startIcon,
  action,
}: BadgeProps & { action?: ReactNode }) {
  const inverse = surface === 'dark';

  return (
    <span
      data-component="badge"
      data-surface={surface}
      className={[
        'inline-flex items-center gap-3xs rounded-pill border border-solid px-2xs py-3xs text-sm leading-none',
        inverse ? 'border-text-inverse text-text-inverse' : 'border-border-strong text-text-primary',
        disabled ? 'opacity-40' : undefined,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {startIcon ? (
        <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
          {startIcon}
        </span>
      ) : null}
      <span>{label}</span>
      {action}
    </span>
  );
}
