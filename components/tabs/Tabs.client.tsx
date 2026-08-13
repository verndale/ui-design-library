import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';

import { TabsList } from './parts/TabsList.client';
import type { TabsProps } from './Tabs.types';

/** A pill tablist with controlled/uncontrolled selection and roving keyboard focus. */
export function Tabs({
  items,
  ariaLabel,
  activeId,
  defaultActiveId,
  onSelect,
  tabIdPrefix,
  className,
}: TabsProps) {
  const generatedPrefix = useId();
  const resolvedPrefix = tabIdPrefix ?? `tabs-${generatedPrefix}`;
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [internalId, setInternalId] = useState(defaultActiveId ?? items[0]?.id);
  const active = activeId ?? internalId;

  const select = useCallback((id: string) => {
    if (activeId === undefined) setInternalId(id);
    onSelect?.(id);
  }, [activeId, onSelect]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
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
    tabRefs.current.get(next.id)?.focus();
  }, [active, items, select]);

  if (items.length === 0) return null;

  return (
    <TabsList
      items={items}
      activeId={active}
      ariaLabel={ariaLabel}
      tabIdPrefix={resolvedPrefix}
      className={className}
      onSelect={select}
      onKeyDown={handleKeyDown}
      registerTab={(id, node) => {
        if (node) tabRefs.current.set(id, node);
        else tabRefs.current.delete(id);
      }}
    />
  );
}
