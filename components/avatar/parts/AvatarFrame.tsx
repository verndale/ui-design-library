import type { AvatarProps } from '../Avatar.types';

export function AvatarFrame({ children, className }: AvatarProps) {
  return (
    <figure
      data-component="avatar"
      className={['relative m-0 aspect-square overflow-hidden rounded-small', className].filter(Boolean).join(' ')}
    >
      {children}
    </figure>
  );
}
