import type { BadgeProps } from './Badge.types.js';
import { BadgeFrame } from './parts/BadgeFrame.js';

export type { BadgeProps, BadgeSurface, DismissibleBadgeProps } from './Badge.types.js';

/** A server-safe short label for status or categorisation. */
export function Badge(props: BadgeProps) {
  return <BadgeFrame {...props} />;
}
