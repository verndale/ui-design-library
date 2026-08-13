import type { AvatarProps } from './Avatar.types.js';
import { AvatarFrame } from './parts/AvatarFrame.js';

/** A square portrait frame for profile imagery. */
export function Avatar({ children, className }: AvatarProps) {
  return <AvatarFrame className={className}>{children}</AvatarFrame>;
}
