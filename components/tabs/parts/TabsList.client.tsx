import type { KeyboardEventHandler } from 'react';

import type { TabItem, TabsPresentation } from '../Tabs.types.js';
import { TabButton } from './TabButton.client.js';

type TabsListProps = {
  items: TabItem[];
  activeIndex: number;
  ariaLabel: string;
  tabIdPrefix: string;
  className?: string;
  onSelect: (id: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  registerTab: (index: number, node: HTMLButtonElement | null) => void;
  tabClassName?: string;
  orientation: 'horizontal' | 'vertical';
  presentation: TabsPresentation;
};

/** Semantic tablist rendering separated from its state and keyboard controller. */
export function TabsList({
  items,
  activeIndex,
  ariaLabel,
  tabIdPrefix,
  className,
  onSelect,
  onKeyDown,
  registerTab,
  tabClassName,
  orientation,
  presentation,
}: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={[
        'flex items-center justify-center gap-2xs',
        orientation === 'horizontal' ? 'flex-wrap' : 'flex-col',
        className,
      ].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => {
        const selected = index === activeIndex;
        return (
          <TabButton
            key={item.id}
            ref={(node) => registerTab(index, node)}
            id={`${tabIdPrefix}-tab-${index}`}
            aria-controls={`${tabIdPrefix}-panel-${index}`}
            selected={selected}
            presentation={presentation}
            className={tabClassName}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </TabButton>
        );
      })}
    </div>
  );
}
