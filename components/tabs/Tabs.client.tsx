import { TabsList } from './parts/TabsList.client.js';
import { TabPanels } from './parts/TabPanels.js';
import { useTabsController } from './parts/useTabsController.client.js';
import type { TabsProps } from './Tabs.types.js';

/** A pill or stroke tablist with controlled/uncontrolled selection and roving keyboard focus. */
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
  presentation = 'pills',
}: TabsProps) {
  const resolvedPresentation = orientation === 'vertical' ? 'pills' : presentation;
  const { activeIndex, handleKeyDown, registerTab, resolvedPrefix, select } = useTabsController({
    items,
    activeId,
    defaultActiveId,
    onSelect,
    tabIdPrefix,
    orientation,
  });

  if (items.length === 0) return null;

  return (
    <div
      data-component="tabs"
      data-presentation={resolvedPresentation}
      className={['flex flex-col gap-m', classNames?.root, className].filter(Boolean).join(' ')}
    >
      <TabsList
        items={items}
        activeIndex={activeIndex}
        ariaLabel={ariaLabel}
        tabIdPrefix={resolvedPrefix}
        className={classNames?.list}
        tabClassName={classNames?.tab}
        orientation={orientation}
        presentation={resolvedPresentation}
        onSelect={select}
        onKeyDown={handleKeyDown}
        registerTab={registerTab}
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
