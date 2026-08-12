import type { BadgeProps } from './Badge.types';
import { BadgeFrame } from './parts/BadgeFrame';

export type { BadgeProps, BadgeSurface, DismissibleBadgeProps } from './Badge.types';

/** A server-safe short label for status or categorisation. */
export function Badge(props: BadgeProps) {
  return <BadgeFrame {...props} />;
}
