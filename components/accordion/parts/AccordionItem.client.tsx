'use client';

import { useId, useState } from 'react';

import type { AccordionItem as AccordionItemData } from '../Accordion.types.js';
import { AccordionToggleIcon } from './AccordionToggleIcon.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function AccordionItem({ label, children, defaultOpen = false }: AccordionItemData) {
  const [open, setOpen] = useState(defaultOpen);
  const buttonId = useId();
  const panelId = useId();

  return (
    <div className="border-b border-border-subtle">
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className={[
            'flex w-full cursor-pointer items-center justify-between gap-s py-m text-start',
            'text-base font-semibold text-text-primary',
            focusRing,
          ].join(' ')}
        >
          <span>{label}</span>
          <span className="inline-flex shrink-0 text-text-primary">
            <AccordionToggleIcon open={open} />
          </span>
        </button>
      </h3>
      <div
        data-accordion-motion
        className={[
          'grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-standard',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div
            inert={!open}
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="pb-m text-text-secondary"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
