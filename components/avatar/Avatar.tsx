import type { AvatarProps } from './Avatar.types';
import { AvatarFrame } from './parts/AvatarFrame';

/** A square portrait frame for profile imagery. */
export function Avatar({ children, className }: AvatarProps) {
  return <AvatarFrame className={className}>{children}</AvatarFrame>;
}
