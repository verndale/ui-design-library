import { classes } from '../../src/lib/classNames.js';
import type { AccordionProps } from './Accordion.types.js';
import { AccordionList } from './parts/AccordionList.client.js';

export type { AccordionItem, AccordionProps } from './Accordion.types.js';

/** A server-renderable tree whose disclosure controls hydrate as narrow client leaves. */
export function Accordion({
  items,
  heading,
  standalone = false,
  initialItemCount,
  moreLabel = 'See more',
  lessLabel = 'See less',
  className,
  classNames,
  id,
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  headingLevel = 2,
  itemHeadingLevel = 3,
  collapsedIcon,
  expandedIcon,
}: AccordionProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-component="accordion"
      className={classes(standalone && 'rounded-medium border border-border-subtle px-m', classNames?.root, className)}
    >
      {heading ? (
        <Heading className={classes('mt-0 mb-s text-xl font-semibold text-text-primary', classNames?.heading)}>
          {heading}
        </Heading>
      ) : null}
      <AccordionList
        items={items}
        initialItemCount={initialItemCount}
        moreLabel={moreLabel}
        lessLabel={lessLabel}
        headingLevel={itemHeadingLevel}
        collapsedIcon={collapsedIcon}
        expandedIcon={expandedIcon}
        classNames={classNames}
      />
    </div>
  );
}
