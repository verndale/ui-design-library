import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';

import type { TabItem } from '../Tabs.types.js';

type UseTabsControllerOptions = {
  items: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string) => void;
  tabIdPrefix?: string;
  orientation: 'horizontal' | 'vertical';
};

/** Shared selection, ID, roving-focus, and orientation-aware keyboard engine. */
export function useTabsController({
  items,
  activeId,
  defaultActiveId,
  onSelect,
  tabIdPrefix,
  orientation,
}: UseTabsControllerOptions) {
  const generatedPrefix = useId();
  const resolvedPrefix = tabIdPrefix ?? `tabs-${generatedPrefix}`;
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const [internalId, setInternalId] = useState(defaultActiveId ?? items[0]?.id);
  const requestedActive = activeId ?? internalId;
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === requestedActive));

  const select = useCallback(
    (id: string) => {
      if (activeId === undefined) setInternalId(id);
      onSelect?.(id);
    },
    [activeId, onSelect],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (items.length < 2) return;
      const last = items.length - 1;
      let nextIndex: number | null = null;
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      if (event.key === nextKey) nextIndex = activeIndex >= last ? 0 : activeIndex + 1;
      else if (event.key === previousKey) nextIndex = activeIndex <= 0 ? last : activeIndex - 1;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = last;
      if (nextIndex === null) return;

      event.preventDefault();
      const next = items[nextIndex]!;
      select(next.id);
      tabRefs.current.get(nextIndex)?.focus();
    },
    [activeIndex, items, orientation, select],
  );

  return {
    activeIndex,
    handleKeyDown,
    resolvedPrefix,
    select,
    tabRefs,
    registerTab(index: number, node: HTMLButtonElement | null) {
      if (node) tabRefs.current.set(index, node);
      else tabRefs.current.delete(index);
    },
  };
}
