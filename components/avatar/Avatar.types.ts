import type { ReactNode } from 'react';

import type { SlotClassNames } from '../../src/lib/classNames.js';

export type AvatarClassNames = SlotClassNames<'root'>;

export type AvatarProps = {
  children: ReactNode;
  /** Sizing lives with the caller — the frame only guarantees a 1:1 crop. */
  className?: string;
  classNames?: AvatarClassNames;
  id?: string;
  ariaLabel?: string;
};
