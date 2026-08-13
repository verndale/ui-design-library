import type { TabItem } from '../Tabs.types.js';

type TabPanelsProps = {
  items: TabItem[];
  activeIndex: number;
  tabIdPrefix: string;
  className?: string;
  panelClassName?: string;
};

/** Package-owned tab panels with complete tab-to-panel IDREF relationships. */
export function TabPanels({ items, activeIndex, tabIdPrefix, className, panelClassName }: TabPanelsProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          id={`${tabIdPrefix}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${tabIdPrefix}-tab-${index}`}
          tabIndex={0}
          hidden={index !== activeIndex}
          className={panelClassName}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
