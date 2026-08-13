'use client';

import { useState } from 'react';

import type { AccordionItem as AccordionItemData } from '../Accordion.types.js';
import { AccordionItem } from './AccordionItem.client.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function AccordionList({
  items,
  initialItemCount,
  moreLabel,
  lessLabel,
}: {
  items: AccordionItemData[];
  initialItemCount?: number;
  moreLabel: string;
  lessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapses = typeof initialItemCount === 'number' && items.length > initialItemCount;
  const visible = collapses && !expanded ? items.slice(0, initialItemCount) : items;

  return (
    <>
      {visible.map((item, index) => (
        <AccordionItem key={item.id ?? index} {...item} />
      ))}
      {collapses ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={[
            'mt-s inline-flex cursor-pointer items-center gap-2xs py-2xs',
            'text-sm font-semibold text-text-primary underline underline-offset-2',
            focusRing,
          ].join(' ')}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </>
  );
}
