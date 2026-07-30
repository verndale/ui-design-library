import { Children, useId, type ReactNode } from 'react';

export type StatProps = {
  /** The figure itself — free-form text: "98%", "10×", "24/7", "#1". Never parsed. */
  value: ReactNode;
  /** The short phrase that gives the value its meaning. */
  label: ReactNode;
  /** Optional supporting sentence beneath the pair. */
  description?: ReactNode;
  className?: string;
};

/**
 * A single statistic: a prominent value paired with a describing label.
 *
 * Value-then-label in reading order — the figure leads, the label gives it
 * meaning. The surface is the caller's: wrap in a Card for the boxed treatment.
 * A lone stat is content, not a widget, so it carries no role of its own; a
 * group of stats gets its accessible name from StatGroup.
 */
export function Stat({ value, label, description, className }: StatProps) {
  return (
    <div data-component="stat" className={['flex flex-col gap-2xs', className].filter(Boolean).join(' ')}>
      <p className="m-0 text-6xl font-extrabold text-text-primary">{value}</p>
      <p className="m-0 text-base font-semibold text-text-primary">{label}</p>
      {description ? <p className="m-0 mt-3xs text-base text-text-secondary">{description}</p> : null}
    </div>
  );
}

export type StatGroupProps = {
  /**
   * Accessible name for the group. Rendered visually hidden — assistive tech
   * announces it as the list's label; sighted users read it from context.
   */
  heading: string;
  /** Row equalizes the stats side by side at `md`+; column stacks. Mobile always stacks. */
  orientation?: 'row' | 'column';
  /** One `Stat` per item; each child is wrapped in a list item. */
  children: ReactNode;
  className?: string;
};

/**
 * A labelled group of Stats. A visually-hidden heading names a native list, one
 * item per Stat — the accessible-name contract the Stat pattern asks for, and the
 * reason this implementation was worth capturing rather than rebuilding.
 */
export function StatGroup({ heading, orientation = 'column', children, className }: StatGroupProps) {
  const headingId = useId();
  const isRow = orientation === 'row';
  return (
    <div data-component="stat-group" className={['w-full', className].filter(Boolean).join(' ')}>
      <h2 id={headingId} className="sr-only">
        {heading}
      </h2>
      <ul
        // Explicit role: WebKit/VoiceOver drops the implicit list/listitem roles
        // when the list marker is removed (`list-none`), which would silently break
        // the accessible-list contract this component exists to provide.
        role="list"
        aria-labelledby={headingId}
        className={[
          'm-0 flex w-full list-none gap-s p-0',
          isRow ? 'flex-col items-stretch md:flex-row' : 'flex-col items-start',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {Children.map(children, (child) => (
          <li className={isRow ? 'min-w-0 md:flex-1 md:self-stretch' : 'w-full'}>{child}</li>
        ))}
      </ul>
    </div>
  );
}
