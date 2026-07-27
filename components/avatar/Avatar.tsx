import type { ReactNode } from 'react';

export type AvatarProps = {
  children: ReactNode;
  /** Sizing lives with the caller — the frame only guarantees a 1:1 crop. */
  className?: string;
};

/** A square portrait frame for profile imagery. */
export function Avatar({ children, className }: AvatarProps) {
  return (
    <figure
      data-component="avatar"
      className={['relative m-0 aspect-square overflow-hidden rounded-small', className].filter(Boolean).join(' ')}
    >
      {children}
    </figure>
  );
}
