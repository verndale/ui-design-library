import type { AvatarProps } from './Avatar.types.js';
import { AvatarFrame } from './parts/AvatarFrame.js';

/** A square portrait frame for profile imagery. */
export function Avatar(props: AvatarProps) {
  return <AvatarFrame {...props} />;
}
