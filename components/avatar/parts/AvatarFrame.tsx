import type { AvatarProps } from '../Avatar.types.js';

export function AvatarFrame({ children, className, classNames, id, ariaLabel }: AvatarProps) {
  return (
    <figure
      data-component="avatar"
      id={id}
      aria-label={ariaLabel}
      className={['relative m-0 aspect-square overflow-hidden rounded-small', classNames?.root, className].filter(Boolean).join(' ')}
    >
      {children}
    </figure>
  );
}
