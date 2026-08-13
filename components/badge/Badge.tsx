import type { BadgeProps } from './Badge.types.js';
import { BadgeFrame } from './parts/BadgeFrame.js';
import { DismissibleBadge } from './parts/DismissibleBadge.client.js';

export type { BadgeProps, BadgeSurface, DismissibleBadgeProps } from './Badge.types.js';

/** A server-safe short label for status or categorisation. */
export function Badge(props: BadgeProps) {
  if (props.onRemove) return <DismissibleBadge {...props} onRemove={props.onRemove} />;
  return <BadgeFrame {...props} />;
}
