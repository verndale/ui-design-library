'use client';

import { useCallback, useState, type KeyboardEvent, type ReactNode } from 'react';

export type TabItem = {
  /** Stable identifier; also used to build each tab's DOM id. */
  id: string;
  /** The visible tab label. */
  label: ReactNode;
};

export type TabsProps = {
  /** The tabs, in display order. */
  items: TabItem[];
  /** Accessible name for the tablist (required — a tablist must be labelled). */
  ariaLabel: string;
  /** Selected tab id (controlled). Omit for uncontrolled use. */
  activeId?: string;
  /** Initial selected id for the uncontrolled case. Defaults to the first item. */
  defaultActiveId?: string;
  /** Called with the newly selected tab id. Selection follows focus. */
  onSelect?: (id: string) => void;
  /** Prefix for each tab's DOM id, so several tablists can coexist on a page. */
  tabIdPrefix?: string;
  className?: string;
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-focus';

const tabBase = [
  'inline-flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center',
  'rounded-pill px-m py-2xs',
  'text-base leading-none transition-[color,background-color] duration-[var(--duration-base)] ease-standard',
  focusRing,
].join(' ');

const tabSelected = 'bg-surface-inverse text-text-inverse';
const tabUnselected = 'text-text-secondary hover:text-text-primary';

/**
 * A pill tablist — a horizontal row of mutually exclusive tabs.
 *
 * Rendered as a WAI-ARIA `tablist` of real `tab` buttons: the selected tab
 * carries `aria-selected` and is the only one in the tab order (roving
 * `tabIndex`), and ArrowLeft/ArrowRight move selection **and** focus with
 * wraparound (automatic activation). Presentation only — the caller owns the
 * panels and wires them to the selected id, so the same tablist drives a
 * carousel, a filter, or a set of `tabpanel`s. Works controlled (`activeId` +
 * `onSelect`) or uncontrolled (`defaultActiveId`). The colour transition is
 * driven by `--duration-base`, which the token layer zeroes under
 * `prefers-reduced-motion`.
 */
export function Tabs({
  items,
  ariaLabel,
  activeId,
  defaultActiveId,
  onSelect,
  tabIdPrefix = 'tab',
  className,
}: TabsProps) {
  const [internalId, setInternalId] = useState(defaultActiveId ?? items[0]?.id);
  const active = activeId ?? internalId;

  const select = useCallback(
    (id: string) => {
      if (activeId === undefined) setInternalId(id);
      onSelect?.(id);
    },
    [activeId, onSelect],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (items.length < 2) return;
      const current = items.findIndex((item) => item.id === active);
      const last = items.length - 1;

      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight') nextIndex = current >= last ? 0 : current + 1;
      else if (event.key === 'ArrowLeft') nextIndex = current <= 0 ? last : current - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      const next = items[nextIndex]!;
      select(next.id);
      document.getElementById(`${tabIdPrefix}-${next.id}`)?.focus();
    },
    [active, items, select, tabIdPrefix],
  );

  if (items.length === 0) return null;

  return (
    <div
      data-component="tabs"
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={['flex flex-wrap items-center justify-center gap-2xs', className].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${tabIdPrefix}-${item.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => select(item.id)}
            className={[tabBase, selected ? tabSelected : tabUnselected].join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
