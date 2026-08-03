'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export type InPageNavigationItem = {
  /** The DOM `id` of the section this item jumps to (its `href` becomes `#id`). */
  id: string;
  /** The visible link label. */
  label: ReactNode;
};

export type InPageNavigationProps = {
  /** The sections, in page order. */
  items: InPageNavigationItem[];
  /** Accessible name for the landmark. Defaults to "On this page". */
  ariaLabel?: string;
  /** Active section id (controlled). Omit to let scroll position drive it. */
  activeId?: string;
  className?: string;
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

const linkBase = ['rounded-pill px-s py-2xs text-base no-underline transition-colors', focusRing].join(' ');
const linkActive = 'text-text-primary';
const linkIdle = 'text-text-secondary hover:text-text-primary';

/** A chevron drawn with `currentColor`; points up when the drawer is open. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={['size-4 shrink-0 transition-transform', open ? 'rotate-180' : ''].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Observe the section targets and report the one currently in view.
 *
 * Dependency-free scroll-spy: it watches the real section elements named by
 * `items[].id` and returns the id of the section nearest the top of the
 * viewport. Skipped entirely while `controlledId` is set, so a caller can drive
 * the active state instead.
 */
function useActiveSection(items: InPageNavigationItem[], controlledId?: string): string | undefined {
  const [spied, setSpied] = useState<string | undefined>(undefined);
  const key = items.map((item) => item.id).join('|');

  useEffect(() => {
    if (controlledId !== undefined) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (inView[0]) setSpied(inView[0].target.id);
      },
      { rootMargin: '0px 0px -55% 0px', threshold: [0, 0.5, 1] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [key, controlledId]); // eslint-disable-line react-hooks/exhaustive-deps

  return controlledId ?? spied;
}

/**
 * A sticky "on this page" bar: anchor links that jump to sections within the
 * current page and track which section is in view.
 *
 * A `<nav>` landmark whose active link carries `aria-current="true"`; the links
 * are real anchors, so Tab reaches them and Enter activates them natively. The
 * active item is driven by an `IntersectionObserver` over the section targets,
 * or by the `activeId` prop when the caller owns it. On wide viewports it is a
 * horizontal pill bar; below `lg` it collapses to a trigger showing the active
 * section, expanding to a drawer whose links are `inert` (and out of the tab
 * order) while closed. The reveal is driven by `--duration-base`, which the
 * token layer zeroes under `prefers-reduced-motion`.
 */
export function InPageNavigation({ items, ariaLabel = 'On this page', activeId, className }: InPageNavigationProps) {
  const active = useActiveSection(items, activeId) ?? items[0]?.id;
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const drawerRef = useRef<HTMLUListElement>(null);

  // The drawer stays in the DOM so its height can animate; `inert` keeps its
  // links out of the tab order and the a11y tree while it is collapsed.
  useEffect(() => {
    const node = drawerRef.current;
    if (!node) return;
    if (open) node.removeAttribute('inert');
    else node.setAttribute('inert', '');
  }, [open]);

  if (items.length === 0) return null;

  const activeLabel = items.find((item) => item.id === active)?.label;

  const link = (item: InPageNavigationItem, onNavigate?: () => void) => {
    const isActive = item.id === active;
    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        aria-current={isActive ? 'true' : undefined}
        onClick={onNavigate}
        className={[linkBase, isActive ? linkActive : linkIdle].join(' ')}
      >
        {item.label}
      </a>
    );
  };

  return (
    <nav
      data-component="in-page-navigation"
      aria-label={ariaLabel}
      className={['sticky bottom-s z-10', className].filter(Boolean).join(' ')}
    >
      {/* Wide viewports: a horizontal pill bar. */}
      <ul className="mx-auto hidden w-fit list-none items-center gap-2xs rounded-pill border border-border-subtle bg-surface-raised px-2xs py-2xs lg:flex">
        {items.map((item) => (
          <li key={item.id}>{link(item)}</li>
        ))}
      </ul>

      {/* Narrow viewports: a trigger showing the active section, expanding to a drawer. */}
      <div className="rounded-medium border border-border-subtle bg-surface-raised lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen((value) => !value)}
          className={[
            'flex w-full cursor-pointer items-center justify-between gap-s px-s py-xs',
            'text-base text-text-primary',
            focusRing,
          ].join(' ')}
        >
          <span>{activeLabel}</span>
          <Chevron open={open} />
        </button>
        <div
          data-inpage-motion
          className={[
            'grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-standard',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          ].join(' ')}
        >
          <div className="overflow-hidden">
            <ul ref={drawerRef} id={drawerId} className="flex list-none flex-col gap-2xs px-2xs pb-2xs">
              {items.map((item) => (
                <li key={item.id}>{link(item, () => setOpen(false))}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
