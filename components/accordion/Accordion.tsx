import type { AccordionProps } from './Accordion.types';
import { AccordionList } from './parts/AccordionList.client';

export type { AccordionItem, AccordionProps } from './Accordion.types';

/** A server-renderable tree whose disclosure controls hydrate as narrow client leaves. */
export function Accordion({
  items,
  heading,
  standalone = false,
  initialItemCount,
  moreLabel = 'See more',
  lessLabel = 'See less',
  className,
}: AccordionProps) {
  return (
    <div
      data-component="accordion"
      className={[standalone ? 'rounded-medium border border-border-subtle px-m' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {heading ? <h2 className="mt-0 mb-s text-xl font-semibold text-text-primary">{heading}</h2> : null}
      <AccordionList
        items={items}
        initialItemCount={initialItemCount}
        moreLabel={moreLabel}
        lessLabel={lessLabel}
      />
    </div>
  );
}
