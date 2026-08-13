'use client';

import { useId, useState, type ReactNode } from 'react';

import { classes } from '../../../src/lib/classNames.js';
import type { AccordionClassNames, AccordionHeadingLevel, AccordionItem as AccordionItemData } from '../Accordion.types.js';
import { AccordionToggleIcon } from './AccordionToggleIcon.js';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export function AccordionItem({
  label,
  children,
  defaultOpen = false,
  headingLevel,
  collapsedIcon,
  expandedIcon,
  classNames,
}: AccordionItemData & {
  headingLevel: AccordionHeadingLevel;
  collapsedIcon?: ReactNode;
  expandedIcon?: ReactNode;
  classNames?: AccordionClassNames;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const buttonId = useId();
  const panelId = useId();

  const Heading = `h${headingLevel}` as const;

  return (
    <div className={classes('border-b border-border-subtle', classNames?.item)}>
      <Heading className={classes('m-0', classNames?.itemHeading)}>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className={classes(
            'flex w-full cursor-pointer items-center justify-between gap-s py-m text-start',
            'text-base font-semibold text-text-primary',
            focusRing,
            classNames?.trigger,
          )}
        >
          <span className={classNames?.label}>{label}</span>
          <span aria-hidden className={classes('inline-flex shrink-0 text-text-primary', classNames?.icon)}>
            {open ? expandedIcon ?? <AccordionToggleIcon open /> : collapsedIcon ?? <AccordionToggleIcon open={false} />}
          </span>
        </button>
      </Heading>
      <div
        data-accordion-motion
        className={classes(
          'grid transition-[grid-template-rows] duration-(--duration-base) ease-standard',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          classNames?.motion,
        )}
      >
        <div className="overflow-hidden">
          <div
            inert={!open}
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className={classes('pb-m text-text-secondary', classNames?.panel)}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
