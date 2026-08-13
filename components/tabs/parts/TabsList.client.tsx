import type { KeyboardEventHandler } from 'react';

import type { TabItem, TabsClassNames } from '../Tabs.types.js';
import { TabButton } from './TabButton.client.js';

type TabsListProps = {
  items: TabItem[];
  activeId?: string;
  ariaLabel: string;
  tabIdPrefix: string;
  className?: string;
  onSelect: (id: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  registerTab: (id: string, node: HTMLButtonElement | null) => void;
  classNames?: TabsClassNames;
  orientation: 'horizontal' | 'vertical';
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
  classNames,
  orientation,
}: TabsListProps) {
  return (
    <div
      data-component="tabs"
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={[
        'flex items-center justify-center gap-2xs',
        orientation === 'horizontal' ? 'flex-wrap' : 'flex-col',
        classNames?.root,
        className,
      ].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <TabButton
            key={item.id}
            ref={(node) => registerTab(item.id, node)}
            id={`${tabIdPrefix}-${item.id}`}
            selected={selected}
            className={classNames?.tab}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </TabButton>
        );
      })}
    </div>
  );
}
