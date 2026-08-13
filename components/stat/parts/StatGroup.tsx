import { Children } from 'react';
import type { StatGroupProps } from '../Stat.types.js';

/** A labelled native list of statistics. */
export function StatGroup({ heading, orientation = 'column', children, className }: StatGroupProps) {
  const isRow = orientation === 'row';
  return (
    <div data-component="stat-group" className={['w-full', className].filter(Boolean).join(' ')}>
      <h2 className="sr-only">
        {heading}
      </h2>
      <ul
        role="list"
        aria-label={heading}
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
