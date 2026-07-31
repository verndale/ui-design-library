'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export type AccordionItem = {
  /** The visible toggle label. */
  label: ReactNode;
  /** The panel body, revealed when the item is open. */
  children: ReactNode;
  /** Stable key; falls back to the render index. */
  id?: string;
  /** Whether the item starts open. Items open and close independently. */
  defaultOpen?: boolean;
};

export type AccordionProps = {
  /** The items, each a label + panel body. */
  items: AccordionItem[];
  /** Optional section heading rendered above the items (an `h2`). */
  heading?: ReactNode;
  /** Boxed treatment — a bordered, rounded, padded container. Purely visual. */
  standalone?: boolean;
  /** When set and `items` exceeds it, only this many show until "See more" is pressed. */
  initialItemCount?: number;
  /** Reveal-control labels for the show-more variant. */
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

/** A plus that becomes a minus when open — drawn with `currentColor`, no glyph font. */
function ToggleIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? null : <path d="M8 3v10" strokeLinecap="round" />}
      <path d="M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

function Item({ label, children, defaultOpen = false }: AccordionItem) {
  const [open, setOpen] = useState(defaultOpen);
  const buttonId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Collapsed content stays in the DOM so its height can animate, so it must be
  // made non-interactive by hand: `inert` takes the panel out of the tab order
  // and the accessibility tree while it is closed, so Tab skips hidden content.
  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    if (open) node.removeAttribute('inert');
    else node.setAttribute('inert', '');
  }, [open]);

  return (
    <div className="border-b border-border-subtle">
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={[
            'flex w-full cursor-pointer items-center justify-between gap-s py-m text-start',
            'text-base font-semibold text-text-primary',
            focusRing,
          ].join(' ')}
        >
          <span>{label}</span>
          <span className="inline-flex shrink-0 text-text-primary">
            <ToggleIcon open={open} />
          </span>
        </button>
      </h3>
      {/* The grid row animates 0fr → 1fr; duration is driven by --duration-base,
          which the token layer zeroes under prefers-reduced-motion. */}
      <div
        data-accordion-motion
        className={[
          'grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-standard',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div ref={panelRef} id={panelId} role="region" aria-labelledby={buttonId} className="pb-m text-text-secondary">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A set of independently-expandable disclosure items.
 *
 * Each header is a real `button` carrying `aria-expanded` and `aria-controls`,
 * wrapped in an `h3` so the set is navigable by heading. Collapsed panels are
 * `inert`, so their focusable content is skipped by Tab rather than silently
 * reachable, and the reveal animation is gated on `prefers-reduced-motion`
 * through the duration token. The optional show-more reveal collapses a long
 * list to `initialItemCount` behind a single control.
 */
export function Accordion({
  items,
  heading,
  standalone = false,
  initialItemCount,
  moreLabel = 'See more',
  lessLabel = 'See less',
  className,
}: AccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const collapses = typeof initialItemCount === 'number' && items.length > initialItemCount;
  const visible = collapses && !expanded ? items.slice(0, initialItemCount) : items;

  return (
    <div
      data-component="accordion"
      className={[standalone ? 'rounded-medium border border-border-subtle px-m' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {heading ? <h2 className="mt-0 mb-s text-xl font-semibold text-text-primary">{heading}</h2> : null}
      {visible.map((item, index) => (
        <Item key={item.id ?? index} {...item} />
      ))}
      {collapses ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className={[
            'mt-s inline-flex cursor-pointer items-center gap-2xs py-2xs',
            'text-sm font-semibold text-text-primary underline underline-offset-2',
            focusRing,
          ].join(' ')}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  );
}
