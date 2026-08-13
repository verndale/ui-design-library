import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';

import { TabsList } from './parts/TabsList.client.js';
import { TabPanels } from './parts/TabPanels.js';
import type { TabsProps } from './Tabs.types.js';

/** A pill tablist with controlled/uncontrolled selection and roving keyboard focus. */
export function Tabs({
  items,
  ariaLabel,
  activeId,
  defaultActiveId,
  onSelect,
  tabIdPrefix,
  className,
  classNames,
  orientation = 'horizontal',
}: TabsProps) {
  const generatedPrefix = useId();
  const resolvedPrefix = tabIdPrefix ?? `tabs-${generatedPrefix}`;
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const [internalId, setInternalId] = useState(defaultActiveId ?? items[0]?.id);
  const requestedActive = activeId ?? internalId;
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === requestedActive));

  const select = useCallback((id: string) => {
    if (activeId === undefined) setInternalId(id);
    onSelect?.(id);
  }, [activeId, onSelect]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length < 2) return;
    const current = activeIndex;
    const last = items.length - 1;
    let nextIndex: number | null = null;
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === nextKey) nextIndex = current >= last ? 0 : current + 1;
    else if (event.key === previousKey) nextIndex = current <= 0 ? last : current - 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = last;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = items[nextIndex]!;
    select(next.id);
    tabRefs.current.get(nextIndex)?.focus();
  }, [activeIndex, items, orientation, select]);

  if (items.length === 0) return null;

  return (
    <div data-component="tabs" className={[classNames?.root, className].filter(Boolean).join(' ')}>
      <TabsList
        items={items}
        activeIndex={activeIndex}
        ariaLabel={ariaLabel}
        tabIdPrefix={resolvedPrefix}
        className={classNames?.list}
        tabClassName={classNames?.tab}
        orientation={orientation}
        onSelect={select}
        onKeyDown={handleKeyDown}
        registerTab={(index, node) => {
          if (node) tabRefs.current.set(index, node);
          else tabRefs.current.delete(index);
        }}
      />
      <TabPanels
        items={items}
        activeIndex={activeIndex}
        tabIdPrefix={resolvedPrefix}
        className={classNames?.panels}
        panelClassName={classNames?.panel}
      />
    </div>
  );
}
