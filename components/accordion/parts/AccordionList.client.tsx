'use client';

import { useState } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { AccordionClassNames, AccordionHeadingLevel, AccordionItem as AccordionItemData } from '../Accordion.types.js';
import type { ReactNode } from 'react';
import { AccordionItem } from './AccordionItem.client.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function AccordionList({
  items,
  initialItemCount,
  moreLabel,
  lessLabel,
  headingLevel,
  collapsedIcon,
  expandedIcon,
  classNames,
}: {
  items: AccordionItemData[];
  initialItemCount?: number;
  moreLabel: string;
  lessLabel: string;
  headingLevel: AccordionHeadingLevel;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
  classNames?: AccordionClassNames;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapses = typeof initialItemCount === 'number' && items.length > initialItemCount;
  const visible = collapses && !expanded ? items.slice(0, initialItemCount) : items;

  return (
    <div className={classNames?.list}>
      {visible.map((item, index) => (
        <AccordionItem
          key={item.id ?? index}
          {...item}
          headingLevel={headingLevel}
          collapsedIcon={collapsedIcon}
          expandedIcon={expandedIcon}
          classNames={classNames}
        />
      ))}
      {collapses ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={classes(
            'mt-s inline-flex cursor-pointer items-center gap-2xs py-2xs',
            'text-sm font-semibold text-text-primary underline underline-offset-2',
            focusRing,
            classNames?.reveal,
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  );
}
