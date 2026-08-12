import type { KeyboardEventHandler } from 'react';

import type { TabItem } from '../Tabs.types';
import { TabButton } from './TabButton.client';

type TabsListProps = {
  items: TabItem[];
  activeId?: string;
  ariaLabel: string;
  tabIdPrefix: string;
  className?: string;
  onSelect: (id: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  registerTab: (id: string, node: HTMLButtonElement | null) => void;
};

/** Semantic tablist rendering separated from its state and keyboard controller. */
export function TabsList({
  items,
  activeId,
  ariaLabel,
  tabIdPrefix,
  className,
  onSelect,
  onKeyDown,
  registerTab,
}: TabsListProps) {
  return (
    <div
      data-component="tabs"
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={['flex flex-wrap items-center justify-center gap-2xs', className].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <TabButton
            key={item.id}
            ref={(node) => registerTab(item.id, node)}
            id={`${tabIdPrefix}-${item.id}`}
            selected={selected}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </TabButton>
        );
      })}
    </div>
  );
}
