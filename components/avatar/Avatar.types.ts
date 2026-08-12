import type { ReactNode } from 'react';

export type AvatarProps = {
  children: ReactNode;
  /** Sizing lives with the caller — the frame only guarantees a 1:1 crop. */
  className?: string;
};
